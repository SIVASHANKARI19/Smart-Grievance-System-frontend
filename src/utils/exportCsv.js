/**
 * Exports an array of grievances to a downloadable CSV file.
 */
export const exportGrievancesToCsv = (grievances, filename = 'grievances.csv') => {
  const headers = [
    'ID', 'Title', 'Description', 'Department', 'Status',
    'Priority', 'Priority Score', 'Citizen', 'Contact',
    'Address', 'Submitted On'
  ];

  const rows = grievances.map(g => [
    g._id || '',
    `"${(g.title || '').replace(/"/g, '""')}"`,
    `"${(g.description || '').replace(/"/g, '""')}"`,
    g.department || '',
    g.status || '',
    g.priority || '',
    g.priorityScore ?? '',
    g.citizen?.name || g.citizen || '',
    g.contactNumber || '',
    `"${(g.address || '').replace(/"/g, '""')}"`,
    g.createdAt ? new Date(g.createdAt).toLocaleString() : '',
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
