import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse,
  faGear,
  faDatabase,
  faChevronRight,
  faBrain,
  faMagicWandSparkles,
  faCamera,
  faComments
} from '@fortawesome/free-solid-svg-icons';

interface SidebarItem {
  id: string;
  label: string;
  path: string;
  icon: any; // Font Awesome icon definition
}

interface SidebarGroup {
  id: string;
  label: string;
  items: SidebarItem[];
  collapsible?: boolean;
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const sidebarGroups: SidebarGroup[] = [
    {
      id: 'main',
      label: 'Main',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          path: '/',
          icon: faHouse
        },
        {
          id: 'control',
          label: 'Control',
          path: '/control',
          icon: faGear
        },
      ],
      collapsible: false
    },
    {
      id: 'ai',
      label: 'AI',
      items: [
        {
          id: 'datasets',
          label: 'Datasets',
          path: '/datasets',
          icon: faDatabase
        },
        {
          id: 'training',
          label: 'Training',
          path: '/training',
          icon: faBrain
        },
        {
          id: 'inference',
          label: 'Inference',
          path: '/inference',
          icon: faMagicWandSparkles
        },
        {
          id: 'chat',
          label: 'Chat',
          path: '/chat',
          icon: faComments
        }
      ],
      collapsible: true
    },
    {
      id: 'settings',
      label: 'Settings',
      items: [
        {
          id: 'configuration',
          label: 'Configuration',
          path: '/configuration',
          icon: faGear
        },
        {
          id: 'cameras',
          label: 'Cameras',
          path: '/cameras',
          icon: faCamera
        }
      ],
      collapsible: true
    }
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  return (
    <aside className="w-56 bg-white border-r border-gray-100 py-3 px-1 overflow-y-auto">
      <nav>
        <div className="space-y-4">
          {sidebarGroups.map((group) => {
            const isCollapsed = collapsedGroups.has(group.id);

            return (
              <div key={group.id}>
                {/* Group Header */}
                <div className="mb-1">
                  {group.collapsible ? (
                    <button
                      onClick={() => toggleGroup(group.id)}
                      className="flex items-center justify-between w-full px-2 py-0.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors rounded hover:bg-gray-50"
                    >
                      <span>{group.label}</span>
                      <FontAwesomeIcon
                        icon={faChevronRight}
                        className={`w-2.5 h-2.5 transition-transform ${isCollapsed ? '' : 'rotate-90'}`}
                      />
                    </button>
                  ) : (
                    <div className="px-2 py-0.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {group.label}
                    </div>
                  )}
                </div>

                {/* Group Items */}
                {(!group.collapsible || !isCollapsed) && (
                  <ul className="space-y-0.5">
                    {group.items.map((item) => (
                      <li key={item.id}>
                        <Link
                          to={item.path}
                          className={`
                            flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-all duration-200
                            ${isActive(item.path)
                              ? 'bg-primary-50 text-primary-600 font-medium'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-700'
                            }
                          `}
                        >
                          <FontAwesomeIcon
                            icon={item.icon}
                            className={`w-3.5 h-3.5 ${isActive(item.path) ? 'text-primary-600' : 'text-gray-400'}`}
                          />
                          <span className="text-sm">{item.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar; 