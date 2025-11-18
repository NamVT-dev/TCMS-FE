import React from 'react';
import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar';
import AdminSidebar from '../../components/Layout/AdminSidebar';
import AdminOverview from '../../components/Admin/AdminOverview/AdminOverview';
import AdminViewStudentList from '../../components/Admin/AdminManageUser/AdminManagerSudent/AdminViewSudentList';
import AdminViewTeacherList from '../../components/Admin/AdminManageUser/AdminManageTeacher/AdminViewTeacherList';
import AdminViewClassList from '../../components/Admin/AdminManageClass/AdminViewClassList';
import AdminClassDetail from '../../components/Admin/AdminManageClass/AdminClassDetail';
import AdminClassForm from '../../components/Admin/AdminManageClass/AdminClassForm';
import AdminViewRoomList from '../../components/Admin/AdminManageRoom/AdminViewRoomList';
import AdminViewEnrollmentList from '../../components/Admin/AdminManageUser/AdminManageEnrollment/AdminViewEnrollList';
import AdminViewTimeWorkingCenter from '../../components/Admin/AdminManageRoom/AdminViewTimeWorkingCenter';
import AdminViewCourseList from '../../components/Admin/AdminManageCourse/AdminViewCourseList';
import AdminScheduleDashboard from '../../components/Admin/AdminManageShedule/AdminScheduleDashboard';
import AdminScheduleJobDetail from '../../components/Admin/AdminManageShedule/AdminScheduleJobDetail';
import AdminScheduleAnalytics from '../../components/Admin/AdminManageShedule/AdminScheduleAnalytics';
import AdminViewTeacherDetail from '../../components/Admin/AdminManageUser/AdminManageTeacher/AdminViewTeacherDetail';
import AdminTeacherForm from '../../components/Admin/AdminManageUser/AdminManageTeacher/AdminTeacherForm';
import AdminViewStaffList from '../../components/Admin/AdminManageUser/AdminManageStaff/AdminViewStaffList';
import AdminStaffCreate from '../../components/Admin/AdminManageUser/AdminManageStaff/AdminStaffCreate';
import AdminViewStaffDetail from '../../components/Admin/AdminManageUser/AdminManageStaff/AdminViewStaffDetail';
import AdminClassScheduleForm from '../../components/Admin/AdminManageClass/AdminClassScheduleForm';
import AdminRevenueReport from '../../components/Admin/AdminManageFinance/AdminRevenueReport';

const AdminDashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>
      <div className="flex pt-16">
        <div className={`fixed left-0 h-[calc(100vh-64px)] transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-20' : 'w-72'
          }`}>
          <div className="h-full rounded-tr-[32px] overflow-hidden">
            <AdminSidebar
              isCollapsed={isSidebarCollapsed}
              onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />
          </div>
        </div>

        <div className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'ml-20' : 'ml-72'
          } p-6`}>
          <Routes>
            <Route path="/overview" element={<AdminOverview />} />
            <Route path="/users/students" element={<AdminViewStudentList />} />


            <Route path="/users/teachers" element={<AdminViewTeacherList />} />
            <Route
              path="/users/teachers/detail/:id"
              element={<AdminViewTeacherDetail />}
            />
            <Route
              path="/users/teachers/create"
              element={<AdminTeacherForm />}
            />
            <Route
              path="/users/teachers/edit/:id"
              element={<AdminTeacherForm />}
            />
            {/* --- KẾT THÚC ROUTE GIÁO VIÊN --- */}

            {/* --- NHÂN VIÊN --- */}
            <Route path="/users/staff" element={<AdminViewStaffList />} />
            <Route path="/users/staff/create" element={<AdminStaffCreate />} />
            <Route path="/users/staff/edit/:id" element={<AdminStaffCreate />} />
            <Route path="/users/staff/detail/:id" element={<AdminViewStaffDetail />} />
            {/* --- KẾT THÚC ROUTE NHÂN VIÊN --- */}

            <Route path="/users/enrollments" element={<AdminViewEnrollmentList />} />

           
            <Route path="/classes" element={<AdminViewClassList />} />
            <Route path="/classes/detail/:id" element={<AdminClassDetail />} />
            <Route path="/classes/create" element={<AdminClassForm />} />
            <Route path="/classes/edit/:id" element={<AdminClassForm />} />
            <Route path="/classes/:id/schedule-setup" element={<AdminClassScheduleForm />} />
          

            <Route path="/facility/rooms" element={<AdminViewRoomList />} />
            <Route path="/facility/working-hours" element={<AdminViewTimeWorkingCenter />} />

            <Route path="/courses" element={<AdminViewCourseList />} />
            <Route path="/scheduler/dashboard" element={<AdminScheduleDashboard />} />
            <Route path="/scheduler/jobs/:jobId" element={<AdminScheduleJobDetail />} />
            <Route path="/scheduler/analytics" element={<AdminScheduleAnalytics />} />

            <Route path="/finance/revenue" element={<AdminRevenueReport />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;