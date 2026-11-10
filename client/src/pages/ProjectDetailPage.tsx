import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getProjectById, voteOnProject } from "@/lib/cohortApi";
import type { CohortProject, ProjectSectionAssignment } from "@/lib/supabase";

interface ProjectWithSections extends CohortProject {
  sections: ProjectSectionAssignment[];
}

// ─── Design tokens (from the project-page design) ─────────────────────────────
const C = {
  bg: "#f4f4f5",
  ink: "#09090b",
  muted: "#52525b",
  subtle: "#71717a",
  faint: "#a1a1aa",
  line: "#ececee",
  card: "#ffffff",
  navy: "#02245b",
  navySoft: "#a9bbdc",
  navyMuted: "#c3d0e8",
  amber: "#fca93d",
  amberInk: "#2b1a04",
  amberText: "#8a5305",
};
const FONT = "'DM Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif";
const MONO = "ui-monospace, Menlo, monospace";
const STRIPES = `repeating-linear-gradient(135deg, ${C.line} 0 12px, #fafafa 12px 24px)`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}
function getVoterId(): string {
  let id = localStorage.getItem("cohort_voter_id");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("cohort_voter_id", id); }
  return id;
}
function paragraphs(text: string | null | undefined): string[] {
  return (text ?? "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}
/** Short hero lead (first sentence(s), ~240 chars); everything else goes to the overview. */
function splitLead(paras: string[]): { lead: string | undefined; rest: string[] } {
  if (paras.length === 0) return { lead: undefined, rest: [] };
  const first = paras[0].replace(/^["“]+|["”]+$/g, "").replace(/\s*\n\s*/g, " ").trim();
  if (first.length <= 280) return { lead: first, rest: paras.slice(1) };
  const sentences = first.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) ?? [first];
  let lead = "";
  let i = 0;
  while (i < sentences.length && (lead.length === 0 || lead.length + sentences[i].length <= 240)) lead += sentences[i++];
  const remainder = sentences.slice(i).join("").trim();
  return { lead: lead.trim(), rest: [remainder, ...paras.slice(1)].filter(Boolean) };
}
function lines(text: string | null | undefined): string[] {
  return (text ?? "").split(/\n+/).map((l) => l.replace(/^\s*[-•*\d.)]+\s*/, "").trim()).filter(Boolean);
}

/** Turns a share URL into an embeddable one when the host supports it. */
function toEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtube.com" || host === "m.youtube.com") {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      const m = u.pathname.match(/^\/(shorts|embed|live)\/([^/?]+)/);
      if (m) return `https://www.youtube.com/embed/${m[2]}`;
    }
    if (host === "youtu.be") return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    if (host === "loom.com") {
      const m = u.pathname.match(/\/(share|embed)\/([^/?]+)/);
      if (m) return `https://www.loom.com/embed/${m[2]}`;
    }
    if (host === "vimeo.com") {
      const m = u.pathname.match(/\/(\d+)/);
      if (m) return `https://player.vimeo.com/video/${m[1]}`;
    }
    if (host === "drive.google.com") {
      const m = u.pathname.match(/\/file\/d\/([^/]+)/);
      if (m) return `https://drive.google.com/file/d/${m[1]}/preview`;
    }
  } catch { /* not a URL */ }
  return null;
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const IcoBack = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>;
const IcoPlay = ({ size = 22, color = C.ink }: { size?: number; color?: string }) => <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M8 5v14l11-7z" /></svg>;
const IcoGlobe = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>;
const IcoDoc = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>;
const IcoFlow = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>;
const IcoVideo = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg>;
const IcoLinkedIn = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>;
const IcoThumbUp = ({ filled }: { filled: boolean }) => <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12" /><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" /></svg>;
const IcoThumbDn = ({ filled }: { filled: boolean }) => <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 14V2" /><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" /></svg>;

