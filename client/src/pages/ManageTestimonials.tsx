import React, { useState, useEffect, useRef } from "react";
import { Star, Trash2, ExternalLink, Link, Loader2, Upload, User, PenLine, Linkedin } from "lucide-react";
import {
  getTestimonials,
  adminScrapeTestimonial,
  adminToggleTestimonialStar,
  adminDeleteTestimonial,
  adminCreateCustomTestimonial,
  type Testimonial,
} from "../lib/cohortApi";

// ── Live preview card — mirrors the main Testimonials page card ───────────────

interface PreviewData {
  name: string;
  bio: string;
  post_text: string;
  image_url: string | null;
  is_starred: boolean;
  source_url: string;
}

function PreviewCard({ p }: { p: PreviewData }) {
  const isLong = p.post_text.length > 300;
  const displayText = isLong ? p.post_text.slice(0, 300) + "…" : p.post_text;
  const isEmpty = !p.name && !p.post_text;

  if (isEmpty) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center py-14 text-gray-400 text-sm">
        <User className="h-8 w-8 mb-2 opacity-30" />
        Fill in the form to see a live preview
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col rounded-2xl bg-white border overflow-hidden shadow-sm ${
        p.is_starred ? "border-blue-300 ring-1 ring-blue-100" : "border-gray-200"
      }`}
    >
      <div className="p-4 flex flex-col gap-3">
        {/* Author row */}
        <div className="flex items-start gap-3">
          {p.image_url ? (
            <img
              src={p.image_url}
              alt={p.name}
              className="w-12 h-12 rounded-full object-cover flex-shrink-0 border border-gray-100"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
              {p.name ? p.name.charAt(0).toUpperCase() : "?"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm leading-tight">
              {p.name || <span className="text-gray-300">Person Name</span>}
            </p>
            {p.bio && (
              <p className="text-xs text-gray-500 mt-0.5 leading-snug">{p.bio}</p>
            )}
          </div>
        </div>

        {/* Post text */}
        <div>
          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
            {displayText || <span className="text-gray-300">Testimonial text will appear here…</span>}
          </p>
          {isLong && (
            <button className="mt-1 text-xs font-semibold text-blue-600">Show more</button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-gray-50 flex items-center justify-between">
        <span />
        {p.source_url ? (
          <span className="text-xs text-gray-400">View post →</span>
        ) : (
          <span className="text-xs text-gray-300 italic">Custom testimonial</span>
        )}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

const ManageTestimonials: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Tab state ──
  const [addMode, setAddMode] = useState<"linkedin" | "custom">("linkedin");

  // ── LinkedIn form ──
  const [url, setUrl] = useState("");
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{ cached: boolean; name: string } | null>(null);

  // ── Custom form ──
  const [customName, setCustomName] = useState("");
  const [customBio, setCustomBio] = useState("");
  const [customText, setCustomText] = useState("");
  const [customStarred, setCustomStarred] = useState(false);
  const [customImageFile, setCustomImageFile] = useState<File | null>(null);
  const [customImagePreview, setCustomImagePreview] = useState<string | null>(null);
  const [isSubmittingCustom, setIsSubmittingCustom] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);
  const [customSuccess, setCustomSuccess] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

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

  // ── LinkedIn handlers ──

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

  // ── Custom form handlers ──

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCustomImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setCustomImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCustomSubmit = async () => {
    if (!customName.trim()) { setCustomError("Name is required."); return; }
    if (!customText.trim()) { setCustomError("Testimonial text is required."); return; }

    setIsSubmittingCustom(true);
    setCustomError(null);
    setCustomSuccess(null);

    const formData = new FormData();
    formData.append("name", customName.trim());
    formData.append("bio", customBio.trim());
    formData.append("post_text", customText.trim());
    formData.append("is_starred", String(customStarred));
    if (customImageFile) formData.append("image", customImageFile);

    try {
      await adminCreateCustomTestimonial(formData);
      setCustomSuccess(`Testimonial from "${customName}" added successfully.`);
      setCustomName("");
      setCustomBio("");
      setCustomText("");
      setCustomStarred(false);
      setCustomImageFile(null);
      setCustomImagePreview(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
      await fetchTestimonials();
    } catch (err: any) {
      setCustomError(err.message);
    } finally {
      setIsSubmittingCustom(false);
    }
  };

  // ── List handlers ──

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

  // ── Preview data (live) ──
  const previewData: PreviewData = {
    name: customName,
    bio: customBio,
    post_text: customText,
    image_url: customImagePreview,
    is_starred: customStarred,
    source_url: "",
  };

  return (
    <div className="space-y-8">

      {/* ── Add Testimonial Panel ──────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">

        {/* Tab switcher */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setAddMode("linkedin")}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors ${
              addMode === "linkedin"
                ? "border-b-2 border-orange-500 text-orange-600 bg-orange-50/40"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Linkedin className="h-4 w-4" />
            Add from LinkedIn
          </button>
          <button
            onClick={() => setAddMode("custom")}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors ${
              addMode === "custom"
                ? "border-b-2 border-orange-500 text-orange-600 bg-orange-50/40"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <PenLine className="h-4 w-4" />
            Add Custom Testimonial
          </button>
        </div>

        <div className="p-6">

          {/* ── LinkedIn form ── */}
          {addMode === "linkedin" && (
            <>
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
            </>
          )}

          {/* ── Custom form ── */}
          {addMode === "custom" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Form fields */}
              <div className="space-y-4">

                {/* Image upload */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Profile Photo <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <div className="flex items-center gap-4">
                    {customImagePreview ? (
                      <img
                        src={customImagePreview}
                        alt="Preview"
                        className="w-14 h-14 rounded-full object-cover border-2 border-orange-200 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-gray-300" />
                      </div>
                    )}
                    <div>
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="custom-image-upload"
                      />
                      <label
                        htmlFor="custom-image-upload"
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        {customImageFile ? customImageFile.name : "Upload photo"}
                      </label>
                      {customImageFile && (
                        <button
                          onClick={() => {
                            setCustomImageFile(null);
                            setCustomImagePreview(null);
                            if (imageInputRef.current) imageInputRef.current.value = "";
                          }}
                          className="mt-1 text-xs text-red-400 hover:text-red-600"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => { setCustomName(e.target.value); setCustomError(null); }}
                    placeholder="e.g. Sarah Johnson"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>

                {/* Designation */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Designation <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={customBio}
                    onChange={(e) => setCustomBio(e.target.value)}
                    placeholder="e.g. Senior PM at Google · 12 years experience"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>

                {/* Testimonial text */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Testimonial <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={customText}
                    onChange={(e) => { setCustomText(e.target.value); setCustomError(null); }}
                    rows={5}
                    placeholder="Write the testimonial text here…"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">{customText.length} characters</p>
                </div>

                {/* Feature toggle */}
                <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-gray-50 border border-gray-100">
                  <label className="flex items-center gap-2 cursor-pointer select-none flex-1">
                    <div
                      onClick={() => setCustomStarred((v) => !v)}
                      className={`relative w-9 h-5 rounded-full transition-colors ${
                        customStarred ? "bg-orange-500" : "bg-gray-200"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                          customStarred ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Feature this testimonial</p>
                      <p className="text-xs text-gray-400">Appears first on the public page with a highlight border</p>
                    </div>
                  </label>
                  {customStarred && (
                    <Star className="h-4 w-4 fill-orange-500 text-orange-500 flex-shrink-0" />
                  )}
                </div>

                {/* Errors / success */}
                {customError && (
                  <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{customError}</p>
                )}
                {customSuccess && (
                  <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">{customSuccess}</p>
                )}

                {/* Submit */}
                <button
                  onClick={handleCustomSubmit}
                  disabled={isSubmittingCustom}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                >
                  {isSubmittingCustom ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                  ) : (
                    "Save Testimonial"
                  )}
                </button>
              </div>

              {/* Live preview */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Live Preview — main page
                </p>
                <PreviewCard p={previewData} />
                <p className="text-xs text-gray-300 mt-2 text-center">
                  This is exactly how the card will appear on the Testimonials page.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Testimonials Grid ───────────────────────────────────────────────── */}
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

                {/* Source badge */}
                {!t.source_url && (
                  <span className="absolute top-3 left-3 text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                    CUSTOM
                  </span>
                )}

                {/* Author row */}
                <div className={`flex items-center gap-3 ${!t.source_url ? "mt-5" : ""}`}>
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
                  {t.source_url ? (
                    <a
                      href={t.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View on LinkedIn
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400 italic">Custom</span>
                  )}

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
