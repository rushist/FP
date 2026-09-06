import React, { useEffect, useState } from 'react';
import { ArrowLeft, Edit2 } from 'lucide-react';
import { apiClient } from '../api/client';
import { Employee } from '../types/employee';
import { formatINR, getDepartmentColor } from '../utils/formatters';

interface EmployeeDetailsProps {
  employeeId: number;
  onNavigate: (page: string, employeeId?: number) => void;
}

export const EmployeeDetails: React.FC<EmployeeDetailsProps> = ({ employeeId, onNavigate }) => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const data = await apiClient.getEmployeeById(employeeId);
        setEmployee(data);
      } catch (err: any) {
        setError(err?.message || 'Failed to load employee details');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [employeeId]);

  if (isLoading) {
    return <div style={{ padding: '32px' }}>Loading employee details...</div>;
  }

  if (error || !employee) {
    return (
      <div>
        <button className="back-link" onClick={() => onNavigate('employees')}>
          <ArrowLeft size={16} /> Back to Employees
        </button>
        <div className="alert alert-error">{error || 'Employee not found'}</div>
      </div>
    );
  }

  const initials = `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`.toUpperCase();
  const totalComp = employee.totalCompensation ?? employee.salary + (employee.bonus ?? 0);
  const deptColor = getDepartmentColor(employee.departmentName);

  let formattedDate = employee.hireDate;
  try {
    const parts = employee.hireDate.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      formattedDate = d.toLocaleDateString('en-IN', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    }
  } catch {
    formattedDate = employee.hireDate;
  }

  return (
    <div>
      <button className="back-link" onClick={() => onNavigate('employees')}>
        <ArrowLeft size={16} /> Back to Employees
      </button>

      <div className="content-header" style={{ marginBottom: '16px' }}>
        <div>
          <h2 className="page-title">Employee Details</h2>
        </div>
        <div className="user-badge">
          <div className="user-avatar-small">AD</div>
          <span>Admin</span>
        </div>
      </div>

      {/* Header Card with Initials Avatar colored to Department */}
      <div
        className="details-header-card"
        style={{
          backgroundColor: deptColor.lightBg,
          borderColor: deptColor.border,
        }}
      >
        <div className="details-name-group">
          <div
            className="avatar-large"
            style={{
              backgroundColor: deptColor.border,
              color: deptColor.text,
            }}
          >
            {initials}
          </div>
          <div>
            <div
              className="details-name"
              style={{ color: deptColor.text }}
            >
              {employee.firstName} {employee.lastName}
            </div>
            <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: deptColor.bg,
                  display: 'inline-block',
                }}
              />
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>
                {employee.departmentName || 'Department'}
              </span>
            </div>
          </div>
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => onNavigate('edit-employee', employee.employeeId)}
        >
          <Edit2 size={16} />
          Edit
        </button>
      </div>

      {/* Detail Fields Card */}
      <div className="card" style={{ maxWidth: '640px' }}>
        <div className="details-key-value-list">
          <div className="details-label">Employee ID</div>
          <div className="details-value">{employee.employeeId}</div>

          <div className="details-label">Department</div>
          <div className="details-value">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: deptColor.bg,
                  display: 'inline-block',
                }}
              />
              <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>
                {employee.departmentName || '—'}
              </span>
            </span>
          </div>

          <div className="details-label">Salary (INR)</div>
          <div className="details-value">{formatINR(employee.salary)}</div>

          <div className="details-label">Bonus (INR)</div>
          <div className="details-value">
            {employee.bonus !== null && employee.bonus !== undefined ? (
              formatINR(employee.bonus)
            ) : (
              <span style={{ color: 'var(--color-text-subtle)' }}>— (No Bonus)</span>
            )}
          </div>

          <div className="details-label">Hire Date</div>
          <div className="details-value">{formattedDate}</div>

          <div className="details-label">Total Compensation</div>
          <div
            className="details-value"
            style={{ color: deptColor.text, fontSize: '1.05rem', fontWeight: 700 }}
          >
            {formatINR(totalComp)}
          </div>
        </div>
      </div>
    </div>
  );
};
