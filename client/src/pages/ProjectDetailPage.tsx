import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getProjectById, voteOnProject } from "@/lib/cohortApi";
import type { CohortProject, ProjectSectionAssignment } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProjectWithSections extends CohortProject {
  sections: ProjectSectionAssignment[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function getVoterId(): string {
  let id = localStorage.getItem("cohort_voter_id");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("cohort_voter_id", id); }
  return id;
}

const ACCENT = ["#6366f1", "#a855f7", "#f59e0b", "#10b981", "#ef4444", "#3b82f6"];

function accentColor(title: string) {
  const i = title.charCodeAt(0) % ACCENT.length;
  return ACCENT[i];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
      <div className="px-5 pt-5 pb-1 flex items-center gap-2 border-b border-gray-100">
        <span className="text-gray-400">{icon}</span>
        <h2 className="text-sm font-bold text-gray-800 tracking-tight">{title}</h2>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function LinkButton({ href, icon, label, sublabel, color }: {
  href: string; icon: React.ReactNode; label: string; sublabel?: string; color: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-gray-300 transition-all group"
      style={{ background: "#fafafa" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#f3f4f6"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#fafafa"; }}
    >
      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-gray-800 truncate">{label}</div>
        {sublabel && <div className="text-xs text-gray-400 truncate">{sublabel}</div>}
      </div>
      <svg className="text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
      </svg>
    </a>
  );
}

// ─── Icons (inline SVG to avoid extra imports) ────────────────────────────────

const IconVideo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
);
const IconLink = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
  </svg>
);
const IconDoc = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
  </svg>
);
const IconFlow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);
const IconLinkedIn = () => (
  <svg width="18" height="18" viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
    <rect width="72" height="72" rx="8" fill="#0077B5"/>
    <path d="M14 27h9v31H14V27zm4.5-14a5.5 5.5 0 110 11 5.5 5.5 0 010-11zM30 27h8.6v4.2h.1c1.2-2.3 4.2-4.7 8.6-4.7C56.8 26.5 58 33 58 40.3V58h-9V42c0-3.8-.1-8.7-5.3-8.7-5.3 0-6.1 4.2-6.1 8.4V58h-9V27z" fill="white"/>
  </svg>
);
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconBook = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
  </svg>
);
const IconStar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconGlobe = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
  </svg>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="bg-gray-200 rounded-xl" style={{ height: 180 }} />
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <div className="h-4 w-2/3 bg-gray-200 rounded" />
        <div className="h-3 w-1/3 bg-gray-100 rounded" />
        <div className="h-3 w-full bg-gray-100 rounded" />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-2">
        <div className="h-3 w-full bg-gray-100 rounded" />
        <div className="h-3 w-5/6 bg-gray-100 rounded" />
        <div className="h-3 w-4/5 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export const ProjectDetailPage = (): JSX.Element => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectWithSections | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [voted, setVoted] = useState<"up" | "down" | null>(null);
  const [thumbsUp, setThumbsUp] = useState(0);
  const [thumbsDown, setThumbsDown] = useState(0);

  useEffect(() => {
    if (!projectId) return;
    (async () => {
      setLoading(true);
      try {
        const { data } = await getProjectById(projectId);
        setProject(data);
        setThumbsUp(data.thumbs_up ?? 0);
        setThumbsDown(data.thumbs_down ?? 0);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [projectId]);

  const vote = async (type: "up" | "down") => {
    if (voted || !projectId) return;
    try {
      await voteOnProject(projectId, type, getVoterId());
      type === "up" ? setThumbsUp((n) => n + 1) : setThumbsDown((n) => n + 1);
      setVoted(type);
    } catch { /* already voted */ }
  };

  if (loading || error || !project) {
    return (
      <div className="min-h-screen" style={{ background: "#f3f2ef" }}>
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </button>
            <Link to="/" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.2rem", color: "#0a66c2", letterSpacing: "-0.01em" }}>MYAI</Link>
          </div>
        </nav>
        <div className="max-w-2xl mx-auto px-4 py-8">
          {loading ? <Skeleton /> : (
            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
              <p className="text-gray-400 text-sm mb-4">Project not found or no longer available.</p>
              <button onClick={() => navigate("/")} className="text-sm font-semibold text-white px-4 py-2 rounded-lg" style={{ background: "#0a66c2" }}>
                Back to Home
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const flags = project.visibility_flags;
  const show = (key: keyof NonNullable<typeof flags>) => !flags || flags[key] !== false;
  const accent = accentColor(project.title);
  const awardSection = project.sections?.find((s) => s.section === "awards");
  const bannerSrc = project.banner_url || project.thumbnail_url;

  const hasLinks = (
    (project.video_link && show("video_link")) ||
    (project.hosted_link && show("demo_link")) ||
    (project.doc_link && show("doc_link")) ||
    project.workflow_link
  );

  return (
    <div className="min-h-screen" style={{ background: "#f3f2ef" }}>

      {/* ── Sticky Nav ───────────────────────────────────────────────────── */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 transition-colors"
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Back
            </button>
            <span style={{ width: 1, height: 16, background: "#e5e7eb", display: "inline-block" }} />
            <Link to="/" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.25rem", color: "#0a66c2", letterSpacing: "-0.01em", textDecoration: "none" }}>
              MYAI COMMUNITY
            </Link>
          </div>

          {/* Category badge */}
          <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: `${accent}15`, color: accent }}>
            {project.project_category}
          </span>
        </div>
      </nav>

      {/* ── Page body ────────────────────────────────────────────────────── */}
      <main className="max-w-2xl mx-auto px-4 py-5 pb-16 space-y-3">

        {/* ── CARD 1: Profile Header (like LinkedIn top card) ─────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>

          {/* Banner */}
          {bannerSrc && show("banner") ? (
            <div className="relative">
              <img src={bannerSrc} alt={project.title} className="w-full object-cover" style={{ height: 180 }} />
              {awardSection?.award_name && (
                <span className="absolute top-3 left-3 text-[11px] font-semibold px-3 py-1 rounded-full" style={{ background: "rgba(245,158,11,0.92)", color: "#fff", backdropFilter: "blur(4px)" }}>
                  🏆 {awardSection.award_name}
                </span>
              )}
            </div>
          ) : (
            <div className="w-full flex items-center justify-center relative" style={{ height: 120, background: `linear-gradient(135deg, ${accent}22 0%, ${accent}44 100%)` }}>
              {awardSection?.award_name && (
                <span className="absolute top-3 left-3 text-[11px] font-semibold px-3 py-1 rounded-full" style={{ background: `${accent}cc`, color: "#fff" }}>
                  🏆 {awardSection.award_name}
                </span>
              )}
            </div>
          )}

          {/* Profile section */}
          <div className="px-5 pb-5">
            {/* Avatar — overlaps banner */}
            <div className="flex items-end justify-between" style={{ marginTop: -36 }}>
              {project.user_image_url && show("user_image") ? (
                <img
                  src={project.user_image_url}
                  alt={project.builder_name}
                  className="rounded-full object-cover flex-shrink-0"
                  style={{ width: 72, height: 72, border: "3px solid #ffffff", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}
                />
              ) : (
                <div
                  className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                  style={{
                    width: 72, height: 72, fontSize: "1.4rem",
                    background: `linear-gradient(135deg, ${accent} 0%, ${accent}aa 100%)`,
                    border: "3px solid #ffffff", boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                  }}
                >
                  {getInitials(project.builder_name)}
                </div>
              )}

              {/* Quick action links (top-right of header card) */}
              <div className="flex items-center gap-2 mt-8">
                {project.builder_linkedin && (
                  <a
                    href={project.builder_linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-[#0077B5] text-[#0077B5] hover:bg-[#0077B5] hover:text-white transition-all"
                  >
                    <IconLinkedIn /> Connect
                  </a>
                )}
                {project.hosted_link && show("demo_link") && (
                  <a
                    href={project.hosted_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full text-white transition-opacity hover:opacity-85"
                    style={{ background: accent }}
                  >
                    <IconGlobe /> Live Demo
                  </a>
                )}
              </div>
            </div>

            {/* Name + title */}
            <div className="mt-3">
              <h1 className="text-xl font-bold text-gray-900 leading-snug">{project.title}</h1>
              <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-1">
                <span className="text-sm font-medium text-gray-600">{project.builder_name}</span>
                <span className="text-gray-300">·</span>
                <span className="text-sm text-gray-400">Builder</span>
                {awardSection?.award_name && (
                  <>
                    <span className="text-gray-300">·</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(245,158,11,0.12)", color: "#b45309" }}>
                      {awardSection.award_name}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Voting row */}
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-400 font-medium">Was this helpful?</span>
              <button
                onClick={() => vote("up")}
                disabled={!!voted}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all disabled:cursor-default"
                style={
                  voted === "up"
                    ? { background: "#dcfce7", borderColor: "#86efac", color: "#16a34a" }
                    : { background: "#f9fafb", borderColor: "#e5e7eb", color: "#6b7280" }
                }
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill={voted === "up" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/><path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/>
                </svg>
                {thumbsUp}
              </button>
              <button
                onClick={() => vote("down")}
                disabled={!!voted}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all disabled:cursor-default"
                style={
                  voted === "down"
                    ? { background: "#fee2e2", borderColor: "#fca5a5", color: "#dc2626" }
                    : { background: "#f9fafb", borderColor: "#e5e7eb", color: "#6b7280" }
                }
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill={voted === "down" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z"/><path d="M17 2h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17"/>
                </svg>
                {thumbsDown}
              </button>
            </div>
          </div>
        </div>

        {/* ── CARD 2: About ────────────────────────────────────────────────── */}
        {project.description && show("description") && (
          <SectionCard title="About" icon={<IconBook />}>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{project.description}</p>
          </SectionCard>
        )}

        {/* ── CARD 3: What you'll learn ─────────────────────────────────────── */}
        {project.what_you_learned && show("what_you_learned") && (
          <SectionCard title="What you'll learn" icon={<IconStar />}>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{project.what_you_learned}</p>
          </SectionCard>
        )}

        {/* ── CARD 4: What's Included ──────────────────────────────────────── */}
        {project.whats_included && project.whats_included.length > 0 && show("whats_included") && (
          <SectionCard title="What's Included" icon={<IconCheck />}>
            <ul className="space-y-2">
              {project.whats_included.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5" style={{ background: `${accent}18`, color: accent }}>
                    <IconCheck />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </SectionCard>
        )}

        {/* ── CARD 5: Project Links ────────────────────────────────────────── */}
        {hasLinks && (
          <SectionCard title="Project Links" icon={<IconLink />}>
            <div className="space-y-2">
              {project.video_link && show("video_link") && (
                <LinkButton href={project.video_link} icon={<IconVideo />} label="Demo Video" sublabel={project.video_link} color="#ef4444" />
              )}
              {project.hosted_link && show("demo_link") && (
                <LinkButton href={project.hosted_link} icon={<IconGlobe />} label="Live Project" sublabel={project.hosted_link} color="#10b981" />
              )}
              {project.doc_link && show("doc_link") && (
                <LinkButton href={project.doc_link} icon={<IconDoc />} label="Documentation" sublabel={project.doc_link} color="#3b82f6" />
              )}
              {project.workflow_link && (
                <LinkButton href={project.workflow_link} icon={<IconFlow />} label="Workflow / Diagram" sublabel={project.workflow_link} color="#8b5cf6" />
              )}
            </div>
          </SectionCard>
        )}

        {/* ── CARD 6: About the Builder ─────────────────────────────────────── */}
        {(project.about_user_description && show("about_user")) && (
          <SectionCard title="About the Builder" icon={<IconUser />}>
            <div className="flex items-start gap-4">
              {project.user_image_url && show("user_image") ? (
                <img src={project.user_image_url} alt={project.builder_name} className="w-14 h-14 rounded-full object-cover flex-shrink-0 border border-gray-200" />
              ) : (
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${accent}, ${accent}99)` }}
                >
                  {getInitials(project.builder_name)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-gray-900">{project.builder_name}</span>
                  {project.builder_linkedin && (
                    <a href={project.builder_linkedin} target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition-opacity">
                      <IconLinkedIn />
                    </a>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed whitespace-pre-line">{project.about_user_description}</p>
              </div>
            </div>
          </SectionCard>
        )}

        {/* ── Footer attribution ──────────────────────────────────────────── */}
        <div className="text-center pt-2 pb-4">
          <Link to="/" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.1em", color: "#9ca3af", textDecoration: "none" }}>
            MYAI COMMUNITY
          </Link>
          <p className="text-[11px] text-gray-300 mt-0.5">AI tools built by real people</p>
        </div>
      </main>
    </div>
  );
};
