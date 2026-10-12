import type { Request, Response } from 'express';
import handler from './index';

export default function managerInsightHandler(req: Request, res: Response) {
  req.url = '/api/manager-insight';
  return handler(req, res);
}
