import * as sql from 'mssql';
import { db } from '../database/connection';
import { EmployeeWithDepartment } from '../models/Employee';
import { CreateEmployeeRequest } from '../dto/CreateEmployeeRequest';
import { UpdateEmployeeRequest } from '../dto/UpdateEmployeeRequest';

export class EmployeeRepository {
  public async create(data: CreateEmployeeRequest): Promise<EmployeeWithDepartment> {
    if (db.isMemory()) {
      return db.getMemoryEngine().insertEmployee({
        FirstName: data.firstName,
        LastName: data.lastName,
        DepartmentID: data.departmentId,
        Salary: data.salary,
        Bonus: data.bonus !== undefined ? data.bonus : null,
        HireDate: data.hireDate,
      });
    }

    const pool = await db.getPool();
    const result = await pool
      .request()
      .input('firstName', sql.NVarChar(50), data.firstName)
      .input('lastName', sql.NVarChar(50), data.lastName)
      .input('departmentId', sql.Int, data.departmentId)
      .input('salary', sql.Decimal(12, 2), data.salary)
      .input('bonus', sql.Decimal(12, 2), data.bonus !== undefined ? data.bonus : null)
      .input('hireDate', sql.Date, data.hireDate)
      .query<{ EmployeeID: number }>(`
        INSERT INTO dbo.Employee (FirstName, LastName, DepartmentID, Salary, Bonus, HireDate)
        OUTPUT INSERTED.EmployeeID
        VALUES (@firstName, @lastName, @departmentId, @salary, @bonus, @hireDate);
      `);

    const createdId = result.recordset[0].EmployeeID;
    const employee = await this.getById(createdId);
    if (!employee) {
      throw new Error('Failed to retrieve newly created employee');
    }
    return employee;
  }

  public async getById(id: number): Promise<EmployeeWithDepartment | null> {
    if (db.isMemory()) {
      return db.getMemoryEngine().getEmployeeById(id);
    }

    const pool = await db.getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query<EmployeeWithDepartment>(`
        SELECT 
          e.EmployeeID, 
          e.FirstName, 
          e.LastName, 
          e.DepartmentID, 
          CAST(e.Salary AS FLOAT) AS Salary, 
          CAST(e.Bonus AS FLOAT) AS Bonus, 
          CONVERT(VARCHAR(10), e.HireDate, 120) AS HireDate,
          d.DepartmentName, 
          d.Location
        FROM dbo.Employee e
        INNER JOIN dbo.Department d ON e.DepartmentID = d.DepartmentID
        WHERE e.EmployeeID = @id
      `);

    return result.recordset.length > 0 ? result.recordset[0] : null;
  }

  public async list(departmentId?: number): Promise<EmployeeWithDepartment[]> {
    if (db.isMemory()) {
      return db.getMemoryEngine().getEmployees(departmentId);
    }

    const pool = await db.getPool();
    const request = pool.request();

    let sqlQuery = `
      SELECT 
        e.EmployeeID, 
        e.FirstName, 
        e.LastName, 
        e.DepartmentID, 
        CAST(e.Salary AS FLOAT) AS Salary, 
        CAST(e.Bonus AS FLOAT) AS Bonus, 
        CONVERT(VARCHAR(10), e.HireDate, 120) AS HireDate,
        d.DepartmentName, 
        d.Location
      FROM dbo.Employee e
      INNER JOIN dbo.Department d ON e.DepartmentID = d.DepartmentID
    `;

    if (departmentId !== undefined) {
      request.input('departmentId', sql.Int, departmentId);
      sqlQuery += ` WHERE e.DepartmentID = @departmentId`;
    }

    sqlQuery += ` ORDER BY e.EmployeeID ASC`;

    const result = await request.query<EmployeeWithDepartment>(sqlQuery);
    return result.recordset;
  }

  public async update(id: number, data: UpdateEmployeeRequest): Promise<EmployeeWithDepartment | null> {
    if (db.isMemory()) {
      return db.getMemoryEngine().updateEmployee(id, {
        FirstName: data.firstName,
        LastName: data.lastName,
        DepartmentID: data.departmentId,
        Salary: data.salary,
        Bonus: data.bonus,
        HireDate: data.hireDate,
      });
    }

    const existing = await this.getById(id);
    if (!existing) return null;

    const pool = await db.getPool();
    const request = pool.request();
    request.input('id', sql.Int, id);

    const setClauses: string[] = [];
    if (data.firstName !== undefined) {
      request.input('firstName', sql.NVarChar(50), data.firstName);
      setClauses.push('FirstName = @firstName');
    }
    if (data.lastName !== undefined) {
      request.input('lastName', sql.NVarChar(50), data.lastName);
      setClauses.push('LastName = @lastName');
    }
    if (data.departmentId !== undefined) {
      request.input('departmentId', sql.Int, data.departmentId);
      setClauses.push('DepartmentID = @departmentId');
    }
    if (data.salary !== undefined) {
      request.input('salary', sql.Decimal(12, 2), data.salary);
      setClauses.push('Salary = @salary');
    }
    if (data.bonus !== undefined) {
      request.input('bonus', sql.Decimal(12, 2), data.bonus);
      setClauses.push('Bonus = @bonus');
    }
    if (data.hireDate !== undefined) {
      request.input('hireDate', sql.Date, data.hireDate);
      setClauses.push('HireDate = @hireDate');
    }

    if (setClauses.length > 0) {
      await request.query(`
        UPDATE dbo.Employee
        SET ${setClauses.join(', ')}
        WHERE EmployeeID = @id
      `);
    }

    return this.getById(id);
  }

  public async delete(id: number): Promise<boolean> {
    if (db.isMemory()) {
      return db.getMemoryEngine().deleteEmployee(id);
    }

    const pool = await db.getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query(`
        DELETE FROM dbo.Employee
        WHERE EmployeeID = @id
      `);

    return (result.rowsAffected[0] || 0) > 0;
  }
}
