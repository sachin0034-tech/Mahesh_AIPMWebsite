import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getPublishedProjects } from "@/lib/cohortApi";
import type { CohortProject, ProjectSectionAssignment } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProjectWithSections extends CohortProject {
  sections: ProjectSectionAssignment[];
}

const ACCENT = ["#6366f1", "#a855f7", "#f59e0b"];

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function Card({
  project, rank, showAward, index, onView, isLight,
}: {
  project: ProjectWithSections;
  rank: number;
  showAward?: boolean;
  index: number;
  onView: () => void;
  isLight: boolean;
}) {
  const color = ACCENT[index % ACCENT.length];
  const awardSection = project.sections.find((s) => s.section === "awards");

  const bg = isLight ? "#ffffff" : "#161a22";
  const bgHover = isLight ? "#f9f7f4" : "#1c2230";

  return (
    <div
      onClick={onView}
      className="group relative flex flex-col justify-between min-h-[180px] p-7 cursor-pointer transition-all duration-200"
      style={{ background: bg }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = bgHover; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = bg; }}
    >
      {showAward && awardSection?.award_name && (
        <span
          className="inline-flex self-start items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full mb-3"
          style={
            isLight
              ? { background: "rgba(245,158,11,0.1)", color: "#b45309", border: "1px solid rgba(245,158,11,0.3)" }
              : { background: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.25)" }
          }
        >
          🏆 {awardSection.award_name}
        </span>
      )}

      <h3
        className="font-semibold leading-snug pr-14"
        style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.1rem", color: isLight ? "#111827" : "rgba(255,255,255,0.9)" }}
      >
        {project.title}
      </h3>

      <div className="flex items-center gap-3 mt-6">
        {project.user_image_url ? (
          <img
            src={project.user_image_url}
            alt={project.builder_name}
            className="w-11 h-11 rounded-full object-cover flex-shrink-0"
            style={{ border: isLight ? "2px solid #e5e7eb" : "2px solid rgba(255,255,255,0.12)" }}
          />
        ) : (
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${color}dd, ${color}88)`,
              border: isLight ? "2px solid #e5e7eb" : "2px solid rgba(255,255,255,0.12)",
            }}
          >
            {getInitials(project.builder_name)}
          </div>
        )}
        <div className="flex flex-col min-w-0">
          <span
            className="text-[0.9rem] font-semibold truncate leading-tight"
            style={{ color: isLight ? "#1f2937" : "rgba(255,255,255,0.85)" }}
          >
            {project.builder_name}
          </span>
          <span
            className="text-[0.7rem] font-medium tracking-wide mt-0.5 uppercase"
            style={{ color: isLight ? "#9ca3af" : "rgba(255,255,255,0.3)" }}
          >
            Builder
          </span>
        </div>
      </div>

      <span
        className="absolute bottom-4 right-5 leading-none select-none"
        style={{
          fontFamily: "'Bebas Neue', 'Impact', sans-serif",
          fontSize: "88px",
          fontWeight: 900,
          color: isLight ? "#f3f4f6" : "rgba(255,255,255,0.06)",
        }}
      >
        {rank}
      </span>

      <span
        className="absolute top-4 right-5 w-1.5 h-1.5 rounded-full opacity-50"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function SkeletonGrid({ isLight }: { isLight: boolean }) {
  const divider = isLight ? "#e5e7eb" : "rgba(255,255,255,0.10)";
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px] rounded-2xl overflow-hidden"
      style={{ background: divider }}
    >
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="p-7 min-h-[180px] animate-pulse"
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
  );
}

// ─── Config per section ───────────────────────────────────────────────────────

const SECTION_CONFIG = {
  awards: {
    label: "Expert Recognition",
    title: "STANDOUT BUILDS",
    sub: "Hand-picked by instructors for exceptional quality and real-world usefulness",
    bg: "#f5f2ed",
    isLight: true,
    showAward: true,
    backTo: "/cohort-projects",
  },
  cohort8: {
    label: "AI Marketplace",
    title: "Explore More",
    sub: "Every tool built by our community — discover, use, and get inspired",
    bg: "#eef1ff",
    isLight: true,
    showAward: false,
    backTo: "/cohort-projects",
  },
} as const;

type SectionParam = keyof typeof SECTION_CONFIG;

// ─── Page ─────────────────────────────────────────────────────────────────────

export const AllProjectsPage = (): JSX.Element => {
  const { section } = useParams<{ section: string }>();
  const navigate = useNavigate();
  const cfg = SECTION_CONFIG[(section as SectionParam) ?? "cohort8"] ?? SECTION_CONFIG.cohort8;

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

  const filtered = allProjects
    .filter((p) => p.sections.some((s) => s.section === section))
    .sort((a, b) => {
      const ra = a.sections.find((s) => s.section === section)?.rank ?? 999;
      const rb = b.sections.find((s) => s.section === section)?.rank ?? 999;
      return ra - rb;
    });

  const dividerColor = cfg.isLight ? "#e5e7eb" : "rgba(255,255,255,0.10)";

  return (
    <div className="flex flex-col w-full min-h-screen" style={{ background: cfg.bg }}>

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <header
        className="w-full sticky top-0 z-40 backdrop-blur-md border-b"
        style={{
          background: cfg.isLight ? `${cfg.bg}e6` : "rgba(13,17,23,0.92)",
          borderColor: cfg.isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(cfg.backTo)}
            className="flex items-center gap-2 transition-opacity hover:opacity-70"
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: "0.8rem",
              letterSpacing: "0.1em",
              color: cfg.isLight ? "#1a1a1a" : "#ffffff",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            BACK
          </button>

          <Link to="/" className="flex flex-col leading-none select-none">
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.4rem", letterSpacing: "-0.02em", color: cfg.isLight ? "#1a1a1a" : "#ffffff", lineHeight: 1 }}>
              MYAI
            </span>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.4rem", letterSpacing: "-0.02em", color: cfg.isLight ? "#1a1a1a" : "#ffffff", lineHeight: 1 }}>
              COMMUNITY
            </span>
          </Link>

          {!loading && (
            <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "0.75rem",
                letterSpacing: "0.15em",
                color: cfg.isLight ? "#9ca3af" : "rgba(255,255,255,0.3)",
              }}
            >
              {filtered.length} TOOL{filtered.length !== 1 ? "S" : ""}
            </span>
          )}
        </div>
      </header>

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto w-full px-4 sm:px-6 lg:px-10 pt-14 pb-10">
        <p
          className="text-xs font-bold tracking-[0.2em] uppercase mb-2"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", color: cfg.isLight ? "#9ca3af" : "rgba(255,255,255,0.3)" }}
        >
          {cfg.label}
        </p>
        <h1
          className="leading-none"
          style={{
            fontFamily: "'Bebas Neue', 'Impact', sans-serif",
            fontSize: "clamp(2.4rem, 5vw, 4rem)",
            letterSpacing: "0.03em",
            fontWeight: 400,
            color: cfg.isLight ? "#111827" : "#ffffff",
          }}
        >
          {cfg.title}
        </h1>
        <p
          className="text-sm mt-2"
          style={{ color: cfg.isLight ? "#6b7280" : "rgba(255,255,255,0.4)", maxWidth: "520px" }}
        >
          {cfg.sub}
        </p>
      </div>

      {/* ── Grid ────────────────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto w-full px-4 sm:px-6 lg:px-10 pb-20">
        {loading ? (
          <SkeletonGrid isLight={cfg.isLight} />
        ) : filtered.length === 0 ? (
          <div
            className="rounded-2xl p-14 text-center"
            style={
              cfg.isLight
                ? { background: "#f9f9f9", border: "1px solid #e5e7eb" }
                : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }
            }
          >
            <p className="text-sm" style={{ color: cfg.isLight ? "#9ca3af" : "rgba(255,255,255,0.3)" }}>
              No tools listed here yet — check back soon.
            </p>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px] rounded-2xl overflow-hidden"
            style={
              cfg.isLight
                ? { background: dividerColor, boxShadow: "0 20px 60px rgba(0,0,0,0.08)" }
                : { background: dividerColor, boxShadow: "0 32px 80px rgba(0,0,0,0.5)" }
            }
          >
            {filtered.map((project, index) => (
              <Card
                key={project.id}
                project={project}
                rank={index + 1}
                showAward={cfg.showAward}
                index={index}
                isLight={cfg.isLight}
                onView={() => navigate(`/project/${project.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
