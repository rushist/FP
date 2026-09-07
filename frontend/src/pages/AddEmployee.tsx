import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { Department } from '../types/department';
import { formatINR } from '../utils/formatters';

interface AddEmployeeProps {
  onNavigate: (page: string) => void;
}

export const AddEmployee: React.FC<AddEmployeeProps> = ({ onNavigate }) => {
  const today = new Date().toISOString().split('T')[0];
  const [departments, setDepartments] = useState<Department[]>([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [departmentId, setDepartmentId] = useState<string>('');
  const [salary, setSalary] = useState('');
  const [bonus, setBonus] = useState('');
  const [bonusType, setBonusType] = useState<'INR' | 'PERCENT'>('INR');
  const [hireDate, setHireDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDepts() {
      try {
        const depts = await apiClient.getDepartments();
        setDepartments(depts);
        if (depts.length > 0) {
          setDepartmentId(depts[0].DepartmentID.toString());
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load departments');
      }
    }
    loadDepts();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!firstName.trim()) {
      setError('First name is required');
      return;
    }
    if (!lastName.trim()) {
      setError('Last name is required');
      return;
    }
    if (!departmentId) {
      setError('Department is required');
      return;
    }
    const numSalary = Number(salary);
    if (isNaN(numSalary) || numSalary <= 0) {
      setError('Salary must be greater than zero');
      return;
    }
    let numBonus: number | null = null;
    if (bonus.trim() !== '') {
      const rawBonus = Number(bonus);
      if (isNaN(rawBonus) || rawBonus < 0) {
        setError('Bonus must be zero or greater');
        return;
      }
      if (bonusType === 'PERCENT') {
        numBonus = Number(((numSalary * rawBonus) / 100).toFixed(2));
      } else {
        numBonus = rawBonus;
      }
    }
    if (!hireDate) {
      setError('Hire date is required');
      return;
    }
    if (hireDate > today) {
      setError('Hire date cannot be in the future');
      return;
    }

    try {
      setIsSubmitting(true);
      await apiClient.createEmployee({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        departmentId: parseInt(departmentId, 10),
        salary: numSalary,
        bonus: numBonus,
        hireDate,
      });
      onNavigate('employees');
    } catch (err: any) {
      setError(err?.message || 'Failed to create employee');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <div className="content-header">
        <div>
          <h2 className="page-title">Add Employee</h2>
          <p className="page-subtitle">Create a new employee record</p>
        </div>
        <div className="user-badge">
          <div className="user-avatar-small">AD</div>
          <span>Admin</span>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '780px' }}>
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="add-first-name" className="form-label">
                First Name <span className="required">*</span>
              </label>
              <input
                id="add-first-name"
                name="firstName"
                type="text"
                className="form-input"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                maxLength={50}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="add-last-name" className="form-label">
                Last Name <span className="required">*</span>
              </label>
              <input
                id="add-last-name"
                name="lastName"
                type="text"
                className="form-input"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                maxLength={50}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="add-department" className="form-label">
                Department <span className="required">*</span>
              </label>
              <select
                id="add-department"
                name="departmentId"
                className="form-input"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                required
              >
                {departments.map((d) => (
                  <option key={d.DepartmentID} value={d.DepartmentID}>
                    {d.DepartmentName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="add-salary" className="form-label">
                Salary (INR) <span className="required">*</span>
              </label>
              <input
                id="add-salary"
                name="salary"
                type="number"
                className="form-input"
                placeholder="95000"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                min="0.01"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="add-bonus" className="form-label">Bonus (Optional)</label>
              <div className="bonus-input-group">
                <input
                  id="add-bonus"
                  name="bonus"
                  type="number"
                  className="form-input bonus-input"
                  placeholder={bonusType === 'INR' ? 'e.g. 5000' : 'e.g. 5 (for 5%)'}
                  value={bonus}
                  onChange={(e) => setBonus(e.target.value)}
                  min="0"
                  step={bonusType === 'INR' ? '0.01' : '0.1'}
                />
                <select
                  id="add-bonus-type"
                  name="bonusType"
                  className="bonus-type-select"
                  value={bonusType}
                  onChange={(e) => setBonusType(e.target.value as 'INR' | 'PERCENT')}
                >
                  <option value="INR">₹ INR</option>
                  <option value="PERCENT">% Percent</option>
                </select>
              </div>
              {bonus.trim() !== '' && bonusType === 'PERCENT' && !isNaN(Number(bonus)) && Number(salary) > 0 && (
                <div className="bonus-hint">
                  ≈ <strong>{formatINR((Number(salary) * Number(bonus)) / 100)}</strong> ({bonus}% of {formatINR(Number(salary))})
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="add-hire-date" className="form-label">
                Hire Date <span className="required">*</span>
              </label>
              <input
                id="add-hire-date"
                name="hireDate"
                type="date"
                className="form-input"
                value={hireDate}
                max={today}
                onChange={(e) => setHireDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Employee'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onNavigate('employees')}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
