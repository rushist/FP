import { db } from '../database/connection';
import { EmployeeWithDepartment } from '../models/Employee';

export interface DepartmentBonusSummary {
  departmentId: number;
  departmentName: string;
  totalBonus: number;
  employeeCount: number;
}

export interface TotalBonusReport {
  totalBonus: number;
  totalEmployees: number;
  byDepartment: DepartmentBonusSummary[];
}

export interface BonusPercentageItem {
  employeeId: number;
  name: string;
  department: string;
  salary: number;
  bonus: number;
  bonusPercentage: number;
}

export interface DepartmentBonusVsSalaryItem {
  departmentId: number;
  departmentName: string;
  totalBonus: number;
  averageSalary: number;
  employeeCount: number;
}

export interface BonusRankingItem {
  rank: number | string;
  employeeId: number;
  name: string;
  department: string;
  salary: number;
  bonus: number | null;
  totalCompensation: number;
}

export interface HighestCompensationReport {
  highestSalaryEmployee: {
    employeeId: number;
    name: string;
    department: string;
    salary: number;
    bonus: number | null;
    totalCompensation: number;
  } | null;
  highestTotalCompensationEmployee: {
    employeeId: number;
    name: string;
    department: string;
    salary: number;
    bonus: number | null;
    totalCompensation: number;
  } | null;
  isSameEmployee: boolean;
}

export class CompensationRepository {
  /**
   * 10.1 Total Bonus across all employees (NULL bonuses counted as zero)
   */
  public async getTotalBonus(): Promise<TotalBonusReport> {
    if (db.isMemory()) {
      const emps = db.getMemoryEngine().getEmployees();
      const depts = db.getMemoryEngine().getDepartments();

      let totalBonus = 0;
      const deptMap = new Map<number, { name: string; totalBonus: number; count: number }>();
      for (const d of depts) {
        deptMap.set(d.DepartmentID, { name: d.DepartmentName, totalBonus: 0, count: 0 });
      }

      for (const e of emps) {
        const bonusVal = e.Bonus !== null && e.Bonus !== undefined ? Number(e.Bonus) : 0;
        totalBonus += bonusVal;
        const d = deptMap.get(e.DepartmentID);
        if (d) {
          d.totalBonus += bonusVal;
          d.count += 1;
        }
      }

      const byDepartment: DepartmentBonusSummary[] = Array.from(deptMap.entries()).map(([id, val]) => ({
        departmentId: id,
        departmentName: val.name,
        totalBonus: Number(val.totalBonus.toFixed(2)),
        employeeCount: val.count,
      }));

      return {
        totalBonus: Number(totalBonus.toFixed(2)),
        totalEmployees: emps.length,
        byDepartment,
      };
    }

    const pool = await db.getPool();
    const overallResult = await pool.request().query<{ TotalBonus: number; TotalEmployees: number }>(`
      SELECT 
        CAST(COALESCE(SUM(COALESCE(Bonus, 0)), 0) AS FLOAT) AS TotalBonus,
        COUNT(*) AS TotalEmployees
      FROM dbo.Employee;
    `);

    const deptResult = await pool.request().query<{
      DepartmentID: number;
      DepartmentName: string;
      TotalBonus: number;
      EmployeeCount: number;
    }>(`
      SELECT 
        d.DepartmentID,
        d.DepartmentName,
        CAST(COALESCE(SUM(COALESCE(e.Bonus, 0)), 0) AS FLOAT) AS TotalBonus,
        COUNT(e.EmployeeID) AS EmployeeCount
      FROM dbo.Department d
      LEFT JOIN dbo.Employee e ON d.DepartmentID = e.DepartmentID
      GROUP BY d.DepartmentID, d.DepartmentName
      ORDER BY d.DepartmentID ASC;
    `);

    return {
      totalBonus: overallResult.recordset[0]?.TotalBonus ?? 0,
      totalEmployees: overallResult.recordset[0]?.TotalEmployees ?? 0,
      byDepartment: deptResult.recordset.map((r) => ({
        departmentId: r.DepartmentID,
        departmentName: r.DepartmentName,
        totalBonus: r.TotalBonus,
        employeeCount: r.EmployeeCount,
      })),
    };
  }

