import { useEffect, useState } from 'react';

const Dashboard = () => {
  const [role, setRole] = useState('');

  useEffect(() => {
    const userRole = localStorage.getItem('role'); // Retrieve the role from localStorage
    setRole(userRole || '');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-6 flex flex-col gap-4 md:gap-8">
      <h1>Dashboard</h1>
      {role === 'admin' && (
        <button>Admin Edit</button>
      )}
    </div>
  );
};

export default Dashboard;