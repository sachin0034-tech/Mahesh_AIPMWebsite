import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProjectById, getPublishedProjects, voteOnProject } from "@/lib/cohortApi";

/**
 * Public project page. Renders the approved product-style template
 * (public/project-page-template.html, see the myai-project-page skill) inside a
 * full-viewport iframe. The record from GET /api/cohort-projects/:id is injected
 * as window.PROJECT, and three other projects as window.MORE_PROJECTS.
 */

function getVoterId(): string {
  let id = localStorage.getItem("cohort_voter_id");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("cohort_voter_id", id); }
  return id;
}

const voteKey = (id: string) => `project_vote_${id}`;
function getMyVote(id: string): "up" | "down" | "" {
  try { const v = localStorage.getItem(voteKey(id)); return v === "up" || v === "down" ? v : ""; } catch { return ""; }
}
function setMyVote(id: string, v: "up" | "down") {
  try { localStorage.setItem(voteKey(id), v); } catch { /* storage blocked */ }
}

// Keep "</script>" and line separators inside JSON from breaking the injected <script>
function safeJson(v: unknown): string {
  return JSON.stringify(v)
    .replace(/</g, "\\u003c")
    .replace(new RegExp("\\u2028", "g"), "\\u2028")
    .replace(new RegExp("\\u2029", "g"), "\\u2029");
}

const hasSection = (p: any, s: string) => (p.sections || []).some((x: any) => x.section === s);
const cohortOf = (p: any) => ((p.sections || []).find((x: any) => /^cohort/.test(x.section)) || {}).section || "";

function pickMore(current: any, all: any[]): any[] {
  const mine = cohortOf(current);
  return all
    .filter((m) => m.id !== current.id)
    .map((m) => ({
      m,
      sc: (mine && cohortOf(m) === mine ? 3 : 0) + ((m.thumbnail_url || m.banner_url) ? 2 : 0) +
        (hasSection(m, "top10") || hasSection(m, "awards") ? 1 : 0),
      r: Math.random(),
    }))
    .sort((a, b) => b.sc - a.sc || a.r - b.r)
    .slice(0, 3)
    .map((x) => x.m);
}

export const ProjectDetailPage = (): JSX.Element => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [more, setMore] = useState<any[]>([]);
  const [template, setTemplate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    setLoading(true);
    setError(false);
    (async () => {
      try {
        const [{ data }, tpl, all] = await Promise.all([
          getProjectById(projectId),
          fetch("/project-page-template.html").then((r) => { if (!r.ok) throw new Error("template"); return r.text(); }),
          getPublishedProjects().then((r) => r.data || []).catch(() => [] as any[]),
        ]);
        if (cancelled) return;
        if (!data) throw new Error("not found");
        setProject(data);
        setMore(pickMore(data, all));
        setTemplate(tpl);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [projectId]);

  // Rating buttons inside the iframe report back here so votes reach the API
  useEffect(() => {
    if (!projectId) return;
    const onMsg = async (e: MessageEvent) => {
      const d = e.data;
      if (!d || d.type !== "project-vote" || !d.on) return;
      if (d.vote !== "up" && d.vote !== "down") return;
      if (getMyVote(projectId)) return; // one rating per visitor
      try {
        await voteOnProject(projectId, d.vote, getVoterId());
      } catch { /* 409 = this voter already rated */ }
      setMyVote(projectId, d.vote);
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [projectId]);

  const srcDoc = useMemo(() => {
    if (!project || !template) return "";
    const inject = `<script>window.PROJECT=${safeJson(project)};window.MORE_PROJECTS=${safeJson(more)};window.MY_VOTE=${safeJson(getMyVote(project.id) || "")};</script>\n`;
    // Data must be set before the script that boots the page (the last inline script)
    const i = template.lastIndexOf("<script>");
    return template.slice(0, i) + inject + template.slice(i);
  }, [project, more, template]);

  if (loading || error || !project) {
    return (
      <div className="min-h-screen" style={{ background: "#f4f4f5", fontFamily: "'DM Sans', sans-serif" }}>
        <div className="max-w-lg mx-auto pt-24 text-center px-6">
          {loading ? (
            <p style={{ color: "#6b7280", fontSize: 14 }}>Loading project…</p>
          ) : (
            <>
              <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 20 }}>This project isn't available.</p>
              <button
                onClick={() => navigate("/")}
                style={{ background: "#02245b", color: "#fff", border: "none", borderRadius: 999, padding: "10px 24px", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
              >
                Back to home
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <iframe
      key={project.id}
      title={project.title}
      srcDoc={srcDoc}
      allow="autoplay; fullscreen; picture-in-picture"
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", border: 0, background: "#f4f4f5" }}
    />
  );
};
