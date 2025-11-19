import React from 'react'
import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar';
import StudentSidebar from '../../components/Layout/StudentSidebar';
import StudentProfile from '../../components/Student/StudentInformation/StudentProfile';
import StudentOverview from '../../components/Student/StudentOverview/StudentOverview';
import LearnerProfileView from '../../components/Student/StudentOverview/LearnerProfileView';
import StudentChangePassword from '../../components/Student/StudentInformation/StudentChangePassword';
import StudentPaymentHistoryView from '../../components/Student/StudentInformation/StudentPaymentHistoryView';

const StudentDashboard = () => {
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
            <StudentSidebar 
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
            <Route path="/overview" element={<StudentOverview />} />
            <Route path="/learner-profile" element={<LearnerProfileView />} />
            <Route path="/profile" element={<StudentProfile />} />
            <Route path="/change-password" element={<StudentChangePassword />} />
       
           
            
            <Route path="/payment-history" element={<StudentPaymentHistoryView />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;