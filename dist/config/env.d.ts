import { z } from "zod";
declare const envSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    PORT: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    DATABASE_URL: z.ZodString;
    JWT_ACCESS_SECRET: z.ZodString;
    JWT_ACCESS_EXPIRES_IN: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    CORS_ORIGIN: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    NODE_ENV: string;
    PORT: number;
    DATABASE_URL: string;
    JWT_ACCESS_SECRET: string;
    JWT_ACCESS_EXPIRES_IN: string;
    CORS_ORIGIN?: string | undefined;
}, {
    DATABASE_URL: string;
    JWT_ACCESS_SECRET: string;
    NODE_ENV?: string | undefined;
    PORT?: number | undefined;
    JWT_ACCESS_EXPIRES_IN?: string | undefined;
    CORS_ORIGIN?: string | undefined;
}>;
export type Env = z.infer<typeof envSchema>;
export declare const env: Env;
export {};
//# sourceMappingURL=env.d.ts.map