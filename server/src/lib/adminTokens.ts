import crypto from 'crypto';

// In-memory token store — simple for single-admin use case
const tokens = new Map<string, number>(); // token → expiry timestamp

const TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

export function generateToken(): string {
  const token = crypto.randomBytes(32).toString('hex');
  tokens.set(token, Date.now() + TTL_MS);
  return token;
}

export function validateToken(token: string): boolean {
  const expiry = tokens.get(token);
  if (!expiry) return false;
  if (Date.now() > expiry) { tokens.delete(token); return false; }
  return true;
}

export function revokeToken(token: string): void {
  tokens.delete(token);
}
