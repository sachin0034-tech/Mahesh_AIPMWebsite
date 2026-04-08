import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCohortAdmin } from '@/contexts/CohortAdminContext';
import { PROJECT_CATEGORIES } from '@/lib/supabase';
import { compressImage } from '@/lib/imageCompression';
import type { CohortProject, ProjectSectionAssignment, ProjectUserWithProjects } from '@/lib/supabase';
import {
  adminGetProjects, adminCreateProject, adminUpdateProject,
  adminSetStatus, adminDeleteProject, adminUploadThumbnail, adminUploadUserImage,
} from '@/lib/cohortApi';
import {
  adminGetProjectUsers, adminCreateProjectUser,
  adminDeleteProjectUser, adminUpdateProjectUserProjects,
} from '@/lib/projectUserApi';
import {
  Plus, Pencil, Trash2, Eye, EyeOff, LogOut, X, Upload, Loader2,
  LayoutDashboard, ListChecks, ChevronUp, ChevronDown, Users,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Section = 'top10' | 'awards' | 'cohort8';
type ActiveView = 'all' | Section | 'project-users';

interface ProjectWithSections extends CohortProject {
  sections: ProjectSectionAssignment[];
}

interface FormState {
  title: string;
  description: string;
  builder_name: string;
  builder_linkedin: string;
  video_link: string;
  workflow_link: string;
  doc_link: string;
  hosted_link: string;
  project_category: string;
  status: 'draft' | 'published';
  // sections
  in_top10: boolean;
  top10_rank: string;
  in_awards: boolean;
  award_name: string;
  in_cohort8: boolean;
  cohort_label: string;
}

const BLANK_FORM: FormState = {
  title: '', description: '', builder_name: '', builder_linkedin: '',
  video_link: '', workflow_link: '', doc_link: '', hosted_link: '',
  project_category: 'AI Tools', status: 'draft',
  in_top10: false, top10_rank: '10',
  in_awards: false, award_name: '',
  in_cohort8: false, cohort_label: 'Cohort 8',
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function sectionLabel(s: Section) {
  return s === 'top10' ? 'Top 10' : s === 'awards' ? 'Award' : 'Cohort 8';
}

function sectionColor(s: Section) {
  return s === 'top10' ? 'bg-orange-100 text-orange-700'
    : s === 'awards' ? 'bg-yellow-100 text-yellow-700'
    : 'bg-blue-100 text-blue-700';
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const CohortAdminDashboard = (): JSX.Element => {
  const { isAdmin, logout } = useCohortAdmin();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<ProjectWithSections[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<ActiveView>('all');
  // Project Users state
  const [projectUsers, setProjectUsers] = useState<ProjectUserWithProjects[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState({ username: '', email: '', password: '', projectIds: [] as string[] });
  const [userSaving, setUserSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(BLANK_FORM);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [userImageFile, setUserImageFile] = useState<File | null>(null);
  const [userImagePreview, setUserImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const userImageRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAdmin) navigate('/cohort-admin');
    else fetchProjects();
  }, [isAdmin]);

  useEffect(() => {
    if (activeView === 'project-users' && isAdmin) fetchProjectUsers();
  }, [activeView]);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data } = await adminGetProjects();
      setProjects(data ?? []);
    } catch {
      showToast('Failed to load projects', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectUsers = async () => {
    setUsersLoading(true);
    try {
      const { data } = await adminGetProjectUsers();
      setProjectUsers(data ?? []);
    } catch {
      showToast('Failed to load project users', 'error');
    } finally {
      setUsersLoading(false);
    }
  };

  // ── Toast ──────────────────────────────────────────────────────────────────

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Modal helpers ──────────────────────────────────────────────────────────

  const openAdd = () => {
    setEditingId(null);
    setForm(BLANK_FORM);
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setUserImageFile(null);
    setUserImagePreview(null);
    setModalOpen(true);
  };

  const openEdit = (p: ProjectWithSections) => {
    const top10 = p.sections.find((s) => s.section === 'top10');
    const awards = p.sections.find((s) => s.section === 'awards');
    const cohort8 = p.sections.find((s) => s.section === 'cohort8');
    setForm({
      title: p.title,
      description: p.description ?? '',
      builder_name: p.builder_name,
      builder_linkedin: p.builder_linkedin ?? '',
      video_link: p.video_link ?? '',
      workflow_link: p.workflow_link ?? '',
      doc_link: p.doc_link ?? '',
      hosted_link: p.hosted_link ?? '',
      project_category: p.project_category,
      status: p.status,
      in_top10: !!top10,
      top10_rank: String(top10?.rank ?? 10),
      in_awards: !!awards,
      award_name: awards?.award_name ?? '',
      in_cohort8: !!cohort8,
      cohort_label: cohort8?.cohort_label ?? 'Cohort 8',
    });
    setThumbnailFile(null);
    setThumbnailPreview(p.thumbnail_url ?? null);
    setUserImageFile(null);
    setUserImagePreview(p.user_image_url ?? null);
    setEditingId(p.id);
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditingId(null); };

  // ── Thumbnail upload ───────────────────────────────────────────────────────

  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file);
    setThumbnailFile(compressed);
    setThumbnailPreview(URL.createObjectURL(compressed));
  };

  const handleUserImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file);
    setUserImageFile(compressed);
    setUserImagePreview(URL.createObjectURL(compressed));
  };

  // ── Save (create / update) ─────────────────────────────────────────────────

  const handleSave = async () => {
    if (!form.title.trim() || !form.builder_name.trim()) {
      showToast('Title and builder name are required', 'error');
      return;
    }
    setSaving(true);
    try {
      let thumbnail_url: string | null = thumbnailPreview;
      if (thumbnailFile) thumbnail_url = await adminUploadThumbnail(thumbnailFile);

      let user_image_url: string | null = userImagePreview;
      if (userImageFile) user_image_url = await adminUploadUserImage(userImageFile);

      const sections = [];
      if (form.in_top10) sections.push({ section: 'top10', rank: parseInt(form.top10_rank) || 10, award_name: null, cohort_label: null });
      if (form.in_awards) sections.push({ section: 'awards', rank: 999, award_name: form.award_name.trim() || null, cohort_label: null });
      if (form.in_cohort8) sections.push({ section: 'cohort8', rank: 999, award_name: null, cohort_label: form.cohort_label.trim() || 'Cohort 8' });

      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        builder_name: form.builder_name.trim(),
        builder_linkedin: form.builder_linkedin.trim() || null,
        thumbnail_url,
        user_image_url,
        video_link: form.video_link.trim() || null,
        workflow_link: form.workflow_link.trim() || null,
        doc_link: form.doc_link.trim() || null,
        hosted_link: form.hosted_link.trim() || null,
        project_category: form.project_category,
        status: form.status,
        sections,
      };

      if (editingId) {
        await adminUpdateProject(editingId, payload);
      } else {
        await adminCreateProject(payload);
      }

      showToast(editingId ? 'Project updated' : 'Project created', 'success');
      closeModal();
      fetchProjects();
    } catch (err: any) {
      showToast(err.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle publish ─────────────────────────────────────────────────────────

  const togglePublish = async (p: ProjectWithSections) => {
    const newStatus = p.status === 'published' ? 'draft' : 'published';
    try {
      await adminSetStatus(p.id, newStatus);
      setProjects((prev) => prev.map((x) => x.id === p.id ? { ...x, status: newStatus } : x));
    } catch { showToast('Update failed', 'error'); }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await adminDeleteProject(deleteId);
      setProjects((prev) => prev.filter((p) => p.id !== deleteId));
      showToast('Project deleted', 'success');
    } catch { showToast('Delete failed', 'error'); }
    setDeleteId(null);
  };

  // ── Rank reorder ───────────────────────────────────────────────────────────

  const adjustRank = async (p: ProjectWithSections, section: Section, dir: 'up' | 'down') => {
    const assignment = p.sections.find((s) => s.section === section);
    if (!assignment) return;
    const newRank = dir === 'up' ? assignment.rank - 1 : assignment.rank + 1;
    // Re-save the project with updated rank for that section
    const updatedSections = p.sections.map((s) =>
      s.section === section ? { ...s, rank: newRank } : s
    );
    await adminUpdateProject(p.id, {
      title: p.title, description: p.description, builder_name: p.builder_name,
      builder_linkedin: p.builder_linkedin, thumbnail_url: p.thumbnail_url,
      video_link: p.video_link, workflow_link: p.workflow_link,
      doc_link: p.doc_link, hosted_link: p.hosted_link,
      project_category: p.project_category, status: p.status,
      sections: updatedSections.map(({ section: sec, rank: r, award_name, cohort_label }) => ({ section: sec, rank: r, award_name, cohort_label })),
    });
    fetchProjects();
  };

  // ── Project User handlers ──────────────────────────────────────────────────

  const openCreateUser = () => {
    setEditingUserId(null);
    setUserForm({ username: '', email: '', password: '', projectIds: [] });
    setUserModalOpen(true);
  };

  const openEditUserProjects = (u: ProjectUserWithProjects) => {
    setEditingUserId(u.id);
    setUserForm({ username: u.username, email: u.email, password: '', projectIds: u.projects.map((p) => p.id) });
    setUserModalOpen(true);
  };

  const handleSaveUser = async () => {
    setUserSaving(true);
    try {
      if (editingUserId) {
        await adminUpdateProjectUserProjects(editingUserId, userForm.projectIds);
        showToast('User projects updated', 'success');
      } else {
        if (!userForm.username || !userForm.email || !userForm.password) {
          showToast('Username, email and password are required', 'error');
          setUserSaving(false);
          return;
        }
        await adminCreateProjectUser(userForm);
        showToast('Project user created', 'success');
      }
      setUserModalOpen(false);
      fetchProjectUsers();
    } catch (err: any) {
      showToast(err.message || 'Save failed', 'error');
    } finally {
      setUserSaving(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await adminDeleteProjectUser(userId);
      setProjectUsers((prev) => prev.filter((u) => u.id !== userId));
      showToast('User deleted', 'success');
    } catch {
      showToast('Delete failed', 'error');
    }
  };

  // ── Filtered list ──────────────────────────────────────────────────────────

  const displayed = activeView === 'all'
    ? projects
    : activeView === 'project-users'
    ? []
    : projects.filter((p) => p.sections.some((s) => s.section === activeView));

  const stats = {
    total: projects.length,
    published: projects.filter((p) => p.status === 'published').length,
    top10: projects.filter((p) => p.sections.some((s) => s.section === 'top10')).length,
    awards: projects.filter((p) => p.sections.some((s) => s.section === 'awards')).length,
    cohort8: projects.filter((p) => p.sections.some((s) => s.section === 'cohort8')).length,
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-gray-50 text-sm">
      {/* ── Sidebar ── */}
      <aside className="w-56 bg-[#0B1120] text-white flex flex-col flex-shrink-0">
        <div className="px-5 py-6 border-b border-white/10">
          <div className="font-black text-base tracking-tight">MYAICOMMUNITY</div>
          <div className="text-white/40 text-xs mt-0.5">Admin Panel</div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {([
            { key: 'all', label: 'All Projects', icon: <LayoutDashboard size={15} /> },
            { key: 'top10', label: 'Top 10', icon: <ListChecks size={15} /> },
            { key: 'awards', label: 'Award Winning', icon: <ListChecks size={15} /> },
            { key: 'cohort8', label: 'Cohort 8', icon: <ListChecks size={15} /> },
            { key: 'project-users', label: 'Project Users', icon: <Users size={15} /> },
          ] as const).map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveView(item.key)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors ${
                activeView === item.key ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white hover:bg-white/10'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="px-3 pb-5">
          <button
            onClick={() => { logout(); navigate('/cohort-admin'); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <LogOut size={15} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-gray-900 text-base">
              {activeView === 'all' ? 'All Projects'
                : activeView === 'top10' ? 'Top 10 Projects'
                : activeView === 'awards' ? 'Award Winning'
                : activeView === 'project-users' ? 'Project Users'
                : 'Cohort 8'}
            </h1>
            <p className="text-gray-400 text-xs mt-0.5">
              {activeView === 'project-users'
                ? `${projectUsers.length} user${projectUsers.length !== 1 ? 's' : ''}`
                : `${displayed.length} project${displayed.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          {activeView === 'project-users' ? (
            <button
              onClick={openCreateUser}
              className="flex items-center gap-2 bg-gradient-to-r from-[#E75A55] to-[#9747FF] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Plus size={15} /> Add User
            </button>
          ) : (
            <button
              onClick={openAdd}
              className="flex items-center gap-2 bg-gradient-to-r from-[#E75A55] to-[#9747FF] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Plus size={15} /> Add Project
            </button>
          )}
        </header>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-3 px-6 py-4">
          {[
            { label: 'Total', value: stats.total },
            { label: 'Published', value: stats.published },
            { label: 'Top 10', value: stats.top10 },
            { label: 'Awards', value: stats.awards },
            { label: 'Cohort 8', value: stats.cohort8 },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 px-4 py-3">
              <div className="text-2xl font-black text-gray-900">{s.value}</div>
              <div className="text-gray-400 text-xs mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Project Users Tab */}
        {activeView === 'project-users' && (
          <div className="flex-1 overflow-auto px-6 pb-6">
            {usersLoading ? (
              <div className="flex items-center justify-center h-40 text-gray-400">
                <Loader2 size={20} className="animate-spin mr-2" /> Loading…
              </div>
            ) : projectUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                <p>No project users yet.</p>
                <button onClick={openCreateUser} className="mt-3 text-[#E75A55] font-medium underline text-sm">Create your first user</button>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500">Username</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500">Email</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500">Assigned Projects</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectUsers.map((u) => (
                      <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900 text-sm">{u.username}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{u.email}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {u.projects.length === 0 ? (
                              <span className="text-xs text-gray-400">None</span>
                            ) : u.projects.map((p) => (
                              <span key={p.id} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                                {p.title}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openEditUserProjects(u)} className="text-gray-400 hover:text-blue-600 transition-colors" title="Edit project assignments">
                              <Pencil size={15} />
                            </button>
                            <button onClick={() => handleDeleteUser(u.id)} className="text-gray-400 hover:text-red-500 transition-colors" title="Delete user">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Projects Table */}
        {activeView !== 'project-users' && (
        <div className="flex-1 overflow-auto px-6 pb-6">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-gray-400">
              <Loader2 size={20} className="animate-spin mr-2" /> Loading…
            </div>
          ) : displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <p>No projects yet.</p>
              <button onClick={openAdd} className="mt-3 text-[#E75A55] font-medium underline text-sm">Add your first project</button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 w-12">#</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500">Project</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500">Builder</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500">Sections</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500">Category</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500">Feedback</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500">Rank</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((p, i) => {
                    const top10 = p.sections.find((s) => s.section === 'top10');
                    return (
                      <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                        <td className="px-4 py-3 max-w-[200px]">
                          <div className="flex items-center gap-2">
                            {p.thumbnail_url ? (
                              <img src={p.thumbnail_url} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-gray-100 flex-shrink-0" />
                            )}
                            <span className="text-gray-900 font-medium truncate text-xs leading-snug">{p.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{p.builder_name}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {p.sections.map((s) => (
                              <span key={s.section} className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${sectionColor(s.section as Section)}`}>
                                {sectionLabel(s.section as Section)}
                                {s.section === 'top10' && ` #${s.rank}`}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{p.project_category}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                          👍 {p.thumbs_up} · 👎 {p.thumbs_down}
                        </td>
                        <td className="px-4 py-3">
                          {top10 && activeView === 'top10' && (
                            <div className="flex flex-col gap-0.5">
                              <button onClick={() => adjustRank(p, 'top10', 'up')} className="text-gray-400 hover:text-gray-700"><ChevronUp size={14} /></button>
                              <button onClick={() => adjustRank(p, 'top10', 'down')} className="text-gray-400 hover:text-gray-700"><ChevronDown size={14} /></button>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => togglePublish(p)} title={p.status === 'published' ? 'Unpublish' : 'Publish'} className="text-gray-400 hover:text-green-600 transition-colors">
                              {p.status === 'published' ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                            <button onClick={() => openEdit(p)} className="text-gray-400 hover:text-blue-600 transition-colors"><Pencil size={15} /></button>
                            <button onClick={() => setDeleteId(p.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative bg-white w-full max-w-lg h-full overflow-y-auto shadow-2xl flex flex-col">
            {/* Modal header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="font-bold text-gray-900">{editingId ? 'Edit Project' : 'Add Project'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
            </div>

            {/* Modal body */}
            <div className="flex-1 px-6 py-5 space-y-5">
              {/* Thumbnail */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Thumbnail</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-[#E75A55] transition-colors"
                >
                  {thumbnailPreview ? (
                    <img src={thumbnailPreview} alt="preview" className="w-full h-40 object-cover" />
                  ) : (
                    <div className="h-40 flex flex-col items-center justify-center text-gray-400">
                      <Upload size={20} className="mb-2" />
                      <span className="text-xs">Click to upload (auto-compressed)</span>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleThumbnailChange} />
              </div>

              {/* User Profile Image */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Builder Profile Image</label>
                <div
                  onClick={() => userImageRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-[#E75A55] transition-colors"
                >
                  {userImagePreview ? (
                    <div className="flex items-center gap-4 p-3">
                      <img src={userImagePreview} alt="profile preview" className="w-16 h-16 rounded-full object-cover flex-shrink-0 border border-gray-200" />
                      <span className="text-xs text-gray-500">Click to change profile image</span>
                    </div>
                  ) : (
                    <div className="h-20 flex flex-col items-center justify-center text-gray-400">
                      <Upload size={18} className="mb-1" />
                      <span className="text-xs">Upload builder profile image (shown on card)</span>
                    </div>
                  )}
                </div>
                <input ref={userImageRef} type="file" accept="image/*" className="hidden" onChange={handleUserImageChange} />
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Title <span className="text-red-400">*</span></label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E75A55]" placeholder="AI Sprint Planning Tool" />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E75A55] resize-none" placeholder="What does this project do?" />
              </div>

              {/* Builder */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Builder Name <span className="text-red-400">*</span></label>
                  <input value={form.builder_name} onChange={(e) => setForm({ ...form, builder_name: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E75A55]" placeholder="Priya Sharma" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">LinkedIn URL</label>
                  <input value={form.builder_linkedin} onChange={(e) => setForm({ ...form, builder_linkedin: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E75A55]" placeholder="linkedin.com/in/..." />
                </div>
              </div>

              {/* Links */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-gray-700">Links</label>
                {[
                  { key: 'video_link', label: 'Demo Video URL' },
                  { key: 'workflow_link', label: 'Workflow / Diagram URL' },
                  { key: 'doc_link', label: 'Documentation URL' },
                  { key: 'hosted_link', label: 'Live / Hosted URL' },
                ].map(({ key, label }) => (
                  <input
                    key={key}
                    value={(form as any)[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E75A55]"
                    placeholder={label}
                  />
                ))}
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                <select value={form.project_category} onChange={(e) => setForm({ ...form, project_category: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E75A55]">
                  {PROJECT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              {/* Sections */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-3">Sections (can be in multiple)</label>
                <div className="space-y-3">
                  {/* Top 10 */}
                  <div className="border border-gray-200 rounded-xl p-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.in_top10} onChange={(e) => setForm({ ...form, in_top10: e.target.checked })} className="accent-[#E75A55]" />
                      <span className="text-sm font-medium text-gray-800">Top 10 Projects</span>
                    </label>
                    {form.in_top10 && (
                      <div className="mt-2 flex items-center gap-2">
                        <label className="text-xs text-gray-500">Rank</label>
                        <input type="number" min={1} max={10} value={form.top10_rank} onChange={(e) => setForm({ ...form, top10_rank: e.target.value })} className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#E75A55]" />
                      </div>
                    )}
                  </div>

                  {/* Awards */}
                  <div className="border border-gray-200 rounded-xl p-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.in_awards} onChange={(e) => setForm({ ...form, in_awards: e.target.checked })} className="accent-[#E75A55]" />
                      <span className="text-sm font-medium text-gray-800">Award Winning</span>
                    </label>
                    {form.in_awards && (
                      <div className="mt-2">
                        <input value={form.award_name} onChange={(e) => setForm({ ...form, award_name: e.target.value })} className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#E75A55]" placeholder="e.g. Best AI Tool" />
                      </div>
                    )}
                  </div>

                  {/* Cohort 8 */}
                  <div className="border border-gray-200 rounded-xl p-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.in_cohort8} onChange={(e) => setForm({ ...form, in_cohort8: e.target.checked })} className="accent-[#E75A55]" />
                      <span className="text-sm font-medium text-gray-800">Cohort 8</span>
                    </label>
                    {form.in_cohort8 && (
                      <div className="mt-2">
                        <input value={form.cohort_label} onChange={(e) => setForm({ ...form, cohort_label: e.target.value })} className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#E75A55]" placeholder="Cohort 8" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Status</label>
                <div className="flex gap-3">
                  {(['draft', 'published'] as const).map((s) => (
                    <label key={s} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="status" value={s} checked={form.status === s} onChange={() => setForm({ ...form, status: s })} className="accent-[#E75A55]" />
                      <span className="text-sm capitalize text-gray-700">{s}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
              <button onClick={closeModal} className="flex-1 border border-gray-200 rounded-lg py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-[#E75A55] to-[#9747FF] text-white rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Project User Create / Edit Modal ── */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setUserModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900">{editingUserId ? 'Edit Project Assignments' : 'Create Project User'}</h3>
              <button onClick={() => setUserModalOpen(false)} className="text-gray-400 hover:text-gray-700"><X size={16} /></button>
            </div>

            <div className="space-y-4">
              {!editingUserId && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Username <span className="text-red-400">*</span></label>
                    <input
                      value={userForm.username}
                      onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E75A55]"
                      placeholder="priya_sharma"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Email <span className="text-red-400">*</span></label>
                    <input
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E75A55]"
                      placeholder="priya@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Password <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E75A55]"
                      placeholder="Set a password for this user"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Assign Projects</label>
                <div className="border border-gray-200 rounded-xl p-3 space-y-2 max-h-48 overflow-y-auto">
                  {projects.length === 0 ? (
                    <p className="text-xs text-gray-400">No projects available yet.</p>
                  ) : projects.map((p) => (
                    <label key={p.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={userForm.projectIds.includes(p.id)}
                        onChange={(e) => {
                          setUserForm({
                            ...userForm,
                            projectIds: e.target.checked
                              ? [...userForm.projectIds, p.id]
                              : userForm.projectIds.filter((id) => id !== p.id),
                          });
                        }}
                        className="accent-[#E75A55]"
                      />
                      <span className="text-sm text-gray-700">{p.title}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setUserModalOpen(false)} className="flex-1 border border-gray-200 rounded-lg py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                disabled={userSaving}
                className="flex-1 bg-gradient-to-r from-[#E75A55] to-[#9747FF] text-white rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {userSaving && <Loader2 size={14} className="animate-spin" />}
                {userSaving ? 'Saving…' : editingUserId ? 'Update' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-gray-900 mb-2">Delete project?</h3>
            <p className="text-gray-500 text-sm mb-5">This action cannot be undone. The project and all its data will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-200 rounded-lg py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 bg-red-500 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
};
