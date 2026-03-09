import React from 'react';

const StatusBadge = ({ status }) => {
  let color = 'bg-gray-100 text-gray-800';
  
  if (status === 'Pending') color = 'bg-yellow-100 text-yellow-800';
  if (status === 'In Progress') color = 'bg-blue-100 text-blue-800';
  if (status === 'Resolved') color = 'bg-green-100 text-green-800';

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
