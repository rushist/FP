import React from 'react';
import { Home, Users, BarChart3 } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'employees' | 'reports';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  return (
    <aside className="app-sidebar">
      <div className="brand-badge">Employee Comp</div>
      <ul className="nav-list">
        <li>
          <button
            className={`nav-button ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => onSelectTab('dashboard')}
          >
            <Home size={18} />
            Dashboard
          </button>
        </li>
        <li>
          <button
            className={`nav-button ${activeTab === 'employees' ? 'active' : ''}`}
            onClick={() => onSelectTab('employees')}
          >
            <Users size={18} />
            Employees
          </button>
        </li>
        <li>
          <button
            className={`nav-button ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => onSelectTab('reports')}
          >
            <BarChart3 size={18} />
            Reports
          </button>
        </li>
      </ul>
    </aside>
  );
};
