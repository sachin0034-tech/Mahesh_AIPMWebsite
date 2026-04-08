import crypto from 'crypto';

interface TokenEntry {
  expiry: number;
  userId: string;
}

// In-memory token store for project users
const tokens = new Map<string, TokenEntry>();

const TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

export function generateProjectUserToken(userId: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  tokens.set(token, { expiry: Date.now() + TTL_MS, userId });
  return token;
}

export function validateProjectUserToken(token: string): string | null {
  const entry = tokens.get(token);
  if (!entry) return null;
  if (Date.now() > entry.expiry) { tokens.delete(token); return null; }
  return entry.userId;
}

export function revokeProjectUserToken(token: string): void {
  tokens.delete(token);
}
