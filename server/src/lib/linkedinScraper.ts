/**
 * LinkedIn Post Scraper
 *
 * Hack: LinkedIn serves fully-rendered HTML to Googlebot for SEO purposes.
 * We impersonate Googlebot with a standard fetch — no Chromium required.
 * ~200ms per scrape vs ~10s with Playwright.
 *
 * Data extracted per post:
 *  - name         author display name
 *  - bio          author headline / job title
 *  - post_text    full body text of the post
 *  - image_url    author profile photo  (mirrored to our Supabase bucket)
 *  - media_url    image/video attached to the post (mirrored to our bucket)
 *  - post_date    date the LinkedIn post was published
 *
 * Scraping happens exactly once per URL; all subsequent reads are pure DB.
 */

import * as cheerio from 'cheerio';
import { supabaseAdmin } from './supabase.js';

export interface ScrapedTestimonial {
  name: string;
  bio: string | null;
  post_text: string;
  image_url: string | null;  // author profile photo — on our CDN
  media_url: string | null;  // post attachment (image/video thumb) — on our CDN
  post_date: string | null;  // ISO date string "YYYY-MM-DD"
  source_url: string;
}

// ── Headers for HTML page fetch (Googlebot impersonation) ─────────────────────

const BOT_HEADERS: HeadersInit = {
  'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
};

// LinkedIn's image CDN requires browser-like headers, not Googlebot
const IMG_HEADERS: HeadersInit = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
  'Referer': 'https://www.linkedin.com/',
  'Origin': 'https://www.linkedin.com',
};

// ── Mirror a remote image into Supabase Storage ───────────────────────────────
// Best-effort: tries to download and re-host on our CDN.
// If LinkedIn's CDN blocks the download, falls back to the original URL so the
// image still renders on the card (LinkedIn URLs work for months before expiring).

