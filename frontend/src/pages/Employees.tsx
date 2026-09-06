import React, { useEffect, useState } from 'react';
import { Search, Plus, Edit2, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { apiClient } from '../api/client';
import { Employee } from '../types/employee';
import { Department } from '../types/department';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { formatINR, getDepartmentColor } from '../utils/formatters';

interface EmployeesProps {
  onNavigate: (page: string, employeeId?: number) => void;
}

type SortField = 'employeeId' | 'name' | 'departmentName' | 'salary' | 'bonus' | 'hireDate';
type SortOrder = 'asc' | 'desc';

export const Employees: React.FC<EmployeesProps> = ({ onNavigate }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Deletion modal state
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedDeptId]);

  async function loadData() {
    try {
      setIsLoading(true);
      setError(null);
      const deptFilter = selectedDeptId === 'all' ? undefined : parseInt(selectedDeptId, 10);
      const [empData, deptData] = await Promise.all([
        apiClient.getEmployees(deptFilter),
        apiClient.getDepartments(),
      ]);
      setEmployees(empData);
      setDepartments(deptData);
    } catch (err: any) {
      setError(err?.message || 'Failed to load employee data');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!employeeToDelete) return;
    try {
      setIsDeleting(true);
      await apiClient.deleteEmployee(employeeToDelete.employeeId);
      setEmployeeToDelete(null);
      await loadData();
    } catch (err: any) {
      alert(`Delete failed: ${err?.message}`);
    } finally {
      setIsDeleting(false);
    }
  }

  const filteredEmployees = employees.filter((e) => {
    const fullName = `${e.firstName} ${e.lastName}`.toLowerCase();
    const idMatch = e.employeeId.toString().includes(searchQuery.trim());
    return fullName.includes(searchQuery.toLowerCase()) || idMatch;
  });

  function handleSort(field: SortField) {
    if (sortField === field) {
      if (sortOrder === 'asc') {
        // 2nd click: sort descending
        setSortOrder('desc');
      } else {
        // 3rd click: reset to default state of DB
        setSortField(null);
        setSortOrder('asc');
      }
    } else {
      // 1st click: sorts by ascending first
      setSortField(field);
      setSortOrder('asc');
    }
  }

  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    if (!sortField) return 0;

    let aVal: any;
    let bVal: any;

    if (sortField === 'name') {
      aVal = `${a.firstName} ${a.lastName}`.toLowerCase();
      bVal = `${b.firstName} ${b.lastName}`.toLowerCase();
    } else if (sortField === 'departmentName') {
      aVal = (a.departmentName || '').toLowerCase();
      bVal = (b.departmentName || '').toLowerCase();
    } else if (sortField === 'bonus') {
      aVal = a.bonus !== null && a.bonus !== undefined ? a.bonus : -1;
      bVal = b.bonus !== null && b.bonus !== undefined ? b.bonus : -1;
    } else if (sortField === 'hireDate') {
      aVal = new Date(a.hireDate).getTime();
      bVal = new Date(b.hireDate).getTime();
    } else {
      aVal = a[sortField];
      bVal = b[sortField];
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  function renderSortIcon(field: SortField) {
    if (sortField === field) {
      return sortOrder === 'asc' ? (
        <ArrowUp size={14} style={{ color: 'var(--color-primary)' }} />
      ) : (
        <ArrowDown size={14} style={{ color: 'var(--color-primary)' }} />
      );
    }
    return <ArrowUpDown size={13} style={{ opacity: 0.35 }} />;
  }

  function getSortTooltip(label: string, field: SortField) {
    if (sortField !== field) {
      return `Click to sort by ${label} (ascending)`;
    }
    if (sortOrder === 'asc') {
      return `Click to sort by ${label} (descending)`;
    }
    return `Click to reset to default order`;
  }

  return (
    <div>
      <div className="content-header">
        <div>
          <h2 className="page-title">Employees</h2>
          <p className="page-subtitle">View and manage employee information</p>
        </div>
        <div className="user-badge">
          <div className="user-avatar-small">AD</div>
          <span>Admin</span>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-container">
        {/* Table Toolbar */}
        <div className="table-toolbar">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              className="form-input search-input"
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <select
              className="form-select"
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.DepartmentID} value={d.DepartmentID}>
                  {d.DepartmentName}
                </option>
              ))}
            </select>

            <button
              className="btn btn-primary"
              onClick={() => onNavigate('add-employee')}
            >
              <Plus size={16} />
              Add Employee
            </button>
          </div>
        </div>

        {/* Employee Table */}
        <table className="data-table">
          <thead>
            <tr>
              <th
                className="sortable"
                style={{ width: '85px' }}
                onClick={() => handleSort('employeeId')}
                title={getSortTooltip('ID', 'employeeId')}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                  <span>ID</span>
                  {renderSortIcon('employeeId')}
                </div>
              </th>
              <th
                className="sortable"
                onClick={() => handleSort('name')}
                title={getSortTooltip('Name', 'name')}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                  <span>Name</span>
                  {renderSortIcon('name')}
                </div>
              </th>
              <th
                className="sortable"
                onClick={() => handleSort('departmentName')}
                title={getSortTooltip('Department', 'departmentName')}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                  <span>Department</span>
                  {renderSortIcon('departmentName')}
                </div>
              </th>
              <th
                className="sortable"
                onClick={() => handleSort('salary')}
                title={getSortTooltip('Salary', 'salary')}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                  <span>Salary (INR)</span>
                  {renderSortIcon('salary')}
                </div>
              </th>
              <th
                className="sortable"
                onClick={() => handleSort('bonus')}
                title={getSortTooltip('Bonus', 'bonus')}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                  <span>Bonus (INR)</span>
                  {renderSortIcon('bonus')}
                </div>
              </th>
              <th
                className="sortable"
                onClick={() => handleSort('hireDate')}
                title={getSortTooltip('Hire Date', 'hireDate')}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                  <span>Hire Date</span>
                  {renderSortIcon('hireDate')}
                </div>
              </th>
              <th style={{ width: '90px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '32px' }}>
                  Loading employees...
                </td>
              </tr>
            ) : sortedEmployees.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                  No employees found
                </td>
              </tr>
            ) : (
              sortedEmployees.map((emp) => {
                const deptColor = getDepartmentColor(emp.departmentName);
                return (
                  <tr key={emp.employeeId}>
                    <td style={{ fontWeight: 600, color: 'var(--color-text-muted)' }}>
                      {emp.employeeId}
                    </td>
                    <td>
                      {/* Name string colored to the department it belongs to */}
                      <button
                        onClick={() => onNavigate('employee-details', emp.employeeId)}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontFamily: 'inherit',
                          fontSize: '0.925rem',
                          fontWeight: 600,
                          color: deptColor.text,
                          cursor: 'pointer',
                          padding: 0,
                          textAlign: 'left',
                        }}
                        title={`View profile for ${emp.firstName} ${emp.lastName}`}
                      >
                        {emp.firstName} {emp.lastName}
                      </button>
                    </td>
                    <td>
                      {/* Department with color dot */}
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: deptColor.bg,
                            display: 'inline-block',
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>
                          {emp.departmentName || '—'}
                        </span>
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{formatINR(emp.salary)}</td>
                    <td style={{ fontWeight: 500 }}>
                      {emp.bonus !== null && emp.bonus !== undefined ? (
                        formatINR(emp.bonus)
                      ) : (
                        <span style={{ color: 'var(--color-text-subtle)' }}>—</span>
                      )}
                    </td>
                    <td>{emp.hireDate}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="action-buttons" style={{ justifyContent: 'center' }}>
                        <button
                          className="btn-icon"
                          title="Edit Employee"
                          onClick={() => onNavigate('edit-employee', emp.employeeId)}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="btn-icon delete"
                          title="Delete Employee"
                          onClick={() => setEmployeeToDelete(emp)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <DeleteConfirmModal
        employee={employeeToDelete}
        isOpen={employeeToDelete !== null}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setEmployeeToDelete(null)}
      />
    </div>
  );
};
