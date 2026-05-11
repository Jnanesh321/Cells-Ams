import { Role } from "@prisma/client";
export type AccessTokenPayload = {
    sub: string;
    role: Role;
};
export declare function signAccessToken(payload: AccessTokenPayload): string;
export declare function verifyAccessToken(token: string): AccessTokenPayload;
//# sourceMappingURL=jwt.d.ts.map