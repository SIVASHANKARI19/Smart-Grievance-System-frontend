import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { grievanceService } from '../../services/grievanceService';
import DashboardCard from '../../components/DashboardCard';
import { FileText, Clock, CheckCircle } from 'lucide-react';

const CitizenDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, inProgress: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await grievanceService.getAll();
        const userGrievances = data.filter(g => 
          g.citizen === user?._id || (g.citizen && g.citizen._id === user?._id)
        );
        
        setStats({
          total: userGrievances.length,
          pending: userGrievances.filter(g => g.status === 'Pending').length,
          resolved: userGrievances.filter(g => g.status === 'Resolved').length,
          inProgress: userGrievances.filter(g => g.status === 'In Progress').length
        });
      } catch (err) {
        console.error("Failed to load stats", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchStats();
  }, [user]);

  if (loading) return <div className="p-8 flex justify-center items-center h-full"><div className="animate-pulse flex space-x-2 text-blue-600 font-medium tracking-tight"><span>Loading Dashboard...</span></div></div>;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p className="text-gray-500 mt-1">Here is a quick overview of your grievance reports.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard 
          title="Total Reports" 
          value={stats.total} 
          icon={FileText} 
          colorClass="bg-indigo-500" 
        />
        <DashboardCard 
          title="Pending" 
          value={stats.pending} 
          icon={Clock} 
          colorClass="bg-amber-500" 
        />
        <DashboardCard 
          title="In Progress" 
          value={stats.inProgress} 
          icon={FileText} 
          colorClass="bg-blue-500" 
        />
        <DashboardCard 
          title="Resolved" 
          value={stats.resolved} 
          icon={CheckCircle} 
          colorClass="bg-emerald-500" 
        />
      </div>
    </div>
  );
};

export default CitizenDashboard;
