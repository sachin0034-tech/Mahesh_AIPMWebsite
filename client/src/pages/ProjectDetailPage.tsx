import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getProjectById, voteOnProject } from "@/lib/cohortApi";
import type { CohortProject, ProjectSectionAssignment } from "@/lib/supabase";

interface ProjectWithSections extends CohortProject {
  sections: ProjectSectionAssignment[];
}

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}
function getVoterId(): string {
  let id = localStorage.getItem("cohort_voter_id");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("cohort_voter_id", id); }
  return id;
}

const ACCENTS = ["#6366f1", "#a855f7", "#f59e0b", "#10b981", "#3b82f6", "#ef4444"];
function accent(title: string) { return ACCENTS[title.charCodeAt(0) % ACCENTS.length]; }

// ─── Inline icons ─────────────────────────────────────────────────────────────
const IcoBack    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;
const IcoVideo   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>;
const IcoGlobe   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>;
const IcoDoc     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const IcoFlow    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
const IcoCheck   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoLI      = () => <svg width="15" height="15" viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><rect width="72" height="72" rx="8" fill="#0077B5"/><path d="M14 27h9v31H14V27zm4.5-14a5.5 5.5 0 110 11 5.5 5.5 0 010-11zM30 27h8.6v4.2h.1c1.2-2.3 4.2-4.7 8.6-4.7C56.8 26.5 58 33 58 40.3V58h-9V42c0-3.8-.1-8.7-5.3-8.7-5.3 0-6.1 4.2-6.1 8.4V58h-9V27z" fill="white"/></svg>;
const IcoThumbUp = ({ filled }: { filled: boolean }) => <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/><path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>;
const IcoThumbDn = ({ filled }: { filled: boolean }) => <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z"/><path d="M17 2h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17"/></svg>;

// ─── Section label ────────────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.18em", color: "#9ca3af", textTransform: "uppercase", marginBottom: "0.75rem" }}>
      {children}
    </p>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="animate-pulse space-y-0">
      <div style={{ height: 280, background: "#e5e7eb" }} />
      <div className="max-w-6xl mx-auto px-6 py-8 grid gap-6" style={{ gridTemplateColumns: "1fr 320px" }}>
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 space-y-3">
            <div className="h-4 w-2/3 bg-gray-100 rounded" />
            <div className="h-3 w-full bg-gray-100 rounded" />
            <div className="h-3 w-5/6 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 space-y-3">
          <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto" />
          <div className="h-3 w-1/2 bg-gray-100 rounded mx-auto" />
        </div>
      </div>
    </div>
  );
}

