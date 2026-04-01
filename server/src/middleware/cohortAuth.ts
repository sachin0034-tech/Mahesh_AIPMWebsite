import type { Request, Response, NextFunction } from 'express';
import { validateToken } from '../lib/adminTokens.js';

export function requireCohortAdmin(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }
  const token = auth.slice(7);
  if (!validateToken(token)) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
    return;
  }
  next();
}
