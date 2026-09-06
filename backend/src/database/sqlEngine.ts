import { Department } from '../models/Department';
import { Employee } from '../models/Employee';
import { ValidationError, ConflictError } from '../utils/errors';

export interface SqlQueryParam {
  name: string;
  value: unknown;
}

/**
 * Robust in-memory SQL execution engine that implements relational data operations,
 * constraints, identity generation, foreign keys, and SQL Server aggregation semantics.
 * Used for fast, reliable local development and automated testing without external dependencies.
 */
export class MemorySqlEngine {
  private departments: Map<number, Department> = new Map();
  private employees: Map<number, Employee> = new Map();
  private nextEmployeeId = 101;
  private nextDepartmentId = 1;

  constructor() {
    this.seedDefaults();
  }

  public reset(): void {
    this.departments.clear();
    this.employees.clear();
    this.nextEmployeeId = 101;
    this.nextDepartmentId = 1;
    this.seedDefaults();
  }

  private seedDefaults(): void {
    // 5 Departments matching schema and reference UI
    const defaultDepartments: Department[] = [
      { DepartmentID: 1, DepartmentName: 'Engineering', Location: 'Building A - Bengaluru' },
      { DepartmentID: 2, DepartmentName: 'Sales', Location: 'Tower B - Mumbai' },
      { DepartmentID: 3, DepartmentName: 'HR', Location: 'Building A - Bengaluru' },
      { DepartmentID: 4, DepartmentName: 'Finance', Location: 'Cyber City - Gurugram' },
      { DepartmentID: 5, DepartmentName: 'Operations', Location: 'Hitec City - Hyderabad' },
    ];
    for (const d of defaultDepartments) {
      this.departments.set(d.DepartmentID, { ...d });
      if (d.DepartmentID >= this.nextDepartmentId) {
        this.nextDepartmentId = d.DepartmentID + 1;
      }
    }

    // 24 Employees matching exact seed data and wireframe metrics with Indian names
    const defaultEmployees: Employee[] = [
      // Engineering (8 employees, Total Bonus = ₹55,000)
      { EmployeeID: 101, FirstName: 'Aarav', LastName: 'Sharma', DepartmentID: 1, Salary: 120000.00, Bonus: 10000.00, HireDate: '2022-01-15' },
      { EmployeeID: 103, FirstName: 'Rohan', LastName: 'Verma', DepartmentID: 1, Salary: 110000.00, Bonus: null, HireDate: '2023-07-10' },
      { EmployeeID: 108, FirstName: 'Diya', LastName: 'Mukherjee', DepartmentID: 1, Salary: 115000.00, Bonus: 10000.00, HireDate: '2020-04-25' },
      { EmployeeID: 109, FirstName: 'Aditya', LastName: 'Joshi', DepartmentID: 1, Salary: 105000.00, Bonus: 8000.00, HireDate: '2021-08-14' },
      { EmployeeID: 110, FirstName: 'Kavya', LastName: 'Nair', DepartmentID: 1, Salary: 95000.00, Bonus: 7000.00, HireDate: '2022-11-01' },
      { EmployeeID: 111, FirstName: 'Rahul', LastName: 'Mehta', DepartmentID: 1, Salary: 102000.00, Bonus: 9000.00, HireDate: '2021-02-20' },
      { EmployeeID: 112, FirstName: 'Pooja', LastName: 'Deshmukh', DepartmentID: 1, Salary: 98000.00, Bonus: 11000.00, HireDate: '2023-03-15' },
      { EmployeeID: 113, FirstName: 'Siddharth', LastName: 'Rao', DepartmentID: 1, Salary: 85000.00, Bonus: 0.00, HireDate: '2024-01-10' },

      // Sales (6 employees, Total Bonus = ₹48,000)
      { EmployeeID: 102, FirstName: 'Priya', LastName: 'Patel', DepartmentID: 2, Salary: 95000.00, Bonus: 8000.00, HireDate: '2021-03-22' },
      { EmployeeID: 106, FirstName: 'Sneha', LastName: 'Kulkarni', DepartmentID: 2, Salary: 98000.00, Bonus: null, HireDate: '2022-09-30' },
      { EmployeeID: 114, FirstName: 'Neha', LastName: 'Gupta', DepartmentID: 2, Salary: 90000.00, Bonus: 12000.00, HireDate: '2020-05-19' },
      { EmployeeID: 115, FirstName: 'Manish', LastName: 'Kumar', DepartmentID: 2, Salary: 88000.00, Bonus: 10000.00, HireDate: '2021-10-04' },
      { EmployeeID: 116, FirstName: 'Ritu', LastName: 'Sen', DepartmentID: 2, Salary: 92000.00, Bonus: 9000.00, HireDate: '2022-06-11' },
      { EmployeeID: 117, FirstName: 'Kunal', LastName: 'Bhatia', DepartmentID: 2, Salary: 87000.00, Bonus: 9000.00, HireDate: '2023-08-22' },

      // HR (3 employees, Total Bonus = ₹12,000)
      { EmployeeID: 104, FirstName: 'Ananya', LastName: 'Iyer', DepartmentID: 3, Salary: 80000.00, Bonus: 5000.00, HireDate: '2020-11-05' },
      { EmployeeID: 118, FirstName: 'Meera', LastName: 'Nambiar', DepartmentID: 3, Salary: 75000.00, Bonus: 4000.00, HireDate: '2022-04-18' },
      { EmployeeID: 119, FirstName: 'Tanvi', LastName: 'Kapoor', DepartmentID: 3, Salary: 72000.00, Bonus: 3000.00, HireDate: '2023-09-01' },

      // Finance (4 employees, Total Bonus = ₹45,000; Avg Salary = ₹41,250 -> Total Bonus > Avg Salary)
      { EmployeeID: 105, FirstName: 'Vikram', LastName: 'Malhotra', DepartmentID: 4, Salary: 105000.00, Bonus: 28000.00, HireDate: '2019-06-18' },
      { EmployeeID: 120, FirstName: 'Rajesh', LastName: 'Singhal', DepartmentID: 4, Salary: 20000.00, Bonus: 7000.00, HireDate: '2022-05-12' },
      { EmployeeID: 121, FirstName: 'Suresh', LastName: 'Pillai', DepartmentID: 4, Salary: 20000.00, Bonus: 6000.00, HireDate: '2023-01-25' },
      { EmployeeID: 122, FirstName: 'Divya', LastName: 'Chawla', DepartmentID: 4, Salary: 20000.00, Bonus: 4000.00, HireDate: '2023-11-10' },

      // Operations (3 employees, Total Bonus = ₹25,000)
      { EmployeeID: 107, FirstName: 'Arjun', LastName: 'Reddy', DepartmentID: 5, Salary: 85000.00, Bonus: 7500.00, HireDate: '2021-12-12' },
      { EmployeeID: 123, FirstName: 'Harish', LastName: 'Chandra', DepartmentID: 5, Salary: 82000.00, Bonus: 9500.00, HireDate: '2022-02-14' },
      { EmployeeID: 124, FirstName: 'Varun', LastName: 'Menon', DepartmentID: 5, Salary: 80000.00, Bonus: 8000.00, HireDate: '2023-05-30' },
    ];

    for (const emp of defaultEmployees) {
      this.employees.set(emp.EmployeeID, { ...emp });
      if (emp.EmployeeID >= this.nextEmployeeId) {
        this.nextEmployeeId = emp.EmployeeID + 1;
      }
    }
  }

