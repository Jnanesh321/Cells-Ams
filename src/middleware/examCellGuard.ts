import type { NextFunction, Request, Response } from "express";

/**
 * Middleware that restricts absentee get operations.
 * Only EXAM_CELL role can view absentee lists.
 * This is layer 1 of the three-layer absentee protection:
 *   Layer 1 (this guard) → Layer 2 (service check) → Layer 3 (mobile UI)
 */
export function examCellGuard(req: Request, _res: Response, next: NextFunction) {
  if (req.user?.role !== "EXAM_CELL") {
    return next(Object.assign(new Error("Only EXAM_CELL can manage absentees"), { status: 403 }));
  }
  next();
}
