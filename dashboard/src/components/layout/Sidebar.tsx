import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarItem {
  id: string;
  label: string;
  path: string;
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  
  const sidebarItems: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', path: '/' },
    { id: 'control', label: 'Control', path: '/control' },
    { id: 'datasets', label: 'Datasets', path: '/datasets' },
    { id: 'training', label: 'Training', path: '/training' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 py-8 overflow-y-auto">
      <nav>
        <ul className="space-y-1">
          {sidebarItems.map((item) => (
            <li key={item.id}>
              <Link
                to={item.path}
                className={`
                  block px-8 py-3 text-sm transition-all duration-200
                  ${isActive(item.path)
                    ? 'bg-indigo-100 text-indigo-600 font-medium border-r-4 border-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-slate-800'
                  }
                `}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar; 