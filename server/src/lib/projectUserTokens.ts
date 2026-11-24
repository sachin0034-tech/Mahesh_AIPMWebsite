import crypto from 'crypto';

// Stateless, signed bearer tokens for project users: "<base64url payload>.<base64url HMAC>".
// Nothing is stored on the server, so a restart, a deploy or a second instance never logs anyone out.
// The signing secret is SESSION_SECRET when set; otherwise it is derived from DATABASE_URL, which is
// stable across restarts and instances and is never sent to clients.

const TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

function secret(): string {
  return (
    process.env.SESSION_SECRET ||
    crypto.createHash('sha256').update('myai-project-user-token:' + (process.env.DATABASE_URL || 'dev')).digest('hex')
  );
}

const b64u = (b: Buffer | string) => Buffer.from(b).toString('base64url');
const sign = (payload: string) => crypto.createHmac('sha256', secret()).update(payload).digest('base64url');

// Best-effort logout: a revoked token stops working on this instance until it would have expired anyway.
const revoked = new Map<string, number>();

function sweepRevoked(now: number) {
  for (const [t, exp] of revoked) if (exp < now) revoked.delete(t);
}

export function generateProjectUserToken(userId: string): string {
  const payload = b64u(JSON.stringify({ u: userId, e: Date.now() + TTL_MS }));
  return `${payload}.${sign(payload)}`;
}

export function validateProjectUserToken(token: string): string | null {
  if (typeof token !== 'string') return null;
  const dot = token.indexOf('.');
  if (dot < 1) return null;
  const payload = token.slice(0, dot);
  const given = token.slice(dot + 1);
  const expected = sign(payload);
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const { u, e } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { u?: string; e?: number };
    const now = Date.now();
    if (typeof u !== 'string' || typeof e !== 'number' || now > e) return null;
    sweepRevoked(now);
    if (revoked.has(token)) return null;
    return u;
  } catch {
    return null;
  }
}

export function revokeProjectUserToken(token: string): void {
  const dot = token.indexOf('.');
  if (dot < 1) return;
  try {
    const { e } = JSON.parse(Buffer.from(token.slice(0, dot), 'base64url').toString('utf8')) as { e?: number };
    revoked.set(token, typeof e === 'number' ? e : Date.now() + TTL_MS);
  } catch { /* ignore malformed tokens */ }
}
