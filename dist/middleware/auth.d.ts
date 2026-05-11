import type { NextFunction, Request, Response } from "express";
export type AuthUser = {
    id: number;
    usn: string;
    name: string;
    email: string | null;
    role: import("@prisma/client").Role;
    isActive: boolean;
    departmentId: number | null;
};
declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}
export declare function auth(req: Request, _res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=auth.d.ts.map