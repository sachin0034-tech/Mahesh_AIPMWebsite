import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ThumbsUp, ThumbsDown, Video, FileText, ExternalLink, Loader2, X, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getPublishedProjects, voteOnProject } from "@/lib/cohortApi";
import type { CohortProject, ProjectSectionAssignment } from "@/lib/supabase";

type Tab = "top10" | "awards" | "cohort8";

interface ProjectWithSections extends CohortProject {
  sections: ProjectSectionAssignment[];
}

const TABS: { key: Tab; label: string; heading: string; sub: string }[] = [
  { key: "top10",   label: "Top 10 Projects", heading: "Top 10 Projects",   sub: "All-time community favourites" },
  { key: "awards",  label: "Award Winning",   heading: "Award Winning",     sub: "Recognised by cohort instructors" },
  { key: "cohort8", label: "All Projects",    heading: "All Projects",      sub: "Latest cohort · just shipped" },
];

// ── Anonymous voter ID ────────────────────────────────────────────────────────

function getVoterId(): string {
  let id = localStorage.getItem("cohort_voter_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("cohort_voter_id", id);
  }
  return id;
}

// ── Shared helpers ────────────────────────────────────────────────────────────

const COLORS = ["#E75A55", "#9747FF", "#F79009"];

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function LinkedInIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
      <rect width="72" height="72" rx="8" fill="#0077B5" />
      <path d="M14 27h9v31H14V27zm4.5-14a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zM30 27h8.6v4.2h.1c1.2-2.3 4.2-4.7 8.6-4.7C56.8 26.5 58 33 58 40.3V58h-9V42c0-3.8-.1-8.7-5.3-8.7-5.3 0-6.1 4.2-6.1 8.4V58h-9V27z" fill="white" />
    </svg>
  );
}

function ThumbnailImg({ url, title, index, className }: { url: string | null; title: string; index: number; className?: string }) {
  const color = COLORS[index % COLORS.length];
  if (url) {
    return <img src={url} alt={title} className={className ?? "w-full h-40 object-cover"} loading="lazy" />;
  }
  const initials = getInitials(title);
  return (
    <div className={`${className ?? "w-full h-40"} flex items-center justify-center relative overflow-hidden`} style={{ background: `linear-gradient(135deg, ${color}18 0%, ${color}35 100%)` }}>
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "repeating-linear-gradient(90deg,#00000010 0,#00000010 1px,transparent 0,transparent 50%),repeating-linear-gradient(180deg,#00000010 0,#00000010 1px,transparent 0,transparent 50%)", backgroundSize: "24px 24px" }} />
      <span className="text-4xl font-black opacity-20 select-none" style={{ color }}>{initials}</span>
    </div>
  );
}

// ── Project portfolio modal ───────────────────────────────────────────────────