  public getDepartments(): Department[] {
    return Array.from(this.departments.values());
  }

  public getDepartmentById(id: number): Department | null {
    return this.departments.get(id) || null;
  }

  public getEmployees(departmentId?: number): (Employee & { DepartmentName: string; Location: string | null })[] {
    const list = Array.from(this.employees.values());
    const filtered = departmentId !== undefined ? list.filter((e) => e.DepartmentID === departmentId) : list;
    return filtered.map((e) => {
      const dept = this.departments.get(e.DepartmentID);
      return {
        ...e,
        DepartmentName: dept ? dept.DepartmentName : 'Unknown',
        Location: dept ? dept.Location : null,
      };
    });
  }

  public getEmployeeById(id: number): (Employee & { DepartmentName: string; Location: string | null }) | null {
    const emp = this.employees.get(id);
    if (!emp) return null;
    const dept = this.departments.get(emp.DepartmentID);
    return {
      ...emp,
      DepartmentName: dept ? dept.DepartmentName : 'Unknown',
      Location: dept ? dept.Location : null,
    };
  }

  public insertEmployee(data: {
    FirstName: string;
    LastName: string;
    DepartmentID: number;
    Salary: number;
    Bonus: number | null;
    HireDate: string;
  }): Employee & { DepartmentName: string; Location: string | null } {
    // Constraint CK_Employee_Salary CHECK (Salary > 0)
    if (data.Salary <= 0) {
      throw new ValidationError('Database constraint violation: Salary must be greater than zero');
    }
    // Constraint CK_Employee_Bonus CHECK (Bonus >= 0 OR Bonus IS NULL)
    if (data.Bonus !== null && data.Bonus !== undefined && data.Bonus < 0) {
      throw new ValidationError('Database constraint violation: Bonus must be zero or greater or NULL');
    }
    // Constraint CK_Employee_HireDate CHECK (HireDate <= CAST(GETDATE() AS DATE))
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (data.HireDate > todayStr) {
      throw new ValidationError('Database constraint violation: Hire date cannot be in the future');
    }
    // Foreign Key FK_Employee_Department
    const dept = this.departments.get(data.DepartmentID);
    if (!dept) {
      throw new ValidationError(`Foreign key constraint violation: DepartmentID ${data.DepartmentID} does not exist`);
    }

    const id = this.nextEmployeeId++;
    const newEmp: Employee = {
      EmployeeID: id,
      FirstName: data.FirstName,
      LastName: data.LastName,
      DepartmentID: data.DepartmentID,
      Salary: Number(data.Salary),
      Bonus: data.Bonus !== null && data.Bonus !== undefined ? Number(data.Bonus) : null,
      HireDate: data.HireDate,
    };
    this.employees.set(id, newEmp);

    return {
      ...newEmp,
      DepartmentName: dept.DepartmentName,
      Location: dept.Location,
    };
  }

