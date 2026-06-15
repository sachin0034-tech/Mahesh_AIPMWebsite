// ─── Single source of truth for the backend URL ───────────────────────────────
// Local dev  → set VITE_API_URL in client/.env
// Production → set VITE_API_URL in netlify.toml  ← only place to change it
// ─────────────────────────────────────────────────────────────────────────────

export const API_BASE_URL = import.meta.env.VITE_API_URL as string;
export const SERVER_ORIGIN = API_BASE_URL?.replace(/\/api$/, '') ?? '';
