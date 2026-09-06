import { CreateEmployeeRequest } from '../dto/CreateEmployeeRequest';
import { UpdateEmployeeRequest } from '../dto/UpdateEmployeeRequest';
import { ValidationError } from '../utils/errors';

export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isFutureDate(dateStr: string): boolean {
  return dateStr.slice(0, 10) > getTodayString();
}

export function validateCreateEmployeeRequest(body: unknown): CreateEmployeeRequest {
  if (!body || typeof body !== 'object') {
    throw new ValidationError('Request body must be a valid JSON object');
  }

  const req = body as Record<string, unknown>;

  // FirstName
  if (req.firstName === undefined || req.firstName === null || typeof req.firstName !== 'string' || req.firstName.trim() === '') {
    throw new ValidationError('First name is required');
  }
  const firstName = req.firstName.trim();
  if (firstName.length > 50) {
    throw new ValidationError('First name must not exceed 50 characters');
  }

  // LastName
  if (req.lastName === undefined || req.lastName === null || typeof req.lastName !== 'string' || req.lastName.trim() === '') {
    throw new ValidationError('Last name is required');
  }
  const lastName = req.lastName.trim();
  if (lastName.length > 50) {
    throw new ValidationError('Last name must not exceed 50 characters');
  }

  // DepartmentID
  if (req.departmentId === undefined || req.departmentId === null) {
    throw new ValidationError('Department ID is required');
  }
  const departmentId = Number(req.departmentId);
  if (!Number.isInteger(departmentId) || departmentId <= 0) {
    throw new ValidationError('Department ID must be a positive integer');
  }

  // Salary
  if (req.salary === undefined || req.salary === null) {
    throw new ValidationError('Salary is required');
  }
  const salary = Number(req.salary);
  if (isNaN(salary) || salary <= 0) {
    throw new ValidationError('Salary must be greater than zero');
  }

  // Bonus (Optional)
  let bonus: number | null = null;
  if (req.bonus !== undefined && req.bonus !== null && req.bonus !== '') {
    const numBonus = Number(req.bonus);
    if (isNaN(numBonus) || numBonus < 0) {
      throw new ValidationError('Bonus must be zero or greater');
    }
    bonus = numBonus;
  }

  // HireDate
  if (req.hireDate === undefined || req.hireDate === null || typeof req.hireDate !== 'string' || req.hireDate.trim() === '') {
    throw new ValidationError('Hire date is required');
  }
  const hireDate = req.hireDate.trim();
  const parsedDate = new Date(hireDate);
  if (isNaN(parsedDate.getTime())) {
    throw new ValidationError('Hire date must be a valid date string (e.g. YYYY-MM-DD)');
  }
  if (isFutureDate(hireDate)) {
    throw new ValidationError('Hire date cannot be in the future');
  }

  return {
    firstName,
    lastName,
    departmentId,
    salary,
    bonus,
    hireDate,
  };
}

export function validateUpdateEmployeeRequest(body: unknown): UpdateEmployeeRequest {
  if (!body || typeof body !== 'object') {
    throw new ValidationError('Request body must be a valid JSON object');
  }

  const req = body as Record<string, unknown>;
  const result: UpdateEmployeeRequest = {};

  if (req.firstName !== undefined) {
    if (typeof req.firstName !== 'string' || req.firstName.trim() === '') {
      throw new ValidationError('First name cannot be empty');
    }
    const firstName = req.firstName.trim();
    if (firstName.length > 50) {
      throw new ValidationError('First name must not exceed 50 characters');
    }
    result.firstName = firstName;
  }

  if (req.lastName !== undefined) {
    if (typeof req.lastName !== 'string' || req.lastName.trim() === '') {
      throw new ValidationError('Last name cannot be empty');
    }
    const lastName = req.lastName.trim();
    if (lastName.length > 50) {
      throw new ValidationError('Last name must not exceed 50 characters');
    }
    result.lastName = lastName;
  }

  if (req.departmentId !== undefined) {
    const departmentId = Number(req.departmentId);
    if (!Number.isInteger(departmentId) || departmentId <= 0) {
      throw new ValidationError('Department ID must be a positive integer');
    }
    result.departmentId = departmentId;
  }

  if (req.salary !== undefined) {
    const salary = Number(req.salary);
    if (isNaN(salary) || salary <= 0) {
      throw new ValidationError('Salary must be greater than zero');
    }
    result.salary = salary;
  }

  if (req.bonus !== undefined) {
    if (req.bonus === null || req.bonus === '') {
      result.bonus = null;
    } else {
      const numBonus = Number(req.bonus);
      if (isNaN(numBonus) || numBonus < 0) {
        throw new ValidationError('Bonus must be zero or greater');
      }
      result.bonus = numBonus;
    }
  }

  if (req.hireDate !== undefined) {
    if (typeof req.hireDate !== 'string' || req.hireDate.trim() === '') {
      throw new ValidationError('Hire date cannot be empty');
    }
    const hireDate = req.hireDate.trim();
    const parsedDate = new Date(hireDate);
    if (isNaN(parsedDate.getTime())) {
      throw new ValidationError('Hire date must be a valid date string (e.g. YYYY-MM-DD)');
    }
    if (isFutureDate(hireDate)) {
      throw new ValidationError('Hire date cannot be in the future');
    }
    result.hireDate = hireDate;
  }

  return result;
}
