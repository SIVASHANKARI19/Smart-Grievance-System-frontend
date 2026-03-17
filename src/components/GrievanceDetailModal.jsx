import React from 'react';
import StatusBadge from './StatusBadge';
import { getSLA } from '../utils/sla';
import {
  X, MapPin, Phone, Building2, AlertTriangle, BarChart2,
  FileText, User, Calendar, Image as ImageIcon, Info, CheckCircle2, Clock
} from 'lucide-react';


const priorityColor = (score) => {
   if (score >= 70) return 'bg-red-100 :bg-red-900/30 text-red-700 :text-red-300 border-red-200 :border-red-800';
   if (score >= 40) return 'bg-orange-100 :bg-orange-900/30 text-orange-700 :text-orange-300 border-orange-200 :border-orange-800';
   if (score >= 20) return 'bg-yellow-100 :bg-yellow-900/30 text-yellow-700 :text-yellow-300 border-yellow-200 :border-yellow-800';
   return 'bg-green-100 :bg-green-900/30 text-green-700 :text-green-300 border-green-200 :border-green-800';
};

const Field = ({ icon: Icon, label, value, children }) => {
  if (!value && !children) return null;
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 shrink-0">
        <Icon size={16} className="text-blue-500 :text-blue-400" />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 :text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
        {children ?? <p className="text-sm text-gray-800 :text-gray-200">{value}</p>}
      </div>
    </div>
  );
};

