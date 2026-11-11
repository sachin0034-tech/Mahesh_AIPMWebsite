import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { getPublishedProjects } from "@/lib/cohortApi";
import type { CohortProject, ProjectSectionAssignment } from "@/lib/supabase";
import { Avatar, Nav, McBackground } from "@/components/McShared";
import "./CohortProjects.css";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProjectWithSections extends CohortProject {
  sections: ProjectSectionAssignment[];
}

type CohortKey = "cohort8" | "cohort9" | "cohort10";
const COHORT_KEYS: CohortKey[] = ["cohort8", "cohort9", "cohort10"];
const COHORT_LABEL: Record<CohortKey, string> = {
  cohort8: "Cohort 8",
  cohort9: "Cohort 9",
  cohort10: "Cohort 10",
};

function cohortOf(p: ProjectWithSections): { key: CohortKey; label: string } {
  const s = p.sections.find((x) => COHORT_KEYS.includes(x.section as CohortKey));
  const key = (s?.section as CohortKey) ?? "cohort8";
  return { key, label: s?.cohort_label ?? COHORT_LABEL[key] };
}

function rankIn(p: ProjectWithSections, match: (s: ProjectSectionAssignment) => boolean) {
  return p.sections.find(match)?.rank ?? 999;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const BackArrow = () => (
  <svg className="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M19.5 12h-14" /><path d="M11 5.5 4.5 12 11 18.5" /></svg>
);
const SearchIcon = () => (
  <svg className="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.9-3.9" /></svg>
);
const LayersIcon = () => (
  <svg className="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.4 21 8l-9 4.6L3 8z" /><path d="M3 12.4 12 17l9-4.6" /></svg>
);
const AwardIcon = () => (
  <svg className="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="9.2" r="5.6" /><path d="M8.4 14.1 6.9 21l5.1-2.7L17.1 21l-1.5-6.9" /></svg>
);

// ─── Config per section ───────────────────────────────────────────────────────

const SECTION_CONFIG = {
  awards: {
    label: "Expert Recognition",
    title: "Standout Builds",
    sub: "Hand-picked by instructors for exceptional quality and real-world usefulness — every award-winning build across the cohorts",
    crumb: "Standout builds",
  },
  cohort8: {
    label: "AI Marketplace",
    title: "Explore Projects",
    sub: "Every tool built by our community — discover, use, and get inspired",
    crumb: "Cohort 8",
  },
  cohort9: {
    label: "Cohort 9",
    title: "Cohort 9 Builds",
    sub: "The latest wave of AI tools from our newest cohort",
    crumb: "Cohort 9",
  },
  cohort10: {
    label: "Cohort 10",
    title: "Cohort 10 Builds",
    sub: "The freshest wave of AI tools from our latest cohort",
    crumb: "Cohort 10",
  },
  cohorts: {
    label: "AI Marketplace",
    title: "Explore Projects",
    sub: "Every tool built across our cohorts — discover, use, and get inspired",
    crumb: "All projects",
  },
} as const;

type SectionParam = keyof typeof SECTION_CONFIG;

// ─── Sheet padding ────────────────────────────────────────────────────────────
// A bordered sheet whose last row is partly filled would leave bare space inside
// the frame. Read the rendered column count and append inert filler cells.

function useFillerCount(ref: React.RefObject<HTMLDivElement>, realCount: number) {
  const [filler, setFiller] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const calc = () => {
      const cols = getComputedStyle(el).gridTemplateColumns.split(" ").filter(Boolean).length || 1;
      setFiller((cols - (realCount % cols)) % cols);
    };
    calc();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, realCount]);
  return filler;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export const AllProjectsPage = (): JSX.Element => {
  const { section } = useParams<{ section: string }>();
  const cfg = SECTION_CONFIG[(section as SectionParam) ?? "cohort8"] ?? SECTION_CONFIG.cohort8;
  const isAwards = section === "awards";
  const isCombined = section === "cohorts";
  const hasTabs = isCombined || isAwards; // cohort tabs

  const [allProjects, setAllProjects] = useState<ProjectWithSections[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | CohortKey>("ALL");
  const [query, setQuery] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    setFilter("ALL");
    setQuery("");
  }, [section]);

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

  // projects belonging to this page, in rank order
  const base = useMemo(() => {
    const isCohort = (s: ProjectSectionAssignment) => COHORT_KEYS.includes(s.section as CohortKey);
    const match = isCombined ? isCohort : (s: ProjectSectionAssignment) => s.section === section;
    return allProjects
      .filter((p) => p.sections.some(match))
      .sort((a, b) => rankIn(a, match) - rankIn(b, match));
  }, [allProjects, section, isCombined]);

  // cohort tabs (combined view only) — a cohort only appears once it has projects
  const tabs = useMemo(() => {
    if (!hasTabs) return [];
    return COHORT_KEYS.map((k) => ({
      key: k,
      label: COHORT_LABEL[k],
      n: base.filter((p) => cohortOf(p).key === k).length,
    })).filter((t) => t.n > 0);
  }, [base, hasTabs]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return base.filter((p) => {
      if (hasTabs && filter !== "ALL" && cohortOf(p).key !== filter) return false;
      if (!q) return true;
      const award = isAwards ? p.sections.find((s) => s.section === "awards")?.award_name || "" : "";
      return `${p.title} ${p.builder_name} ${award}`.toLowerCase().includes(q);
    });
  }, [base, filter, query, hasTabs, isAwards]);

  const gridRef = useRef<HTMLDivElement>(null);
  const filler = useFillerCount(gridRef, visible.length);

  const showTools = !loading;

  return (
    <div className="mc">
      <McBackground />
      <Nav />

      <main>
        {/* sub nav */}
        <div className="subnav">
          <div className="wrap subnav-in">
            <Link className="backlink" to="/"><BackArrow /> Back to community</Link>
            <span className="crumb">
              {cfg.label} <i>/</i> <b>{cfg.crumb}</b>
            </span>
          </div>
        </div>

        {/* masthead */}
        <header className="amast">
          <div className="wrap">
            <div className="amast-top">
              <div>
                <span className="eyebrow">{cfg.label}</span>
                <h1>{cfg.title}</h1>
              </div>
              {showTools && (
                <span className="badge badge-accent" style={{ marginTop: 6 }}>
                  {isAwards ? <AwardIcon /> : <LayersIcon />}
                  {base.length} TOOL{base.length !== 1 ? "S" : ""}
                </span>
              )}
            </div>
            <p className="lede">{cfg.sub}</p>
          </div>
        </header>

        <section className="allp">
          <div className="wrap">
            {/* filters */}
            {!loading && base.length > 0 && (
              <div className="filters">
                {hasTabs && tabs.length > 0 && (
                  <div className="tabs" role="tablist">
                    <button
                      type="button" role="tab" aria-selected={filter === "ALL"}
                      className={`tab ${filter === "ALL" ? "is-on" : ""}`}
                      onClick={() => setFilter("ALL")}
                    >
                      All <b>{base.length}</b>
                    </button>
                    {tabs.map((t) => (
                      <button
                        key={t.key} type="button" role="tab" aria-selected={filter === t.key}
                        className={`tab ${filter === t.key ? "is-on" : ""}`}
                        onClick={() => setFilter(t.key)}
                      >
                        {t.label} <b>{t.n}</b>
                      </button>
                    ))}
                  </div>
                )}
                <label className="search">
                  <SearchIcon />
                  <input
                    type="search" value={query} placeholder={isAwards ? "Search a build, builder or award" : "Search a project or builder"}
                    aria-label="Search projects" onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
                <span className="count"><b>{visible.length}</b> of {base.length} {isAwards ? "builds" : "tools"}</span>
              </div>
            )}

            {loading ? (
              <div className="pgrid pg3">{Array.from({ length: 9 }).map((_, i) => <div key={i} className="skel" />)}</div>
            ) : base.length === 0 ? (
              <div className="empty">No tools listed here yet — check back soon.</div>
            ) : visible.length === 0 ? (
              <div className="empty">
                <b>No projects match that search</b>
                <span>Try a different name, or clear the filter.</span>
              </div>
            ) : (
              <div ref={gridRef} className={`sgrid ${isAwards ? "" : "sgrid-lite"}`}>
                {visible.map((p, i) => {
                  const cohort = cohortOf(p);
                  const award = isAwards ? p.sections.find((s) => s.section === "awards")?.award_name : null;
                  return (
                    <Link key={p.id} to={`/project/${p.id}`} className="scell">
                      {isAwards && <span className="sghost" aria-hidden="true">{i + 1}</span>}
                      <span className="spill-slot">
                        {isAwards ? (
                          <span className={`spill ${award ? "" : "spill-plain"}`}>
                            <AwardIcon />{award || "Standout Build"}
                          </span>
                        ) : (
                          <span className="chip-cohort">{isCombined ? cohort.label : cfg.crumb}</span>
                        )}
                      </span>
                      <h3 className="stitle">{p.title}</h3>
                      <div className="sby">
                        <Avatar name={p.builder_name} src={p.user_image_url} />
                        <div className="pmeta-txt">
                          <div className="sby-name">{p.builder_name}</div>
                          {isAwards && <div className="sby-sub">{cohort.label}</div>}
                        </div>
                      </div>
                    </Link>
                  );
                })}
                {Array.from({ length: filler }).map((_, i) => (
                  <div key={`f${i}`} className="scell filler" aria-hidden="true" />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};
