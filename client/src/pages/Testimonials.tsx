import React, { useEffect, useState } from "react";
import { getTestimonials, type Testimonial } from "../lib/cohortApi";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const LinkedInIcon = () => (
  <svg
    className="w-4 h-4 flex-shrink-0"
    style={{ color: "#0077b5" }}
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 flex flex-col gap-3 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3 bg-gray-200 rounded w-3/5" />
          <div className="h-2.5 bg-gray-100 rounded w-4/5" />
          <div className="h-2.5 bg-gray-100 rounded w-2/3" />
        </div>
      </div>
      <div className="space-y-1.5 mt-1">
        <div className="h-2.5 bg-gray-100 rounded" />
        <div className="h-2.5 bg-gray-100 rounded" />
        <div className="h-2.5 bg-gray-100 rounded w-4/5" />
      </div>
      <div className="h-36 bg-gray-100 rounded-xl" />
    </div>
  );
}

// ── LinkedIn-style card ───────────────────────────────────────────────────────

function TestimonialCard({ t }: { t: Testimonial }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = t.post_text.length > 300;
  const displayText = isLong && !expanded ? t.post_text.slice(0, 300) : t.post_text;
  const isLinkedIn = !!t.source_url;

  const cardClass = `flex flex-col rounded-2xl bg-white border overflow-hidden shadow-sm transition-all duration-200 ${
    t.is_starred ? "border-blue-300 ring-1 ring-blue-100" : "border-gray-200"
  } ${isLinkedIn ? "hover:shadow-md cursor-pointer" : ""}`;

  const cardContent = (
    <>
      <div className="p-4 flex flex-col gap-3">
        {/* ── Author row ── */}
        <div className="flex items-start gap-3">
          {/* Profile photo */}
          {t.image_url ? (
            <img
              src={t.image_url}
              alt={t.name}
              loading="lazy"
              decoding="async"
              className="w-12 h-12 rounded-full object-cover flex-shrink-0 border border-gray-100"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
              {t.name.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Name + bio */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold text-gray-900 text-sm leading-tight">{t.name}</p>
              {isLinkedIn && <LinkedInIcon />}
            </div>
            {t.bio && (
              <p className="text-xs text-gray-500 mt-0.5 leading-snug">{t.bio}</p>
            )}
          </div>
        </div>

        {/* ── Post text ── */}
        <div>
          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
            {displayText}
            {isLong && !expanded && "…"}
          </p>
          {isLong && (
            <button
              data-expand="true"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpanded((v) => !v); }}
              className="mt-1 text-xs font-semibold text-blue-600 hover:underline"
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>

        {/* ── Post media attachment ── */}
        {t.media_url && (
          <div className="rounded-xl overflow-hidden border border-gray-100 mt-1">
            <img
              src={t.media_url}
              alt="Post attachment"
              loading="lazy"
              decoding="async"
              className="w-full object-cover max-h-60"
            />
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      {(t.post_date || isLinkedIn) && (
        <div className="px-4 py-2.5 border-t border-gray-50 flex items-center justify-between">
          {t.post_date ? (
            <span className="text-xs text-gray-400">{formatDate(t.post_date)}</span>
          ) : (
            <span />
          )}
          {isLinkedIn && (
            <span className="text-xs text-gray-400 hover:text-blue-500 transition-colors">
              View post →
            </span>
          )}
        </div>
      )}
    </>
  );

  if (isLinkedIn) {
    return (
      <a
        href={t.source_url}
        target="_blank"
        rel="noopener noreferrer"
        className={cardClass}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("[data-expand]")) e.preventDefault();
        }}
      >
        {cardContent}
      </a>
    );
  }

  return <div className={cardClass}>{cardContent}</div>;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export const Testimonials = (): JSX.Element => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTestimonials()
      .then((res) => setTestimonials(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f2ed]">
      {/* Header */}
      <section className="py-14 px-4 text-center">
        <p
          className="text-xs font-bold tracking-[0.2em] uppercase mb-3 text-gray-400"
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          Community Voices
        </p>
        <h1
          className="leading-none mb-4 text-gray-900"
          style={{
            fontFamily: "'Bebas Neue', 'Impact', sans-serif",
            fontSize: "clamp(3rem, 8vw, 6rem)",
            letterSpacing: "0.03em",
            fontWeight: 400,
          }}
        >
          What People Are Saying
        </h1>
        <p className="text-gray-500 text-base max-w-xl mx-auto">
          Real feedback from product managers and AI practitioners who've leveled up with us.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-20">
        {loading ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="break-inside-avoid"><SkeletonCard /></div>
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-red-500 py-12">{error}</p>
        ) : testimonials.length === 0 ? (
          <p className="text-center text-gray-400 py-20">No testimonials yet — check back soon.</p>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
            {testimonials.map((t) => (
              <div key={t.id} className="break-inside-avoid">
                <TestimonialCard t={t} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Testimonials;