const Timeline = ({ currentStatus }) => {
  const statuses = [
    { key: 'Pending', label: 'Submitted', color: 'bg-yellow-500' },
    { key: 'In Progress', label: 'Processing', color: 'bg-blue-500' },
    { key: 'Resolved', label: 'Resolved', color: 'bg-green-500' }
  ];

  const currentIndex = statuses.findIndex(s => s.key === currentStatus);

  return (
    <div className="py-4">
      <div className="relative flex justify-between">
        {/* Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 :bg-gray-700 -translate-y-1/2 z-0" />
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-blue-500 -translate-y-1/2 z-0 transition-all duration-500" 
          style={{ width: `${(currentIndex / (statuses.length - 1)) * 100}%` }}
        />

        {statuses.map((s, idx) => {
          const isActive = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          return (
            <div key={s.key} className="relative z-10 flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 ${
                isActive 
                  ? 'bg-white :bg-gray-800 border-blue-500 text-blue-500' 
                  : 'bg-white :bg-gray-800 border-gray-200 :border-gray-700 text-gray-400'
              } transition-colors duration-300`}>
                {isActive && !isCurrent ? <CheckCircle2 size={16} /> : <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-blue-500' : 'bg-gray-300 :bg-gray-600'}`} />}
              </div>
              <span className={`text-[10px] font-bold mt-2 uppercase tracking-tighter ${isActive ? 'text-gray-900 :text-gray-100' : 'text-gray-400'}`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const GrievanceDetailModal = ({ grievance, onClose }) => {
  if (!grievance) return null;

  const g = grievance;
  const score = g.priorityScore ?? 0;
  const sla = getSLA(g.createdAt, g.priority);
  const dateStr = g.createdAt
    ? new Date(g.createdAt).toLocaleString()
    : '—';

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white :bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-in fade-in zoom-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-100 :border-gray-700 sticky top-0 bg-white/80 :bg-gray-800/80 backdrop-blur-md rounded-t-2xl z-20">
          <div>
            <h2 className="text-xl font-bold text-gray-900 :text-gray-100">{g.title}</h2>
            <p className="text-[10px] text-gray-400 :text-gray-500 mt-1 uppercase tracking-widest font-mono">ID: {g._id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 :hover:bg-gray-700 rounded-full transition-colors text-gray-500 :text-gray-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Progress Timeline */}
          <section className="bg-gray-50 :bg-gray-900/50 rounded-2xl p-6 border border-gray-100 :border-gray-700/50">
            <h3 className="text-xs font-bold text-gray-400 :text-gray-500 uppercase tracking-widest mb-4">Grievance Progress</h3>
            <Timeline currentStatus={g.status} />
          </section>

          {/* Status + Priority Row */}
          <div className="flex flex-wrap gap-3">
            <StatusBadge status={g.status} />
            <span className={`flex items-center gap-1.5 text-xs font-bold uppercase px-3 py-1.5 rounded-full border shadow-sm ${priorityColor(score)}`}>
              <AlertTriangle size={13} />
              Priority {g.priority || 'Low'} ({score})
            </span>
            <span className={`flex items-center gap-1.5 text-xs font-bold uppercase px-3 py-1.5 rounded-full border shadow-sm ${sla.color}`}>
              <Clock size={13} />
              SLA: {sla.label}
            </span>
          </div>

          {/* AI Classification Info Box */}
          <div className="bg-blue-50 :bg-blue-900/20 border border-blue-100 :border-blue-800/50 rounded-2xl p-5 space-y-3 shadow-inner">
            <p className="text-[10px] font-black text-blue-700 :text-blue-400 uppercase tracking-widest flex items-center gap-2">
              <BarChart2 size={14} /> AI Engine Analysis
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-[10px] text-gray-400 :text-gray-500 uppercase font-bold">Department</span>
                <p className="font-bold text-gray-800 :text-gray-200">{g.department || '—'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-gray-400 :text-gray-500 uppercase font-bold">Category</span>
                <p className="font-bold text-gray-800 :text-gray-200">{g.category || '—'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-gray-400 :text-gray-500 uppercase font-bold">Mass Scale</span>
                <p className="font-bold text-gray-800 :text-gray-200">{g.isMassComplaint ? 'High' : 'Low'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-gray-400 :text-gray-500 uppercase font-bold">Repetition</span>
                <p className="font-bold text-gray-800 :text-gray-200">{g.repeatCount || 0} Reports</p>
              </div>
            </div>
          </div>

          {/* Core Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
            <div className="space-y-6">
              <Field icon={FileText} label="Description" value={g.description} />
              <Field icon={User} label="Citizen Information">
                <p className="text-sm font-medium text-gray-800 :text-gray-200">
                  {g.citizen?.name || g.citizen || '—'}
                </p>
                {g.citizen?.email && (
                  <p className="text-xs text-gray-400 :text-gray-500">{g.citizen.email}</p>
                )}
              </Field>
              <Field icon={Calendar} label="Incident Logged" value={dateStr} />
            </div>
            
            <div className="space-y-6">
              {g.contactNumber && (
                <Field icon={Phone} label="Contact Point" value={g.contactNumber} />
              )}
              {g.address && (
                <Field icon={MapPin} label="Physical Address" value={g.address} />
              )}
              {g.location?.lat && (
                <Field icon={MapPin} label="Geospatial Tag">
                  <a
                    href={`https://maps.google.com/?q=${g.location.lat},${g.location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 text-sm text-blue-600 :text-blue-400 font-bold hover:underline underline-offset-4"
                  >
                    View on Maps
                    <Info size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </Field>
              )}
            </div>
          </div>

          {/* Attached Photo */}
          {g.image && (
            <div className="mt-4">
              <p className="text-xs font-bold text-gray-400 :text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <ImageIcon size={14} className="text-blue-500" /> Evidence Attachment
              </p>
              <div className="relative group">
                <img
                  src={g.image}
                  alt="Grievance Evidence"
                  className="max-h-80 rounded-2xl object-cover border border-gray-100 :border-gray-700 w-full bg-gray-50 :bg-gray-900 group-hover:brightness-95 transition-all cursor-zoom-in"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-5 bg-gray-50 :bg-gray-900/50 border-t border-gray-100 :border-gray-700 rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold bg-white :bg-gray-800 border border-gray-200 :border-gray-700 text-gray-700 :text-gray-200 rounded-xl hover:bg-gray-100 :hover:bg-gray-700 transition-all shadow-sm active:scale-95"
          >
            Close Detail View
          </button>
        </div>
      </div>
    </div>
  );
};

export default GrievanceDetailModal;
