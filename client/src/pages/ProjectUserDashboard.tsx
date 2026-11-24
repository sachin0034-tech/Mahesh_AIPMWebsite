import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useProjectUser } from "@/contexts/ProjectUserContext";
import { getMyProjects, publishMyProject, unpublishMyProject, STUDENTS_CAN_PUBLISH } from "@/lib/projectUserApi";
import { McBackground, Nav, ArrowRight } from "@/components/McShared";
import type { CohortProject } from "@/lib/supabase";
import { useConfirm } from "@/components/ConfirmDialog";
import "./CohortProjects.css";
import "./Builder.css";

export const ProjectUserDashboard = (): JSX.Element => {
  const { isLoggedIn, authChecked, user, logout } = useProjectUser();
  const navigate = useNavigate();
  const { ask, dialog } = useConfirm();
  const [projects, setProjects] = useState<CohortProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authChecked) return;
    if (!isLoggedIn) { navigate("/project-login"); return; }
    (async () => {
      try {
        const { projects: data } = await getMyProjects();
        setProjects(data ?? []);
      } catch {
        setProjects([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [authChecked, isLoggedIn]);

  const toggle = async (p: CohortProject) => {
    const live = p.status === "published";
    const ok = await ask(live
      ? { title: "Unpublish this project?", message: "No one else will be able to see it until you publish it again. Your work stays saved as a draft.", confirmLabel: "Unpublish", danger: true }
      : { title: "Publish this project?", message: "It will become visible on the public site.", confirmLabel: "Publish" });
    if (!ok) return;
    setBusy(p.id); setError("");
    try {
      if (p.status === "published") await unpublishMyProject(p.id);
      else await publishMyProject(p.id);
      setProjects((list) => list.map((x) => x.id === p.id ? { ...x, status: p.status === "published" ? "draft" : "published" } : x));
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mc">
      <McBackground />
      <Nav />
      {dialog}
      <main className="b-main">
        <div className="wrap">
          <div className="b-head">
            <div>
              <span className="eyebrow">{user ? `Hi, ${user.username}` : "Builders"}</span>
              <h1>Your projects</h1>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link to="/project-editor/new" className="btn btn-dark">Add a project <ArrowRight /></Link>
              <button className="btn btn-ghost btn-pill" onClick={async () => { await logout(); navigate("/"); }}>Sign out</button>
            </div>
          </div>

          {error && <div className="b-alert" role="alert">{error}</div>}

          {loading ? (
            <div className="b-grid">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skel" />)}</div>
          ) : projects.length === 0 ? (
            <div className="b-empty">
              <b>No projects yet</b>
              Add your first project and preview how it will look before it goes live.
              <div style={{ marginTop: 18 }}><Link to="/project-editor/new" className="btn btn-dark">Add a project <ArrowRight /></Link></div>
            </div>
          ) : (
            <div className="b-grid">
              {projects.map((p) => {
                const live = p.status === "published";
                const img = p.banner_url || p.thumbnail_url;
                return (
                  <div key={p.id} className="b-proj">
                    <div className="b-proj-img">{img ? <img src={img} alt="" loading="lazy" /> : "No cover image yet"}</div>
                    <div className="b-proj-body">
                      <span className={`b-status ${live ? "live" : "draft"}`}>{live ? "Live" : "Draft"}</span>
                      <h3>{p.title}</h3>
                      <div className="b-actions">
                        <Link to={`/project-editor/${p.id}`} className="btn btn-dark">Edit</Link>
                        {live && <Link to={`/project/${p.id}`} className="btn btn-ghost btn-pill">View</Link>}
                        {STUDENTS_CAN_PUBLISH && (
                          <button className="btn btn-ghost btn-pill" disabled={busy === p.id} onClick={() => toggle(p)}>
                            {live ? "Unpublish" : "Publish"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
