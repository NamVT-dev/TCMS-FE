import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar';
import AdminSidebar from '../../components/Layout/AdminSidebar';
import AdminOverview from '../../components/Admin/AdminOverview/AdminOverview';
import AdminViewStudentList from '../../components/Admin/AdminManageUser/AdminManagerSudent/AdminViewSudentList';
import AdminViewTeacherList from '../../components/Admin/AdminManageUser/AdminManageTeacher/AdminViewTeacherList';
import AdminViewParentList from '../../components/Admin/AdminManageUser/AdminManageParent/AdminViewParentList';
import AdminViewClassList from '../../components/Admin/AdminManageClass/AdminViewClassList';
import AdminCreateClass from '../../components/Admin/AdminManageClass/AdminCreateClass';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar - Fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      {/* Main Content */}
      <div className="flex pt-16">
        {/* Sidebar */}
        <div className="fixed left-0 h-[calc(100vh-64px)]">
          <div className="h-full rounded-tr-[32px] overflow-hidden">
            <AdminSidebar />
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 ml-72 p-6">
          <Routes>
          
            <Route path="/overview" element={<AdminOverview />} />
            <Route path="/users/students" element={<AdminViewStudentList />} />
            <Route path="/users/teachers" element={<AdminViewTeacherList />} />
            <Route path="/users/parents" element={<AdminViewParentList />} />
            <Route path="/classes" element={<AdminViewClassList />} />
            <Route path="/create/class" element={<AdminCreateClass />} />

            {/* Add other routes here matching your sidebar paths */}
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;