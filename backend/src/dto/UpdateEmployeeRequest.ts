export interface UpdateEmployeeRequest {
  firstName?: string;
  lastName?: string;
  departmentId?: number;
  salary?: number;
  bonus?: number | null;
  hireDate?: string;
}