  /**
   * 10.2 Employees without bonus (Bonus IS NULL; 0 is not NULL)
   */
  public async getEmployeesWithoutBonus(): Promise<EmployeeWithDepartment[]> {
    if (db.isMemory()) {
      return db
        .getMemoryEngine()
        .getEmployees()
        .filter((e) => e.Bonus === null || e.Bonus === undefined);
    }

    const pool = await db.getPool();
    const result = await pool.request().query<EmployeeWithDepartment>(`
      SELECT 
        e.EmployeeID, 
        e.FirstName, 
        e.LastName, 
        e.DepartmentID, 
        CAST(e.Salary AS FLOAT) AS Salary, 
        e.Bonus, 
        CONVERT(VARCHAR(10), e.HireDate, 120) AS HireDate,
        d.DepartmentName, 
        d.Location
      FROM dbo.Employee e
      INNER JOIN dbo.Department d ON e.DepartmentID = d.DepartmentID
      WHERE e.Bonus IS NULL
      ORDER BY e.EmployeeID ASC;
    `);

    return result.recordset;
  }

  /**
   * 10.3 Bonus percentage: (Bonus / Salary) * 100 rounded to 2 decimal places.
   * Excludes NULL bonus.
   */
  public async getBonusPercentages(): Promise<BonusPercentageItem[]> {
    if (db.isMemory()) {
      const emps = db
        .getMemoryEngine()
        .getEmployees()
        .filter((e) => e.Bonus !== null && e.Bonus !== undefined);

      return emps.map((e) => {
        const bonus = Number(e.Bonus);
        const salary = Number(e.Salary);
        const pct = salary > 0 ? (bonus / salary) * 100 : 0;
        return {
          employeeId: e.EmployeeID,
          name: `${e.FirstName} ${e.LastName}`,
          department: e.DepartmentName,
          salary,
          bonus,
          bonusPercentage: Number(pct.toFixed(2)),
        };
      });
    }

    const pool = await db.getPool();
    const result = await pool.request().query<{
      EmployeeID: number;
      FirstName: string;
      LastName: string;
      DepartmentName: string;
      Salary: number;
      Bonus: number;
      BonusPercentage: number;
    }>(`
      SELECT 
        e.EmployeeID,
        e.FirstName,
        e.LastName,
        d.DepartmentName,
        CAST(e.Salary AS FLOAT) AS Salary,
        CAST(e.Bonus AS FLOAT) AS Bonus,
        CAST(ROUND((CAST(e.Bonus AS FLOAT) / CAST(e.Salary AS FLOAT)) * 100.0, 2) AS FLOAT) AS BonusPercentage
      FROM dbo.Employee e
      INNER JOIN dbo.Department d ON e.DepartmentID = d.DepartmentID
      WHERE e.Bonus IS NOT NULL
      ORDER BY BonusPercentage DESC, e.EmployeeID ASC;
    `);

    return result.recordset.map((r) => ({
      employeeId: r.EmployeeID,
      name: `${r.FirstName} ${r.LastName}`,
      department: r.DepartmentName,
      salary: r.Salary,
      bonus: r.Bonus,
      bonusPercentage: r.BonusPercentage,
    }));
  }

  /**
   * 10.4 Department Bonus vs Average Salary:
   * Departments where Total Bonus > Department Average Salary
   * Treats NULL bonus as 0.
   */
  public async getDepartmentBonusVsSalary(): Promise<DepartmentBonusVsSalaryItem[]> {
    if (db.isMemory()) {
      const emps = db.getMemoryEngine().getEmployees();
      const depts = db.getMemoryEngine().getDepartments();

      const deptMap = new Map<
        number,
        { name: string; totalBonus: number; totalSalary: number; count: number }
      >();

      for (const d of depts) {
        deptMap.set(d.DepartmentID, { name: d.DepartmentName, totalBonus: 0, totalSalary: 0, count: 0 });
      }

      for (const e of emps) {
        const d = deptMap.get(e.DepartmentID);
        if (d) {
          d.totalBonus += e.Bonus !== null && e.Bonus !== undefined ? Number(e.Bonus) : 0;
          d.totalSalary += Number(e.Salary);
          d.count += 1;
        }
      }

      const qualifying: DepartmentBonusVsSalaryItem[] = [];
      for (const [id, val] of deptMap.entries()) {
        if (val.count > 0) {
          const avgSalary = val.totalSalary / val.count;
          if (val.totalBonus > avgSalary) {
            qualifying.push({
              departmentId: id,
              departmentName: val.name,
              totalBonus: Number(val.totalBonus.toFixed(2)),
              averageSalary: Number(avgSalary.toFixed(2)),
              employeeCount: val.count,
            });
          }
        }
      }
      return qualifying;
    }

    const pool = await db.getPool();
    const result = await pool.request().query<{
      DepartmentID: number;
      DepartmentName: string;
      TotalBonus: number;
      AverageSalary: number;
      EmployeeCount: number;
    }>(`
      SELECT 
        d.DepartmentID,
        d.DepartmentName,
        CAST(SUM(COALESCE(e.Bonus, 0)) AS FLOAT) AS TotalBonus,
        CAST(ROUND(AVG(CAST(e.Salary AS FLOAT)), 2) AS FLOAT) AS AverageSalary,
        COUNT(e.EmployeeID) AS EmployeeCount
      FROM dbo.Department d
      INNER JOIN dbo.Employee e ON d.DepartmentID = e.DepartmentID
      GROUP BY d.DepartmentID, d.DepartmentName
      HAVING SUM(COALESCE(e.Bonus, 0)) > AVG(CAST(e.Salary AS FLOAT))
      ORDER BY d.DepartmentID ASC;
    `);

    return result.recordset.map((r) => ({
      departmentId: r.DepartmentID,
      departmentName: r.DepartmentName,
      totalBonus: r.TotalBonus,
      averageSalary: r.AverageSalary,
      employeeCount: r.EmployeeCount,
    }));
  }

