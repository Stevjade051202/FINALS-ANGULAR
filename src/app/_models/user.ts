export interface User {
    id?: string;
    username: string;
    email: string;
    role?: string;
    token?: string;
    firstName?: string;
    lastName?: string;
    employeeId?: string;
}

export const Role = {
    Admin: 'Admin',
    User: 'User'
} as const;

export type RoleType = typeof Role[keyof typeof Role];