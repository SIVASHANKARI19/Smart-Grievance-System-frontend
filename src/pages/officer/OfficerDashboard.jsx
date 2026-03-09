import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { grievanceService } from '../../services/grievanceService';
import GrievanceTable from '../../components/GrievanceTable';
import { Download, ShieldCheck, RefreshCw } from 'lucide-react';
import { exportGrievancesToCsv } from '../../utils/exportCsv';

const OfficerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);

  const fetchGrievances = async () => {
    try {
      setLoading(true);
      const dept = user?.department || 'Water Supply'; 
      const data = await grievanceService.getByDepartment(dept);
      
      const sorted = data.sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
      setGrievances(sorted);
    } catch (err) {
      console.error("Failed to load grievances", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchGrievances();
    // eslint-disable-next-line
  }, [user]);

  const handleOpenModal = (grievance) => {
    setSelectedGrievance(grievance);
    setNewStatus(grievance.status);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedGrievance) return;
    
    setUpdateLoading(true);
    try {
      await grievanceService.updateStatus(selectedGrievance._id, newStatus);
      setIsModalOpen(false);
      fetchGrievances();
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update status. Please try again.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleExport = () => {
    exportGrievancesToCsv(grievances);
  };

  if (loading) return (
    <div className="p-8 flex flex-col items-center justify-center py-40">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-500 :text-gray-400 font-bold animate-pulse uppercase tracking-widest text-xs">Loading Departmental Queue...</p>
    </div>
  );

  return (
    <div className="p-8 :bg-gray-900 min-h-screen transition-colors duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900 :text-gray-100 tracking-tight flex items-center gap-3">
            <ShieldCheck className="text-blue-600" size={32} />
            Officer Dashboard
          </h1>
          <p className="text-gray-500 :text-gray-400 mt-1 font-medium italic">
            Managing <span className="text-blue-600 :text-blue-400 font-bold">#{user?.department || 'Water Supply'}</span> Redressal Queue
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchGrievances}
            className="p-3 text-gray-500 hover:bg-gray-100 :hover:bg-gray-800 rounded-xl transition-all"
            title="Refresh Data"
          >
            <RefreshCw size={20} />
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 :bg-indigo-700 :hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 :shadow-none transition-all active:scale-95"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      <GrievanceTable 
        grievances={grievances} 
        onUpdateStatus={handleOpenModal} 
        showCitizenName={true}
        showPriority={true}
      />

      {/* Update Status Modal */}
      {isModalOpen && selectedGrievance && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm shadow-2xl flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white :bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 border border-gray-100 :border-gray-700 transform transition-all animate-in zoom-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 :bg-blue-900/30 rounded-lg">
                <RefreshCw size={24} className="text-blue-600 :text-blue-400" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 :text-gray-100 tracking-tight">Update Status</h3>
            </div>

            <div className="bg-gray-50 :bg-gray-900/50 rounded-xl p-5 mb-6 border border-gray-100 :border-gray-700 text-sm">
              <p className="text-xs font-bold text-gray-400 :text-gray-500 uppercase tracking-widest mb-2">Selected Grievance</p>
              <p className="text-gray-800 :text-gray-200 font-bold mb-1 line-clamp-1">{selectedGrievance.title}</p>
              <p className="text-blue-600 :text-blue-400 font-black">Current: {selectedGrievance.status}</p>
            </div>
            
            <form onSubmit={handleUpdateStatus}>
              <div className="mb-8">
                <label className="block text-xs font-black text-gray-400 :text-gray-500 uppercase tracking-widest mb-3">Assign New Status</label>
                <div className="grid grid-cols-1 gap-2">
                  {['Pending', 'In Progress', 'Resolved'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setNewStatus(status)}
                      className={`px-4 py-3 rounded-xl text-sm font-bold border-2 transition-all flex items-center justify-between ${
                        newStatus === status
                          ? 'bg-blue-50 :bg-blue-900/30 border-blue-500 text-blue-700 :text-blue-300'
                          : 'bg-white :bg-gray-800 border-gray-100 :border-gray-700 text-gray-500 :text-gray-400 hover:border-gray-200 :hover:border-gray-600'
                      }`}
                    >
                      {status}
                      {newStatus === status && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={updateLoading || newStatus === selectedGrievance.status}
                  className="w-full py-4 text-sm font-black text-white bg-blue-600 :bg-blue-700 rounded-xl hover:bg-blue-700 :hover:bg-blue-600 transition-all shadow-lg shadow-blue-100 :shadow-none disabled:opacity-50 disabled:scale-100 active:scale-95"
                >
                  {updateLoading ? 'Saving Changes...' : 'Confirm Status Update'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-3 text-sm font-bold text-gray-500 :text-gray-400 bg-transparent rounded-xl hover:bg-gray-50 :hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficerDashboard;