// ─── Small building blocks ────────────────────────────────────────────────────
const wrap: React.CSSProperties = { maxWidth: 1240, margin: "0 auto", padding: "0 clamp(16px, 4vw, 32px)" };
const h2Style: React.CSSProperties = { margin: "18px 0 0", fontWeight: 600, fontSize: "clamp(36px,4.4vw,52px)", lineHeight: 1.1, letterSpacing: "-0.01em", textWrap: "balance" as any };
const bodyStyle: React.CSSProperties = { fontSize: 17, lineHeight: 1.6, color: C.muted, textWrap: "pretty" as any };

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <span style={{ display: "inline-block", border: `1px solid ${C.ink}`, borderRadius: 999, padding: "3px 10px", fontSize: 12 }}>// {children} //</span>;
}
function AmberTag({ children }: { children: React.ReactNode }) {
  return <span style={{ display: "inline-block", background: C.amber, color: C.amberInk, padding: "5px 11px", borderRadius: 12, fontSize: 12, fontWeight: 600, letterSpacing: ".05em" }}>{children}</span>;
}
function Pill({ href, children, variant = "solid" }: { href: string; children: React.ReactNode; variant?: "solid" | "outline" }) {
  const external = /^https?:/.test(href);
  const style: React.CSSProperties = variant === "solid"
    ? { background: C.navy, color: "#fff", padding: "15px 26px", borderRadius: 999, fontSize: 15, fontWeight: 600, whiteSpace: "nowrap" }
    : { border: `1.5px solid ${C.ink}`, color: C.ink, padding: "14px 26px", borderRadius: 999, fontSize: 15, fontWeight: 600, whiteSpace: "nowrap" };
  return (
    <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="transition-opacity hover:opacity-85" style={style}>
      {children}
    </a>
  );
}
function Avatar({ src, name, size, dark = false }: { src?: string | null; name: string; size: number; dark?: boolean }) {
  if (src) return <img src={src} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flex: "none" }} />;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flex: "none", display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 600, fontSize: size * 0.34,
      background: dark ? "repeating-linear-gradient(135deg,#1a3a72 0 6px,#24467f 6px 12px)" : "repeating-linear-gradient(135deg,#ececec 0 8px,#f6f6f6 8px 16px)",
      color: dark ? "#fff" : C.muted, border: dark ? "none" : "1px solid #e0e0e0",
    }}>{getInitials(name)}</div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="animate-pulse" style={{ ...wrap, paddingTop: 72 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,440px),1fr))", gap: 56 }}>
        <div className="space-y-5">
          <div className="h-4 w-1/2 rounded bg-zinc-200" />
          <div className="h-16 w-full rounded bg-zinc-200" />
          <div className="h-4 w-5/6 rounded bg-zinc-200" />
          <div className="h-4 w-2/3 rounded bg-zinc-200" />
        </div>
        <div style={{ height: 420, borderRadius: 24, background: "#e4e4e7" }} />
      </div>
    </div>
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

  // Always open a project from the top, not at the previous page's scroll position
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [projectId]);

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
      type === "up" ? setUps((n) => n + 1) : setDowns((n) => n + 1);
      setVoted(type);
    } catch { /* already voted */ }
  };

  // ── Loading / error ──
  if (loading || error || !project) {
    return (
      <div className="min-h-screen" style={{ background: C.bg, color: C.ink, fontFamily: FONT }}>
        <div style={{ ...wrap, paddingTop: 24 }}>
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-medium hover:opacity-60" style={{ background: "none", border: "none", cursor: "pointer", color: C.ink }}>
            <IcoBack /> Back
          </button>
        </div>
        {loading ? <Skeleton /> : (
          <div className="max-w-lg mx-auto mt-20 text-center px-6">
            <p className="mb-5 text-sm" style={{ color: C.subtle }}>This project isn't available.</p>
            <Pill href="/">Back to home</Pill>
          </div>
        )}
      </div>
    );
  }

  // ── Derived data ──
  const flags = project.visibility_flags;
  const show = (k: keyof NonNullable<typeof flags>) => !flags || flags[k] !== false;

  const award = project.sections?.find((s) => s.section === "awards" && s.award_name);
  const cohortLabels = Array.from(new Set(
    (project.sections ?? []).map((s) => s.cohort_label).filter((l): l is string => !!l)
  ));
  const banner = show("banner") ? (project.banner_url || project.thumbnail_url) : null;
  const builderImg = show("user_image") ? project.user_image_url : null;

  const descParas = show("description") ? paragraphs(project.description) : [];
  const { lead: heroText, rest: moreDesc } = splitLead(descParas);
  const features = show("whats_included") ? (project.whats_included ?? []).map((f) => f.trim()).filter(Boolean) : [];
  const learned = show("what_you_learned") ? lines(project.what_you_learned) : [];
  const aboutUser = show("about_user") ? paragraphs(project.about_user_description) : [];

  const videoLink = show("video_link") ? project.video_link : null;
  const liveLink = show("demo_link") ? project.hosted_link : null;
  const docLink = show("doc_link") ? project.doc_link : null;
  const workflowLink = project.workflow_link;
  const embedUrl = videoLink ? toEmbedUrl(videoLink) : null;

  const links = [
    videoLink && { href: videoLink, label: "Demo video", icon: <IcoVideo />, color: "#EF4444" },
    liveLink && { href: liveLink, label: "Live project", icon: <IcoGlobe />, color: "#10B981" },
    docLink && { href: docLink, label: "Documentation", icon: <IcoDoc />, color: "#3B82F6" },
    workflowLink && { href: workflowLink, label: "Workflow", icon: <IcoFlow />, color: "#8B5CF6" },
  ].filter(Boolean) as { href: string; label: string; icon: React.ReactNode; color: string }[];

  const tags = [project.project_category, ...cohortLabels, award?.award_name].filter(Boolean) as string[];

  const navItems = [
    features.length > 0 && { id: "features", label: "Features" },
    videoLink && { id: "demo", label: "Demo" },
    (moreDesc.length > 0 || links.length > 0) && { id: "overview", label: "Overview" },
    learned.length > 0 && { id: "learned", label: "What we learned" },
  ].filter(Boolean) as { id: string; label: string }[];

  const firstName = project.builder_name.split(" ")[0];

  return (
    <div className="min-h-screen" style={{ background: C.bg, color: C.ink, fontFamily: FONT, WebkitFontSmoothing: "antialiased" }}>
      <div style={wrap}>

        {/* ── Nav ───────────────────────────────────────────────────────── */}
        <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap", padding: "24px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <button onClick={() => navigate(-1)} aria-label="Back" className="hover:opacity-60" style={{ background: "none", border: "none", cursor: "pointer", color: C.ink, display: "flex", padding: 0, marginRight: 4 }}>
              <IcoBack />
            </button>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.ink, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, letterSpacing: "-0.03em", fontSize: 16, flex: "none" }}>
              {project.title.trim()[0]?.toUpperCase()}
            </div>
            <span style={{ fontWeight: 600, fontSize: 16 }} className="truncate">{project.title}</span>
            <Link to="/" style={{ fontSize: 13, color: C.subtle, whiteSpace: "nowrap" }} className="hover:opacity-70">/ MyAI Community project</Link>
          </div>
          {navItems.length > 0 && (
            <div style={{ display: "flex", gap: "8px 28px", fontSize: 14, fontWeight: 500, flexWrap: "wrap", whiteSpace: "nowrap" }}>
              {navItems.map((n) => <a key={n.id} href={`#${n.id}`} style={{ color: C.ink }} className="hover:!text-[#8a5305]">{n.label}</a>)}
            </div>
          )}
          {videoLink && (
            <a href="#demo" style={{ background: C.navy, color: "#fff", padding: "11px 20px", borderRadius: 999, fontSize: 14, fontWeight: 600, whiteSpace: "nowrap" }} className="hover:opacity-85">
              Watch demo
            </a>
          )}
        </nav>

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <header style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,440px),1fr))", gap: 56, alignItems: "center", padding: "clamp(32px,6vw,72px) 0 80px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: C.muted }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.amber, display: "inline-block", boxShadow: "0 0 0 4px rgba(252,169,61,.15)" }} />
              <span>{[award?.award_name ?? project.project_category, "MyAI Community"].join(" · ")}</span>
            </div>
            <h1 style={{ margin: "20px 0 0", fontWeight: 600, fontSize: "clamp(44px,6vw,76px)", lineHeight: 1.02, letterSpacing: "-0.04em", textWrap: "balance" as any }}>
              {project.title}
            </h1>
            {heroText && (
              <p style={{ ...bodyStyle, margin: "24px 0 0", maxWidth: 470 }}>{heroText}</p>
            )}
            {(videoLink || docLink || liveLink) && (
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 36 }}>
                {videoLink && <Pill href="#demo">Watch the demo</Pill>}
                {liveLink && <Pill href={liveLink} variant={videoLink ? "outline" : "solid"}>Try it live</Pill>}
                {docLink && <Pill href={docLink} variant="outline">Read the docs</Pill>}
              </div>
            )}
          </div>

          {/* Visual */}
          <div style={{ position: "relative", minHeight: "clamp(360px, 44vw, 520px)" }}>
            <div style={{
              position: "absolute", inset: "20px clamp(0px,3vw,40px) 0 clamp(0px,6vw,80px)", borderRadius: 24, overflow: "hidden",
              background: banner ? "#e4e4e7" : STRIPES, border: `1px solid ${C.line}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {banner
                ? <img src={banner} alt={project.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ fontWeight: 600, fontSize: 96, letterSpacing: "-0.04em", color: "#d4d4d8" }}>{getInitials(project.title)}</span>}
            </div>

            {features.length > 0 && (
              <div className="hidden sm:flex" style={{ position: "absolute", top: 70, right: 0, flexDirection: "column", gap: 8, maxWidth: 260 }}>
                {features.slice(0, 2).map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: `1px solid ${C.line}`, borderRadius: 999, padding: "8px 14px 8px 8px", fontSize: 13, boxShadow: "0 6px 20px rgba(0,0,0,.06)" }}>
                    <span style={{ width: 18, height: 18, borderRadius: "50%", background: C.ink, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flex: "none" }}>✓</span>
                    <span className="truncate">{f}</span>
                  </div>
                ))}
              </div>
            )}

            {links.length > 0 && (
              <div style={{ position: "absolute", left: 0, bottom: 60, width: 230, background: "#fff", border: `1px solid ${C.line}`, borderRadius: 16, padding: 14, boxShadow: "0 10px 30px rgba(0,0,0,.07)" }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Explore the project</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                  {links.map((l) => (
                    <a key={l.label} href={l.label === "Demo video" ? "#demo" : l.href} {...(l.label === "Demo video" ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                      style={{ fontSize: 12, color: C.amberText, border: "1px solid rgba(252,169,61,.55)", background: "rgba(252,169,61,.15)", padding: "3px 9px", borderRadius: 999, whiteSpace: "nowrap" }}
                      className="hover:opacity-80">
                      + {l.label}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div style={{ position: "absolute", right: 10, bottom: 0, width: 150, background: C.amber, color: C.amberInk, borderRadius: 18, padding: 16 }}>
              <div style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", opacity: 0.9 }}>{award ? "Award" : "Category"}</div>
              <div style={{ fontWeight: 600, letterSpacing: "-0.03em", fontSize: (award?.award_name ?? project.project_category).length > 14 ? 20 : 28, lineHeight: 1.1, marginTop: 6 }}>
                {award?.award_name ?? project.project_category}
              </div>
              <div style={{ fontSize: 12, lineHeight: 1.35, marginTop: 4 }}>Built by {project.builder_name}</div>
            </div>
          </div>
        </header>

        {/* ── Links strip ───────────────────────────────────────────────── */}
        {links.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "20px 56px", padding: "28px 0", borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}` }}>
            <span style={{ fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: C.subtle }}>Project links</span>
            {links.map((l) => (
              <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em", color: C.ink }} className="hover:!text-[#8a5305]">
                <span style={{ color: l.color, display: "flex" }}>{l.icon}</span>
                <span>{l.label}</span>
              </a>
            ))}
          </div>
        )}

        {/* ── Features (What's included) ────────────────────────────────── */}
        {features.length > 0 && (
          <section id="features" style={{ padding: "120px 0 0", scrollMarginTop: 24 }}>
            <div style={{ textAlign: "center", maxWidth: 620, margin: "0 auto" }}>
              <h2 style={{ ...h2Style, margin: 0 }}>What's included</h2>
              <p style={{ ...bodyStyle, margin: "18px 0 0" }}>The key pieces that make {project.title} work.</p>
            </div>
            <div style={{ marginTop: 56, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,340px),1fr))", gap: 20 }}>
              {features.map((f, i) => (
                <div key={i} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 36, padding: "clamp(28px,4vw,48px)" }}>
                  <AmberTag>Feature {String(i + 1).padStart(2, "0")}</AmberTag>
                  <h3 style={{ margin: "20px 0 0", fontWeight: 600, fontSize: "clamp(22px,2.4vw,30px)", lineHeight: 1.2, letterSpacing: "-0.01em" }}>{f}</h3>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── About the builder ───────────────────────────────────────────── */}
      <section style={{ marginTop: 120, background: C.navy, color: "#fff" }}>
        <div style={{ ...wrap, paddingTop: 96, paddingBottom: 96, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", gap: 64, alignItems: "end" }}>
          <div>
            <AmberTag>// Why {project.title} //</AmberTag>
            {aboutUser.length > 0 ? (
              <p style={{ margin: "24px 0 0", fontSize: "clamp(20px,2.2vw,26px)", lineHeight: 1.4, fontWeight: 500, textWrap: "pretty" as any }}>
                {aboutUser[0]}
                {aboutUser.length > 1 && <span style={{ color: C.navySoft }}> {aboutUser.slice(1).join(" ")}</span>}
              </p>
            ) : (
              <p style={{ margin: "24px 0 0", fontSize: "clamp(20px,2.2vw,26px)", lineHeight: 1.4, fontWeight: 500 }}>
                {project.title} <span style={{ color: C.navySoft }}>was built by {project.builder_name} as part of the MyAI Community.</span>
              </p>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Avatar src={builderImg} name={project.builder_name} size={64} dark />
              <div>
                <div style={{ fontWeight: 600, letterSpacing: "-0.03em", fontSize: 32, lineHeight: 1.1 }}>{project.builder_name}</div>
                <div style={{ fontSize: 14, color: C.navyMuted, marginTop: 4 }}>AI Builder · MyAI Community</div>
              </div>
            </div>
            {project.builder_linkedin && (
              <a href={project.builder_linkedin} target="_blank" rel="noopener noreferrer" className="hover:opacity-90"
                style={{ background: "#fff", color: C.ink, padding: "13px 22px", borderRadius: 999, fontSize: 14, fontWeight: 600, whiteSpace: "nowrap" }}>
                Connect on LinkedIn
              </a>
            )}
          </div>
        </div>
      </section>

      <div style={wrap}>

        {/* ── Demo ──────────────────────────────────────────────────────── */}
        {videoLink && (
          <section id="demo" style={{ padding: "120px 0 0", scrollMarginTop: 24 }}>
            <Eyebrow>Demo</Eyebrow>
            <h2 style={{ ...h2Style, maxWidth: 820 }}>See {project.title} in action</h2>
            <p style={{ ...bodyStyle, margin: "18px 0 0", maxWidth: 620 }}>A walkthrough of the project by {firstName}.</p>
            {embedUrl ? (
              <div style={{ marginTop: 40, aspectRatio: "16/9", borderRadius: 24, overflow: "hidden", border: `1px solid ${C.line}`, background: "#000" }}>
                <iframe src={embedUrl} title={`${project.title} demo`} style={{ width: "100%", height: "100%", border: 0 }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen />
              </div>
            ) : (
              <a href={videoLink} target="_blank" rel="noopener noreferrer" className="group"
                style={{ marginTop: 40, aspectRatio: "16/9", borderRadius: 24, background: banner ? `center/cover no-repeat url("${banner}")` : STRIPES, border: `1px solid ${C.line}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, textAlign: "center", padding: 24, position: "relative", overflow: "hidden" }}>
                {banner && <span style={{ position: "absolute", inset: 0, background: "rgba(9,9,11,.35)" }} />}
                <span className="transition-transform group-hover:scale-105" style={{ position: "relative", width: 72, height: 72, borderRadius: "50%", background: "#fff", boxShadow: "0 6px 20px rgba(0,0,0,.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <IcoPlay />
                </span>
                <span style={{ position: "relative", fontFamily: MONO, fontSize: 12, color: banner ? "#fff" : C.subtle }}>Watch the demo video ↗</span>
              </a>
            )}
          </section>
        )}

        {/* ── Overview (rest of description + links) ────────────────────── */}
        {(moreDesc.length > 0 || links.length > 0) && (
          <section id="overview" style={{ padding: "120px 0 0", scrollMarginTop: 24 }}>
            <Eyebrow>Overview</Eyebrow>
            <h2 style={h2Style}>About the project</h2>
            {moreDesc.length > 0 && (
              <div style={{ marginTop: 24, maxWidth: 820, display: "flex", flexDirection: "column", gap: 16 }}>
                {moreDesc.map((p, i) => <p key={i} style={{ ...bodyStyle, margin: 0 }}>{p.replace(/^["“]+|["”]+$/g, "").replace(/\s*\n\s*/g, " ")}</p>)}
              </div>
            )}
            {links.length > 0 && (
              <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", borderTop: `1px solid ${C.ink}` }}>
                {links.map((l, i) => (
                  <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="group"
                    style={{ padding: i === 0 ? "28px 28px 28px 0" : 28, borderLeft: i === 0 ? "none" : `1px solid ${C.line}`, color: C.ink }}>
                    <div style={{ fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: C.subtle }}>{String(i + 1).padStart(2, "0")} · Link</div>
                    <div className="group-hover:!text-[#8a5305]" style={{ fontWeight: 600, letterSpacing: "-0.03em", fontSize: 30, marginTop: 12 }}>{l.label} ↗</div>
                    <p className="truncate" style={{ margin: "10px 0 0", fontSize: 15, lineHeight: 1.6, color: C.muted }}>{l.href.replace(/^https?:\/\/(www\.)?/, "")}</p>
                  </a>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── What we learned ───────────────────────────────────────────── */}
        {learned.length > 0 && (
          <section id="learned" style={{ padding: "120px 0 0", scrollMarginTop: 24 }}>
            <Eyebrow>What we learned</Eyebrow>
            <h2 style={h2Style}>Lessons from the build</h2>
            <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,360px),1fr))", gap: 16 }}>
              {learned.map((l, i) => (
                <div key={i} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 24, padding: 32 }}>
                  <div style={{ fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: C.subtle }}>Lesson {String(i + 1).padStart(2, "0")}</div>
                  <p style={{ margin: "10px 0 0", fontSize: 17, lineHeight: 1.6, color: C.ink }}>{l}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Project footer ────────────────────────────────────────────── */}
        <footer style={{ margin: "120px 0 0", padding: "0 0 64px" }}>
          <hr style={{ border: 0, borderTop: "1px solid #d4d4d8", margin: "24px 0 28px" }} />
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {tags.map((t) => (
                <span key={t} style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 12, padding: "5px 10px", fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase", color: "#424242" }}>{t}</span>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase", color: "#616161", whiteSpace: "nowrap" }}>
                {voted ? "Thanks for your feedback" : "Rate this project"}
              </span>
              {([["up", ups], ["down", downs]] as const).map(([type, count]) => {
                const active = voted === type;
                return (
                  <button key={type} aria-label={type === "up" ? "Helpful" : "Not helpful"} onClick={() => vote(type)} disabled={!!voted}
                    className="transition-colors enabled:hover:bg-zinc-50 disabled:cursor-default"
                    style={{
                      display: "flex", alignItems: "center", gap: 8, height: 36, padding: "0 14px", borderRadius: 4, fontFamily: "inherit", fontWeight: 600, fontSize: 14, cursor: "pointer",
                      border: `1px solid ${active ? (type === "up" ? "#86efac" : "#fca5a5") : "#d1d1d1"}`,
                      background: active ? (type === "up" ? "#dcfce7" : "#fee2e2") : "#fff",
                      color: active ? (type === "up" ? "#16a34a" : "#dc2626") : "#424242",
                    }}>
                    {type === "up" ? <IcoThumbUp filled={active} /> : <IcoThumbDn filled={active} />}
                    <span>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 20, marginTop: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <Avatar src={builderImg} name={project.builder_name} size={80} />
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontSize: 16 }}><span style={{ fontWeight: 700 }}>{project.builder_name}</span> <span style={{ fontSize: 14, color: "#424242" }}>AI Builder</span></div>
                <div style={{ fontSize: 14, color: "#424242" }}>Builder of {project.title}, MyAI Community</div>
              </div>
            </div>
            {project.builder_linkedin && (
              <a href={project.builder_linkedin} target="_blank" rel="noopener noreferrer" className="hover:opacity-90"
                style={{ display: "flex", alignItems: "center", gap: 10, height: 44, padding: "0 20px", background: "#0a66c2", color: "#fff", fontSize: 15, fontWeight: 600, borderRadius: 22 }}>
                <IcoLinkedIn /><span>Connect on LinkedIn</span>
              </a>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};
