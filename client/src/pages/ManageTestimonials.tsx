import React, { useState, useEffect } from "react";
import { Star, Trash2, ExternalLink, Link, Loader2 } from "lucide-react";
import {
  getTestimonials,
  adminScrapeTestimonial,
  adminToggleTestimonialStar,
  adminDeleteTestimonial,
  type Testimonial,
} from "../lib/cohortApi";

const ManageTestimonials: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form
  const [url, setUrl] = useState("");
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{ cached: boolean; name: string } | null>(null);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getTestimonials();
      setTestimonials(res.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTestimonials(); }, []);

  const handleScrape = async () => {
    const trimmed = url.trim();
    if (!trimmed) { setScrapeError("Paste a LinkedIn post URL."); return; }
    if (!trimmed.includes("linkedin.com")) { setScrapeError("URL must be a linkedin.com link."); return; }

    setIsScraping(true);
    setScrapeError(null);
    setLastResult(null);

    try {
      const res = await adminScrapeTestimonial(trimmed);
      setLastResult({ cached: res.cached, name: res.data.name });
      setUrl("");
      await fetchTestimonials();
    } catch (err: any) {
      setScrapeError(err.message);
    } finally {
      setIsScraping(false);
    }
  };

  const handleToggleStar = async (id: string, current: boolean) => {
    try {
      await adminToggleTestimonialStar(id, !current);
      setTestimonials((prev) =>
        [...prev.map((t) => (t.id === id ? { ...t, is_starred: !current } : t))]
          .sort((a, b) => Number(b.is_starred) - Number(a.is_starred))
      );
    } catch (err: any) {
      alert("Failed to update: " + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this testimonial?")) return;
    try {
      await adminDeleteTestimonial(id);
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      alert("Failed to delete: " + err.message);
    }
  };

  return (
    <div className="space-y-8">

      {/* ── Scrape Form ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-bold text-gray-900 text-base mb-1">Add Testimonial from LinkedIn</h2>
        <p className="text-gray-400 text-xs mb-5">
          Paste a public LinkedIn post URL — we'll extract the author, text, and profile image automatically.
        </p>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="url"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setScrapeError(null); setLastResult(null); }}
              onKeyDown={(e) => e.key === "Enter" && !isScraping && handleScrape()}
              placeholder="https://www.linkedin.com/posts/..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleScrape}
            disabled={isScraping}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            {isScraping ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Scraping…</>
            ) : (
              "Extract & Save"
            )}
          </button>
        </div>

        {scrapeError && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{scrapeError}</p>
        )}
        {lastResult && (
          <p className="mt-3 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
            {lastResult.cached
              ? `"${lastResult.name}" was already saved — returned from cache.`
              : `Scraped & saved testimonial from ${lastResult.name}.`}
          </p>
        )}

        <p className="mt-4 text-xs text-gray-400">
          <span className="font-medium text-gray-500">How it works:</span> We fetch the post HTML using a
          Googlebot user-agent (LinkedIn serves rendered HTML to crawlers), extract structured data, and
          mirror the profile image to our CDN. The post must be publicly visible.
        </p>
      </div>

      {/* ── Testimonials Grid ───────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-bold text-gray-900 text-base mb-5">
          All Testimonials{" "}
          <span className="text-orange-500 font-medium">({testimonials.length})</span>
        </h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
          </div>
        ) : error ? (
          <p className="text-red-500 bg-red-50 px-4 py-3 rounded-lg text-sm">{error}</p>
        ) : testimonials.length === 0 ? (
          <p className="text-gray-400 text-center py-12 text-sm">No testimonials yet. Add one above.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className={`relative rounded-xl border p-4 flex flex-col gap-3 ${
                  t.is_starred ? "border-orange-300 bg-orange-50/40" : "border-gray-100 bg-gray-50/30"
                }`}
              >
                {t.is_starred && (
                  <span className="absolute top-3 right-3 text-[10px] font-bold bg-orange-500 text-white px-2 py-0.5 rounded-full">
                    FEATURED
                  </span>
                )}

                {/* Author row */}
                <div className="flex items-center gap-3">
                  {t.image_url ? (
                    <img
                      src={t.image_url}
                      alt={t.name}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-gray-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {t.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm leading-tight">{t.name}</p>
                    {t.bio && <p className="text-xs text-gray-500 truncate">{t.bio}</p>}
                  </div>
                </div>

                {/* Post text */}
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">{t.post_text}</p>

                {/* Media attachment */}
                {t.media_url && (
                  <div className="rounded-lg overflow-hidden border border-gray-100">
                    <img
                      src={t.media_url}
                      alt="Attachment"
                      loading="lazy"
                      className="w-full object-cover max-h-32"
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-1">
                  <a
                    href={t.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View on LinkedIn
                  </a>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStar(t.id, t.is_starred)}
                      className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                        t.is_starred
                          ? "bg-orange-100 border-orange-300 text-orange-700 hover:bg-orange-200"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Star className={`h-3 w-3 ${t.is_starred ? "fill-orange-500 text-orange-500" : ""}`} />
                      {t.is_starred ? "Unstar" : "Star"}
                    </button>

                    <button
                      onClick={() => handleDelete(t.id)}
                      className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageTestimonials;
