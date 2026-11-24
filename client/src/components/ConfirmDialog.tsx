import React, { useCallback, useEffect, useRef, useState } from "react";

type Opts = { title: string; message: string; confirmLabel: string; danger?: boolean };

/** Promise-based confirm card. Render `dialog` inside the `.mc` wrapper, call `ask(...)` and await the answer. */
export function useConfirm() {
  const [opts, setOpts] = useState<Opts | null>(null);
  const resolver = useRef<((v: boolean) => void) | null>(null);

  const ask = useCallback((o: Opts) => new Promise<boolean>((resolve) => {
    resolver.current = resolve;
    setOpts(o);
  }), []);

  const close = (v: boolean) => {
    resolver.current?.(v);
    resolver.current = null;
    setOpts(null);
  };

  useEffect(() => {
    if (!opts) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") close(false); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [opts]);

  const dialog = opts ? (
    <div className="b-confirm-back" onMouseDown={(e) => { if (e.target === e.currentTarget) close(false); }}>
      <div className="b-confirm" role="dialog" aria-modal="true" aria-labelledby="b-confirm-title">
        <h3 id="b-confirm-title">{opts.title}</h3>
        <p>{opts.message}</p>
        <div className="b-confirm-actions">
          <button type="button" className="btn btn-ghost btn-pill" onClick={() => close(false)}>Cancel</button>
          <button type="button" autoFocus className={`btn btn-pill ${opts.danger ? "b-confirm-danger" : "btn-dark"}`} onClick={() => close(true)}>
            {opts.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return { ask, dialog };
}
