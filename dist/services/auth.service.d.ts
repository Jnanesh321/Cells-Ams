export declare class AuthService {
    static loginByUsn(usn: string, password: string): Promise<{
        accessToken: string;
        role: import(".prisma/client").$Enums.Role;
        user: {
            role: import(".prisma/client").$Enums.Role;
            id: number;
            usn: string;
            email: string | null;
            name: string;
            isActive: boolean;
            departmentId: number | null;
        };
    }>;
}
//# sourceMappingURL=auth.service.d.ts.map