async function mirrorImage(remoteUrl: string, prefix: string): Promise<string> {
  try {
    // Try browser UA first; LinkedIn media CDN often rejects non-browser agents
    let res = await fetch(remoteUrl, { headers: IMG_HEADERS });
    if (!res.ok) res = await fetch(remoteUrl, { headers: BOT_HEADERS });

    if (res.ok) {
      const contentType = res.headers.get('content-type') ?? 'image/jpeg';
      const ext = contentType.includes('png') ? 'png'
        : contentType.includes('webp') ? 'webp'
        : 'jpg';
      const buf = Buffer.from(await res.arrayBuffer());
      const filename = `testimonials/${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;

      const { error } = await supabaseAdmin.storage
        .from('project-thumbnails')
        .upload(filename, buf, { contentType, upsert: true });

      if (!error) {
        const { data } = supabaseAdmin.storage
          .from('project-thumbnails')
          .getPublicUrl(filename);
        return data.publicUrl; // ✅ successfully mirrored
      }
    }
  } catch {
    // network error — fall through to raw URL fallback
  }

  // CDN blocked us or upload failed — store the original URL directly.
  // The image will still render; it may eventually expire but is fine for months.
  return remoteUrl;
}

// ── Main scraper ──────────────────────────────────────────────────────────────

export async function scrapeLinkedInPost(rawUrl: string): Promise<ScrapedTestimonial> {
  // Stable cache key — strip tracking params and trailing slash
  const url = rawUrl.split('?')[0].replace(/\/+$/, '');

  const res = await fetch(url, { headers: BOT_HEADERS, redirect: 'follow' });

  if (!res.ok) {
    throw new Error(
      `LinkedIn returned HTTP ${res.status}. The post may be private or the URL is invalid.`
    );
  }

  const html = await res.text();

  // Detect login-wall redirect
  if (
    html.includes('authwall') ||
    (html.includes('/login') && html.length < 8000)
  ) {
    throw new Error(
      'LinkedIn redirected to the login page. Make sure the post is set to "Public".'
    );
  }

  const $ = cheerio.load(html);

  let name = '';
  let bio: string | null = null;
  let post_text = '';
  let rawProfileImageUrl: string | null = null;  // author photo
  let rawMediaUrl: string | null = null;          // attached image/video in the post
  let post_date: string | null = null;

  // ── 1. JSON-LD — richest source, present on most public posts ────────────────
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).text());
      const nodes: any[] = Array.isArray(data) ? data : [data];

      for (const node of nodes) {
        const type = node['@type'];

        if (
          type === 'SocialMediaPosting' ||
          type === 'Article' ||
          type === 'NewsArticle'
        ) {
          // Author fields
          if (!name && node.author?.name) name = String(node.author.name).trim();
          if (!bio && node.author?.jobTitle) bio = String(node.author.jobTitle).trim();

          // Profile photo lives under author.image (ImageObject or string URL)
          if (!rawProfileImageUrl) {
            const authorImg = node.author?.image;
            if (authorImg) {
              rawProfileImageUrl = typeof authorImg === 'string'
                ? authorImg
                : (authorImg.url ?? authorImg.contentUrl ?? null);
            }
          }

          // Post body
          if (!post_text && node.articleBody) post_text = String(node.articleBody).trim();

          // Media attachment — LinkedIn uses several shapes:
          //   string, ImageObject {url}, array of strings/ImageObjects, @list
          if (!rawMediaUrl) {
            const postImg = node.image ?? node.associatedMedia ?? node.thumbnailUrl;
            if (postImg) {
              if (typeof postImg === 'string') {
                rawMediaUrl = postImg;
              } else if (Array.isArray(postImg)) {
                // Pick first valid URL from array
                for (const item of postImg) {
                  const u = typeof item === 'string' ? item : (item?.url ?? item?.contentUrl);
                  if (u) { rawMediaUrl = u; break; }
                }
              } else if (postImg['@list']) {
                // JSON-LD @list
                const list = postImg['@list'];
                if (Array.isArray(list) && list.length > 0) {
                  const first = list[0];
                  rawMediaUrl = typeof first === 'string' ? first : (first?.url ?? first?.contentUrl ?? null);
                }
              } else {
                rawMediaUrl = postImg.url ?? postImg.contentUrl ?? null;
              }
            }
          }

          // Published date
          if (!post_date && node.datePublished) {
            const d = new Date(node.datePublished);
            if (!isNaN(d.getTime())) post_date = d.toISOString().split('T')[0];
          }
        }

        // Standalone Person node (some pages emit this separately)
        if (type === 'Person') {
          if (!name && node.name) name = String(node.name).trim();
          if (!bio && node.jobTitle) bio = String(node.jobTitle).trim();
          if (!rawProfileImageUrl) {
            const img = node.image;
            if (img) rawProfileImageUrl = typeof img === 'string' ? img : (img.url ?? img.contentUrl ?? null);
          }
        }
      }
    } catch {
      // malformed JSON-LD — skip
    }
  });

  // ── 2. OG / meta tags fallback ───────────────────────────────────────────────

  if (!name) {
    const ogTitle = $('meta[property="og:title"]').attr('content') ?? '';
    // "Firstname Lastname on LinkedIn: «post text»…"
    const m = ogTitle.match(/^(.+?)\s+(?:on|shared)\s+LinkedIn/i);
    name = m ? m[1].trim() : ogTitle.split(':')[0].trim();
  }

  if (!post_text) {
    post_text = $('meta[property="og:description"]').attr('content') ?? '';
  }

  // og:image / twitter:image — post attachment thumbnail
  if (!rawMediaUrl) {
    rawMediaUrl =
      $('meta[property="og:image:secure_url"]').attr('content') ||
      $('meta[property="og:image:url"]').attr('content') ||
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      $('meta[name="twitter:image:src"]').attr('content') ||
      null;
    // Discard placeholder/blank values LinkedIn sometimes emits
    if (rawMediaUrl && (rawMediaUrl.length < 10 || rawMediaUrl.includes('ghost'))) {
      rawMediaUrl = null;
    }
  }

  // ── 3. <title> as last resort ────────────────────────────────────────────────
  if (!name) {
    const m = $('title').text().match(/^(.+?)\s+(?:on|shared)\s+LinkedIn/i);
    if (m) name = m[1].trim();
  }

  // ── 4a. Last-resort: scrape <img> tags from the rendered page ────────────────
  // LinkedIn's Googlebot HTML embeds post images as <img> with data-delayed-url
  // or regular src attributes in sections like .feed-shared-image__container.
  if (!rawMediaUrl) {
    // Common LinkedIn post image selectors in their SEO/Googlebot HTML
    const imgSelectors = [
      'img.feed-shared-image__image',
      'img[class*="feed-shared"]',
      'div[data-urn] img',
      'article img',
    ];
    for (const sel of imgSelectors) {
      const src = $(sel).first().attr('src') || $(sel).first().attr('data-delayed-url');
      if (src && src.startsWith('http') && src.includes('media')) {
        rawMediaUrl = src;
        break;
      }
    }
  }

  // Debug: log what we found (remove after confirmed working)
  console.log('[linkedinScraper] rawProfileImageUrl:', rawProfileImageUrl ? String(rawProfileImageUrl).slice(0, 80) : null);
  console.log('[linkedinScraper] rawMediaUrl:', rawMediaUrl ? String(rawMediaUrl).slice(0, 80) : null);

  // ── 4. Meta description for bio fallback ─────────────────────────────────────
  if (!bio) {
    const desc = $('meta[name="description"]').attr('content') ?? '';
    // Format: "Name | Headline | Post excerpt…"
    const parts = desc.split(' | ');
    if (parts.length >= 2 && parts[1].length < 200) bio = parts[1].trim() || null;
  }

  // ── Validation ────────────────────────────────────────────────────────────────
  if (!name) throw new Error(
    'Could not extract the author name. The post may require login or LinkedIn changed its HTML structure.'
  );
  if (!post_text) throw new Error(
    'Could not extract post text. Ensure the post is publicly visible.'
  );

  // ── 5. Mirror both images to our Supabase bucket (parallel) ──────────────────
  // mirrorImage falls back to the raw URL if our CDN upload fails, so both
  // values are always either a valid URL or null (when no URL was found at all).
  const [image_url, media_url] = await Promise.all([
    rawProfileImageUrl ? mirrorImage(rawProfileImageUrl, 'avatar') : Promise.resolve(null),
    rawMediaUrl        ? mirrorImage(rawMediaUrl,        'media')  : Promise.resolve(null),
  ]);
  // Cast: mirrorImage returns string, but TS sees string | null from the ternaries above

  return { name, bio, post_text, image_url, media_url, post_date, source_url: url };
}
