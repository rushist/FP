export interface Employee {
  EmployeeID: number;
  FirstName: string;
  LastName: string;
  DepartmentID: number;
  Salary: number;
  Bonus: number | null;
  HireDate: string; // ISO date string (YYYY-MM-DD)
}

export interface EmployeeWithDepartment extends Employee {
  DepartmentName?: string;
  Location?: string | null;
}
