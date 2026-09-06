import {
  CompensationRepository,
  TotalBonusReport,
  BonusPercentageItem,
  DepartmentBonusVsSalaryItem,
  BonusRankingItem,
  HighestCompensationReport,
} from '../repositories/CompensationRepository';
import { EmployeeWithDepartment } from '../models/Employee';

import { EmployeeResponse } from '../dto/EmployeeResponse';

export class CompensationService {
  private repo: CompensationRepository;

  constructor(repo: CompensationRepository = new CompensationRepository()) {
    this.repo = repo;
  }

  public async getTotalBonus(): Promise<TotalBonusReport> {
    return this.repo.getTotalBonus();
  }

  public async getEmployeesWithoutBonus(): Promise<EmployeeResponse[]> {
    const list = await this.repo.getEmployeesWithoutBonus();
    return list.map((e) => ({
      employeeId: e.EmployeeID,
      firstName: e.FirstName,
      lastName: e.LastName,
      departmentId: e.DepartmentID,
      departmentName: e.DepartmentName ?? 'Unknown',
      salary: e.Salary,
      bonus: null,
      hireDate: e.HireDate,
      totalCompensation: e.Salary,
    }));
  }

  public async getBonusPercentages(): Promise<BonusPercentageItem[]> {
    return this.repo.getBonusPercentages();
  }

  public async getDepartmentBonusVsSalary(): Promise<DepartmentBonusVsSalaryItem[]> {
    return this.repo.getDepartmentBonusVsSalary();
  }

  public async getBonusRanking(): Promise<BonusRankingItem[]> {
    return this.repo.getBonusRanking();
  }

  public async getHighestCompensationComparison(): Promise<HighestCompensationReport> {
    return this.repo.getHighestCompensationComparison();
  }
}
