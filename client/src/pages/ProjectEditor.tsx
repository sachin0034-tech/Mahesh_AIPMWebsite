import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useProjectUser } from "@/contexts/ProjectUserContext";
import {
  getMyProject, updateMyProject, createMyProject, publishMyProject, unpublishMyProject, uploadProjectAsset, STUDENTS_CAN_PUBLISH,
} from "@/lib/projectUserApi";
import { compressImage } from "@/lib/imageCompression";
import { DEFAULT_VISIBILITY_FLAGS, PROJECT_CATEGORIES } from "@/lib/supabase";
import type { VisibilityFlags } from "@/lib/supabase";
import { Avatar, McBackground, Nav } from "@/components/McShared";
import { useConfirm } from "@/components/ConfirmDialog";
import "./CohortProjects.css";
import "./Builder.css";

// ─── Types ────────────────────────────────────────────────────────────────────

type Form = {
  title: string;
  builder_name: string;
  project_category: string;
  description: string;
  builder_linkedin: string;
  video_link: string;
  workflow_link: string;
  doc_link: string;
  hosted_link: string;
  what_you_learned: string;
  about_user_description: string;
  banner_url: string | null;
  user_image_url: string | null;
  whats_included: string[];
  visibility_flags: VisibilityFlags;
  stack: string[]; // "Built with" tools the builder picked; empty = automatic set
};

const BLANK: Form = {
  title: "", builder_name: "", project_category: "AI Tools", description: "", builder_linkedin: "",
  video_link: "", workflow_link: "", doc_link: "", hosted_link: "", what_you_learned: "",
  about_user_description: "", banner_url: null, user_image_url: null, whats_included: [],
  visibility_flags: DEFAULT_VISIBILITY_FLAGS,
  stack: [],
};

// ─── Small pieces ─────────────────────────────────────────────────────────────

function Field({
  label, hint, flag, flags, onFlags, children,
}: {
  label: string; hint?: string; flag?: keyof VisibilityFlags;
  flags: VisibilityFlags; onFlags: (f: VisibilityFlags) => void; children: React.ReactNode;
}) {
  const on = flag ? flags[flag] : true;
  return (
    <div className="b-field">
      <div className="b-label">
        <span>{label} {hint && <small>{hint}</small>}</span>
        {flag && (
          <button
            type="button" className={`e-vis ${on ? "on" : ""}`}
            onClick={() => onFlags({ ...flags, [flag]: !on })}
            title={on ? "Shown on your public page" : "Hidden from your public page"}
          >
            {on ? "Visible" : "Hidden"}
          </button>
        )}
      </div>
      <div style={{ opacity: on ? 1 : 0.5 }}>{children}</div>
    </div>
  );
}

function ImagePick({
  src, label, onFile, onClear,
}: { src: string | null; label: string; onFile: (f: File) => void; onClear: () => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <label className="e-upload">
        {src ? <img src={src} alt={label} /> : <span>Click to upload {label}</span>}
        <input
          ref={ref} type="file" accept="image/*" hidden
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            onFile(await compressImage(f));
            e.target.value = "";
          }}
        />
      </label>
      {src && <button type="button" className="e-link-btn" onClick={onClear}>Remove</button>}
    </div>
  );
}

const STACK_TOOLS: [string, string][] = [
  ["claude", "Claude"], ["openai", "OpenAI"], ["googlegemini", "Gemini"], ["anthropic", "Anthropic"], ["perplexity", "Perplexity"],
  ["langchain", "LangChain"], ["n8n", "n8n"], ["zapier", "Zapier"], ["python", "Python"], ["javascript", "JavaScript"],
  ["typescript", "TypeScript"], ["nextdotjs", "Next.js"], ["fastapi", "FastAPI"], ["streamlit", "Streamlit"], ["tailwindcss", "Tailwind CSS"],
  ["supabase", "Supabase"], ["firebase", "Firebase"], ["postgresql", "PostgreSQL"], ["mongodb", "MongoDB"], ["airtable", "Airtable"],
  ["notion", "Notion"], ["figma", "Figma"], ["stripe", "Stripe"], ["twilio", "Twilio"], ["github", "GitHub"], ["docker", "Docker"],
  ["vercel", "Vercel"], ["netlify", "Netlify"],
];
const MAX_STACK = 6;
// The chosen tools ride inside the existing jsonb visibility_flags column, so no schema change is needed.
const STACK_KEY = "myai_built_with"; // namespaced so it can never collide with a visibility flag
const withStack = (f: Form) => ({ ...f.visibility_flags, [STACK_KEY]: f.stack }) as VisibilityFlags;