  /**
   * 10.5 Bonus Ranking:
   * Rank employees by bonus amount. Employees with bonuses appear first (highest first).
   * Employees with NULL bonuses appear last (rank '-' or numbered, not excluded).
   */
  public async getBonusRanking(): Promise<BonusRankingItem[]> {
    if (db.isMemory()) {
      const emps = db.getMemoryEngine().getEmployees();

      // Separate with bonus vs without bonus
      const withBonus = emps
        .filter((e) => e.Bonus !== null && e.Bonus !== undefined)
        .sort((a, b) => (Number(b.Bonus) !== Number(a.Bonus) ? Number(b.Bonus) - Number(a.Bonus) : Number(b.Salary) - Number(a.Salary)));

      const withoutBonus = emps
        .filter((e) => e.Bonus === null || e.Bonus === undefined)
        .sort((a, b) => Number(b.Salary) - Number(a.Salary));

      const result: BonusRankingItem[] = [];
      let rank = 1;

      for (const e of withBonus) {
        const bonus = Number(e.Bonus);
        const salary = Number(e.Salary);
        result.push({
          rank: rank++,
          employeeId: e.EmployeeID,
          name: `${e.FirstName} ${e.LastName}`,
          department: e.DepartmentName,
          salary,
          bonus,
          totalCompensation: salary + bonus,
        });
      }

      for (const e of withoutBonus) {
        const salary = Number(e.Salary);
        result.push({
          rank: '-',
          employeeId: e.EmployeeID,
          name: `${e.FirstName} ${e.LastName}`,
          department: e.DepartmentName,
          salary,
          bonus: null,
          totalCompensation: salary,
        });
      }

      return result;
    }

    const pool = await db.getPool();
    const result = await pool.request().query<{
      RankVal: number | null;
      EmployeeID: number;
      FirstName: string;
      LastName: string;
      DepartmentName: string;
      Salary: number;
      Bonus: number | null;
      TotalCompensation: number;
    }>(`
      SELECT 
        CASE 
          WHEN e.Bonus IS NOT NULL 
          THEN DENSE_RANK() OVER (ORDER BY CASE WHEN e.Bonus IS NOT NULL THEN 0 ELSE 1 END, e.Bonus DESC)
          ELSE NULL 
        END AS RankVal,
        e.EmployeeID,
        e.FirstName,
        e.LastName,
        d.DepartmentName,
        CAST(e.Salary AS FLOAT) AS Salary,
        CAST(e.Bonus AS FLOAT) AS Bonus,
        CAST(e.Salary + COALESCE(e.Bonus, 0) AS FLOAT) AS TotalCompensation
      FROM dbo.Employee e
      INNER JOIN dbo.Department d ON e.DepartmentID = d.DepartmentID
      ORDER BY 
        CASE WHEN e.Bonus IS NULL THEN 1 ELSE 0 END ASC,
        e.Bonus DESC,
        TotalCompensation DESC,
        e.EmployeeID ASC;
    `);

    return result.recordset.map((r) => ({
      rank: r.RankVal !== null ? r.RankVal : '-',
      employeeId: r.EmployeeID,
      name: `${r.FirstName} ${r.LastName}`,
      department: r.DepartmentName,
      salary: r.Salary,
      bonus: r.Bonus,
      totalCompensation: r.TotalCompensation,
    }));
  }

