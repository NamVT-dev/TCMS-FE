import React from 'react'
import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar';
import TeacherSidebar from '../../components/Layout/TeacherSidebar';
import TeacherOverview from '../../components/Teacher/TeacherOverview/TeacherOverview';
import TeacherViewUpdateProfile from '../../components/Teacher/TeacherInformation/TeacherViewUpdateProfile';
import TeacherRegisterSchedule from '../../components/Teacher/TeacherInformation/TeacherRegisterSchedule ';
import TeacherViewSchedule from '../../components/Teacher/TeacherWork/TeacherTimtable/TeacherViewScheduel';
import TeacherClassDetail from '../../components/Teacher/TeacherWork/TeacherClassDetail';
import TeacherMyClasses from '../../components/Teacher/TeacherWork/TeacherMyClasses';
import TodayAttendancePage from '../../components/Teacher/TeacherAttendance/TodayAttendancePage';
import AttendanceDetailPage from '../../components/Teacher/TeacherAttendance/AttendanceDetailPage';
import AttendanceHistoryPage from '../../components/Teacher/TeacherAttendance/AttendanceHistoryPage';

const TeacherDashboard = () => {
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
        <div className={`fixed left-0 h-[calc(100vh-64px)] transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-20' : ''
          }`}>
          <div className="h-full rounded-tr-[32px] overflow-hidden">
            <TeacherSidebar
              isCollapsed={isSidebarCollapsed}
              onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />
          </div>
        </div>

        {/* Dashboard Content */}
        <div className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'ml-20' : 'ml-72'
          } p-6`}>
          <Routes>
            <Route path="/overview" element={<TeacherOverview />} />
            <Route path="/profile" element={<TeacherViewUpdateProfile />} />
            <Route path="/work-schedule" element={<TeacherRegisterSchedule />} />
            <Route path="/timetable" element={<TeacherViewSchedule />} />
            <Route path="/my-classes" element={<TeacherMyClasses />} />
            <Route path="/my-classes/:classId" element={<TeacherClassDetail />} />
            <Route path="/attendance" element={<TodayAttendancePage />} />
            <Route path="/attendance/:attendanceId" element={<AttendanceDetailPage />} />
            <Route path="/attendance-history" element={<AttendanceHistoryPage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;