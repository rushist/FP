import { Employee, CreateEmployeePayload, UpdateEmployeePayload } from '../types/employee';
import { Department } from '../types/department';
import {
  TotalBonusReport,
  BonusPercentageItem,
  DepartmentBonusVsSalaryItem,
  BonusRankingItem,
  HighestCompensationReport,
} from '../types/report';

export class ApiError extends Error {
  public readonly code: string;
  public readonly status: number;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

const BASE_URL = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const code = data?.error?.code || 'UNKNOWN_ERROR';
      const message = data?.error?.message || response.statusText || 'An error occurred';
      throw new ApiError(response.status, code, message);
    }

    return data as T;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(0, 'NETWORK_ERROR', err?.message || 'Failed to connect to backend service');
  }
}

export const apiClient = {
  // Health
  checkHealth: () => request<{ status: string }>('/health'),

  // Departments
  getDepartments: () => request<Department[]>('/departments'),

  // Employees CRUD
  getEmployees: (departmentId?: number) => {
    const query = departmentId ? `?departmentId=${departmentId}` : '';
    return request<Employee[]>(`/employees${query}`);
  },

  getEmployeeById: (id: number) => request<Employee>(`/employees/${id}`),

  createEmployee: (payload: CreateEmployeePayload) =>
    request<Employee>('/employees', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateEmployee: (id: number, payload: UpdateEmployeePayload) =>
    request<Employee>(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteEmployee: (id: number) =>
    request<void>(`/employees/${id}`, {
      method: 'DELETE',
    }),

  // Compensation Reports
  getTotalBonusReport: () => request<TotalBonusReport>('/reports/total-bonus'),

  getEmployeesWithoutBonus: () => request<Employee[]>('/reports/no-bonus'),

  getBonusPercentages: () => request<BonusPercentageItem[]>('/reports/bonus-percentage'),

  getDepartmentBonusVsSalary: () => request<DepartmentBonusVsSalaryItem[]>('/reports/departments/bonus-vs-salary'),

  getBonusRanking: () => request<BonusRankingItem[]>('/reports/bonus-ranking'),

  getHighestCompensationReport: () => request<HighestCompensationReport>('/reports/highest-compensation'),
};
