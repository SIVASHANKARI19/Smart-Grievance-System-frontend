import React from 'react';

const DashboardCard = ({ title, value, icon: Icon, colorClass }) => {
  return (
    <div className="bg-white :bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 :border-gray-700 flex items-center space-x-4 transition-all hover:shadow-md">
      <div className={`p-3 rounded-xl shadow-sm ${colorClass}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-500 :text-gray-400 uppercase tracking-tight">{title}</p>
        <h3 className="text-2xl font-black text-gray-900 :text-gray-100">{value}</h3>
      </div>
    </div>
  );
};

export default DashboardCard;
