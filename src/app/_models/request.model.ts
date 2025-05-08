export interface Request {
    id?: number;
    type: string;
    employeeId: number;
    employeeName: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    items: RequestItem[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface RequestItem {
    id?: number;
    name: string;
    quantity: number;
}