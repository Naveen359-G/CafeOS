import type { Request, Response } from 'express';
import handler from './index';

export default function recommendationHandler(req: Request, res: Response) {
  req.url = '/api/recommendation';
  return handler(req, res);
}
