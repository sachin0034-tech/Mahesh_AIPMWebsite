import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectUser } from '@/contexts/ProjectUserContext';
import { getMyProject, updateMyProject, publishMyProject, uploadProjectAsset } from '@/lib/projectUserApi';
import { compressImage } from '@/lib/imageCompression';
import { ProjectPublicView } from '@/components/ProjectPublicView';
import { DEFAULT_VISIBILITY_FLAGS } from '@/lib/supabase';
import type { CohortProject, VisibilityFlags } from '@/lib/supabase';
import {
  Save, Globe, LogOut, Loader2, Upload, X, Plus, Trash2, ArrowLeft, Eye,
} from 'lucide-react';

// ─── Visibility Toggle ────────────────────────────────────────────────────────

function VisibilityToggle({
  label, field, flags, onChange,
}: {
  label: string;
  field: keyof VisibilityFlags;
  flags: VisibilityFlags;
  onChange: (flags: VisibilityFlags) => void;
}) {
  const on = flags[field];
  return (
    <button
      type="button"
      onClick={() => onChange({ ...flags, [field]: !on })}
      title={on ? 'Hide on public page' : 'Show on public page'}
      className={`flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border transition-colors ${
        on
          ? 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100'
          : 'bg-gray-100 border-gray-200 text-gray-400 hover:bg-gray-200'
      }`}
    >
      <Eye size={10} />
      {on ? 'Visible' : 'Hidden'}
    </button>
  );
}

// ─── Image Upload Zone ────────────────────────────────────────────────────────

function ImageUploadZone({
  value, previewFile, label, accept = 'image/*', onFileChange,
}: {
  value: string | null;
  previewFile: File | null;
  label: string;
  accept?: string;
  onFileChange: (file: File) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const previewSrc = previewFile ? URL.createObjectURL(previewFile) : value;

  return (
    <div>
      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-[#E75A55] transition-colors"
      >
        {previewSrc ? (
          <img src={previewSrc} alt={label} className="w-full h-36 object-cover" />
        ) : (
          <div className="h-36 flex flex-col items-center justify-center text-gray-400 gap-2">
            <Upload size={18} />
            <span className="text-xs">Click to upload {label}</span>
          </div>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const compressed = await compressImage(file);
          onFileChange(compressed);
          e.target.value = '';
        }}
      />
    </div>
  );
}

// ─── What's Included List Editor ──────────────────────────────────────────────

function WhatsIncludedEditor({
  items, onChange,
}: {
  items: string[];
  onChange: (items: string[]) => void;
}) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={item}
            onChange={(e) => {
              const next = [...items];
              next[i] = e.target.value;
              onChange(next);
            }}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E75A55]"
            placeholder={`Item ${i + 1}`}
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      {items.length < 10 && (
        <button
          type="button"
          onClick={() => onChange([...items, ''])}
          className="flex items-center gap-1.5 text-xs text-[#E75A55] font-medium hover:underline mt-1"
        >
          <Plus size={12} /> Add item
        </button>
      )}
    </div>
  );
}

// ─── Field Group ──────────────────────────────────────────────────────────────

