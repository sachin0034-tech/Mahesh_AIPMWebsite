import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export function getInitials(name: string) {
  const p = String(name ?? "").trim().split(/\s+/);
  return (((p[0] || "")[0] || "") + ((p[1] || "")[0] || "")).toUpperCase();
}

export const ArrowRight = () => (
  <svg className="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 12h14" /><path d="M13 6.5 18.5 12 13 17.5" /></svg>
);

export function Avatar({ name, src }: { name: string; src?: string | null }) {
  return src ? (
    <img className="av" loading="lazy" decoding="async" src={src} alt={name} />
  ) : (
    <span className="av-i" aria-hidden="true">{getInitials(name)}</span>
  );
}

// Fades/slides an element in the first time it scrolls into view.
export function Reveal({
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

export function Nav({ active = "home" }: { active?: "home" | "testimonials" }) {
  return (
    <nav className="nav">
      <div className="wrap nav-in">
        <Link to="/" className="logo"><span>MYAI</span><span>Community</span></Link>
        <div className="nav-links">
          <Link to="/" className={active === "home" ? "is-active" : ""} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>HOME</Link>
          {active === "testimonials" && <Link to="/testimonials" className="is-active">TESTIMONIALS</Link>}
        </div>
        <div className="nav-cta">
          <Link to="/project-login" className="btn btn-ghost btn-pill">PROJECT LOGIN</Link>
          <Link to="/cohort-admin" className="btn btn-dark">ADMIN LOGIN</Link>
        </div>
      </div>
    </nav>
  );
}

/** Fixed decorative background used by every .mc page. */
export function McBackground() {
  return (
    <div className="bg" aria-hidden="true">
      <div className="bg-rails"><i /><i /></div>
      <div className="bg-glow" />
      <div className="bg-glow-2" />
    </div>
  );
}
