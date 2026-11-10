import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { getPublishedProjects, getTestimonials, getJobSuccessStories } from "@/lib/cohortApi";
import type { JobSuccessStory, Testimonial } from "@/lib/cohortApi";
import type { CohortProject, ProjectSectionAssignment } from "@/lib/supabase";
import "./CohortProjects.css";

// ─── Types ────────────────────────────────────────────────────────────────────

type SectionKey = "top10" | "awards" | "cohort8" | "cohort9" | "cohort10";

interface ProjectWithSections extends CohortProject {
  sections: ProjectSectionAssignment[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  const p = String(name ?? "").trim().split(/\s+/);
  return (((p[0] || "")[0] || "") + ((p[1] || "")[0] || "")).toUpperCase();
}

// Derives the correct "Cohort N" label from a project's own cohort section
// assignment, instead of assuming a fixed cohort.
function getCohortLabel(project: ProjectWithSections): string {
  const cohortSection = project.sections.find(
    (s) => s.section === "cohort8" || s.section === "cohort9" || s.section === "cohort10"
  );
  if (!cohortSection) return "Cohort 8";
  return (
    cohortSection.cohort_label ??
    (cohortSection.section === "cohort10" ? "Cohort 10" : cohortSection.section === "cohort9" ? "Cohort 9" : "Cohort 8")
  );
}

function inSection(projects: ProjectWithSections[], key: SectionKey) {
  return projects
    .filter((p) => p.sections.some((s) => s.section === key))
    .sort((a, b) => {
      const ra = a.sections.find((s) => s.section === key)?.rank ?? 999;
      const rb = b.sections.find((s) => s.section === key)?.rank ?? 999;
      return ra - rb;
    });
}

// ─── Small shared pieces ──────────────────────────────────────────────────────

const ArrowRight = () => (
  <svg className="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 12h14" /><path d="M13 6.5 18.5 12 13 17.5" /></svg>
);
const UpRight = () => (
  <svg className="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M7.5 16.5 16.5 7.5" /><path d="M9.2 7.5h7.3v7.3" /></svg>
);
const AwardIcon = () => (
  <svg className="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="9.2" r="5.6" /><path d="M8.4 14.1 6.9 21l5.1-2.7L17.1 21l-1.5-6.9" /></svg>
);
const Bracket = ({ className }: { className: string }) => (
  <svg className={`bk ${className}`} viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M2 10V4a2 2 0 0 1 2-2h6" />
  </svg>
);
const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path className="li-plate" d="M20.4 0H3.6A3.6 3.6 0 0 0 0 3.6v16.8A3.6 3.6 0 0 0 3.6 24h16.8a3.6 3.6 0 0 0 3.6-3.6V3.6A3.6 3.6 0 0 0 20.4 0z" />
    <path className="li-glyph" d="M7.15 20.02H3.93V9.42h3.22v10.6zM5.54 8.01a1.87 1.87 0 1 1 0-3.74 1.87 1.87 0 0 1 0 3.74zm14.53 12.01h-3.21v-5.55c0-1.49-.63-2.28-1.85-2.28-1.31 0-2.05.89-2.05 2.28v5.55H9.78V9.42h3.08v1.45h.04c.43-.81 1.48-1.66 3.05-1.66 3.26 0 3.86 2.14 3.86 4.93v5.88z" />
  </svg>
);
const QuoteMark = () => (
  <svg className="tquote-mark" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
    <path d="M9.4 6.5C6.6 8 5 10.4 5 13.4c0 2.6 1.5 4.1 3.4 4.1 1.8 0 3.1-1.3 3.1-3.1 0-1.7-1.2-3-2.9-3-.3 0-.6 0-.8.1.3-1.6 1.4-3 3-3.9zM19 6.5c-2.8 1.5-4.4 3.9-4.4 6.9 0 2.6 1.5 4.1 3.4 4.1 1.8 0 3.1-1.3 3.1-3.1 0-1.7-1.2-3-2.9-3-.3 0-.6 0-.8.1.3-1.6 1.4-3 3-3.9z" />
  </svg>
);

