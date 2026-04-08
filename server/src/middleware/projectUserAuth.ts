import type { Request, Response, NextFunction } from 'express';
import { validateProjectUserToken } from '../lib/projectUserTokens.js';

// Extend Express Request to carry projectUserId
declare global {
  namespace Express {
    interface Request {
      projectUserId?: string;
    }
  }
}

export function requireProjectUser(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }
  const token = auth.slice(7);
  const userId = validateProjectUserToken(token);
  if (!userId) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
    return;
  }
  req.projectUserId = userId;
  next();
}
