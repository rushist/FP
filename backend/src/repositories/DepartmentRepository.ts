import * as sql from 'mssql';
import { db } from '../database/connection';
import { Department } from '../models/Department';

export class DepartmentRepository {
  public async getAll(): Promise<Department[]> {
    if (db.isMemory()) {
      return db.getMemoryEngine().getDepartments();
    }

    const pool = await db.getPool();
    const result = await pool.request().query<Department>(`
      SELECT DepartmentID, DepartmentName, Location
      FROM dbo.Department
      ORDER BY DepartmentName ASC
    `);
    return result.recordset;
  }

  public async getById(id: number): Promise<Department | null> {
    if (db.isMemory()) {
      return db.getMemoryEngine().getDepartmentById(id);
    }

    const pool = await db.getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query<Department>(`
        SELECT DepartmentID, DepartmentName, Location
        FROM dbo.Department
        WHERE DepartmentID = @id
      `);

    return result.recordset.length > 0 ? result.recordset[0] : null;
  }

  public async exists(id: number): Promise<boolean> {
    const dept = await this.getById(id);
    return dept !== null;
  }
}
