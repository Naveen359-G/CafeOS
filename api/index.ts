import type { Request, Response } from 'express';
import app from '../server';

export default function handler(req: Request, res: Response) {
  // Ensure request URL maintains the /api prefix when dispatched through Vercel rewrites
  if (req.url && !req.url.startsWith('/api') && !req.url.startsWith('/assets')) {
    req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
  }
  return (app as any)(req, res);
}
