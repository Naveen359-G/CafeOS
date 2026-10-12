import type { Request, Response } from 'express';
import app from '../server';

export default function handler(req: Request, res: Response) {
  try {
    // 1. Resolve true request URL on Vercel
    const fwdUri = req.headers['x-forwarded-uri'] as string | undefined;
    const matchedPath = req.headers['x-matched-path'] as string | undefined;
    const queryPath = (req as any).query?.path;

    let targetPath = '';

    if (fwdUri && !fwdUri.includes('[') && !fwdUri.includes(']')) {
      targetPath = fwdUri;
    } else if (queryPath) {
      const joined = Array.isArray(queryPath) ? queryPath.join('/') : String(queryPath);
      if (joined && !joined.includes('[')) {
        targetPath = `/api/${joined}`;
      }
    } else if (matchedPath && !matchedPath.includes('[') && !matchedPath.includes(']')) {
      targetPath = matchedPath;
    } else if (req.url && !req.url.includes('[')) {
      targetPath = req.url;
    }

    if (targetPath) {
      // Ensure prefix with /api if it's an API route without /api
      if (!targetPath.startsWith('/api') && targetPath.startsWith('/')) {
        targetPath = `/api${targetPath}`;
      } else if (!targetPath.startsWith('/')) {
        targetPath = `/api/${targetPath}`;
      }
      req.url = targetPath;
    }

    // 2. Prevent Express body-parser from hanging on pre-parsed serverless bodies
    if (req.body && typeof req.body === 'object') {
      (req as any)._body = true;
    }

    // 3. Delegate to Express app
    return (app as any)(req, res);
  } catch (err: any) {
    console.error('Fatal error in Vercel API handler:', err);
    if (!res.headersSent) {
      res.status(200).json({
        error: 'Handler recovery',
        message: err?.message || 'Server processed request with fallback',
      });
    }
  }
}
