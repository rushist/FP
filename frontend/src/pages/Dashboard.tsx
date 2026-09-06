import React, { useEffect, useState } from 'react';
import { Users, IndianRupee, TrendingUp, UserPlus, ChevronRight, BarChart2 } from 'lucide-react';
import { apiClient } from '../api/client';
import { TotalBonusReport } from '../types/report';
import { Employee } from '../types/employee';
import { Department } from '../types/department';
import { formatINR } from '../utils/formatters';
import { DepartmentPieChart } from '../components/DepartmentPieChart';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [bonusReport, setBonusReport] = useState<TotalBonusReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [empData, deptData, bonusData] = await Promise.all([
          apiClient.getEmployees(),
          apiClient.getDepartments(),
          apiClient.getTotalBonusReport(),
        ]);
        setEmployees(empData);
        setDepartments(deptData);
        setBonusReport(bonusData);
      } catch (err: any) {
        setError(err?.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const totalEmployees = employees.length;
  const totalDepartments = departments.length;
  const totalBonus = bonusReport ? bonusReport.totalBonus : 0;
  const avgSalary =
    employees.length > 0
      ? Math.round(employees.reduce((acc, curr) => acc + curr.salary, 0) / employees.length)
      : 0;

  // Department counts for Pie chart
  const deptCounts = departments.map((d) => {
    const count = employees.filter((e) => e.departmentId === d.DepartmentID).length;
    return { name: d.DepartmentName, count };
  });

  return (
    <div>
      <div className="content-header">
        <div>
          <h2 className="page-title">Welcome</h2>
          <p className="page-subtitle">Overview of your organization's people and compensation</p>
        </div>
        <div className="user-badge">
          <div className="user-avatar-small">AD</div>
          <span>Admin</span>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* 4 Stat Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-title">Total Employees</div>
          <div className="kpi-value-row">
            <div className="kpi-value">{isLoading ? '...' : totalEmployees}</div>
            <Users className="kpi-icon" size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">Total Departments</div>
          <div className="kpi-value-row">
            <div className="kpi-value">{isLoading ? '...' : totalDepartments}</div>
            <BarChart2 className="kpi-icon" size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">Total Bonus</div>
          <div className="kpi-value-row">
            <div className="kpi-value">
              {isLoading ? '...' : formatINR(totalBonus)}
            </div>
            <IndianRupee className="kpi-icon" size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">Average Salary</div>
          <div className="kpi-value-row">
            <div className="kpi-value">
              {isLoading ? '...' : formatINR(avgSalary)}
            </div>
            <TrendingUp className="kpi-icon" size={24} />
          </div>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="dashboard-grid">
        {/* Left: Employees by Department Pie Chart with assigned colors */}
        <div className="card">
          <h3 className="card-title">Employees by Department</h3>
          {isLoading ? (
            <div style={{ padding: '32px', textAlign: 'center' }}>Loading chart...</div>
          ) : (
            <DepartmentPieChart data={deptCounts} />
          )}
        </div>

        {/* Right: Quick Actions */}
        <div className="card">
          <h3 className="card-title">Quick Actions</h3>
          <div
            className="quick-action-item"
            onClick={() => onNavigate('add-employee')}
          >
            <div className="quick-action-left">
              <UserPlus size={18} color="var(--color-primary)" />
              <span>Add Employee</span>
            </div>
            <ChevronRight size={16} color="var(--color-text-subtle)" />
          </div>

          <div
            className="quick-action-item"
            onClick={() => onNavigate('employees')}
          >
            <div className="quick-action-left">
              <Users size={18} color="var(--color-primary)" />
              <span>View Employees</span>
            </div>
            <ChevronRight size={16} color="var(--color-text-subtle)" />
          </div>

          <div
            className="quick-action-item"
            onClick={() => onNavigate('reports')}
          >
            <div className="quick-action-left">
              <BarChart2 size={18} color="var(--color-primary)" />
              <span>Compensation Reports</span>
            </div>
            <ChevronRight size={16} color="var(--color-text-subtle)" />
          </div>
        </div>
      </div>
    </div>
  );
};