const isUrlOk = (v: string) => { if (!v.trim()) return true; try { return /^https?:$/.test(new URL(v.trim()).protocol); } catch { return false; } };

// ─── Editor ───────────────────────────────────────────────────────────────────

export const ProjectEditor = (): JSX.Element => {
  const { projectId } = useParams<{ projectId: string }>();
  const { ask, dialog } = useConfirm();
  const isNew = projectId === "new";
  const { isLoggedIn, authChecked } = useProjectUser();
  const navigate = useNavigate();

  const [id, setId] = useState<string | null>(isNew ? null : projectId ?? null);
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [form, setForm] = useState<Form>(BLANK);
  const [saved, setSaved] = useState<Form>(BLANK);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [denied, setDenied] = useState(false);
  const [busy, setBusy] = useState<"" | "save" | "publish" | "unpublish">("");
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [wide, setWide] = useState(false); // desktop: hide form, preview full width
  const [pane, setPane] = useState<"form" | "preview">("form"); // mobile switch
  const [view, setView] = useState<"page" | "card">("page");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [frameWrapEl, setFrameWrapEl] = useState<HTMLDivElement | null>(null); // callback ref: the node mounts after the auth gate
  const [wrapSize, setWrapSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = frameWrapEl;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth, h = el.clientHeight;
      setWrapSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [frameWrapEl]);
  const [template, setTemplate] = useState("");

  const dirty = JSON.stringify(form) !== JSON.stringify(saved) || !!bannerFile || !!photoFile;
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));
  const flash = (msg: string, ok: boolean) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3500); };

  // auth + load
  useEffect(() => {
    if (!authChecked) return;
    if (!isLoggedIn) { navigate("/project-login"); return; }
    if (isNew || !projectId) return;
    (async () => {
      try {
        const { data } = await getMyProject(projectId);
        const f: Form = {
          title: data.title ?? "", builder_name: data.builder_name ?? "",
          project_category: data.project_category ?? "AI Tools", description: data.description ?? "",
          builder_linkedin: data.builder_linkedin ?? "", video_link: data.video_link ?? "",
          workflow_link: data.workflow_link ?? "", doc_link: data.doc_link ?? "", hosted_link: data.hosted_link ?? "",
          what_you_learned: data.what_you_learned ?? "", about_user_description: data.about_user_description ?? "",
          banner_url: data.banner_url ?? null, user_image_url: data.user_image_url ?? null,
          whats_included: Array.isArray(data.whats_included) ? data.whats_included : [], visibility_flags: data.visibility_flags ?? DEFAULT_VISIBILITY_FLAGS,
          stack: Array.isArray((data.visibility_flags as any)?.[STACK_KEY]) ? (data.visibility_flags as any)[STACK_KEY] : [],
        };
        setForm(f); setSaved(f); setStatus(data.status === "published" ? "published" : "draft");
      } catch {
        setDenied(true); // 403 (not yours) or 404
      } finally {
        setLoading(false);
      }
    })();
  }, [authChecked, isLoggedIn, projectId]);

  // the real public page template, used for the preview
  useEffect(() => {
    fetch("/project-page-template.html").then((r) => r.text()).then(setTemplate).catch(() => setTemplate(""));
  }, []);

  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  // Local previews for images not uploaded yet. Data URLs (not blob: URLs), because the
  // sandboxed preview iframe cannot load blob URLs from this page. Nothing is sent to the server here.
  const useLocalPreview = (file: File | null) => {
    const [url, setUrl] = useState<string | null>(null);
    useEffect(() => {
      if (!file) { setUrl(null); return; }
      let live = true;
      const r = new FileReader();
      r.onload = () => { if (live) setUrl(r.result as string); };
      r.readAsDataURL(file);
      return () => { live = false; };
    }, [file]);
    return url;
  };
  const bannerPreview = useLocalPreview(bannerFile);
  const photoPreview = useLocalPreview(photoFile);

  const previewProject = useMemo(() => ({
    id: id ?? "preview",
    title: form.title || "Your project title",
    builder_name: form.builder_name || "Your name",
    project_category: form.project_category,
    description: form.description || null,
    builder_linkedin: form.builder_linkedin || null,
    video_link: form.video_link || null,
    workflow_link: form.workflow_link || null,
    doc_link: form.doc_link || null,
    hosted_link: form.hosted_link || null,
    what_you_learned: form.what_you_learned || null,
    about_user_description: form.about_user_description || null,
    whats_included: form.whats_included.filter(Boolean),
    visibility_flags: withStack(form),
    banner_url: bannerPreview ?? form.banner_url,
    thumbnail_url: bannerPreview ?? form.banner_url,
    user_image_url: photoPreview ?? form.user_image_url,
    thumbs_up: 0, thumbs_down: 0, status, sections: [] as any[],
  }), [form, id, bannerPreview, photoPreview, status]);

  // debounce so the iframe doesn't reload on every keystroke
  const [debounced, setDebounced] = useState(previewProject);
  useEffect(() => { const t = setTimeout(() => setDebounced(previewProject), 450); return () => clearTimeout(t); }, [previewProject]);

  const srcDoc = useMemo(() => {
    if (!template) return "";
    const json = JSON.stringify(debounced).replace(/</g, "\\u003c").replace(new RegExp("\\u2028", "g"), "\\u2028").replace(new RegExp("\\u2029", "g"), "\\u2029");
    const inject = `<script>window.PROJECT=${json};window.MORE_PROJECTS=[];window.MY_VOTE="";document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("nav a,nav button,footer a,.backlink,.crumb a");if(a){e.preventDefault();e.stopPropagation();}},true);</script>\n<style>nav a,nav button,footer a,.backlink,.crumb a{pointer-events:none!important;cursor:default!important}</style>\n`;
    const i = template.lastIndexOf("<script>");
    return template.slice(0, i) + inject + template.slice(i);
  }, [template, debounced]);

  // ── actions ──
  const validate = (forPublish: boolean) => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Add a project title";
    if (!form.builder_name.trim()) e.builder_name = "Add your name";
    for (const k of ["video_link", "hosted_link", "doc_link", "workflow_link", "builder_linkedin"] as const) {
      if (!isUrlOk(form[k])) e[k] = "Must start with http:// or https://";
    }
    if (forPublish) {
      if (!form.description.trim()) e.description = "Add a description before publishing";
      if (!form.video_link.trim() && !form.hosted_link.trim()) e.video_link = "Add a demo video or a live demo link";
    }
    setErrors(e);
    if (Object.keys(e).length) { flash("Fix the highlighted fields", false); setPane("form"); }
    return Object.keys(e).length === 0;
  };

  // returns the project id on success
  const save = async (forPublish = false): Promise<string | null> => {
    if (!validate(forPublish)) return null;
    let pid = id;
    if (!pid) {
      const created = await createMyProject({
        title: form.title.trim(), builder_name: form.builder_name.trim(), project_category: form.project_category,
      });
      pid = created.data.id;
      setId(pid);
    }
    let banner_url = form.banner_url;
    let user_image_url = form.user_image_url;
    if (bannerFile) banner_url = await uploadProjectAsset(bannerFile, "banner");
    if (photoFile) user_image_url = await uploadProjectAsset(photoFile, "user_image");

    const t = (v: string) => v.trim() || null;
    await updateMyProject(pid, {
      title: form.title.trim(), builder_name: form.builder_name.trim(), project_category: form.project_category,
      description: t(form.description), builder_linkedin: t(form.builder_linkedin),
      video_link: t(form.video_link), workflow_link: t(form.workflow_link), doc_link: t(form.doc_link),
      hosted_link: t(form.hosted_link), what_you_learned: t(form.what_you_learned),
      about_user_description: t(form.about_user_description),
      whats_included: form.whats_included.map((s) => s.trim()).filter(Boolean),
      visibility_flags: withStack(form), banner_url, user_image_url,
    });
    const next = { ...form, banner_url, user_image_url };
    setForm(next); setSaved(next); setBannerFile(null); setPhotoFile(null);
    if (isNew) navigate(`/project-editor/${pid}`, { replace: true });
    return pid;
  };

  const run = async (kind: "save" | "publish" | "unpublish") => {
    if (kind === "unpublish" && !(await ask({ title: "Unpublish this project?", message: "No one else will be able to see it until you publish it again. Your work stays saved as a draft.", confirmLabel: "Unpublish", danger: true }))) return;
    if (kind === "publish" && !(await ask(status === "published"
      ? { title: "Save changes to your live project?", message: "They will be visible on the public site right away.", confirmLabel: "Save changes" }
      : { title: "Publish this project?", message: "It will become visible on the public site.", confirmLabel: "Publish" }))) return;
    setBusy(kind);
    try {
      if (kind === "unpublish") {
        if (!id) return;
        await unpublishMyProject(id);
        setStatus("draft");
        flash("Unpublished. Your project is now a private draft.", true);
        return;
      }
      const pid = await save(kind === "publish");
      if (!pid) return;
      if (kind === "publish") {
        await publishMyProject(pid);
        setStatus("published");
        flash("Your project is live!", true);
      } else {
        flash("Changes saved", true);
        // After saving a draft, go back to this builder's project list instead of staying in the editor
        navigate("/my-projects");
      }
    } catch (e: any) {
      flash(e.message || "Something went wrong", false);
    } finally {
      setBusy("");
    }
  };

  // ── render ──
  if (loading || !authChecked) {
    return <div className="mc"><McBackground /><Nav /><main className="b-main"><div className="wrap"><div className="skel" style={{ height: 320 }} /></div></main></div>;
  }

  if (denied) {
    return (
      <div className="mc"><McBackground /><Nav />
        <main className="b-main"><div className="wrap"><div className="b-narrow"><div className="b-card">
          <h1>Project not available</h1>
          <p className="b-sub">This project does not exist, or it belongs to another account. You can only edit projects you created.</p>
          <Link to="/my-projects" className="btn btn-dark b-btn-full">Back to your projects</Link>
        </div></div></div></main>
      </div>
    );
  }

  const flags = form.visibility_flags;
  const setFlags = (f: VisibilityFlags) => set("visibility_flags", f);
  const bad = (k: string) => (errors[k] ? "is-bad" : "");
  const err = (k: string) => errors[k] && <div className="b-err">{errors[k]}</div>;

  return (
    <div className="mc">
      <McBackground />
      <Nav />
      {dialog}

      <div className="e-top">
        <div className="wrap e-top-in">
          <div className="e-title">
            <Link to="/my-projects" className="backlink">← Projects</Link>
            <b>{form.title || "New project"}</b>
            <span className={`b-status ${status === "published" ? "live" : "draft"}`}>{status === "published" ? "Live" : "Draft"}</span>
            {dirty && <span className="e-dirty">Unsaved changes</span>}
          </div>
          <div className="e-btns">
            <button className="btn btn-ghost btn-pill e-showprev" onClick={() => setPane(pane === "form" ? "preview" : "form")}>
              {pane === "form" ? "Preview" : "Edit"}
            </button>
            <button className="btn btn-ghost btn-pill" disabled={!!busy || !dirty} onClick={() => run("save")}>
              {busy === "save" ? "Saving…" : "Save draft"}
            </button>
            {STUDENTS_CAN_PUBLISH && status === "published" && (
              <button className="btn btn-ghost btn-pill" disabled={!!busy} onClick={() => run("unpublish")}>Unpublish</button>
            )}
            {STUDENTS_CAN_PUBLISH && (
              <button className="btn btn-dark" disabled={!!busy || (status === "published" && !dirty)} onClick={() => run("publish")}>
                {busy === "publish" ? "Publishing…" : status === "published" ? "Save & keep live" : "Publish"}
              </button>
            )}
          </div>
        </div>
      </div>

      <main className="wrap">
        <div className={`e-layout ${wide ? "is-wide" : ""}`}>
          {/* ── form ── */}
          <div className={`e-form-col ${pane === "preview" ? "e-pane-hidden" : ""}`}>
          <section className="e-form">
            <div className="e-sec">Basics</div>
            <label className="b-field">
              <span className="b-label">Project title</span>
              <input className={`b-input ${bad("title")}`} value={form.title} maxLength={150} onChange={(e) => set("title", e.target.value)} placeholder="AI Sprint Planning Tool" />
              {err("title")}
            </label>
            <label className="b-field">
              <span className="b-label">Your name</span>
              <input className={`b-input ${bad("builder_name")}`} value={form.builder_name} maxLength={100} onChange={(e) => set("builder_name", e.target.value)} />
              {err("builder_name")}
            </label>
            <label className="b-field">
              <span className="b-label">Category</span>
              <select className="b-select" value={form.project_category} onChange={(e) => set("project_category", e.target.value)}>
                {PROJECT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <Field label="Description" flag="description" flags={flags} onFlags={setFlags}>
              <textarea className={`b-textarea ${bad("description")}`} rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="What does your project do, and who is it for?" />
              {err("description")}
            </Field>

            <div className="e-sec">Links</div>
            <Field label="Demo video" hint="YouTube, Loom…" flag="video_link" flags={flags} onFlags={setFlags}>
              <input className={`b-input ${bad("video_link")}`} type="url" inputMode="url" value={form.video_link} onChange={(e) => set("video_link", e.target.value)} placeholder="https://" />
              {err("video_link")}
            </Field>
            <Field label="Live demo" flag="demo_link" flags={flags} onFlags={setFlags}>
              <input className={`b-input ${bad("hosted_link")}`} type="url" inputMode="url" value={form.hosted_link} onChange={(e) => set("hosted_link", e.target.value)} placeholder="https://your-project.com" />
              {err("hosted_link")}
            </Field>
            <Field label="Docs and workflow" flag="doc_link" flags={flags} onFlags={setFlags}>
              <input className={`b-input ${bad("doc_link")}`} type="url" inputMode="url" style={{ marginBottom: 8 }} value={form.doc_link} onChange={(e) => set("doc_link", e.target.value)} placeholder="Documentation URL" />
              {err("doc_link")}
              <input className={`b-input ${bad("workflow_link")}`} type="url" inputMode="url" value={form.workflow_link} onChange={(e) => set("workflow_link", e.target.value)} placeholder="Workflow or diagram URL" />
              {err("workflow_link")}
            </Field>

            <div className="e-sec">Images</div>
            <Field label="Project banner" flag="banner" flags={flags} onFlags={setFlags}>
              <ImagePick src={bannerPreview ?? form.banner_url} label="a banner" onFile={setBannerFile} onClear={() => { setBannerFile(null); set("banner_url", null); }} />
            </Field>
            <Field label="Your photo" flag="user_image" flags={flags} onFlags={setFlags}>
              <ImagePick src={photoPreview ?? form.user_image_url} label="your photo" onFile={setPhotoFile} onClear={() => { setPhotoFile(null); set("user_image_url", null); }} />
            </Field>

            <div className="e-sec">Built with</div>
            <div className="e-field-hint">
              {form.stack.length === 0
                ? "Nothing picked, so we'll show 4 suggested tools. Choose your own to replace them."
                : `Showing your ${form.stack.length} pick${form.stack.length > 1 ? "s" : ""} (up to ${MAX_STACK}).`}
            </div>
            <div className="e-stack">
              {STACK_TOOLS.map(([key, label]) => {
                const on = form.stack.includes(key);
                const full = form.stack.length >= MAX_STACK && !on;
                return (
                  <button type="button" key={key} className={`e-stack-chip ${on ? "is-on" : ""}`} disabled={full} aria-pressed={on}
                    onClick={() => setForm((f) => {
                      const cur = f.stack;
                      if (cur.includes(key)) return { ...f, stack: cur.filter((k) => k !== key) };
                      return cur.length >= MAX_STACK ? f : { ...f, stack: [...cur, key] };
                    })}>
                    {label}
                  </button>
                );
              })}
            </div>
            {form.stack.length > 0 && (
              <button type="button" className="e-link-btn" onClick={() => set("stack", [])}>Clear all</button>
            )}

            <div className="e-sec">More about it</div>
            <Field label="What you'll learn" flag="what_you_learned" flags={flags} onFlags={setFlags}>
              <textarea className="b-textarea" rows={3} value={form.what_you_learned} onChange={(e) => set("what_you_learned", e.target.value)} placeholder="Key takeaways, skills, lessons" />
            </Field>
            <Field label="What's included" flag="whats_included" flags={flags} onFlags={setFlags}>
              {form.whats_included.map((item, i) => (
                <div key={i} className="e-incl">
                  <input className="b-input" value={item} placeholder={`Item ${i + 1}`}
                    onChange={(e) => set("whats_included", form.whats_included.map((x, j) => (j === i ? e.target.value : x)))} />
                  <button type="button" className="btn btn-ghost btn-pill" aria-label="Remove item"
                    onClick={() => set("whats_included", form.whats_included.filter((_, j) => j !== i))}>✕</button>
                </div>
              ))}
              {form.whats_included.length < 10 && (
                <button type="button" className="e-link-btn" onClick={() => set("whats_included", [...form.whats_included, ""])}>+ Add item</button>
              )}
            </Field>
            <Field label="About you" flag="about_user" flags={flags} onFlags={setFlags}>
              <textarea className="b-textarea" rows={3} style={{ marginBottom: 8 }} value={form.about_user_description} onChange={(e) => set("about_user_description", e.target.value)} placeholder="A short bio" />
              <input className={`b-input ${bad("builder_linkedin")}`} type="url" inputMode="url" value={form.builder_linkedin} onChange={(e) => set("builder_linkedin", e.target.value)} placeholder="LinkedIn URL" />
              {err("builder_linkedin")}
            </Field>
          </section>
          </div>

          {/* ── preview ── */}
          <aside className={`e-prev ${pane === "form" ? "e-pane-hidden" : ""}`} style={pane === "form" ? undefined : undefined}>
            <div className="e-prev-bar">
              <div className="e-prev-left">
              <button type="button" className="e-toggle" onClick={() => setWide((v) => !v)} aria-pressed={wide}
                aria-label={wide ? "Show form" : "Hide form"} data-tip={wide ? "Show form" : "Hide form"}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="16" rx="3" />
                  <line x1="9" y1="4" x2="9" y2="20" />
                </svg>
              </button>
              <div className="e-tabs" role="tablist">
                <button role="tab" aria-selected={view === "page"} className={`e-tab ${view === "page" ? "is-on" : ""}`} onClick={() => setView("page")}>Project page</button>
                <button role="tab" aria-selected={view === "card"} className={`e-tab ${view === "card" ? "is-on" : ""}`} onClick={() => setView("card")}>Card in list</button>
              </div>
              </div>
              {view === "page" && (
                <div className="e-tabs">
                  <button className={`e-tab ${device === "desktop" ? "is-on" : ""}`} onClick={() => setDevice("desktop")}>Desktop</button>
                  <button className={`e-tab ${device === "mobile" ? "is-on" : ""}`} onClick={() => setDevice("mobile")}>Mobile</button>
                </div>
              )}
            </div>

            {view === "page" ? (
              <div className="e-frame-wrap" ref={setFrameWrapEl}>
                {srcDoc ? (() => {
                  const designW = device === "mobile" ? 390 : 1280;
                  const scale = wrapSize.w ? Math.min(1, wrapSize.w / designW) : 1;
                  const left = Math.max(0, (wrapSize.w - designW * scale) / 2);
                  return (
                    <iframe title="Project preview" className="e-frame"
                      style={{ width: designW, height: wrapSize.h / scale, transform: `scale(${scale})`, transformOrigin: "top left", marginLeft: left }}
                      srcDoc={srcDoc} allow="autoplay; fullscreen; picture-in-picture" />
                  );
                })() : (
                  <div className="b-empty" style={{ border: 0 }}>Loading preview…</div>
                )}
              </div>
            ) : (
              <div className="e-cardprev">
                <div className="sgrid-lite" style={{ display: "block" }}>
                  <div className="scell">
                    <span className="spill-slot"><span className="chip-cohort">{form.project_category}</span></span>
                    <h3 className="stitle">{previewProject.title}</h3>
                    <div className="sby">
                      <Avatar name={previewProject.builder_name} src={previewProject.user_image_url} />
                      <div className="pmeta-txt"><div className="sby-name">{previewProject.builder_name}</div></div>
                    </div>
                  </div>
                </div>
                <p>This is how your project appears in the "Explore projects" list, newest first.</p>
              </div>
            )}
          </aside>
        </div>
      </main>

      {toast && <div className={`e-toast ${toast.ok ? "ok" : "bad"}`} role="status">{toast.msg}</div>}
    </div>
  );
};
