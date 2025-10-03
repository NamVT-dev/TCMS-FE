import React from 'react';
import Navbar from '../../components/Layout/Navbar';
import AdminSidebar from '../../components/Layout/AdminSidebar';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar - Fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      {/* Main Content */}
      <div className="flex pt-16"> {/* pt-16 to offset fixed navbar */}
        {/* Sidebar */}
        <div className="fixed left-0 h-[calc(100vh-64px)]"> {/* 64px is navbar height */}
          <div className="h-full rounded-tr-[32px] overflow-hidden">
            <AdminSidebar />
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 ml-72 p-6"> {/* ml-72 matches sidebar width */}
          {/* Add your dashboard content here */}
          <h1 className="text-2xl font-semibold text-gray-800">Dashboard Content</h1>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;