  /**
   * 10.6 Highest Salary and Compensation Comparison
   * Returns:
   * 1. Employee with highest base salary
   * 2. Employee with highest total compensation (Salary + COALESCE(Bonus, 0))
   * 3. Whether they are the same employee
   */
  public async getHighestCompensationComparison(): Promise<HighestCompensationReport> {
    if (db.isMemory()) {
      const emps = db.getMemoryEngine().getEmployees();
      if (emps.length === 0) {
        return {
          highestSalaryEmployee: null,
          highestTotalCompensationEmployee: null,
          isSameEmployee: false,
        };
      }

      let highestSalaryEmp = emps[0];
      let highestCompEmp = emps[0];
      let highestCompVal = Number(emps[0].Salary) + (emps[0].Bonus !== null && emps[0].Bonus !== undefined ? Number(emps[0].Bonus) : 0);

      for (const e of emps) {
        const salary = Number(e.Salary);
        const comp = salary + (e.Bonus !== null && e.Bonus !== undefined ? Number(e.Bonus) : 0);

        if (salary > Number(highestSalaryEmp.Salary)) {
          highestSalaryEmp = e;
        }
        if (comp > highestCompVal) {
          highestCompVal = comp;
          highestCompEmp = e;
        }
      }

      const mapToItem = (e: EmployeeWithDepartment) => {
        const bonus = e.Bonus !== null && e.Bonus !== undefined ? Number(e.Bonus) : null;
        const salary = Number(e.Salary);
        return {
          employeeId: e.EmployeeID,
          name: `${e.FirstName} ${e.LastName}`,
          department: e.DepartmentName ?? 'Unknown',
          salary,
          bonus,
          totalCompensation: salary + (bonus ?? 0),
        };
      };

      return {
        highestSalaryEmployee: mapToItem(highestSalaryEmp),
        highestTotalCompensationEmployee: mapToItem(highestCompEmp),
        isSameEmployee: highestSalaryEmp.EmployeeID === highestCompEmp.EmployeeID,
      };
    }

    const pool = await db.getPool();
    const highestSalaryResult = await pool.request().query<{
      EmployeeID: number;
      FirstName: string;
      LastName: string;
      DepartmentName: string;
      Salary: number;
      Bonus: number | null;
      TotalCompensation: number;
    }>(`
      SELECT TOP 1 
        e.EmployeeID,
        e.FirstName,
        e.LastName,
        d.DepartmentName,
        CAST(e.Salary AS FLOAT) AS Salary,
        CAST(e.Bonus AS FLOAT) AS Bonus,
        CAST(e.Salary + COALESCE(e.Bonus, 0) AS FLOAT) AS TotalCompensation
      FROM dbo.Employee e
      INNER JOIN dbo.Department d ON e.DepartmentID = d.DepartmentID
      ORDER BY e.Salary DESC, e.EmployeeID ASC;
    `);

    const highestCompResult = await pool.request().query<{
      EmployeeID: number;
      FirstName: string;
      LastName: string;
      DepartmentName: string;
      Salary: number;
      Bonus: number | null;
      TotalCompensation: number;
    }>(`
      SELECT TOP 1 
        e.EmployeeID,
        e.FirstName,
        e.LastName,
        d.DepartmentName,
        CAST(e.Salary AS FLOAT) AS Salary,
        CAST(e.Bonus AS FLOAT) AS Bonus,
        CAST(e.Salary + COALESCE(e.Bonus, 0) AS FLOAT) AS TotalCompensation
      FROM dbo.Employee e
      INNER JOIN dbo.Department d ON e.DepartmentID = d.DepartmentID
      ORDER BY (e.Salary + COALESCE(e.Bonus, 0)) DESC, e.EmployeeID ASC;
    `);

    const sEmp = highestSalaryResult.recordset[0];
    const cEmp = highestCompResult.recordset[0];

    const highestSalaryEmployee = sEmp
      ? {
          employeeId: sEmp.EmployeeID,
          name: `${sEmp.FirstName} ${sEmp.LastName}`,
          department: sEmp.DepartmentName,
          salary: sEmp.Salary,
          bonus: sEmp.Bonus,
          totalCompensation: sEmp.TotalCompensation,
        }
      : null;

    const highestTotalCompensationEmployee = cEmp
      ? {
          employeeId: cEmp.EmployeeID,
          name: `${cEmp.FirstName} ${cEmp.LastName}`,
          department: cEmp.DepartmentName,
          salary: cEmp.Salary,
          bonus: cEmp.Bonus,
          totalCompensation: cEmp.TotalCompensation,
        }
      : null;

    return {
      highestSalaryEmployee,
      highestTotalCompensationEmployee,
      isSameEmployee:
        highestSalaryEmployee !== null &&
        highestTotalCompensationEmployee !== null &&
        highestSalaryEmployee.employeeId === highestTotalCompensationEmployee.employeeId,
    };
  }
}
