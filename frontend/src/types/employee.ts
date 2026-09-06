export interface Employee {
  employeeId: number;
  firstName: string;
  lastName: string;
  departmentId: number;
  departmentName?: string;
  salary: number;
  bonus: number | null;
  hireDate: string;
  totalCompensation?: number;
}

export interface CreateEmployeePayload {
  firstName: string;
  lastName: string;
  departmentId: number;
  salary: number;
  bonus?: number | null;
  hireDate: string;
}

export interface UpdateEmployeePayload {
  firstName?: string;
  lastName?: string;
  departmentId?: number;
  salary?: number;
  bonus?: number | null;
  hireDate?: string;
}