function FieldGroup({
  label, field, flags, onFlagsChange, dimmed = false, children,
}: {
  label: string;
  field?: keyof VisibilityFlags;
  flags: VisibilityFlags;
  onFlagsChange: (flags: VisibilityFlags) => void;
  dimmed?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`transition-opacity ${dimmed ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-gray-700">{label}</label>
        {field && (
          <VisibilityToggle label={label} field={field} flags={flags} onChange={onFlagsChange} />
        )}
      </div>
      {children}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type EditorForm = Partial<CohortProject> & {
  whats_included: string[];
  visibility_flags: VisibilityFlags;
};

const BLANK: EditorForm = {
  description: '',
  builder_linkedin: '',
  video_link: '',
  workflow_link: '',
  doc_link: '',
  hosted_link: '',
  what_you_learned: '',
  about_user_description: '',
  banner_url: null,
  user_image_url: null,
  whats_included: [],
  visibility_flags: DEFAULT_VISIBILITY_FLAGS,
};

export const ProjectEditor = (): JSX.Element => {
  const { projectId } = useParams<{ projectId: string }>();
  const { isLoggedIn, user, logout } = useProjectUser();
  const navigate = useNavigate();

  const [project, setProject] = useState<CohortProject | null>(null);
  const [form, setForm] = useState<EditorForm>(BLANK);
  const [savedForm, setSavedForm] = useState<EditorForm>(BLANK);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [userImgFile, setUserImgFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const isDirty = JSON.stringify(form) !== JSON.stringify(savedForm) || !!bannerFile || !!userImgFile;

  useEffect(() => {
    if (!isLoggedIn) { navigate('/project-login'); return; }
    if (!projectId) return;
    (async () => {
      try {
        const { data } = await getMyProject(projectId);
        setProject(data);
        const initial: EditorForm = {
          description: data.description ?? '',
          builder_linkedin: data.builder_linkedin ?? '',
          video_link: data.video_link ?? '',
          workflow_link: data.workflow_link ?? '',
          doc_link: data.doc_link ?? '',
          hosted_link: data.hosted_link ?? '',
          what_you_learned: data.what_you_learned ?? '',
          about_user_description: data.about_user_description ?? '',
          banner_url: data.banner_url ?? null,
          user_image_url: data.user_image_url ?? null,
          whats_included: data.whats_included ?? [],
          visibility_flags: data.visibility_flags ?? DEFAULT_VISIBILITY_FLAGS,
        };
        setForm(initial);
        setSavedForm(initial);
      } catch {
        showToast('Could not load project', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [isLoggedIn, projectId]);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSave = async () => {
    if (!projectId) return;
    setSaving(true);
    try {
      let banner_url = form.banner_url;
      let user_image_url = form.user_image_url;

      if (bannerFile) {
        banner_url = await uploadProjectAsset(bannerFile, 'banner');
        setBannerFile(null);
      }
      if (userImgFile) {
        user_image_url = await uploadProjectAsset(userImgFile, 'user_image');
        setUserImgFile(null);
      }

      const payload = {
        description: form.description?.trim() || null,
        builder_linkedin: form.builder_linkedin?.trim() || null,
        video_link: form.video_link?.trim() || null,
        workflow_link: form.workflow_link?.trim() || null,
        doc_link: form.doc_link?.trim() || null,
        hosted_link: form.hosted_link?.trim() || null,
        what_you_learned: form.what_you_learned?.trim() || null,
        about_user_description: form.about_user_description?.trim() || null,
        whats_included: form.whats_included.filter(Boolean),
        visibility_flags: form.visibility_flags,
        banner_url,
        user_image_url,
      };

      await updateMyProject(projectId, payload);

      const next: EditorForm = { ...form, banner_url, user_image_url };
      setSavedForm(next);
      setForm(next);
      setProject((p) => p ? { ...p, ...payload, banner_url: banner_url ?? null, user_image_url: user_image_url ?? null } : p);
      showToast('Changes saved', 'success');
    } catch (err: any) {
      showToast(err.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!projectId || isDirty) return;
    setPublishing(true);
    try {
      await publishMyProject(projectId);
      setProject((p) => p ? { ...p, status: 'published' } : p);
      showToast('Your project is now live!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Publish failed', 'error');
    } finally {
      setPublishing(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/project-login');
  };

  // Build live preview data
  const previewProject: Partial<CohortProject> & { sections: any[] } = {
    ...(project ?? {}),
    description: form.description || null,
    builder_linkedin: form.builder_linkedin || null,
    video_link: form.video_link || null,
    workflow_link: form.workflow_link || null,
    doc_link: form.doc_link || null,
    hosted_link: form.hosted_link || null,
    what_you_learned: form.what_you_learned || null,
    about_user_description: form.about_user_description || null,
    whats_included: form.whats_included.filter(Boolean),
    visibility_flags: form.visibility_flags,
    banner_url: bannerFile ? null : (form.banner_url ?? null),
    user_image_url: userImgFile ? null : (form.user_image_url ?? null),
    // For file previews, override with object URLs
    ...(bannerFile ? { banner_url: URL.createObjectURL(bannerFile) } : {}),
    ...(userImgFile ? { user_image_url: URL.createObjectURL(userImgFile) } : {}),
    sections: [],
  };

  const setFlags = (flags: VisibilityFlags) => setForm((f) => ({ ...f, visibility_flags: flags }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f7f4ee]">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f7f4ee] gap-4">
        <p className="text-gray-500">Project not found or access denied.</p>
        <button onClick={() => navigate('/my-projects')} className="text-[#E75A55] underline text-sm">
          Back to My Projects
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#f7f4ee]">
      {/* ── Top bar ── */}
      <header className="bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between flex-shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/my-projects')}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="font-bold text-gray-900 text-sm truncate max-w-[260px]">{project.title}</div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                project.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {project.status}
              </span>
              {isDirty && <span className="text-[10px] text-amber-500 font-medium">Unsaved changes</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <span className="text-xs text-gray-400 hidden sm:block">{user.username}</span>
          )}
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-gray-700 transition-colors p-1.5"
            title="Sign out"
          >
            <LogOut size={15} />
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-700 disabled:opacity-40 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            {saving ? 'Saving…' : 'Save'}
          </button>
          {project.status !== 'published' && (
            <button
              onClick={handlePublish}
              disabled={publishing || isDirty}
              title={isDirty ? 'Save your changes before publishing' : 'Publish to make this project live'}
              className="flex items-center gap-1.5 bg-gradient-to-r from-[#E75A55] to-[#9747FF] disabled:opacity-40 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              {publishing ? <Loader2 size={12} className="animate-spin" /> : <Globe size={12} />}
              {publishing ? 'Publishing…' : 'Publish'}
            </button>
          )}
        </div>
      </header>

      {/* ── Split panels ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: Editor */}
        <div className="w-[440px] flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="px-5 py-5 space-y-6">

            {/* Project name — read only */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">Project Name (admin-set)</label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500 select-none">
                {project.title}
              </div>
            </div>

            {/* Description */}
            <FieldGroup label="Description" field="description" flags={form.visibility_flags} onFlagsChange={setFlags} dimmed={!form.visibility_flags.description}>
              <textarea
                value={form.description ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E75A55] resize-none"
                placeholder="What does this project do?"
              />
            </FieldGroup>

            {/* Project Banner */}
            <FieldGroup label="Project Banner" field="banner" flags={form.visibility_flags} onFlagsChange={setFlags} dimmed={!form.visibility_flags.banner}>
              <ImageUploadZone
                value={form.banner_url ?? null}
                previewFile={bannerFile}
                label="project banner"
                onFileChange={setBannerFile}
              />
              {(form.banner_url || bannerFile) && (
                <button
                  type="button"
                  onClick={() => { setBannerFile(null); setForm((f) => ({ ...f, banner_url: null })); }}
                  className="mt-1.5 flex items-center gap-1 text-xs text-red-400 hover:text-red-600"
                >
                  <X size={11} /> Remove banner
                </button>
              )}
            </FieldGroup>

            {/* Builder Photo */}
            <FieldGroup label="Your Photo" field="user_image" flags={form.visibility_flags} onFlagsChange={setFlags} dimmed={!form.visibility_flags.user_image}>
              <ImageUploadZone
                value={form.user_image_url ?? null}
                previewFile={userImgFile}
                label="your photo"
                onFileChange={setUserImgFile}
              />
              {(form.user_image_url || userImgFile) && (
                <button
                  type="button"
                  onClick={() => { setUserImgFile(null); setForm((f) => ({ ...f, user_image_url: null })); }}
                  className="mt-1.5 flex items-center gap-1 text-xs text-red-400 hover:text-red-600"
                >
                  <X size={11} /> Remove photo
                </button>
              )}
            </FieldGroup>

            {/* What You Learned */}
            <FieldGroup label="What you'll learn" field="what_you_learned" flags={form.visibility_flags} onFlagsChange={setFlags} dimmed={!form.visibility_flags.what_you_learned}>
              <textarea
                value={form.what_you_learned ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, what_you_learned: e.target.value }))}
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E75A55] resize-none"
                placeholder="Key takeaways, skills gained, lessons learned…"
              />
            </FieldGroup>

            {/* About You */}
            <FieldGroup label="About You (Bio)" field="about_user" flags={form.visibility_flags} onFlagsChange={setFlags} dimmed={!form.visibility_flags.about_user}>
              <textarea
                value={form.about_user_description ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, about_user_description: e.target.value }))}
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E75A55] resize-none"
                placeholder="A short bio — who you are, your background…"
              />
              <div className="mt-2">
                <input
                  value={form.builder_linkedin ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, builder_linkedin: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E75A55]"
                  placeholder="LinkedIn URL (linkedin.com/in/…)"
                />
              </div>
            </FieldGroup>

            {/* What's Included */}
            <FieldGroup label="What's Included" field="whats_included" flags={form.visibility_flags} onFlagsChange={setFlags} dimmed={!form.visibility_flags.whats_included}>
              <WhatsIncludedEditor
                items={form.whats_included}
                onChange={(items) => setForm((f) => ({ ...f, whats_included: items }))}
              />
            </FieldGroup>

            {/* Video Link */}
            <FieldGroup label="Demo Video URL" field="video_link" flags={form.visibility_flags} onFlagsChange={setFlags} dimmed={!form.visibility_flags.video_link}>
              <input
                type="url"
                value={form.video_link ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, video_link: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E75A55]"
                placeholder="https://youtube.com/…"
              />
            </FieldGroup>

            {/* Demo / Live Link */}
            <FieldGroup label="Live Demo Link" field="demo_link" flags={form.visibility_flags} onFlagsChange={setFlags} dimmed={!form.visibility_flags.demo_link}>
              <input
                type="url"
                value={form.hosted_link ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, hosted_link: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E75A55]"
                placeholder="https://your-project.com"
              />
            </FieldGroup>

            {/* Doc Link */}
            <FieldGroup label="Additional Doc / Workflow Link" field="doc_link" flags={form.visibility_flags} onFlagsChange={setFlags} dimmed={!form.visibility_flags.doc_link}>
              <div className="space-y-2">
                <input
                  type="url"
                  value={form.doc_link ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, doc_link: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E75A55]"
                  placeholder="Documentation URL"
                />
                <input
                  type="url"
                  value={form.workflow_link ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, workflow_link: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E75A55]"
                  placeholder="Workflow / Diagram URL"
                />
              </div>
            </FieldGroup>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="flex-1 overflow-y-auto bg-[#f5f2ed]">
          <div className="px-4 py-3 border-b border-black/[0.06] bg-[#f5f2ed] sticky top-0 z-10 flex items-center gap-2">
            <Eye size={13} className="text-gray-400" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Live Preview</span>
            <span className="text-[10px] text-gray-400 ml-1">— updates as you type</span>
          </div>
          <div className="max-w-xl mx-auto py-6 px-4">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <ProjectPublicView
                project={previewProject}
                index={0}
                isPreview={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
};