function Avatar({ name, src }: { name: string; src?: string | null }) {
  return src ? (
    <img className="av" loading="lazy" decoding="async" src={src} alt={name} />
  ) : (
    <span className="av-i" aria-hidden="true">{getInitials(name)}</span>
  );
}

// Fades/slides an element in the first time it scrolls into view.
function Reveal({
  className = "", children, delay = 0, as: Tag = "div",
}: {
  className?: string;
  children: React.ReactNode;
  delay?: number;
  as?: any;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { setShown(true); return; }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) { setShown(true); io.disconnect(); }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`r ${shown ? "in" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <nav className="nav">
      <div className="wrap nav-in">
        <Link to="/" className="logo"><span>MYAI</span><span>Community</span></Link>
        <div className="nav-links"><Link to="/" className="is-active">HOME</Link></div>
        <div className="nav-cta">
          <Link to="/project-login" className="btn btn-ghost btn-pill">PROJECT LOGIN</Link>
          <Link to="/cohort-admin" className="btn btn-dark">ADMIN LOGIN</Link>
        </div>
      </div>
    </nav>
  );
}

function SectionHead({
  eyebrow, title, lede, actions,
}: { eyebrow: string; title: string; lede?: string; actions?: React.ReactNode }) {
  return (
    <Reveal className="sec-head">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        {lede && <p className="lede">{lede}</p>}
      </div>
      {actions}
    </Reveal>
  );
}

const Rule = () => <div className="wrap"><div className="rule" /></div>;

// ─── Trending ─────────────────────────────────────────────────────────────────

function TrendingCardLink({ project, rank, featured }: { project: ProjectWithSections; rank: number; featured?: boolean }) {
  const cohort = getCohortLabel(project).toUpperCase();
  return (
    <Link
      to={`/project/${project.id}`}
      className={`pcard ${featured ? "fcard" : ""}`}
    >
      <div className="thumb">
        <span className={`chip-rank ${rank <= 3 ? "is-top" : ""}`}>{String(rank).padStart(2, "0")}</span>
        {project.user_image_url ? (
          <img loading="lazy" decoding="async" src={project.user_image_url} alt={project.builder_name} />
        ) : (
          <span className="thumb-empty" aria-hidden="true"><i>{getInitials(project.builder_name)}</i></span>
        )}
        <div className="reveal"><span>{cohort}</span><UpRight /></div>
      </div>
      <div className="pbody">
        <h3 className="pcard-title">{project.title}</h3>
        <div className="pmeta">
          <Avatar name={project.builder_name} src={project.user_image_url} />
          <div className="pmeta-txt">
            <div className="pmeta-name">{project.builder_name}</div>
            <div className="pmeta-sub">{cohort}</div>
          </div>
        </div>
      </div>
      <Bracket className="bk-a" />
      <Bracket className="bk-b" />
    </Link>
  );
}

function TrendingSection({ projects, loading }: { projects: ProjectWithSections[]; loading: boolean }) {
  const sorted = inSection(projects, "top10");
  const cohorts = Array.from(new Set(sorted.map((p) => getCohortLabel(p)))).sort();

  return (
    <>
      <header className="masthead">
        <Reveal className="wrap mast-copy">
          <span className="eyebrow">Community Top Picks</span>
          <div className="mast-rule" aria-hidden="true" />
          <h1>Trending Projects</h1>
          {!loading && sorted.length > 0 && (
            <p className="mast-meta">
              {sorted.length} project{sorted.length !== 1 ? "s" : ""}
              {cohorts.length > 0 && ` · ${cohorts.join(" & ")}`}
            </p>
          )}
        </Reveal>
      </header>

      <section style={{ paddingTop: 8 }}>
        <div className="wrap">
          {loading ? (
            <div className="pgrid pg3">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skel" />)}
            </div>
          ) : sorted.length === 0 ? (
            <div className="empty">No tools listed yet — check back soon.</div>
          ) : (
            <div className="pgrid pg3">
              {sorted.map((p, i) => (
                <Reveal key={p.id} className={`pcard-slot ${i === 0 ? "fcard-slot" : ""}`} delay={Math.min(i, 9) * 50}>
                  <TrendingCardLink project={p} rank={i + 1} featured={i === 0} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

// ─── Job Success Stories (placements ticker) ──────────────────────────────────

function JobSuccessStoriesSection() {
  const [stories, setStories] = useState<JobSuccessStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getJobSuccessStories()
      .then((res) => setStories(res.data ?? []))
      .catch(() => setStories([]))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && stories.length === 0) return null;

  // Each half of the track must be wider than the viewport, so repeat the list
  // until it is, then duplicate that set once more for the seamless -50% loop.
  const repeat = Math.max(1, Math.ceil(10 / Math.max(stories.length, 1)));
  const half = Array.from({ length: repeat }, () => stories).flat();
  const track = [...half, ...half];
  const duration = Math.max(half.length * 4.5, 40);
  const companies = new Set(stories.map((s) => s.company_name)).size;

  return (
    <>
      <Rule />
      <section id="success">
        <div className="wrap">
          <SectionHead
            eyebrow="Job Success Stories"
            title="Where Our Students Have Got Placed"
            actions={
              !loading && (
                <div className="sec-actions">
                  <span className="badge badge-accent">
                    <svg className="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 17 9.5 11l3.5 3.5L20.5 7" /><path d="M14.6 7h5.9v5.9" /></svg>
                    {stories.length} ALUMNI PLACED
                  </span>
                </div>
              )
            }
          />
          <Reveal className="wall">
            {!loading && (
              <p className="wall-label">{stories.length} alumni · {companies} compan{companies !== 1 ? "ies" : "y"}</p>
            )}
            <div className="marquee">
              {loading ? (
                <div className="track" style={{ animation: "none" }}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="pers" style={{ height: 330, opacity: 0.12 }} />
                  ))}
                </div>
              ) : (
                <div className="track" style={{ animationDuration: `${duration}s` }}>
                  {track.map((s, i) => (
                    <a
                      key={`${s.id}-${i}`}
                      className="pers"
                      href={s.linkedin_url ?? undefined}
                      target={s.linkedin_url ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      aria-label={`${s.student_name} — ${s.role_title} at ${s.company_name}`}
                    >
                      {s.image_url ? (
                        <img className="pers-photo" loading="eager" decoding="async" src={s.image_url} alt={s.student_name} />
                      ) : (
                        <span className="pers-photo thumb-empty" style={{ position: "relative", display: "grid", placeItems: "center" }}>
                          <i style={{ fontStyle: "normal", fontSize: 28, fontWeight: 600, color: "var(--steel)" }}>{getInitials(s.student_name)}</i>
                        </span>
                      )}
                      <span className="pers-body">
                        <span className="pers-name">{s.student_name}</span>
                        <span className="pers-role">{s.role_title}</span>
                        <span className="pers-foot">
                          <span className="pers-co">{s.company_name}</span>
                          {s.linkedin_url && <span className="pers-li" aria-hidden="true"><LinkedInIcon /></span>}
                        </span>
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

// ─── Standout Builds ──────────────────────────────────────────────────────────

const AWARDS_COLLAPSED = 12;

function StandoutSection({ projects, loading }: { projects: ProjectWithSections[]; loading: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const all = inSection(projects, "awards");
  const shown = expanded ? all : all.slice(0, AWARDS_COLLAPSED);

  const toggle = () => {
    if (expanded) {
      setExpanded(false);
      gridRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    } else {
      setExpanded(true);
    }
  };

  return (
    <>
      <Rule />
      <section>
        <div className="wrap">
          <SectionHead
            eyebrow="Expert Recognition"
            title="Standout Builds"
            lede="Hand-picked by instructors for exceptional quality and real-world usefulness"
            actions={
              <div className="sec-actions">
                {!loading && all.length > 0 && (
                  <span className="badge badge-accent"><AwardIcon />{all.length} TOOLS</span>
                )}
                <Link to="/all-projects/awards" className="btn btn-ghost btn-pill">See All <ArrowRight /></Link>
              </div>
            }
          />
          {loading ? (
            <div className="pgrid pg3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skel" />)}</div>
          ) : all.length === 0 ? (
            <div className="empty">No tools listed here yet — check back soon.</div>
          ) : (
            <>
              <Reveal className="sgrid">
                <div ref={gridRef} style={{ display: "contents" }}>
                  {shown.map((p, i) => {
                    const award = p.sections.find((s) => s.section === "awards")?.award_name;
                    return (
                      <Link key={p.id} to={`/project/${p.id}`} className="scell">
                        <span className="sghost" aria-hidden="true">{i + 1}</span>
                        <span className="spill-slot">
                          <span className={`spill ${award ? "" : "spill-plain"}`}>
                            <AwardIcon />{award || "Standout Build"}
                          </span>
                        </span>
                        <h3 className="stitle">{p.title}</h3>
                        <div className="sby">
                          <Avatar name={p.builder_name} src={p.user_image_url} />
                          <div className="pmeta-txt">
                            <div className="sby-name">{p.builder_name}</div>
                            <div className="sby-sub">{getCohortLabel(p)}</div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </Reveal>
              {all.length > AWARDS_COLLAPSED && (
                <div className="more-wrap">
                  <button className="btn btn-dark" type="button" onClick={toggle}>
                    {expanded ? "Show fewer" : `Show all ${all.length} builds`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}

// ─── Explore Projects (tabbed cohorts) ────────────────────────────────────────

const ALL_TABS = ["cohort8", "cohort9", "cohort10"] as const;
type CohortTab = typeof ALL_TABS[number];
const TAB_LABEL: Record<CohortTab, string> = { cohort8: "Cohort 8", cohort9: "Cohort 9", cohort10: "Cohort 10" };

function CohortTabsSection({ projects, loading }: { projects: ProjectWithSections[]; loading: boolean }) {
  const hasCohort10 = projects.some((p) => p.sections.some((s) => s.section === "cohort10"));
  const visibleTabs = ALL_TABS.filter((t) => t !== "cohort10" || hasCohort10);
  const defaultTab: CohortTab = hasCohort10 ? "cohort10" : "cohort9";

  const [tab, setTab] = useState<CohortTab>(defaultTab);
  // If cohort10 projects get removed while viewing that tab, fall back
  const activeTab = visibleTabs.includes(tab) ? tab : defaultTab;

  const VISIBLE = 16;
  const filtered = inSection(projects, activeTab);
  const visible = filtered.slice(0, VISIBLE);

  return (
    <>
      <Rule />
      <section>
        <div className="wrap">
          <SectionHead
            eyebrow="AI Marketplace"
            title="Explore Projects"
            actions={
              <div className="tabs" role="tablist">
                {visibleTabs.map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === t}
                    className={`tab ${activeTab === t ? "is-on" : ""}`}
                    onClick={() => setTab(t)}
                  >
                    {TAB_LABEL[t]}
                  </button>
                ))}
              </div>
            }
          />
          {loading ? (
            <div className="pgrid pg3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skel" />)}</div>
          ) : visible.length === 0 ? (
            <div className="empty">No tools listed here yet — check back soon.</div>
          ) : (
            <Reveal className="sgrid sgrid-lite">
              {visible.map((p) => (
                <Link key={p.id} to={`/project/${p.id}`} className="scell">
                  <span className="spill-slot"><span className="chip-cohort">{TAB_LABEL[activeTab]}</span></span>
                  <h3 className="stitle">{p.title}</h3>
                  <div className="sby">
                    <Avatar name={p.builder_name} src={p.user_image_url} />
                    <div className="pmeta-txt"><div className="sby-name">{p.builder_name}</div></div>
                  </div>
                </Link>
              ))}
            </Reveal>
          )}
          {!loading && filtered.length > 0 && (
            <div className="more-wrap">
              <Link to="/all-projects/cohorts" className="btn btn-neutral">See More <ArrowRight /></Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

function VoiceCard({ t }: { t: Testimonial }) {
  return (
    <article className="vcard">
      <QuoteMark />
      <p className="vq">{t.post_text}</p>
      <a className="viewpost" href={t.source_url} target="_blank" rel="noopener noreferrer">
        View post <span aria-hidden="true">→</span>
      </a>
      <div className="vfoot">
        <Avatar name={t.name} src={t.image_url} />
        <div>
          <b>{t.name}</b>
          {t.bio && <span>{t.bio}</span>}
        </div>
      </div>
    </article>
  );
}

const TICKER_N = 30;

function TestimonialsHomeSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const wallRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getTestimonials()
      .then((res) => setTestimonials(res.data ?? []))
      .catch(() => setTestimonials([]))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && testimonials.length === 0) return null;

  const picks = testimonials.slice(0, TICKER_N);
  const columns = [0, 1, 2].map((c) => picks.filter((_, i) => i % 3 === c)).filter((c) => c.length > 0);

  const toggle = () => {
    const next = !showAll;
    setShowAll(next);
    if (!next) setTimeout(() => wallRef.current?.scrollIntoView({ block: "start", behavior: "smooth" }), 0);
  };

  return (
    <>
      <Rule />
      <section>
        <div className="wrap">
          <SectionHead
            eyebrow="Community Voices"
            title="What People Are Saying"
            lede="Real feedback from product managers and AI practitioners"
            actions={
              !loading && (
                <div className="sec-actions">
                  <span className="badge badge-accent">
                    <svg className="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.4l1.9 5 5 1.9-5 1.9-1.9 5-1.9-5-5-1.9 5-1.9z" /></svg>
                    {testimonials.length} REVIEWS
                  </span>
                </div>
              )
            }
          />

          {loading ? (
            <div className="pgrid pg3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skel" />)}</div>
          ) : (
            <>
              <div className="vwall" ref={wallRef} hidden={showAll}>
                {columns.map((col, ci) => (
                  <div className="vcol" key={ci}>
                    <div className="vtrack">
                      {[...col, ...col].map((t, i) => <VoiceCard key={`${t.id}-${i}`} t={t} />)}
                    </div>
                  </div>
                ))}
              </div>
              <div className={`vall ${showAll ? "is-open" : ""}`}>
                {showAll && testimonials.map((t) => <VoiceCard key={t.id} t={t} />)}
              </div>
              <div className="more-wrap">
                <button className="btn btn-dark" type="button" onClick={toggle}>
                  {showAll ? "Show fewer" : `See all ${testimonials.length} testimonials`}
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export const CohortProjects = (): JSX.Element => {
  const [allProjects, setAllProjects] = useState<ProjectWithSections[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await getPublishedProjects();
        setAllProjects(data ?? []);
      } catch {
        setAllProjects([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="mc">
      <div className="bg" aria-hidden="true">
        <div className="bg-rails"><i /><i /></div>
        <div className="bg-glow" />
        <div className="bg-glow-2" />
      </div>

      <Nav />

      <main>
        <TrendingSection projects={allProjects} loading={loading} />
        <JobSuccessStoriesSection />
        <StandoutSection projects={allProjects} loading={loading} />
        <CohortTabsSection projects={allProjects} loading={loading} />
        <TestimonialsHomeSection />
      </main>
    </div>
  );
};