function ProjectModal({ project, index, onClose }: { project: ProjectWithSections; index: number; onClose: () => void }) {
  const [thumbsUp, setThumbsUp] = useState(project.thumbs_up);
  const [thumbsDown, setThumbsDown] = useState(project.thumbs_down);
  const [voted, setVoted] = useState<"up" | "down" | null>(null);

  const color = COLORS[index % COLORS.length];
  const initials = getInitials(project.builder_name);
  const awardSection = project.sections.find((s) => s.section === "awards");

  const vote = async (type: "up" | "down") => {
    if (voted) return;
    const voterId = getVoterId();
    try {
      await voteOnProject(project.id, type, voterId);
      if (type === "up") setThumbsUp((n) => n + 1);
      else setThumbsDown((n) => n + 1);
      setVoted(type);
    } catch { /* already voted */ }
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 bg-white rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Hero image */}
        <div className="relative flex-shrink-0">
          <ThumbnailImg url={project.thumbnail_url} title={project.title} index={index} className="w-full h-64 sm:h-96 object-cover rounded-t-2xl" />

          {/* Overlay badges */}
          {awardSection?.award_name && (
            <span className="absolute top-4 left-4 bg-[#FEF3C7] text-[#92400E] text-[11px] font-semibold px-3 py-1 rounded-full shadow-sm">
              {awardSection.award_name}
            </span>
          )}
          <span className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-gray-700 text-[11px] font-semibold px-3 py-1 rounded-full border border-gray-100 shadow-sm">
            {project.project_category}
          </span>

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition shadow-sm"
          >
            <X size={16} className="text-gray-700" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-5 p-6">
          {/* Title */}
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">{project.title}</h2>

          {/* Builder */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ backgroundColor: color }}>
              {initials}
            </div>
            <div className="flex flex-col">
              <span className="text-gray-900 text-sm font-semibold">{project.builder_name}</span>
              <span className="text-gray-400 text-xs">Builder</span>
            </div>
            {project.builder_linkedin && (
              <a
                href={project.builder_linkedin}
                target="_blank"
                rel="noopener noreferrer"
                title={`${project.builder_name} on LinkedIn`}
                className="ml-auto hover:opacity-80 transition-opacity"
              >
                <LinkedInIcon size={28} />
              </a>
            )}
          </div>

          <div className="border-t border-gray-100" />

          {/* Description */}
          {project.description && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">About the Project</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{project.description}</p>
            </div>
          )}

          {/* Links */}
          {(project.video_link || project.doc_link || project.hosted_link || project.workflow_link) && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Project Links</h3>
              <div className="flex flex-wrap gap-2">
                {project.video_link && (
                  <a href={project.video_link} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-gray-50 hover:bg-[#E75A55]/10 border border-gray-200 hover:border-[#E75A55]/40 text-gray-700 hover:text-[#E75A55] text-xs font-medium px-3 py-2 rounded-lg transition-colors">
                    <Video size={14} /> Demo Video <ArrowUpRight size={12} />
                  </a>
                )}
                {project.doc_link && (
                  <a href={project.doc_link} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-gray-50 hover:bg-[#E75A55]/10 border border-gray-200 hover:border-[#E75A55]/40 text-gray-700 hover:text-[#E75A55] text-xs font-medium px-3 py-2 rounded-lg transition-colors">
                    <FileText size={14} /> Documentation <ArrowUpRight size={12} />
                  </a>
                )}
                {project.hosted_link && (
                  <a href={project.hosted_link} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-gray-50 hover:bg-[#E75A55]/10 border border-gray-200 hover:border-[#E75A55]/40 text-gray-700 hover:text-[#E75A55] text-xs font-medium px-3 py-2 rounded-lg transition-colors">
                    <ExternalLink size={14} /> Live Project <ArrowUpRight size={12} />
                  </a>
                )}
                {project.workflow_link && (
                  <a href={project.workflow_link} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-gray-50 hover:bg-[#E75A55]/10 border border-gray-200 hover:border-[#E75A55]/40 text-gray-700 hover:text-[#E75A55] text-xs font-medium px-3 py-2 rounded-lg transition-colors">
                    <ExternalLink size={14} /> Workflow <ArrowUpRight size={12} />
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="border-t border-gray-100" />

          {/* Voting */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Found this helpful?</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => vote("up")}
                disabled={!!voted}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  voted === "up"
                    ? "bg-green-50 border-green-200 text-green-600"
                    : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-green-50 hover:border-green-200 hover:text-green-600"
                } disabled:cursor-default`}
              >
                <ThumbsUp size={14} /> {thumbsUp}
              </button>
              <button
                onClick={() => vote("down")}
                disabled={!!voted}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  voted === "down"
                    ? "bg-red-50 border-red-200 text-red-500"
                    : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-red-50 hover:border-red-200 hover:text-red-500"
                } disabled:cursor-default`}
              >
                <ThumbsDown size={14} /> {thumbsDown}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Project card ──────────────────────────────────────────────────────────────

function ProjectCard({ project, rank, showRank, showAward, index, onView }: {
  project: ProjectWithSections;
  rank: number;
  showRank?: boolean;
  showAward?: boolean;
  index: number;
  onView: () => void;
}) {
  const [thumbsUp, setThumbsUp] = useState(project.thumbs_up);
  const [thumbsDown, setThumbsDown] = useState(project.thumbs_down);
  const [voted, setVoted] = useState<"up" | "down" | null>(null);

  const awardSection = project.sections.find((s) => s.section === "awards");
  const initials = getInitials(project.builder_name);
  const color = COLORS[index % COLORS.length];

  const vote = async (type: "up" | "down") => {
    if (voted) return;
    const voterId = getVoterId();
    try {
      await voteOnProject(project.id, type, voterId);
      if (type === "up") setThumbsUp((n) => n + 1);
      else setThumbsDown((n) => n + 1);
      setVoted(type);
    } catch { /* already voted or error */ }
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col bg-white hover:shadow-lg transition-shadow">
      {/* Thumbnail */}
      <div className="relative">
        <ThumbnailImg url={project.thumbnail_url} title={project.title} index={index} className="w-full h-40 object-cover rounded-t-xl" />
        {showRank && (
          <span className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white flex items-center justify-center text-sm font-black shadow-sm" style={{ color }}>
            {rank}
          </span>
        )}
        {showAward && awardSection?.award_name && (
          <span className="absolute top-3 left-3 bg-[#FEF3C7] text-[#92400E] text-[10px] font-semibold px-2 py-1 rounded-full">
            {awardSection.award_name}
          </span>
        )}
        <span className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] font-semibold px-2 py-1 rounded-full border border-gray-100">
          {project.project_category}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <h3 className="text-gray-900 font-semibold text-sm leading-snug">{project.title}</h3>

        {project.description && (
          <p className="text-gray-500 text-xs leading-relaxed line-clamp-3">{project.description}</p>
        )}

        {/* Builder */}
        <div className="flex items-center gap-2 pt-1">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ backgroundColor: color }}>
            {initials}
          </div>
          <p className="text-gray-800 text-xs font-semibold flex-1">{project.builder_name}</p>
          {project.builder_linkedin && (
            <a
              href={project.builder_linkedin}
              target="_blank"
              rel="noopener noreferrer"
              title={`${project.builder_name} on LinkedIn`}
              className="flex-shrink-0 hover:opacity-80 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <LinkedInIcon size={20} />
            </a>
          )}
        </div>

        <div className="border-t border-gray-100" />

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onView}
              className="flex items-center gap-1 bg-[#0B1120] hover:bg-[#1a2540] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              View Project <ArrowUpRight size={12} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => vote("up")}
              disabled={!!voted}
              className={`flex items-center gap-1 text-xs transition-colors ${voted === "up" ? "text-green-600" : "text-gray-400 hover:text-green-600"} disabled:cursor-default`}
            >
              <ThumbsUp size={13} /><span>{thumbsUp}</span>
            </button>
            <button
              onClick={() => vote("down")}
              disabled={!!voted}
              className={`flex items-center gap-1 text-xs transition-colors ${voted === "down" ? "text-red-500" : "text-gray-400 hover:text-red-500"} disabled:cursor-default`}
            >
              <ThumbsDown size={13} /><span>{thumbsDown}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export const CohortProjects = (): JSX.Element => {
  const [activeTab, setActiveTab] = useState<Tab>("top10");
  const [allProjects, setAllProjects] = useState<ProjectWithSections[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<{ project: ProjectWithSections; index: number } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await getPublishedProjects();
        setAllProjects(data ?? []);
      } catch {
        setAllProjects([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const closeModal = useCallback(() => setSelectedProject(null), []);

  const currentTab = TABS.find((t) => t.key === activeTab)!;

  const displayed = allProjects
    .filter((p) => p.sections.some((s) => s.section === activeTab))
    .sort((a, b) => {
      const ra = a.sections.find((s) => s.section === activeTab)?.rank ?? 999;
      const rb = b.sections.find((s) => s.section === activeTab)?.rank ?? 999;
      return ra - rb;
    });

  return (
    <div className="flex flex-col w-full items-start">
      {/* Nav */}
      <section className="bg-[#f7f4ee] w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="font-bold text-lg sm:text-xl tracking-tight">MYAICOMMUNITY</div>
            <div className="flex gap-4 sm:gap-6">
              <Link to="/bootcamp" className="text-gray-600 hover:text-[#E75A55] pb-1 text-sm sm:text-base">Bootcamp</Link>
              <Link to="/cohort-projects" className="text-[#E75A55] border-b-2 border-[#E75A55] pb-1 text-sm sm:text-base">Cohort Projects</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Hero */}
      <section className="relative w-full bg-[#0B1120] px-4 sm:px-6 lg:px-8 py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(90deg, #ffffff 0px, #ffffff 1px, transparent 1px, transparent 80px)" }} />
        <div className="relative z-10 container mx-auto flex flex-col items-center text-center max-w-4xl">
          <Badge className="bg-white/10 mb-4 sm:mb-6 py-2 px-3 sm:px-4 rounded-full text-xs sm:text-sm border border-white/20">
            <span className="bg-gradient-to-r from-[#E75A55] to-[#9747FF] bg-clip-text text-transparent">
              Real projects. Real PMs. Real impact.
            </span>
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            What Our Cohort{" "}
            <span className="bg-[linear-gradient(90deg,#F79009_-41.06%,#4A00E0_114.08%)] bg-clip-text text-transparent block sm:inline">
              Built
            </span>
          </h1>
          <p className="text-white/60 text-base sm:text-lg max-w-2xl">
            Every project below was shipped during a live cohort and shared publicly. Browse AI tools,
            product experiments, and automations built by PMs just like you.
          </p>
        </div>
      </section>

      {/* Projects */}
      <section className="w-full bg-white py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-1">{currentTab.heading}</h2>
          <p className="text-gray-400 text-sm mb-6">{currentTab.sub}</p>

          {/* Tabs */}
          <div className="flex gap-8 overflow-x-auto border-b border-gray-200 mb-8">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`whitespace-nowrap text-sm pb-3 transition-colors ${
                  activeTab === tab.key
                    ? "text-gray-900 font-semibold border-b-2 border-gray-900 -mb-[1px]"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Cards */}
          {loading ? (
            <div className="flex items-center justify-center h-48 text-gray-400">
              <Loader2 size={20} className="animate-spin mr-2" /> Loading projects…
            </div>
          ) : displayed.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400">
              No projects in this section yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayed.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  rank={index + 1}
                  showRank={activeTab === "top10"}
                  showAward={activeTab === "awards"}
                  index={index}
                  onView={() => setSelectedProject({ project, index })}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Portfolio modal */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject.project}
          index={selectedProject.index}
          onClose={closeModal}
        />
      )}
    </div>
  );
};
