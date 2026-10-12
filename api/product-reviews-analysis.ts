import type { Request, Response } from 'express';
import handler from './index';

export default function productReviewsAnalysisHandler(req: Request, res: Response) {
  req.url = '/api/product-reviews-analysis';
  return handler(req, res);
}
