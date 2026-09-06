import { EmployeeRepository } from '../repositories/EmployeeRepository';
import { DepartmentRepository } from '../repositories/DepartmentRepository';
import { CreateEmployeeRequest } from '../dto/CreateEmployeeRequest';
import { UpdateEmployeeRequest } from '../dto/UpdateEmployeeRequest';
import { EmployeeResponse } from '../dto/EmployeeResponse';
import { validateCreateEmployeeRequest, validateUpdateEmployeeRequest } from '../validation/employeeValidation';
import { NotFoundError, ValidationError } from '../utils/errors';
import { EmployeeWithDepartment } from '../models/Employee';

export class EmployeeService {
  private employeeRepo: EmployeeRepository;
  private departmentRepo: DepartmentRepository;
  private isFivePercentBonusEnabled: boolean;

  constructor(
    employeeRepo: EmployeeRepository = new EmployeeRepository(),
    departmentRepo: DepartmentRepository = new DepartmentRepository()
  ) {
    this.employeeRepo = employeeRepo;
    this.departmentRepo = departmentRepo;
    this.isFivePercentBonusEnabled = process.env.ENABLE_DEFAULT_FIVE_PERCENT_BONUS === 'true';
  }

  public async createEmployee(payload: unknown): Promise<EmployeeResponse> {
    const validated = validateCreateEmployeeRequest(payload);

    // Verify department exists
    const deptExists = await this.departmentRepo.exists(validated.departmentId);
    if (!deptExists) {
      throw new ValidationError(`Department with ID ${validated.departmentId} does not exist`);
    }

    const created = await this.employeeRepo.create(validated);
    return this.mapToResponse(created);
  }

  public async getEmployeeById(id: number): Promise<EmployeeResponse> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new ValidationError('Invalid employee ID. Must be a positive integer.');
    }

    const employee = await this.employeeRepo.getById(id);
    if (!employee) {
      throw new NotFoundError(`Employee with ID ${id} was not found`);
    }

    return this.mapToResponse(employee);
  }

  public async listEmployees(departmentIdParam?: string | null): Promise<EmployeeResponse[]> {
    let departmentId: number | undefined = undefined;
    if (departmentIdParam !== undefined && departmentIdParam !== null && departmentIdParam.trim() !== '') {
      const parsed = Number(departmentIdParam);
      if (isNaN(parsed) || !Number.isInteger(parsed) || parsed <= 0) {
        throw new ValidationError('Invalid departmentId query parameter. Must be a positive integer.');
      }
      departmentId = parsed;
    }

    const employees = await this.employeeRepo.list(departmentId);
    return employees.map((e) => this.mapToResponse(e));
  }

  public async updateEmployee(id: number, payload: unknown): Promise<EmployeeResponse> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new ValidationError('Invalid employee ID. Must be a positive integer.');
    }

    const validated = validateUpdateEmployeeRequest(payload);

    // Verify employee exists
    const existing = await this.employeeRepo.getById(id);
    if (!existing) {
      throw new NotFoundError(`Employee with ID ${id} was not found`);
    }

    // Verify department if changing department
    if (validated.departmentId !== undefined) {
      const deptExists = await this.departmentRepo.exists(validated.departmentId);
      if (!deptExists) {
        throw new ValidationError(`Department with ID ${validated.departmentId} does not exist`);
      }
    }

    const updated = await this.employeeRepo.update(id, validated);
    if (!updated) {
      throw new NotFoundError(`Employee with ID ${id} was not found`);
    }

    return this.mapToResponse(updated);
  }

  public async deleteEmployee(id: number): Promise<void> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new ValidationError('Invalid employee ID. Must be a positive integer.');
    }

    const existing = await this.employeeRepo.getById(id);
    if (!existing) {
      throw new NotFoundError(`Employee with ID ${id} was not found`);
    }

    const deleted = await this.employeeRepo.delete(id);
    if (!deleted) {
      throw new NotFoundError(`Employee with ID ${id} was not found`);
    }
  }

  private mapToResponse(emp: EmployeeWithDepartment): EmployeeResponse {
    let bonus = emp.Bonus !== null && emp.Bonus !== undefined ? Number(emp.Bonus) : null;

    // Optional 5% Default Bonus (calculated on read only, does not mutate DB)
    if (bonus === null && this.isFivePercentBonusEnabled) {
      bonus = Number((emp.Salary * 0.05).toFixed(2));
    }

    const totalComp = emp.Salary + (bonus ?? 0);

    return {
      employeeId: emp.EmployeeID,
      firstName: emp.FirstName,
      lastName: emp.LastName,
      departmentId: emp.DepartmentID,
      departmentName: emp.DepartmentName,
      salary: emp.Salary,
      bonus,
      hireDate: emp.HireDate,
      totalCompensation: Number(totalComp.toFixed(2)),
    };
  }
}
