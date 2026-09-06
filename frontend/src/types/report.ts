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
