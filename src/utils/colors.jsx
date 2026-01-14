export const getLevelColor = (code) => {
  const colors = {
    'PN': '#10b981', // Emerald
    'NU': '#3b82f6', // Blue
    'PR': '#f59e0b', // Amber
    'JS': '#8b5cf6'  // Violet
  };
  return colors[code] || '#64748b';
};


export const getStatusColor = (status) => {
  const colors = {
    'Active': '#10b981',
    'Inactive': '#ef4444',
    'Graduated': '#f59e0b',
    'Transferred': '#8b5cf6'
  };
  return colors[status] || '#64748b';
};