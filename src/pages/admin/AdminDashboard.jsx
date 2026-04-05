import React, { useState, useEffect } from 'react';
import { grievanceService } from '../../services/grievanceService';
import DashboardCard from '../../components/DashboardCard';
import GrievanceTable from '../../components/GrievanceTable';
import { FileText, Clock, CheckCircle, Download, LayoutDashboard, UserPlus, Trash2, Users } from 'lucide-react';
import { exportGrievancesToCsv } from '../../utils/exportCsv';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const DEPARTMENTS = [
  'Water', 'Electricity', 'Roads', 'Sanitation',
  'Street Lights', 'Health', 'Parks'
];

const AdminDashboard = () => {
  const [grievances, setGrievances] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, inProgress: 0 });
  const [loading, setLoading] = useState(true);

  // Officer management state
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'officers'
  const [officers, setOfficers] = useState([]);
  const [officerLoading, setOfficerLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', phone: '', department: 'Water', password: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchGrievances = async () => {
      try {
        const data = await grievanceService.getAll();
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

  const fetchOfficers = async () => {
    setOfficerLoading(true);
    try {
      const res = await fetch(`${API_URL}/officers/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setOfficers(data);
    } catch (err) {
      console.error("Failed to load officers", err);
    } finally {
      setOfficerLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'officers') fetchOfficers();
  }, [activeTab]);

  const handleAddOfficer = async (e) => {
    e.preventDefault();
    setAddError('');
    setAddSuccess('');
    setFormLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/officers/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Failed to add officer');
      setAddSuccess(`Officer ${data.officer.name} added successfully!`);
      setForm({ name: '', email: '', phone: '', department: 'Water', password: '' });
      setShowAddForm(false);
      fetchOfficers();
    } catch (err) {
      setAddError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteOfficer = async (id, name) => {
    if (!window.confirm(`Remove officer ${name}?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/officers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      setOfficers(prev => prev.filter(o => o._id !== id));
    } catch (err) {
      alert('Failed to remove officer');
    }
  };

  const handleExport = () => exportGrievancesToCsv(grievances);

  if (loading) return (
    <div className="p-8 flex flex-col items-center justify-center py-40">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">Synchronizing System Data...</p>
    </div>
  );

  return (
    <div className="p-8 min-h-screen transition-colors duration-300">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <LayoutDashboard className="text-blue-600" size={32} />
            Admin Panel
          </h1>
          <p className="text-gray-500 mt-1 font-medium italic">Administrative command center for public redressal.</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all active:scale-95"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-sm rounded-t-xl transition-all
            ${activeTab === 'dashboard' ? 'bg-white border border-b-white border-gray-200 text-blue-600 -mb-px' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <LayoutDashboard size={16} />
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('officers')}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-sm rounded-t-xl transition-all
            ${activeTab === 'officers' ? 'bg-white border border-b-white border-gray-200 text-blue-600 -mb-px' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Users size={16} />
          Manage Officers
        </button>
      </div>

      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <DashboardCard title="Total Reports" value={stats.total} icon={FileText} colorClass="bg-indigo-600" />
            <DashboardCard title="Pending Approval" value={stats.pending} icon={Clock} colorClass="bg-amber-500" />
            <DashboardCard title="Active Processing" value={stats.inProgress} icon={FileText} colorClass="bg-blue-500" />
            <DashboardCard title="Successfully Resolved" value={stats.resolved} icon={CheckCircle} colorClass="bg-emerald-500" />
          </div>

          <div className="mb-6 flex justify-between items-center border-b-2 border-gray-100 pb-5">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Real-time Grievance Stream</h2>
          </div>

          <GrievanceTable
            grievances={grievances.slice(0, 15)}
            showCitizenName={true}
            showPriority={true}
          />
        </>
      )}

      {/* OFFICERS TAB */}
      {activeTab === 'officers' && (
        <div>
          {/* Success message */}
          {addSuccess && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-5 font-medium text-sm">
              <CheckCircle size={16} />
              {addSuccess}
            </div>
          )}

          {/* Add Officer Button */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-gray-900">Department Officers</h2>
            <button
              onClick={() => { setShowAddForm(!showAddForm); setAddError(''); setAddSuccess(''); }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all active:scale-95"
            >
              <UserPlus size={16} />
              {showAddForm ? 'Cancel' : 'Add Officer'}
            </button>
          </div>

          {/* Add Officer Form */}
          {showAddForm && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-5">New Officer Details</h3>

              {addError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {addError}
                </div>
              )}

              <form onSubmit={handleAddOfficer} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name</label>
                  <input
                    type="text" required placeholder="Officer name"
                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
                  <input
                    type="email" required placeholder="officer@dept.gov"
                    value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone</label>
                  <input
                    type="tel" required placeholder="9876543210"
                    value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Department</label>
                  <select
                    value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                  >
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
                  <input
                    type="password" required placeholder="Set login password for officer"
                    value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="submit" disabled={formLoading}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {formLoading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        Adding Officer...
                      </>
                    ) : (
                      <><UserPlus size={16} /> Add Officer</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Officers List */}
          {officerLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : officers.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Users size={48} className="mx-auto mb-4 opacity-30" />
              <p className="font-semibold">No officers added yet</p>
              <p className="text-sm">Click "Add Officer" to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {officers.map(officer => (
                <div key={officer._id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center font-bold text-blue-600 text-lg">
                      {officer.name.charAt(0).toUpperCase()}
                    </div>
                    <button
                      onClick={() => handleDeleteOfficer(officer._id, officer.name)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-all"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <h3 className="font-bold text-gray-900 text-base">{officer.name}</h3>
                  <p className="text-xs text-gray-500 mb-3">{officer.email}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
                      {officer.department}
                    </span>
                    <span className="bg-gray-100 text-gray-600 text-xs font-mono px-2.5 py-1 rounded-lg">
                      {officer.employeeId}
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${officer.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {officer.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">📞 {officer.phone}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;