// ─── Link pill ────────────────────────────────────────────────────────────────
function LinkPill({ href, icon, label, color }: { href: string; icon: React.ReactNode; label: string; color: string }) {
  return (
    <a
      href={href} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-2.5 w-full px-4 py-3 rounded-xl transition-all duration-150"
      style={{ background: `${color}0d`, border: `1px solid ${color}25` }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = `${color}18`; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = `${color}0d`; }}
    >
      <span style={{ color }} className="flex-shrink-0">{icon}</span>
      <span className="text-sm font-semibold truncate" style={{ color: "#1f2937" }}>{label}</span>
      <svg className="ml-auto flex-shrink-0" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
    </a>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export const ProjectDetailPage = (): JSX.Element => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectWithSections | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [voted, setVoted] = useState<"up" | "down" | null>(null);
  const [ups, setUps] = useState(0);
  const [downs, setDowns] = useState(0);

  useEffect(() => {
    if (!projectId) return;
    (async () => {
      setLoading(true);
      try {
        const { data } = await getProjectById(projectId);
        setProject(data);
        setUps(data.thumbs_up ?? 0);
        setDowns(data.thumbs_down ?? 0);
      } catch { setError(true); }
      finally { setLoading(false); }
    })();
  }, [projectId]);

  const vote = async (type: "up" | "down") => {
    if (voted || !projectId) return;
    try {
      await voteOnProject(projectId, type, getVoterId());
      type === "up" ? setUps(n => n + 1) : setDowns(n => n + 1);
      setVoted(type);
    } catch { /* already voted */ }
  };

  // ── Loading / error ──
  if (loading || error || !project) {
    return (
      <div className="min-h-screen" style={{ background: "#f5f2ed" }}>
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center gap-3">
          <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem", fontWeight: 600 }}>
            <IcoBack /> Back
          </button>
        </div>
        {loading ? <Skeleton /> : (
          <div className="max-w-lg mx-auto mt-20 text-center px-6">
            <p className="text-gray-400 mb-5 text-sm">This project isn't available.</p>
            <button onClick={() => navigate("/")} style={{ background: "#1a1a1a", color: "#f5f2ed", border: "none", borderRadius: 10, padding: "10px 24px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.82rem", letterSpacing: "0.1em", cursor: "pointer" }}>
              BACK TO HOME
            </button>
          </div>
        )}
      </div>
    );
  }

  const flags   = project.visibility_flags;
  const show    = (k: keyof NonNullable<typeof flags>) => !flags || flags[k] !== false;
  const ac      = accent(project.title);
  const award   = project.sections?.find(s => s.section === "awards");
  const banner  = project.banner_url || project.thumbnail_url;
  const hasLinks = (project.video_link && show("video_link")) || (project.hosted_link && show("demo_link")) || (project.doc_link && show("doc_link")) || project.workflow_link;

  return (
    <div className="min-h-screen" style={{ background: "#f5f2ed" }}>

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#f5f2ed]/90 backdrop-blur-md border-b border-black/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 transition-opacity hover:opacity-60"
            style={{ background: "none", border: "none", cursor: "pointer", color: "#1a1a1a", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.12em" }}
          >
            <IcoBack /> BACK
          </button>
          <Link to="/" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.3rem", color: "#1a1a1a", letterSpacing: "-0.01em", textDecoration: "none" }}>
            MYAI COMMUNITY
          </Link>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.15em", color: "#9ca3af", textTransform: "uppercase" }}>
            {project.project_category}
          </span>
        </div>
      </header>

      {/* ── Hero Banner ──────────────────────────────────────────────────── */}
      <div className="relative w-full overflow-hidden" style={{ height: "clamp(220px, 32vw, 400px)" }}>
        {banner && show("banner") ? (
          <img src={banner} alt={project.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${ac}33 0%, ${ac}66 50%, #1a1a1a44 100%)` }} />
        )}
        {/* Dark gradient overlay */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.05) 100%)" }} />

        {/* Award badge */}
        {award?.award_name && (
          <div className="absolute top-5 left-6">
            <span style={{ background: "rgba(245,158,11,0.9)", backdropFilter: "blur(8px)", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.12em", padding: "5px 12px", borderRadius: 99, textTransform: "uppercase" }}>
              ★ {award.award_name}
            </span>
          </div>
        )}

        {/* Title block on banner */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-7 max-w-6xl mx-auto" style={{ width: "100%" }}>
          <div className="max-w-6xl mx-auto">
            <h1 style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif", fontSize: "clamp(2rem, 5vw, 3.6rem)", letterSpacing: "0.02em", fontWeight: 400, color: "#ffffff", lineHeight: 1, textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}>
              {project.title}
            </h1>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "0.9rem", letterSpacing: "0.06em", color: "rgba(255,255,255,0.65)", marginTop: 4 }}>
              {project.builder_name} &nbsp;·&nbsp; Builder
            </p>
          </div>
        </div>
      </div>

      {/* ── Body: two-column ─────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── LEFT: main content ─────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* About */}
            {project.description && show("description") && (
              <div className="bg-white rounded-2xl p-7" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.05)" }}>
                <Label>About the Project</Label>
                <p className="text-[0.9rem] text-gray-600 leading-relaxed whitespace-pre-line">{project.description}</p>
              </div>
            )}

            {/* What you'll learn */}
            {project.what_you_learned && show("what_you_learned") && (
              <div className="bg-white rounded-2xl p-7" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.05)" }}>
                <Label>What You'll Learn</Label>
                <p className="text-[0.9rem] text-gray-600 leading-relaxed whitespace-pre-line">{project.what_you_learned}</p>
              </div>
            )}

            {/* What's included */}
            {project.whats_included && project.whats_included.length > 0 && show("whats_included") && (
              <div className="bg-white rounded-2xl p-7" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.05)" }}>
                <Label>What's Included</Label>
                <ul className="space-y-3">
                  {project.whats_included.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-[0.9rem] text-gray-700">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5" style={{ background: `${ac}18`, color: ac }}>
                        <IcoCheck />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Project links — on mobile they're in left col, on desktop in sidebar */}
            {hasLinks && (
              <div className="lg:hidden bg-white rounded-2xl p-7" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.05)" }}>
                <Label>Project Links</Label>
                <div className="space-y-2">
                  {project.video_link && show("video_link") && <LinkPill href={project.video_link} icon={<IcoVideo />} label="Demo Video" color="#ef4444" />}
                  {project.hosted_link && show("demo_link") && <LinkPill href={project.hosted_link} icon={<IcoGlobe />} label="Live Project" color="#10b981" />}
                  {project.doc_link && show("doc_link") && <LinkPill href={project.doc_link} icon={<IcoDoc />} label="Documentation" color="#3b82f6" />}
                  {project.workflow_link && <LinkPill href={project.workflow_link} icon={<IcoFlow />} label="Workflow" color="#8b5cf6" />}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: sidebar ─────────────────────────────────────────────── */}
          <div className="w-full lg:w-[320px] flex-shrink-0 space-y-5">

            {/* Builder card */}
            <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.05)" }}>
              {/* Accent strip */}
              <div style={{ height: 6, background: `linear-gradient(90deg, ${ac}, ${ac}77)` }} />

              <div className="p-6">
                <Label>Builder</Label>
                <div className="flex items-center gap-4 mb-4">
                  {project.user_image_url && show("user_image") ? (
                    <img src={project.user_image_url} alt={project.builder_name}
                      className="rounded-full object-cover flex-shrink-0"
                      style={{ width: 60, height: 60, border: `2.5px solid ${ac}33` }} />
                  ) : (
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                      style={{ width: 60, height: 60, background: `linear-gradient(135deg, ${ac}, ${ac}99)`, fontSize: "1.1rem" }}>
                      {getInitials(project.builder_name)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-[0.95rem] truncate">{project.builder_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">AI Builder</p>
                  </div>
                </div>

                {project.about_user_description && show("about_user") && (
                  <p className="text-[0.82rem] text-gray-500 leading-relaxed mb-4 whitespace-pre-line line-clamp-4">
                    {project.about_user_description}
                  </p>
                )}

                {project.builder_linkedin && (
                  <a href={project.builder_linkedin} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
                    style={{ background: "#0077B5", color: "#fff" }}>
                    <IcoLI /> Connect on LinkedIn
                  </a>
                )}
              </div>
            </div>

            {/* Project links — desktop sidebar */}
            {hasLinks && (
              <div className="hidden lg:block bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.05)" }}>
                <Label>Project Links</Label>
                <div className="space-y-2">
                  {project.video_link && show("video_link") && <LinkPill href={project.video_link} icon={<IcoVideo />} label="Demo Video" color="#ef4444" />}
                  {project.hosted_link && show("demo_link") && <LinkPill href={project.hosted_link} icon={<IcoGlobe />} label="Live Project" color="#10b981" />}
                  {project.doc_link && show("doc_link") && <LinkPill href={project.doc_link} icon={<IcoDoc />} label="Documentation" color="#3b82f6" />}
                  {project.workflow_link && <LinkPill href={project.workflow_link} icon={<IcoFlow />} label="Workflow" color="#8b5cf6" />}
                </div>
              </div>
            )}

            {/* Voting card */}
            <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.05)" }}>
              <Label>Rate this project</Label>
              <div className="flex gap-3">
                <button onClick={() => vote("up")} disabled={!!voted}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-all disabled:cursor-default"
                  style={voted === "up"
                    ? { background: "#dcfce7", borderColor: "#86efac", color: "#16a34a" }
                    : { background: "#f9fafb", borderColor: "#e5e7eb", color: "#6b7280" }}>
                  <IcoThumbUp filled={voted === "up"} /> {ups}
                </button>
                <button onClick={() => vote("down")} disabled={!!voted}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-all disabled:cursor-default"
                  style={voted === "down"
                    ? { background: "#fee2e2", borderColor: "#fca5a5", color: "#dc2626" }
                    : { background: "#f9fafb", borderColor: "#e5e7eb", color: "#6b7280" }}>
                  <IcoThumbDn filled={voted === "down"} /> {downs}
                </button>
              </div>
              {voted && (
                <p className="text-[11px] text-center mt-2" style={{ color: "#9ca3af" }}>Thanks for your feedback!</p>
              )}
            </div>

            {/* Category tag */}
            <div className="text-center py-1">
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.15em", color: ac, textTransform: "uppercase", background: `${ac}12`, padding: "5px 14px", borderRadius: 99, display: "inline-block" }}>
                {project.project_category}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pb-4">
          <Link to="/" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.15em", color: "#d1d5db", textDecoration: "none" }}>
            MYAI COMMUNITY · AI TOOLS BUILT BY REAL PEOPLE
          </Link>
        </div>
      </div>
    </div>
  );
};