  public updateEmployee(
    id: number,
    data: {
      FirstName?: string;
      LastName?: string;
      DepartmentID?: number;
      Salary?: number;
      Bonus?: number | null;
      HireDate?: string;
    }
  ): (Employee & { DepartmentName: string; Location: string | null }) | null {
    const emp = this.employees.get(id);
    if (!emp) return null;

    if (data.Salary !== undefined && data.Salary <= 0) {
      throw new ValidationError('Database constraint violation: Salary must be greater than zero');
    }
    if (data.Bonus !== undefined && data.Bonus !== null && data.Bonus < 0) {
      throw new ValidationError('Database constraint violation: Bonus must be zero or greater or NULL');
    }
    if (data.DepartmentID !== undefined) {
      const dept = this.departments.get(data.DepartmentID);
      if (!dept) {
        throw new ValidationError(`Foreign key constraint violation: DepartmentID ${data.DepartmentID} does not exist`);
      }
    }
    if (data.HireDate !== undefined) {
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      if (data.HireDate > todayStr) {
        throw new ValidationError('Database constraint violation: Hire date cannot be in the future');
      }
    }

    const updated: Employee = {
      ...emp,
      FirstName: data.FirstName !== undefined ? data.FirstName : emp.FirstName,
      LastName: data.LastName !== undefined ? data.LastName : emp.LastName,
      DepartmentID: data.DepartmentID !== undefined ? data.DepartmentID : emp.DepartmentID,
      Salary: data.Salary !== undefined ? Number(data.Salary) : emp.Salary,
      Bonus: data.Bonus !== undefined ? (data.Bonus !== null ? Number(data.Bonus) : null) : emp.Bonus,
      HireDate: data.HireDate !== undefined ? data.HireDate : emp.HireDate,
    };
    this.employees.set(id, updated);

    const dept = this.departments.get(updated.DepartmentID);
    return {
      ...updated,
      DepartmentName: dept ? dept.DepartmentName : 'Unknown',
      Location: dept ? dept.Location : null,
    };
  }

  public deleteEmployee(id: number): boolean {
    return this.employees.delete(id);
  }
}
