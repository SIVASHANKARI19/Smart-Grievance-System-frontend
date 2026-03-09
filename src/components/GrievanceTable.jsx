import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import GrievanceDetailModal from './GrievanceDetailModal';
import { getSLA } from '../utils/sla';
import { Clock } from 'lucide-react';

const GrievanceTable = ({ grievances, onUpdateStatus, showCitizenName = false, showPriority = false }) => {
  const [selectedGrievance, setSelectedGrievance] = useState(null);

  return (
    <>
      <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 :bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 :text-gray-400 uppercase tracking-wider">Title</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 :text-gray-400 uppercase tracking-wider">Department</th>
                {showCitizenName && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 :text-gray-400 uppercase tracking-wider">Citizen</th>
                )}
                {showPriority && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 :text-gray-400 uppercase tracking-wider">Priority Score</th>
                )}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 :text-gray-400 uppercase tracking-wider">SLA / Due</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 :text-gray-400 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 :text-gray-400 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 :text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {grievances.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-8 text-center text-sm text-gray-500">
                    No grievances found.
                  </td>
                </tr>
              ) : (
                grievances.map((g) => {
                  const sla = getSLA(g.createdAt, g.priority);
                  return (
                    <tr key={g._id} className="hover:bg-gray-50 :hover:bg-gray-700/50 transition-colors border-b border-gray-100 :border-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 :text-gray-100 max-w-[180px] truncate" title={g.title}>{g.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 :text-gray-400">
                        <span className="bg-indigo-50 :bg-indigo-900/30 text-indigo-700 :text-indigo-300 px-2 py-0.5 rounded-md text-xs font-medium">
                          {g.department || '—'}
                        </span>
                      </td>
                      {showCitizenName && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 :text-gray-400">{g.citizen?.name || 'Unknown'}</td>
                      )}
                      {showPriority && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 :text-gray-400">
                          <span className={`px-2 py-1 rounded-md text-xs font-semibold ${g.priorityScore >= 70 ? 'bg-red-100 :bg-red-900/40 text-red-800 :text-red-200' : g.priorityScore >= 40 ? 'bg-orange-100 :bg-orange-900/40 text-orange-800 :text-orange-200' : g.priorityScore >= 20 ? 'bg-yellow-100 :bg-yellow-900/40 text-yellow-800 :text-yellow-200' : 'bg-gray-100 :bg-gray-700 text-gray-800 :text-gray-200'}`}>
                            {g.priorityScore ?? 0} — {g.priority || 'Low'}
                          </span>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${sla.color}`}>
                          <Clock size={10} />
                          {sla.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={g.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 :text-gray-400">
                        {new Date(g.createdAt || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedGrievance(g)}
                            className="text-blue-600 :text-blue-400 bg-blue-50 :bg-blue-900/30 hover:bg-blue-100 :hover:bg-blue-900/50 border border-blue-200 :border-blue-800 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                          >
                            Details
                          </button>
                          {onUpdateStatus && (
                            <button
                              onClick={() => onUpdateStatus(g)}
                              className="text-white bg-blue-600 :bg-blue-700 hover:bg-blue-700 :hover:bg-blue-600 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                            >
                              Update
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedGrievance && (
        <GrievanceDetailModal
          grievance={selectedGrievance}
          onClose={() => setSelectedGrievance(null)}
        />
      )}
    </>
  );
};

export default GrievanceTable;
