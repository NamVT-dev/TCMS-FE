import React from 'react';
import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar';
import AdminSidebar from '../../components/Layout/AdminSidebar';
import AdminOverview from '../../components/Admin/AdminOverview/AdminOverview';
import AdminViewStudentList from '../../components/Admin/AdminManageUser/AdminManagerSudent/AdminViewSudentList';
import AdminViewTeacherList from '../../components/Admin/AdminManageUser/AdminManageTeacher/AdminViewTeacherList';
import AdminViewParentList from '../../components/Admin/AdminManageUser/AdminManageParent/AdminViewParentList';
import AdminViewClassList from '../../components/Admin/AdminManageClass/AdminViewClassList';
import AdminCreateClass from '../../components/Admin/AdminManageClass/AdminCreateClass';
import AdminViewRoomList from '../../components/Admin/AdminManageRoom/AdminViewRoomList';
import AdminViewEnrollmentList from '../../components/Admin/AdminManageUser/AdminManageEnrollment/AdminViewEnrollList';
import AdminViewTimeWorkingCenter from '../../components/Admin/AdminManageRoom/AdminViewTimeWorkingCenter';
import AdminViewCourseList from '../../components/Admin/AdminManageCourse/AdminViewCourseList';
import AdminScheduleDashboard from '../../components/Admin/AdminManageShedule/AdminScheduleDashboard';
import AdminScheduleJobDetail from '../../components/Admin/AdminManageShedule/AdminScheduleJobDetail';
import AdminScheduleAnalytics from '../../components/Admin/AdminManageShedule/AdminScheduleAnalytics';

const AdminDashboard = () => {
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
        <div className={`fixed left-0 h-[calc(100vh-64px)] transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-20' : 'w-72'
          }`}>
          <div className="h-full rounded-tr-[32px] overflow-hidden">
            <AdminSidebar
              isCollapsed={isSidebarCollapsed}
              onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />
          </div>
        </div>

        {/* Dashboard Content */}
        <div className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'ml-20' : 'ml-72'
          } p-6`}>
          <Routes>

            <Route path="/overview" element={<AdminOverview />} />
            <Route path="/users/students" element={<AdminViewStudentList />} />
            <Route path="/users/teachers" element={<AdminViewTeacherList />} />

            <Route path="/users/parents" element={<AdminViewParentList />} />
            <Route path="/users/enrollments" element={<AdminViewEnrollmentList />} />
            <Route path="/classes" element={<AdminViewClassList />} />
            <Route path="/classes/create" element={<AdminCreateClass />} />
            <Route path="/facility/rooms" element={<AdminViewRoomList />} />
            <Route path="/facility/working-hours" element={<AdminViewTimeWorkingCenter />} />

            <Route path="/courses" element={<AdminViewCourseList />} />
            <Route path="/scheduler/dashboard" element={<AdminScheduleDashboard />}/>
            <Route path="/scheduler/jobs/:jobId" element={<AdminScheduleJobDetail />}/>
            <Route path="/scheduler/analytics" element={<AdminScheduleAnalytics />}/>

            {/* Add other routes here matching your sidebar paths */}
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;