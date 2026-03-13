import React, { useState, useEffect } from 'react';
import { grievanceService } from '../../services/grievanceService';
import DashboardCard from '../../components/DashboardCard';
import GrievanceTable from '../../components/GrievanceTable';
import { FileText, Clock, CheckCircle, Download, LayoutDashboard } from 'lucide-react';
import { exportGrievancesToCsv } from '../../utils/exportCsv';

const AdminDashboard = () => {
  const [grievances , setGrievances] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, inProgress: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrievances = async () => {
      try {
        const data = await grievanceService.getAll();
        
        // Sort newest first
        const sorted = data.sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()));
        setGrievances(sorted);
        
        setStats({
          total: data.length,
          pending: data.filter(g => g.status === 'Pending').length,
          resolved: data.filter(g => g.status === 'Resolved').length,
          inProgress: data.filter(g => g.status === 'In Progress').length
        });
      } catch (err) {
        console.error("Failed to load grievances", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGrievances();
  }, []);

  const handleExport = () => {
    exportGrievancesToCsv(grievances);
  };

  if (loading) return (
    <div className="p-8 flex flex-col items-center justify-center py-40">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-500 :text-gray-400 font-bold animate-pulse uppercase tracking-widest text-xs">Synchronizing System Data...</p>
    </div>
  );

  return (
     <div className="p-8 :bg-gray-900 min-h-screen transition-colors duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 :text-gray-100 tracking-tight flex items-center gap-3">
            <LayoutDashboard className="text-blue-600" size={32} />
            System Overview
          </h1>
          <p className="text-gray-500 :text-gray-400 mt-1 font-medium italic">Administrative command center for public redressal.</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 :bg-indigo-700 :hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 :shadow-none transition-all active:scale-95"
        >
          <Download size={18} />
           Export CSV Data
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <DashboardCard 
          title="Total Reports" 
          value={stats.total} 
          icon={FileText} 
          colorClass="bg-indigo-600" 
        />
        <DashboardCard 
          title="Pending Approval" 
          value={stats.pending} 
          icon={Clock} 
          colorClass="bg-amber-500" 
        />
        <DashboardCard 
          title="Active Processing" 
          value={stats.inProgress} 
          icon={FileText} 
          colorClass="bg-blue-500" 
        />
        <DashboardCard 
          title="Successfully Resolved" 
          value={stats.resolved} 
          icon={CheckCircle} 
          colorClass="bg-emerald-500" 
        />
      </div>

      <div className="mb-6 flex justify-between items-center border-b-2 border-gray-100 :border-gray-800 pb-5">
        <h2 className="text-2xl font-black text-gray-900 :text-gray-100 tracking-tight">Real-time Grievance Stream</h2>
      </div>
      
      <GrievanceTable 
        grievances={grievances.slice(0, 15)} 
        showCitizenName={true}
        showPriority={true}
      />
    </div>
  );
};

export default AdminDashboard;
