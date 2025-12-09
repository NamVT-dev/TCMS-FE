import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar'; 
import StaffSidebar from '../../components/Layout/StaffSidebar'; 


// 1. Staff / AdminManageUser (Student, Teacher, Enrollment)
import StaffViewStudentList from '../../components/Staff/AdminManageUser/AdminManagerSudent/AdminViewSudentList';
import StaffStudentDetail from '../../components/Staff/AdminManageUser/AdminManagerSudent/AdminStudentDetail';
import StaffViewTeacherList from '../../components/Staff/AdminManageUser/AdminManageTeacher/AdminViewTeacherList';
import StaffViewTeacherDetail from '../../components/Staff/AdminManageUser/AdminManageTeacher/AdminViewTeacherDetail';
import StaffViewEnrollmentList from '../../components/Staff/AdminManageUser/AdminManageEnrollment/AdminViewEnrollList';

// 2. Staff / AdminManageClass
import StaffViewClassList from '../../components/Staff/AdminManageClass/AdminViewClassList';
import StaffClassDetail from '../../components/Staff/AdminManageClass/AdminClassDetail';
import StaffClassScheduleForm from '../../components/Staff/AdminManageClass/AdminClassScheduleForm';
import StaffViewDetailSessionClass from '../../components/Staff/AdminManageClass/AdminViewDetailSessionClass';
import AdminCreateClassModal from '../../components/Staff/AdminManageClass/AdminCreateClassModal';

// 3. Staff / AdminManageRequest
import StaffRequestDashboard from '../../components/Staff/AdminManageRequest/AdminManageLearnerRequest/AdminRequestDashboard';
import StaffRequestList from '../../components/Staff/AdminManageRequest/AdminManageLearnerRequest/AdminRequestList';
import StaffSubstituteManager from '../../components/Staff/AdminManageRequest/AdminManageTeacherRequest/AdminSubstituteManager';

// 4. Staff / AdminManageRoom & Complain
import StaffViewRoomList from '../../components/Staff/AdminManageRoom/AdminViewRoomList';
import StaffViewListComplain from '../../components/Staff/AdminManageRequest/AdminManageUserComplain/AdminViewListComplain';

// 5. Staff / StaffInformation
import StaffViewUpdateProfile from '../../components/Staff/StaffInformation/StaffViewUpdateProfile';


const StaffDashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>
      <div className="flex pt-16">
        {/* Sidebar container */}
        <div className={`fixed left-0 h-[calc(100vh-64px)] transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-20' : 'w-72'
          }`}>
          <div className="h-full rounded-tr-[32px] overflow-hidden">
            <StaffSidebar
              isCollapsed={isSidebarCollapsed}
              onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />
          </div>
        </div>

        <div className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'ml-20' : 'ml-72'
          } p-6`}>
          <Routes>


            <Route path="/users/students" element={<StaffViewStudentList />} />
            <Route path="/users/student/:id" element={<StaffStudentDetail />} />

            <Route path="/users/teachers" element={<StaffViewTeacherList />} />
            <Route path="/users/teachers/detail/:id" element={<StaffViewTeacherDetail />} />

            <Route path="/users/enrollments" element={<StaffViewEnrollmentList />} />

            <Route path="/requests/dashboard" element={<StaffRequestDashboard />} />
            <Route path="/requests/list" element={<StaffRequestList />} />
            <Route path="/requests/substitute" element={<StaffSubstituteManager />} />

            <Route path="/classes" element={<StaffViewClassList />} />
            <Route path="/classes/detail/:id" element={<StaffClassDetail />} />
            <Route path="/classes/:id/schedule-setup" element={<StaffClassScheduleForm />} />
            <Route path="/classes/:id/sessions" element={<StaffViewDetailSessionClass />} />
            <Route path="/classes/create" element={< StaffViewClassList />} />


            <Route path="/facility/rooms" element={<StaffViewRoomList />} />
            <Route path="/facility/complain" element={<StaffViewListComplain />} />

            <Route path="/profile" element={<StaffViewUpdateProfile />} />

          </Routes>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;