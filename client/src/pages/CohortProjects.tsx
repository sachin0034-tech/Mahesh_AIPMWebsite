import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getPublishedProjects } from "@/lib/cohortApi";
import type { CohortProject, ProjectSectionAssignment } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "top10" | "awards" | "cohort8";

interface ProjectWithSections extends CohortProject {
  sections: ProjectSectionAssignment[];
}


const ACCENT = ["#6366f1", "#a855f7", "#f59e0b"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

// ─── Project Modal ────────────────────────────────────────────────────────────

// ─── Dark Card (shared across all sections) ───────────────────────────────────

function DarkCard({
  project, rank, showAward, index, onView,
}: {
  project: ProjectWithSections;
  rank: number;
  showAward?: boolean;
  index: number;
  onView: () => void;
}) {
  const color = ACCENT[index % ACCENT.length];
  const awardSection = project.sections.find((s) => s.section === "awards");

  return (
    <div
      onClick={onView}
      className="group relative flex flex-col justify-between min-h-[180px] p-7 cursor-pointer transition-all duration-200"
      style={{ background: "#161a22" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#1c2230"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#161a22"; }}
    >
      {/* Award badge */}
      {showAward && awardSection?.award_name && (
        <span
          className="inline-flex self-start items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full mb-3"
          style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.25)" }}
        >
          {awardSection.award_name}
        </span>
      )}

      {/* Title */}
      <h3
        className="text-white/90 font-semibold leading-snug pr-14"
        style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.1rem" }}
      >
        {project.title}
      </h3>

      {/* Builder row */}
      <div className="flex items-center gap-3 mt-6">
        {project.user_image_url ? (
          <img
            src={project.user_image_url}
            alt={project.builder_name}
            className="w-11 h-11 rounded-full object-cover flex-shrink-0"
            style={{ border: "2px solid rgba(255,255,255,0.12)" }}
          />
        ) : (
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${color}cc, ${color}66)`,
              border: "2px solid rgba(255,255,255,0.12)",
            }}
          >
            {getInitials(project.builder_name)}
          </div>
        )}
        <div className="flex flex-col min-w-0">
          <span className="text-white/85 text-[0.9rem] font-semibold truncate leading-tight">
            {project.builder_name}
          </span>
          <span className="text-white/30 text-[0.7rem] font-medium tracking-wide mt-0.5 uppercase">
            Builder
          </span>
        </div>
      </div>

      {/* Rank — always visible */}
      <span
        className="absolute bottom-4 right-5 leading-none select-none"
        style={{
          fontFamily: "'Bebas Neue', 'Impact', sans-serif",
          fontSize: "88px",
          fontWeight: 900,
          color: "rgba(255,255,255,0.06)",
        }}
      >
        {rank}
      </span>

      {/* Accent dot */}
      <span
        className="absolute top-4 right-5 w-1.5 h-1.5 rounded-full opacity-40"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

// ─── Light Card ───────────────────────────────────────────────────────────────

function LightCard({
  project, rank, showAward, index, onView,
}: {
  project: ProjectWithSections;
  rank: number;
  showAward?: boolean;
  index: number;
  onView: () => void;
}) {
  const color = ACCENT[index % ACCENT.length];
  const awardSection = project.sections.find((s) => s.section === "awards");

  return (
    <div
      onClick={onView}
      className="group relative flex flex-col justify-between min-h-[180px] p-7 cursor-pointer transition-all duration-200"
      style={{ background: "#ffffff" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#f9f7f4"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#ffffff"; }}
    >
      {/* Award badge */}
      {showAward && awardSection?.award_name && (
        <span
          className="inline-flex self-start items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full mb-3"
          style={{ background: "rgba(245,158,11,0.1)", color: "#b45309", border: "1px solid rgba(245,158,11,0.3)" }}
        >
          {awardSection.award_name}
        </span>
      )}

      {/* Title */}
      <h3
        className="font-semibold leading-snug pr-14"
        style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.1rem", color: "#111827" }}
      >
        {project.title}
      </h3>

      {/* Builder row */}
      <div className="flex items-center gap-3 mt-6">
        {project.user_image_url ? (
          <img
            src={project.user_image_url}
            alt={project.builder_name}
            className="w-11 h-11 rounded-full object-cover flex-shrink-0"
            style={{ border: "2px solid #e5e7eb" }}
          />
        ) : (
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${color}dd, ${color}88)`,
              border: "2px solid #e5e7eb",
            }}
          >
            {getInitials(project.builder_name)}
          </div>
        )}
        <div className="flex flex-col min-w-0">
          <span className="text-[0.9rem] font-semibold truncate leading-tight" style={{ color: "#1f2937" }}>
            {project.builder_name}
          </span>
          <span className="text-[0.7rem] font-medium tracking-wide mt-0.5 uppercase" style={{ color: "#9ca3af" }}>
            Builder
          </span>
        </div>
      </div>

      {/* Rank — always visible */}
      <span
        className="absolute bottom-4 right-5 leading-none select-none"
        style={{
          fontFamily: "'Bebas Neue', 'Impact', sans-serif",
          fontSize: "88px",
          fontWeight: 900,
          color: "#f3f4f6",
        }}
      >
        {rank}
      </span>

      {/* Accent dot */}
      <span
        className="absolute top-4 right-5 w-1.5 h-1.5 rounded-full opacity-50"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

// ─── Project Section (sliding carousel, 2 rows × 3 cols) ─────────────────────

const ITEMS_PER_PAGE = 6;

function ProjectSection({
  label, title, sub, projects, sectionKey, showAward, loading, onView,
  bg = "#111418", variant = "dark", seeAllLink,
}: {
  label: string;
  title: string;
  sub: string;
  projects: ProjectWithSections[];
  sectionKey: Tab;
  showAward?: boolean;
  loading: boolean;
  onView: (project: ProjectWithSections) => void;
  bg?: string;
  variant?: "dark" | "light";
  seeAllLink?: string;
}) {
  const [page, setPage] = useState(0);
  const isLight = variant === "light";

  const filtered = projects
    .filter((p) => p.sections.some((s) => s.section === sectionKey))
    .sort((a, b) => {
      const ra = a.sections.find((s) => s.section === sectionKey)?.rank ?? 999;
      const rb = b.sections.find((s) => s.section === sectionKey)?.rank ?? 999;
      return ra - rb;
    });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  // Build slide groups
  const slides = Array.from({ length: totalPages }, (_, i) =>
    filtered.slice(i * ITEMS_PER_PAGE, (i + 1) * ITEMS_PER_PAGE)
  );

  useEffect(() => { setPage(0); }, [filtered.length]);

  const dividerColor = isLight ? "#e5e7eb" : "rgba(255,255,255,0.10)";
  const emptyBg      = isLight ? "#ffffff" : "#161a22";

  const prev = () => setPage((p) => Math.max(0, p - 1));
  const next = () => setPage((p) => Math.min(totalPages - 1, p + 1));

  // Arrow button styles
  const arrowStyle = (disabled: boolean): React.CSSProperties => ({
    width: 36, height: 36, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    border: isLight ? "1.5px solid #d1d5db" : "1.5px solid rgba(255,255,255,0.18)",
    background: isLight ? "#ffffff" : "rgba(255,255,255,0.06)",
    color: isLight ? (disabled ? "#d1d5db" : "#374151") : (disabled ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.7)"),
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.18s ease",
    flexShrink: 0,
  });

  return (
    <section
      className="relative px-4 sm:px-6 lg:px-10 py-16 overflow-hidden"
      style={{ background: bg }}
    >
      <div className="relative max-w-screen-xl mx-auto">

        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p
              className="text-xs font-bold tracking-[0.2em] uppercase mb-2"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", color: isLight ? "#9ca3af" : "rgba(255,255,255,0.3)" }}
            >
              {label}
            </p>
            <h2
              className="leading-none"
              style={{
                fontFamily: "'Bebas Neue', 'Impact', sans-serif",
                fontSize: "clamp(2.2rem, 4vw, 3.2rem)",
                letterSpacing: "0.03em",
                fontWeight: 400,
                color: isLight ? "#111827" : "#ffffff",
              }}
            >
              {title}
            </h2>
            <p className="text-xs mt-1.5" style={{ color: isLight ? "#6b7280" : "rgba(255,255,255,0.25)" }}>
              {sub}
            </p>
          </div>

          {/* Right: count + See All */}
          <div className="flex flex-col items-end gap-2">
            {!loading && filtered.length > 0 && (
              <span
                className="text-xs font-bold tracking-[0.15em] uppercase"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", color: isLight ? "#d1d5db" : "rgba(255,255,255,0.2)" }}
              >
                {filtered.length} Tool{filtered.length !== 1 ? "s" : ""}
              </span>
            )}
            {seeAllLink && !loading && filtered.length > ITEMS_PER_PAGE && (
              <Link
                to={seeAllLink}
                className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-200"
                style={
                  isLight
                    ? { background: "#111827", color: "#ffffff" }
                    : { background: "rgba(255,255,255,0.12)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.15)" }
                }
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.85"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}
              >
                See All
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
        </div>

        {/* Carousel body */}
        {loading ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px] rounded-2xl overflow-hidden"
            style={{ background: dividerColor }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-7 min-h-[180px] animate-pulse"
                style={{ background: isLight ? "#f9f9f9" : "rgba(255,255,255,0.03)" }}
              >
                <div className={`h-3 w-3/4 rounded mb-2 ${isLight ? "bg-gray-200" : "bg-white/10"}`} />
                <div className={`h-3 w-1/2 rounded ${isLight ? "bg-gray-200" : "bg-white/10"}`} />
                <div className="flex items-center gap-3 mt-6">
                  <div className={`w-11 h-11 rounded-full flex-shrink-0 ${isLight ? "bg-gray-200" : "bg-white/10"}`} />
                  <div className="space-y-1.5">
                    <div className={`h-2.5 w-24 rounded ${isLight ? "bg-gray-200" : "bg-white/10"}`} />
                    <div className={`h-2 w-12 rounded ${isLight ? "bg-gray-200" : "bg-white/10"}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl p-14 text-center"
            style={isLight ? { background: "#f9f9f9", border: "1px solid #e5e7eb" } : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <p className="text-sm" style={{ color: isLight ? "#9ca3af" : "rgba(255,255,255,0.3)" }}>
              No tools listed here yet — check back soon.
            </p>
          </div>
        ) : (
          <>
            {/* Slide track — overflow hidden clips the sliding panels */}
            <div
              style={{
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: isLight ? "0 20px 60px rgba(0,0,0,0.08)" : "0 32px 80px rgba(0,0,0,0.5)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  transform: `translateX(-${page * 100}%)`,
                  transition: "transform 0.42s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                {slides.map((slideItems, slideIndex) => (
                  <div key={slideIndex} style={{ minWidth: "100%", flexShrink: 0 }}>
                    <div
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px]"
                      style={{ background: dividerColor }}
                    >
                      {slideItems.map((project, index) => {
                        const globalIndex = slideIndex * ITEMS_PER_PAGE + index;
                        return isLight ? (
                          <LightCard
                            key={project.id}
                            project={project}
                            rank={globalIndex + 1}
                            showAward={showAward}
                            index={globalIndex}
                            onView={() => onView(project)}
                          />
                        ) : (
                          <DarkCard
                            key={project.id}
                            project={project}
                            rank={globalIndex + 1}
                            showAward={showAward}
                            index={globalIndex}
                            onView={() => onView(project)}
                          />
                        );
                      })}
                      {/* Fill empty slots on last slide */}
                      {Array.from({ length: ITEMS_PER_PAGE - slideItems.length }).map((_, i) => (
                        <div key={`empty-${i}`} className="min-h-[180px]" style={{ background: emptyBg }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Controls: arrows + dots */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                {/* Prev */}
                <button
                  onClick={prev}
                  disabled={page === 0}
                  style={arrowStyle(page === 0)}
                  onMouseEnter={(e) => { if (page !== 0) (e.currentTarget as HTMLButtonElement).style.opacity = "0.75"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>

                {/* Dot indicators */}
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      style={{
                        width: i === page ? 20 : 6,
                        height: 6,
                        borderRadius: 3,
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.25s ease",
                        background: i === page
                          ? (isLight ? "#111827" : "rgba(255,255,255,0.75)")
                          : (isLight ? "#d1d5db" : "rgba(255,255,255,0.18)"),
                        padding: 0,
                      }}
                    />
                  ))}
                </div>

                {/* Next */}
                <button
                  onClick={next}
                  disabled={page === totalPages - 1}
                  style={arrowStyle(page === totalPages - 1)}
                  onMouseEnter={(e) => { if (page !== totalPages - 1) (e.currentTarget as HTMLButtonElement).style.opacity = "0.75"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────

const HERO_WORDS = ["DISCOVER.", "BUILD.", "DEPLOY.", "INSPIRE.", "LAUNCH."];

function HeroSection() {
  const [wordIndex, setWordIndex] = useState(0);
  const [animState, setAnimState] = useState<"visible" | "exit" | "enter">("visible");

  // Parallax refs — direct DOM writes, no React state
  const textRef  = useRef<HTMLDivElement>(null);
  const blob1Ref = useRef<HTMLDivElement>(null);
  const blob2Ref = useRef<HTMLDivElement>(null);
  const rafRef   = useRef<number>(0);

  // Word rotator
  useEffect(() => {
    const cycle = () => {
      setAnimState("exit");
      setTimeout(() => {
        setWordIndex((i) => (i + 1) % HERO_WORDS.length);
        setAnimState("enter");
        setTimeout(() => setAnimState("visible"), 300);
      }, 300);
    };
    const id = setInterval(cycle, 2500);
    return () => clearInterval(id);
  }, []);

  // Parallax — rAF loop writing transforms directly to the DOM
  useEffect(() => {
    const tick = () => {
      const y = window.scrollY;
      if (textRef.current)
        textRef.current.style.transform = `translateY(${-y * 0.28}px)`;
      if (blob1Ref.current)
        blob1Ref.current.style.transform = `translateY(${y * 0.5}px)`;
      if (blob2Ref.current)
        blob2Ref.current.style.transform = `translateY(${-y * 0.3}px)`;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const scrollToTop10 = () => {
    document.getElementById("top10-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const wordStyle: React.CSSProperties = {
    fontFamily: "'Bebas Neue', 'Impact', sans-serif",
    fontSize: "clamp(72px, 12vw, 160px)",
    lineHeight: 0.9,
    letterSpacing: "-0.01em",
    color: "#1a1a1a",
    display: "block",
    transition: "opacity 0.3s ease, transform 0.3s ease",
    opacity: animState === "exit" ? 0 : 1,
    transform: animState === "exit" ? "translateY(-18px)" : animState === "enter" ? "translateY(14px)" : "translateY(0)",
    willChange: "transform, opacity",
  };

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "#f5f2ed", display: "flex", flexDirection: "column" }}
    >
      {/* Grain texture */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat", backgroundSize: "180px", opacity: 0.5, zIndex: 0,
      }} />

      {/* Parallax background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div ref={blob1Ref} style={{ position: "absolute", top: "10%", left: "5%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, #6366f118 0%, transparent 70%)", willChange: "transform" }} />
        <div ref={blob2Ref} style={{ position: "absolute", bottom: "20%", right: "8%", width: "380px", height: "380px", borderRadius: "50%", background: "radial-gradient(circle, #a855f712 0%, transparent 70%)", willChange: "transform" }} />
      </div>

      {/* ── Centered hero text ── */}
      <div
        ref={textRef}
        className="relative z-10 flex flex-col items-center text-center px-6"
        style={{ paddingTop: "5vh", paddingBottom: "4vh", willChange: "transform" }}
      >
        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.2em", color: "#1a1a1a", opacity: 0.38, marginBottom: "1.2rem" }}>
          AI TOOLS · BUILT BY THE COMMUNITY · FREE TO USE
        </p>

        <div style={{ overflow: "hidden", marginBottom: "1rem" }}>
          <span style={wordStyle}>{HERO_WORDS[wordIndex]}</span>
        </div>

        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "clamp(0.85rem, 1.8vw, 1.15rem)", letterSpacing: "0.12em", color: "#1a1a1a", opacity: 0.45, lineHeight: 1.5, maxWidth: "560px" }}>
          BROWSE AI TOOLS BUILT BY REAL PEOPLE. FIND ONE YOU NEED. USE IT TODAY.
        </p>

        {/* Scroll indicator */}
        <button
          onClick={scrollToTop10}
          style={{ marginTop: "2.5rem", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}
        >
          {/* Mouse shell */}
          <div style={{
            width: "26px", height: "42px", borderRadius: "13px",
            border: "2px solid rgba(26,26,26,0.35)",
            display: "flex", justifyContent: "center", paddingTop: "7px",
          }}>
            {/* Scroll wheel dot — CSS bounce via keyframes injected once */}
            <div
              className="scroll-dot"
              style={{
                width: "4px", height: "8px", borderRadius: "2px",
                background: "#1a1a1a", opacity: 0.5,
                animation: "scrollDot 1.6s ease-in-out infinite",
              }}
            />
          </div>
          {/* Label */}
          <span style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700, fontSize: "0.62rem", letterSpacing: "0.18em",
            color: "#1a1a1a", opacity: 0.3,
          }}>
            SCROLL
          </span>
        </button>

        <style>{`
          @keyframes scrollDot {
            0%   { transform: translateY(0);   opacity: 0.5; }
            40%  { transform: translateY(8px);  opacity: 0.15; }
            100% { transform: translateY(0);   opacity: 0.5; }
          }
        `}</style>
      </div>

    </section>
  );
}

// ─── Trending Section ─────────────────────────────────────────────────────────

function TrendingSection({
  projects, loading, onView,
}: {
  projects: ProjectWithSections[];
  loading: boolean;
  onView: (project: ProjectWithSections) => void;
}) {
  const sorted = projects
    .filter((p) => p.sections.some((s) => s.section === "top10"))
    .sort((a, b) => {
      const ra = a.sections.find((s) => s.section === "top10")?.rank ?? 999;
      const rb = b.sections.find((s) => s.section === "top10")?.rank ?? 999;
      return ra - rb;
    });

  return (
    <section
      className="relative px-4 sm:px-6 lg:px-10 py-16 overflow-hidden"
      style={{ background: "linear-gradient(160deg, #0d1117 0%, #0B1120 50%, #0e0b1f 100%)" }}
    >
      {/* Subtle radial glow accents */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "-80px", left: "-60px",
          width: "500px", height: "500px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "-100px", right: "-80px",
          width: "420px", height: "420px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-10">
          <div>
            <p
              className="text-white/30 text-xs font-bold tracking-[0.2em] uppercase mb-2"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              Community Top Picks
            </p>
            <h2
              className="text-white leading-none"
              style={{
                fontFamily: "'Bebas Neue', 'Impact', sans-serif",
                fontSize: "clamp(2.2rem, 4vw, 3.2rem)",
                letterSpacing: "0.03em",
                fontWeight: 400,
              }}
            >
              Trending Projects
            </h2>
          </div>
          {!loading && sorted.length > 0 && (
            <span
              className="text-white/20 text-xs font-bold tracking-[0.15em] uppercase pb-1"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              {sorted.length} Tool{sorted.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px] rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.07)" }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-7 min-h-[170px] animate-pulse" style={{ background: "rgba(255,255,255,0.03)" }}>
                <div className="h-3 w-3/4 rounded bg-white/10 mb-2" />
                <div className="h-3 w-1/2 rounded bg-white/10" />
                <div className="flex items-center gap-3 mt-6">
                  <div className="w-11 h-11 rounded-full bg-white/10 flex-shrink-0" />
                  <div className="space-y-1.5">
                    <div className="h-2.5 w-24 rounded bg-white/10" />
                    <div className="h-2 w-12 rounded bg-white/10" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div
            className="rounded-2xl p-14 text-center"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <p className="text-white/30 text-sm">No tools listed yet — check back soon.</p>
          </div>
        ) : (
          /* gap-[1px] + dark bg = crisp divider lines at all breakpoints */
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px] rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.10)", boxShadow: "0 32px 80px rgba(0,0,0,0.5)" }}
          >
            {sorted.map((project, index) => {
              const color = ACCENT[index % ACCENT.length];
              return (
                <div
                  key={project.id}
                  onClick={() => onView(project)}
                  className="group relative flex flex-col justify-between min-h-[180px] p-7 cursor-pointer transition-all duration-200"
                  style={{ background: "#0f1623" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = "#141c2e";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = "#0f1623";
                  }}
                >
                  {/* Top: title */}
                  <h3
                    className="text-white/90 font-semibold text-[0.95rem] leading-snug pr-14"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {project.title}
                  </h3>

                  {/* Bottom: avatar + name + Builder label */}
                  <div className="flex items-center gap-3 mt-6">
                    {project.user_image_url ? (
                      <img
                        src={project.user_image_url}
                        alt={project.builder_name}
                        className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                        style={{ border: "2px solid rgba(255,255,255,0.12)" }}
                      />
                    ) : (
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${color}cc, ${color}66)`,
                          border: "2px solid rgba(255,255,255,0.12)",
                        }}
                      >
                        {getInitials(project.builder_name)}
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="text-white/85 text-[0.9rem] font-semibold truncate leading-tight">
                        {project.builder_name}
                      </span>
                      <span className="text-white/30 text-[0.72rem] font-medium tracking-wide mt-0.5 uppercase">
                        Builder
                      </span>
                    </div>
                  </div>

                  {/* Rank — always visible, large ghost number */}
                  <span
                    className="absolute bottom-4 right-5 leading-none select-none transition-opacity duration-200 group-hover:opacity-100"
                    style={{
                      fontFamily: "'Bebas Neue', 'Impact', sans-serif",
                      fontSize: "88px",
                      fontWeight: 900,
                      color: "rgba(255,255,255,0.06)",
                    }}
                  >
                    {index + 1}
                  </span>

                  {/* Subtle top-left accent dot */}
                  <span
                    className="absolute top-4 right-5 w-1.5 h-1.5 rounded-full opacity-40"
                    style={{ backgroundColor: color }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export const CohortProjects = (): JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();
  const [allProjects, setAllProjects] = useState<ProjectWithSections[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await getPublishedProjects();
        setAllProjects(data ?? []);
      } catch {
        setAllProjects([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const goToProject = (p: ProjectWithSections) => navigate(`/project/${p.id}`);

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#f5f2ed]">

      {/* ── Nav ───────────────────────────────────────────────────────────── */}
      <header className="w-full sticky top-0 z-40 bg-[#f5f2ed]/90 backdrop-blur-md border-b border-black/[0.06]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex flex-col leading-none select-none">
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.02em", color: "#1a1a1a", lineHeight: 1 }}>
              MYAI
            </span>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.02em", color: "#1a1a1a", lineHeight: 1 }}>
              COMMUNITY
            </span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6">
            {[
              { to: "/", label: "HOME" },
            ].map(({ to, label }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.1em" }}
                  className={`transition-colors ${isActive ? "text-black border-b-2 border-black pb-0.5" : "text-black/50 hover:text-black"}`}
                >
                  {label}
                </Link>
              );
            })}

            {/* Divider */}
            <span style={{ width: 1, height: 18, background: "rgba(0,0,0,0.12)", display: "inline-block" }} />

            {/* Project Login */}
            <Link
              to="/project-login"
              style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.1em",
                padding: "6px 14px", borderRadius: 8,
                border: "1.5px solid rgba(0,0,0,0.18)", color: "#1a1a1a",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(0,0,0,0.05)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
            >
              PROJECT LOGIN
            </Link>

            {/* Admin Login */}
            <Link
              to="/cohort-admin"
              style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.1em",
                padding: "6px 14px", borderRadius: 8,
                background: "#1a1a1a", color: "#f5f2ed",
                transition: "opacity 0.15s ease",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.8"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}
            >
              ADMIN LOGIN
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <HeroSection />

      {/* ── Top 10 Projects ───────────────────────────────────────────────── */}
      <div id="top10-section" />
      <TrendingSection
        projects={allProjects}
        loading={loading}
        onView={(p) => goToProject(p)}
      />


      {/* ── Award Winning ─────────────────────────────────────────────────── */}
      <ProjectSection
        label="Expert Recognition"
        title="STANDOUT BUILDS"
        sub="Hand-picked by instructors for exceptional quality and real-world usefulness"
        projects={allProjects}
        sectionKey="awards"
        showAward
        loading={loading}
        bg="#f5f2ed"
        variant="light"
        seeAllLink="/all-projects/awards"
        onView={(p) => goToProject(p)}
      />

      {/* ── All Projects ──────────────────────────────────────────────────── */}
      <ProjectSection
        label="AI Marketplace"
        title="Explore More"
        sub="Browse every tool built by our community discover, use, and get inspired"
        projects={allProjects}
        sectionKey="cohort8"
        loading={loading}
        bg="#eef1ff"
        variant="light"
        seeAllLink="/all-projects/cohort8"
        onView={(p) => goToProject(p)}
      />

    </div>
  );
};
