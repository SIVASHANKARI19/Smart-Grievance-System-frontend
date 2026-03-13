import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { grievanceService } from '../../services/grievanceService';
import GrievanceTable from '../../components/GrievanceTable';

const MyGrievances = () => {
   const { user } = useContext(AuthContext);
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrievances = async () => {
      try {
        const data = await grievanceService.getAll();
        const userGrievances = data.filter(g => 
          g.citizen === user?._id || (g.citizen && g.citizen._id === user?._id)
        );
        // Sort by newest first mapping over potentially missing createdAt dates
         const sorted = userGrievances.sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()));
        setGrievances(sorted);
      } catch (err) {
        console.error("Failed to load grievances", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchGrievances();
  }, [user]);

  if (loading) return <div className="p-8 flex justify-center py-20"><div className="animate-pulse text-blue-600 font-medium">Loading your grievances...</div></div>;

  return (
     <div className="p-8">
      <div className="mb-6 flex justify-between items-center border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Grievances</h1>
          <p className="text-gray-500 mt-1">Track the status of your reported issues.</p>
        </div>
      </div>
      
      <GrievanceTable grievances={grievances} />
     </div>
  );
};

export default MyGrievances;
