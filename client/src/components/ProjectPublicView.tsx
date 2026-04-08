import React, { useState } from 'react';
import {
  ThumbsUp, ThumbsDown, Video, FileText, ExternalLink, ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';
import { voteOnProject } from '@/lib/cohortApi';
import type { CohortProject, ProjectSectionAssignment } from '@/lib/supabase';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getVoterId(): string {
  let id = localStorage.getItem('cohort_voter_id');
  if (!id) { id = crypto.randomUUID(); localStorage.setItem('cohort_voter_id', id); }
  return id;
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export function LinkedInIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
      <rect width="72" height="72" rx="8" fill="#0077B5" />
      <path d="M14 27h9v31H14V27zm4.5-14a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zM30 27h8.6v4.2h.1c1.2-2.3 4.2-4.7 8.6-4.7C56.8 26.5 58 33 58 40.3V58h-9V42c0-3.8-.1-8.7-5.3-8.7-5.3 0-6.1 4.2-6.1 8.4V58h-9V27z" fill="white" />
    </svg>
  );
}

const ACCENT = ['#6366f1', '#a855f7', '#f59e0b'];

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  project: Partial<CohortProject> & { sections?: ProjectSectionAssignment[] };
  index?: number;
  isPreview?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProjectPublicView({ project, index = 0, isPreview = false }: Props) {
  const [thumbsUp, setThumbsUp] = useState(project.thumbs_up ?? 0);
  const [thumbsDown, setThumbsDown] = useState(project.thumbs_down ?? 0);
  const [voted, setVoted] = useState<'up' | 'down' | null>(null);

  const color = ACCENT[index % ACCENT.length];
  const flags = project.visibility_flags;
  const awardSection = project.sections?.find((s) => s.section === 'awards');

  const vote = async (type: 'up' | 'down') => {
    if (voted || isPreview || !project.id) return;
    try {
      await voteOnProject(project.id, type, getVoterId());
      type === 'up' ? setThumbsUp((n) => n + 1) : setThumbsDown((n) => n + 1);
      setVoted(type);
    } catch { /* already voted */ }
  };

  const showField = (key: keyof NonNullable<typeof flags>) =>
    !flags || flags[key] === true || flags[key] === undefined;

  const bannerSrc = project.banner_url || project.thumbnail_url;

  return (
    <div className="flex flex-col gap-5">
      {/* Banner / Hero image */}
      {bannerSrc && showField('banner') ? (
        <div className="relative flex-shrink-0">
          <img
            src={bannerSrc}
            alt={project.title ?? 'Project banner'}
            className="w-full h-52 object-cover rounded-xl"
          />
          {awardSection?.award_name && (
            <span className="absolute top-3 left-3 bg-amber-50 text-amber-700 text-[11px] font-semibold px-3 py-1 rounded-full border border-amber-200">
              {awardSection.award_name}
            </span>
          )}
          {project.project_category && (
            <span className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-gray-600 text-[11px] font-medium px-3 py-1 rounded-full border border-gray-200 shadow-sm">
              {project.project_category}
            </span>
          )}
        </div>
      ) : !bannerSrc && project.title ? (
        <div
          className="w-full h-52 rounded-xl flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${color}18 0%, ${color}30 100%)` }}
        >
          <span className="text-5xl font-black opacity-10" style={{ color }}>
            {getInitials(project.title)}
          </span>
        </div>
      ) : null}

      {/* Title */}
      {project.title && (
        <h2 className="text-xl font-bold text-gray-900 leading-snug px-6">
          {project.title}
        </h2>
      )}

      <div className="px-6 flex flex-col gap-5">
        {/* Builder row */}
        {project.builder_name && (
          <div className="flex items-center gap-3">
            {project.user_image_url && showField('user_image') ? (
              <img
                src={project.user_image_url}
                alt={project.builder_name}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: color }}
              >
                {getInitials(project.builder_name)}
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-gray-900 text-sm font-semibold">{project.builder_name}</span>
              <span className="text-gray-400 text-xs">Builder</span>
            </div>
            {project.builder_linkedin && (
              <a
                href={project.builder_linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto hover:opacity-80 transition-opacity"
                onClick={(e) => isPreview && e.preventDefault()}
              >
                <LinkedInIcon size={28} />
              </a>
            )}
          </div>
        )}

        <div className="border-t border-gray-100" />

        {/* Description */}
        {project.description && showField('description') && (
          <div>
            <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
              About the Project
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">{project.description}</p>
          </div>
        )}

        {/* What You Learned */}
        {project.what_you_learned && showField('what_you_learned') && (
          <div>
            <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
              What you'll learn
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">{project.what_you_learned}</p>
          </div>
        )}

        {/* About User */}
        {project.about_user_description && showField('about_user') && (
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
              About the Builder
            </h3>
            <div className="flex items-start gap-3">
              {project.user_image_url && showField('user_image') && (
                <img
                  src={project.user_image_url}
                  alt={project.builder_name ?? 'Builder'}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
              )}
              <div>
                {project.builder_name && (
                  <div className="text-sm font-semibold text-gray-900 mb-1">{project.builder_name}</div>
                )}
                <p className="text-gray-600 text-xs leading-relaxed">{project.about_user_description}</p>
              </div>
            </div>
          </div>
        )}

        {/* What's Included */}
        {project.whats_included && project.whats_included.length > 0 && showField('whats_included') && (
          <div>
            <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
              What's Included
            </h3>
            <ul className="space-y-1.5">
              {project.whats_included.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle2 size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Project Links */}
        {(
          (project.video_link && showField('video_link')) ||
          (project.doc_link && showField('doc_link')) ||
          (project.hosted_link && showField('demo_link')) ||
          project.workflow_link
        ) && (
          <div>
            <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Project Links
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.video_link && showField('video_link') && (
                <a
                  href={project.video_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-900 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                  onClick={(e) => isPreview && e.preventDefault()}
                >
                  <Video size={13} /> Demo Video <ArrowUpRight size={11} />
                </a>
              )}
              {project.doc_link && showField('doc_link') && (
                <a
                  href={project.doc_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-900 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                  onClick={(e) => isPreview && e.preventDefault()}
                >
                  <FileText size={13} /> Documentation <ArrowUpRight size={11} />
                </a>
              )}
              {project.hosted_link && showField('demo_link') && (
                <a
                  href={project.hosted_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-900 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                  onClick={(e) => isPreview && e.preventDefault()}
                >
                  <ExternalLink size={13} /> Live Project <ArrowUpRight size={11} />
                </a>
              )}
              {project.workflow_link && (
                <a
                  href={project.workflow_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-900 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                  onClick={(e) => isPreview && e.preventDefault()}
                >
                  <ExternalLink size={13} /> Workflow <ArrowUpRight size={11} />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Voting — hidden in preview mode */}
        {!isPreview && project.id && (
          <>
            <div className="border-t border-gray-100" />
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs text-gray-400">Was this helpful?</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => vote('up')}
                  disabled={!!voted}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    voted === 'up'
                      ? 'bg-green-50 border-green-200 text-green-600'
                      : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-green-50 hover:border-green-200 hover:text-green-600'
                  } disabled:cursor-default`}
                >
                  <ThumbsUp size={13} /> {thumbsUp}
                </button>
                <button
                  onClick={() => vote('down')}
                  disabled={!!voted}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    voted === 'down'
                      ? 'bg-red-50 border-red-200 text-red-500'
                      : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-red-50 hover:border-red-200 hover:text-red-500'
                  } disabled:cursor-default`}
                >
                  <ThumbsDown size={13} /> {thumbsDown}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
