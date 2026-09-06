export interface EmployeeResponse {
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
