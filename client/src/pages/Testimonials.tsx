import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getTestimonials, type Testimonial } from "../lib/cohortApi";
import { Avatar, Nav, McBackground } from "@/components/McShared";
import "./CohortProjects.css";

// Role groups come from each reviewer's own bio line
const GROUPS = ["Product managers", "Leaders & founders", "Engineering & data", "Others"] as const;
type Group = (typeof GROUPS)[number];

function groupOf(role: string | null): Group {
  const r = (role || "").toLowerCase();
  if (/founder|\bceo\b|\bcto\b|\bcpo\b|chief|\bvp\b|vice president|director|head of|\bhead\b|general manager|\bgm\b|partner|principal|owner|president/.test(r)) return "Leaders & founders";
  if (/product|\bpm\b|\btpm\b|\bpmt\b/.test(r)) return "Product managers";
  if (/engineer|developer|architect|scientist|\bdata\b|analyst|technical|tech lead|devops|cloud/.test(r)) return "Engineering & data";
  return "Others";
}

const BackArrow = () => (
  <svg className="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M19.5 12h-14" /><path d="M11 5.5 4.5 12 11 18.5" /></svg>
);
const SearchIcon = () => (
  <svg className="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.9-3.9" /></svg>
);
const SparkIcon = () => (
  <svg className="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.4l1.9 5 5 1.9-5 1.9-1.9 5-1.9-5-5-1.9 5-1.9z" /></svg>
);
const QuoteMark = () => (
  <svg className="tquote-mark" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
    <path d="M9.4 6.5C6.6 8 5 10.4 5 13.4c0 2.6 1.5 4.1 3.4 4.1 1.8 0 3.1-1.3 3.1-3.1 0-1.7-1.2-3-2.9-3-.3 0-.6 0-.8.1.3-1.6 1.4-3 3-3.9zM19 6.5c-2.8 1.5-4.4 3.9-4.4 6.9 0 2.6 1.5 4.1 3.4 4.1 1.8 0 3.1-1.3 3.1-3.1 0-1.7-1.2-3-2.9-3-.3 0-.6 0-.8.1.3-1.6 1.4-3 3-3.9z" />
  </svg>
);

function VoiceCard({ t }: { t: Testimonial }) {
  return (
    <article className="vcard">
      <QuoteMark />
      <p className="vq">{t.post_text}</p>
      {t.source_url && (
        <a className="viewpost" href={t.source_url} target="_blank" rel="noopener noreferrer">
          View post <span aria-hidden="true">→</span>
        </a>
      )}
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

export const Testimonials = (): JSX.Element => {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | Group>("ALL");
  const [query, setQuery] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    getTestimonials()
      .then((res) => setItems(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const tabs = useMemo(
    () => GROUPS.map((g) => ({ g, n: items.filter((t) => groupOf(t.bio) === g).length })).filter((t) => t.n > 0),
    [items]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((t) => {
      if (filter !== "ALL" && groupOf(t.bio) !== filter) return false;
      return !q || `${t.name} ${t.bio || ""} ${t.post_text}`.toLowerCase().includes(q);
    });
  }, [items, filter, query]);

  return (
    <div className="mc">
      <McBackground />
      <Nav active="testimonials" />

      <main>
        <div className="subnav">
          <div className="wrap subnav-in">
            <Link className="backlink" to="/"><BackArrow /> Back to community</Link>
            <span className="crumb">Community Voices <i>/</i> <b>All testimonials</b></span>
          </div>
        </div>

        <header className="amast">
          <div className="wrap">
            <div className="amast-top">
              <div>
                <span className="eyebrow">Community Voices</span>
                <h1>What People Are Saying</h1>
              </div>
              {!loading && !error && (
                <span className="badge badge-accent" style={{ marginTop: 6 }}>
                  <SparkIcon />{items.length} REVIEWS
                </span>
              )}
            </div>
            <p className="lede">Real feedback from product managers and AI practitioners who went through the cohorts</p>
          </div>
        </header>

        <section className="allp">
          <div className="wrap">
            {!loading && items.length > 0 && (
              <div className="filters">
                <div className="tabs" role="tablist">
                  <button type="button" role="tab" aria-selected={filter === "ALL"}
                    className={`tab ${filter === "ALL" ? "is-on" : ""}`} onClick={() => setFilter("ALL")}>
                    All <b>{items.length}</b>
                  </button>
                  {tabs.map((t) => (
                    <button key={t.g} type="button" role="tab" aria-selected={filter === t.g}
                      className={`tab ${filter === t.g ? "is-on" : ""}`} onClick={() => setFilter(t.g)}>
                      {t.g} <b>{t.n}</b>
                    </button>
                  ))}
                </div>
                <label className="search">
                  <SearchIcon />
                  <input type="search" value={query} placeholder="Search a name, role or company"
                    aria-label="Search testimonials" onChange={(e) => setQuery(e.target.value)} />
                </label>
                <span className="count"><b>{visible.length}</b> of {items.length} reviews</span>
              </div>
            )}

            {loading ? (
              <div className="pgrid pg3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skel" />)}</div>
            ) : error ? (
              <div className="empty"><b>Couldn't load testimonials</b><span>{error}</span></div>
            ) : items.length === 0 ? (
              <div className="empty">No testimonials yet — check back soon.</div>
            ) : visible.length === 0 ? (
              <div className="empty">
                <b>No testimonials match that search</b>
                <span>Try a different name, or clear the filter.</span>
              </div>
            ) : (
              <div className="vall is-open">
                {visible.map((t) => <VoiceCard key={t.id} t={t} />)}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Testimonials;
