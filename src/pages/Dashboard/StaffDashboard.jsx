import React from 'react'
import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar';
import StaffOverview from '../../components/Staff/StaffOverview/StaffOverview';
import StaffSidebar from '../../components/Layout/StaffSidebar';
import StaffManageTeacherView from '../../components/Staff/StaffManageUser/StaffManageTeacher/StaffManageTeacherView';
import StaffManageStudentView from '../../components/Staff/StaffManageUser/StaffManagerSudent/StaffManageStudentView';
import StaffViewUpdateProfile from '../../components/Staff/StaffInformation/StaffViewUpdateProfile';

const StaffDashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar - Fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      {/* Main Content */}
      <div className="flex pt-16">
        {/* Sidebar */}
        <div className={`fixed left-0 h-[calc(100vh-64px)] transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'w-20' : ''
        }`}>
          <div className="h-full rounded-tr-[32px] overflow-hidden">
            <StaffSidebar 
              isCollapsed={isSidebarCollapsed} 
              onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
            />
          </div>
        </div>

        {/* Dashboard Content */}
        <div className={`flex-1 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'ml-20' : 'ml-72'
        } p-6`}>
          <Routes>
            <Route path="/overview" element={<StaffOverview />} />
            <Route path="/users/teachers" element={<StaffManageTeacherView />} />
            <Route path="/users/students" element={<StaffManageStudentView />} />
            <Route path="/profile" element={<StaffViewUpdateProfile />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default StaffDashboard;