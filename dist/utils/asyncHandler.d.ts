import type { NextFunction, Request, Response, RequestHandler } from "express";
export declare function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler;
//# sourceMappingURL=asyncHandler.d.ts.map