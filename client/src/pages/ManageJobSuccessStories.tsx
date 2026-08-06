import React, { useState, useEffect, useRef } from "react";
import { Trash2, Loader2, Upload, User, Linkedin, Briefcase } from "lucide-react";
import {
  getJobSuccessStories,
  adminCreateJobSuccessStory,
  adminDeleteJobSuccessStory,
  type JobSuccessStory,
} from "../lib/cohortApi";

// ── Live preview card — mirrors the public scroller card ───────────────────

interface PreviewData {
  student_name: string;
  company_name: string;
  role_title: string;
  image_url: string | null;
}

function PreviewCard({ p }: { p: PreviewData }) {
  const isEmpty = !p.student_name && !p.company_name && !p.role_title;

  if (isEmpty) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center py-14 text-gray-400 text-sm">
        <User className="h-8 w-8 mb-2 opacity-30" />
        Fill in the form to see a live preview
      </div>
    );
  }

  return (
    <div className="w-56 rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-sm">
      <div className="h-56 bg-gray-100 flex items-center justify-center overflow-hidden">
        {p.image_url ? (
          <img src={p.image_url} alt={p.student_name} className="w-full h-full object-cover" />
        ) : (
          <User className="h-10 w-10 text-gray-300" />
        )}
      </div>
      <div className="p-4">
        <p className="font-semibold text-gray-900 text-sm leading-tight">
          {p.student_name || <span className="text-gray-300">Student Name</span>}
        </p>
        <p className="text-xs text-gray-500 mt-1 leading-snug">
          {p.role_title || <span className="text-gray-300">Role</span>}
          {p.role_title && p.company_name ? " at " : ""}
          {p.company_name || (!p.role_title && <span className="text-gray-300">Company</span>)}
        </p>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

const ManageJobSuccessStories: React.FC = () => {
  const [stories, setStories] = useState<JobSuccessStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [studentName, setStudentName] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const fetchStories = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getJobSuccessStories();
      setStories(res.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStories(); }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!studentName.trim()) { setFormError("Student name is required."); return; }
    if (!companyName.trim()) { setFormError("Company name is required."); return; }
    if (!roleTitle.trim()) { setFormError("Role is required."); return; }

    setIsSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    const formData = new FormData();
    formData.append("student_name", studentName.trim());
    formData.append("linkedin_url", linkedinUrl.trim());
    formData.append("company_name", companyName.trim());
    formData.append("role_title", roleTitle.trim());
    if (imageFile) formData.append("image", imageFile);

    try {
      await adminCreateJobSuccessStory(formData);
      setFormSuccess(`Success story for "${studentName}" added.`);
      setStudentName("");
      setLinkedinUrl("");
      setCompanyName("");
      setRoleTitle("");
      setImageFile(null);
      setImagePreview(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
      await fetchStories();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this success story?")) return;
    try {
      await adminDeleteJobSuccessStory(id);
      setStories((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      alert("Failed to delete: " + err.message);
    }
  };

  const previewData: PreviewData = {
    student_name: studentName,
    company_name: companyName,
    role_title: roleTitle,
    image_url: imagePreview,
  };

  return (
    <div className="space-y-8">

      {/* ── Add Success Story Panel ────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
          <Briefcase className="h-4 w-4 text-orange-500" />
          <h2 className="text-sm font-semibold text-gray-800">Add Job Success Story</h2>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form fields */}
          <div className="space-y-4">

            {/* Image upload */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Student Photo <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="flex items-center gap-4">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-14 h-14 rounded-full object-cover border-2 border-orange-200 flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-gray-300" />
                  </div>
                )}
                <div>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="success-story-image-upload"
                  />
                  <label
                    htmlFor="success-story-image-upload"
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    {imageFile ? imageFile.name : "Upload photo"}
                  </label>
                  {imageFile && (
                    <button
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                        if (imageInputRef.current) imageInputRef.current.value = "";
                      }}
                      className="mt-1 text-xs text-red-400 hover:text-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Student name */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Student Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => { setStudentName(e.target.value); setFormError(null); }}
                placeholder="e.g. Priya Sharma"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
            </div>

            {/* LinkedIn URL */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                LinkedIn Profile <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://www.linkedin.com/in/..."
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>
            </div>

            {/* Role placed */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Role Placed As <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => { setRoleTitle(e.target.value); setFormError(null); }}
                placeholder="e.g. Product Manager"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
            </div>

            {/* Company name */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Company Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => { setCompanyName(e.target.value); setFormError(null); }}
                placeholder="e.g. Google"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
            </div>

            {/* Errors / success */}
            {formError && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{formError}</p>
            )}
            {formSuccess && (
              <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">{formSuccess}</p>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
              ) : (
                "Save Success Story"
              )}
            </button>
          </div>

          {/* Live preview */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Live Preview — main page
            </p>
            <PreviewCard p={previewData} />
            <p className="text-xs text-gray-300 mt-2">
              This is how the card will appear in the scrolling section on the homepage.
            </p>
          </div>
        </div>
      </div>

      {/* ── Success Stories Grid ────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-bold text-gray-900 text-base mb-5">
          All Success Stories{" "}
          <span className="text-orange-500 font-medium">({stories.length})</span>
        </h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
          </div>
        ) : error ? (
          <p className="text-red-500 bg-red-50 px-4 py-3 rounded-lg text-sm">{error}</p>
        ) : stories.length === 0 ? (
          <p className="text-gray-400 text-center py-12 text-sm">No success stories yet. Add one above.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stories.map((s) => (
              <div
                key={s.id}
                className="relative rounded-xl border border-gray-100 bg-gray-50/30 p-4 flex items-center gap-3"
              >
                {s.image_url ? (
                  <img
                    src={s.image_url}
                    alt={s.student_name}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0 border border-gray-200"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {s.student_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 text-sm leading-tight truncate">{s.student_name}</p>
                  <p className="text-xs text-gray-500 truncate">{s.role_title} at {s.company_name}</p>
                  {s.linkedin_url && (
                    <a
                      href={s.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 mt-1"
                    >
                      <Linkedin className="h-3 w-3" />
                      LinkedIn
                    </a>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageJobSuccessStories;