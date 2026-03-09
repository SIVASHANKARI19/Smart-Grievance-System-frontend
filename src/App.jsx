import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import 'leaflet/dist/leaflet.css';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Citizen Pages
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import SubmitGrievance from './pages/citizen/SubmitGrievance';
import MyGrievances from './pages/citizen/MyGrievances';

// Officer Pages
import OfficerDashboard from './pages/officer/OfficerDashboard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import Analytics from './pages/admin/Analytics';

// Landing Page Placeholder
const LandingPage = () => (
  <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4">
    <div className="text-center max-w-3xl">
      <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6 mt-10">
         Smart Public Grievance <span className="text-blue-600 block sm:inline">Redressal System</span>
      </h1>
      <p className="mt-4 text-xl text-gray-600 mb-10 leading-relaxed">
        A transparent, fast, and reliable platform to report public issues and track their resolution by respective city departments.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <a href="/register" className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all w-full sm:w-auto">
          Report an Issue
        </a>
        <a href="/login" className="px-8 py-4 bg-white text-gray-800 border border-gray-200 font-bold rounded-xl shadow-sm hover:bg-gray-50 transition-all w-full sm:w-auto">
          Track Status
        </a>
      </div>
    </div>
    <div className="mt-20 block w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto pb-20">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
           <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
              <span className="font-bold text-xl">1</span>
           </div>
           <h3 className="text-xl font-bold mb-3">Submit Grievance</h3>
           <p className="text-gray-500 leading-relaxed">Log your issue online securely with location details.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
           <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
              <span className="font-bold text-xl">2</span>
           </div>
           <h3 className="text-xl font-bold mb-3">Track Progress</h3>
           <p className="text-gray-500 leading-relaxed">Real-time updates as your report is assigned to an officer.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
           <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
              <span className="font-bold text-xl">3</span>
           </div>
           <h3 className="text-xl font-bold mb-3">Issue Resolved</h3>
           <p className="text-gray-500 leading-relaxed">Department resolves the problem and updates the portal.</p>
        </div>
      </div>
    </div>
  </div>
);

// Layout wrapper for authenticated pages to include Sidebar
const DashboardLayout = () => {
  return (
    <div className="flex flex-col md:flex-row bg-gray-50 min-h-[calc(100vh-4rem)]">
      <Sidebar />
      <main className="flex-1 w-full overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

const AppRoutes = () => {
  const { token, role, loading } = useContext(AuthContext);

  if (loading) return null; // Avoid flicker

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <div className="flex-grow">
        <Routes>
          {/* Public Routes */}
<Route
  path="/"
  element={
    token && role
      ? <Navigate to={`/${role}/dashboard`} replace />
      : <LandingPage />
  }
/>       <Route
  path="/login"
  element={
    token && role
      ? <Navigate to={`/${role}/dashboard`} replace />
      : <Login />
  }
/>

<Route
  path="/register"
  element={
    token && role
      ? <Navigate to={`/${role}/dashboard`} replace />
      : <Register />
  }
/>

          {/* Protected Routes Wrapper mapped to layout */}
          <Route element={<DashboardLayout />}>
            
            {/* Citizen Routes */}
            <Route path="/citizen" element={<ProtectedRoute allowedRoles={['citizen']} />}>
              <Route path="dashboard" element={<CitizenDashboard />} />
              <Route path="submit" element={<SubmitGrievance />} />
              <Route path="my-grievances" element={<MyGrievances />} />
            </Route>

            {/* Officer Routes */}
            <Route path="/officer" element={<ProtectedRoute allowedRoles={['officer']} />}>
              <Route path="dashboard" element={<OfficerDashboard />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="analytics" element={<Analytics />} />
            </Route>
            
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    // <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    // </ThemeProvider>
  );
}

export default App;
