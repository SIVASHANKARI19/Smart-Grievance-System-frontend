import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, FileText, PlusCircle, PieChart } from 'lucide-react';

const Sidebar = () => {
  const { role } = useContext(AuthContext);

  let links = [];

  if (role === 'citizen') {
    links = [
      { name: 'Dashboard', path: '/citizen/dashboard', icon: LayoutDashboard },
      { name: 'Submit Grievance', path: '/citizen/submit', icon: PlusCircle },
      { name: 'My Grievances', path: '/citizen/my-grievances', icon: FileText },
    ];
  } else if (role === 'officer') {
    links = [
      { name: 'Dashboard', path: '/officer/dashboard', icon: LayoutDashboard },
    ];
  } else if (role === 'admin') {
    links = [
      { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Analytics', path: '/admin/analytics', icon: PieChart },
    ];
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] flex-shrink-0 hidden md:block">
      <div className="py-6 px-4 space-y-2 sticky top-20">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
                  <span>{link.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
