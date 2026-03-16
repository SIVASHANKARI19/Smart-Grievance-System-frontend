import React, { useState, useEffect, useMemo } from 'react';
import { grievanceService } from '../../services/grievanceService';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { AlertTriangle, TrendingUp, Map as MapIcon, BarChart3, PieChart } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const Analytics = () => {
   const [loading, setLoading] = useState(true);
   const [grievances, setGrievances] = useState([]);
   const [trendData, setTrendData] = useState(null);
  const [deptData, setDeptData] = useState(null);
  const [catData, setCatData] = useState(null);
  const [spikeAlert, setSpikeAlert] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await grievanceService.getAll();
        setGrievances(data);

        // 1. Process Trend Data (Last 14 days)
        const last14Days = [...Array(14)].map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (13 - i));
          return d.toISOString().split('T')[0];
        });

        const dayCounts = {};
        data.forEach(g => {
          const date = new Date(g.createdAt).toISOString().split('T')[0];
          dayCounts[date] = (dayCounts[date] || 0) + 1;
        });

        const trendValues = last14Days.map(date => dayCounts[date] || 0);
        
        // Spike Detection (Today vs Avg)
        const todayCount = trendValues[trendValues.length - 1];
        const avgCount = trendValues.slice(0, -1).reduce((a, b) => a + b, 0) / 13;
        if (todayCount > avgCount * 2 && todayCount > 5) {
          setSpikeAlert({ count: todayCount, increase: Math.round((todayCount / (avgCount || 1)) * 100) });
        }

        setTrendData({
          labels: last14Days.map(d => d.split('-').slice(1).join('/')),
          datasets: [{
            label: 'Daily Grievances',
            data: trendValues,
            fill: true,
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderColor: 'rgb(59, 130, 246)',
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: 'rgb(59, 130, 246)'
          }]
        });

        // 2. Department Data
        const depts = {};
        data.forEach(g => {
          const d = g.department || 'Unassigned';
          depts[d] = (depts[d] || 0) + 1;
        });
        setDeptData({
          labels: Object.keys(depts),
          datasets: [{
            label: 'Count',
            data: Object.values(depts),
            backgroundColor: 'rgba(99, 102, 241, 0.7)',
            borderRadius: 8
          }]
        });

        // 3. Category Data
        const cats = {};
        data.forEach(g => {
          const c = g.category || 'General';
          cats[c] = (cats[c] || 0) + 1;
        });
        setCatData({
          labels: Object.keys(cats),
          datasets: [{
            data: Object.values(cats),
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(239, 68, 68, 0.8)',
              'rgba(139, 92, 246, 0.8)'
            ]
          }]
        });

      } catch (err) {
        console.error('Analytics Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter grievances with valid coordinates for the map
  const mapPoints = useMemo(() => {
    return grievances.filter(g => g.location && g.location.lat && g.location.lng);
  }, [grievances]);

  if (loading) return (
    <div className="p-8 flex flex-col items-center justify-center py-40">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-500 :text-gray-400 font-bold animate-pulse text-xs uppercase tracking-widest">Generating Intelligence Reports...</p>
    </div>
  );

  return (
    <div className="p-8 :bg-gray-900 min-h-screen transition-colors duration-300">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-gray-900 :text-gray-100 tracking-tight flex items-center gap-3">
          <BarChart3 className="text-blue-600" size={32} />
          Strategic Analytics
        </h1>
        <p className="text-gray-500 :text-gray-400 mt-1 font-medium italic">Data-driven insights for systemic improvement.</p>
      </div>

      {/* Spike Alert Banner */}
      {spikeAlert && (
        <div className="mb-8 bg-red-50 :bg-red-900/20 border-2 border-red-200 :border-red-800/50 p-5 rounded-2xl flex items-center gap-4 animate-bounce">
          <div className="p-3 bg-red-500 rounded-xl shadow-lg shadow-red-200 :shadow-none">
            <TrendingUp size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-black text-red-800 :text-red-200 uppercase tracking-tight">Active Spike Detected!</h3>
            <p className="text-sm text-red-700 :text-red-300 font-medium">
              Today's volume is <span className="underline font-black">{spikeAlert.increase}% higher</span> than average ({spikeAlert.count} new reports).
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Main Trend Chart */}
        <div className="xl:col-span-2 space-y-8">
          <div className="bg-white :bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 :border-gray-700">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-gray-800 :text-gray-100 flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-500" />
                Grievance Velocity (14 Days)
              </h2>
            </div>
            <div className="h-80">
              {trendData && <Line data={trendData} options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                scales: { 
                  y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                  x: { grid: { display: false } }
                },
                plugins: { legend: { display: false } }
              }} />}
            </div>
          </div>

          {/* Heatmap Section */}
          <div className="bg-white :bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 :border-gray-700 overflow-hidden">
             <h2 className="text-xl font-bold text-gray-800 :text-gray-100 mb-6 flex items-center gap-2">
                <MapIcon size={20} className="text-emerald-500" />
                Geospatial Incident Heatmap
              </h2>
              <div className="h-96 rounded-2xl overflow-hidden border border-gray-100 :border-gray-700 z-0">
                <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {mapPoints.map(g => (
                    <CircleMarker 
                      key={g._id}
                      center={[g.location.lat, g.location.lng]}
                      radius={scoreToRadius(g.priorityScore)}
                      pathOptions={{ 
                        fillColor: scoreToColor(g.priorityScore),
                        color: 'white',
                        weight: 1,
                        fillOpacity: 0.6
                      }}
                    >
                      <Popup>
                        <div className="p-1">
                          <p className="font-bold text-sm">{g.title}</p>
                          <p className="text-xs text-gray-500">{g.department}</p>
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))}
                </MapContainer>
              </div>
          </div>
        </div>

        {/* Side Charts */}
        <div className="space-y-8">
          {/* Category Distribution */}
          <div className="bg-white :bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 :border-gray-700">
             <h2 className="text-lg font-bold text-gray-800 :text-gray-100 mb-6 flex items-center gap-2">
                <PieChart size={18} className="text-orange-500" />
                Issue Archetypes
              </h2>
              <div className="h-64 flex items-center justify-center">
                {catData && <Pie data={catData} options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } }
                }} />}
              </div>
          </div>

          {/* Department Performance */}
          <div className="bg-white :bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 :border-gray-700">
             <h2 className="text-lg font-bold text-gray-800 :text-gray-100 mb-6 flex items-center gap-2">
                <BarChart3 size={18} className="text-indigo-500" />
                Department Load
              </h2>
              <div className="h-80">
                {deptData && <Bar data={deptData} options={{ 
                  indexAxis: 'y',
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } }
                }} />}
              </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// Helpers for Map
const scoreToColor = (s) => (s >= 70 ? '#ef4444' : s >= 40 ? '#f97316' : '#10b981');
const scoreToRadius = (s) => Math.min(Math.max(s / 5, 8), 25);

export default Analytics;
