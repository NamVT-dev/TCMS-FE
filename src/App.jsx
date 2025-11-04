import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import LoginForm from "./pages/Auth/LoginForm";
import RegisterForm from "./pages/Auth/RegisterForm";
import StudentDashboard from "./pages/Dashboard/StudentDashboard";
import TeacherDashboard from "./pages/Dashboard/TeacherDashboard";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import HomePage from "./pages/Homepage/HomePage";
import { UserProvider } from "./context/UserContext";
import ProtectedRoute from "./hooks/ProtectedRoute";
import VerifyOtp from "./pages/Auth/VerifyOtp ";
import GuestViewCourseDetail from "./pages/Homepage/GuestViewCourseDetail";
import StudentRegisterTest from "./components/Student/StudentOverview/StudentRegisterTest"; 
import ForgotPasswordForm from "./pages/Auth/ForgotPasswordForm";
import ResetPasswordForm from "./pages/Auth/ResetPasswordForm";


// Component wrapper để xử lý modal
function AppContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();

  // Mở modal khi URL là /register-first-test
  useEffect(() => {
    if (location.pathname === "/register-first-test") {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
  }, [location.pathname]);

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage onOpenModal={() => setIsModalOpen(true)} />} />
        <Route path="/register-first-test" element={<HomePage onOpenModal={() => setIsModalOpen(true)} />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />  
        <Route path="/courses/:id" element={<GuestViewCourseDetail />} />
        <Route path="/forgot-password" element={<ForgotPasswordForm />} />
        <Route path="/reset-password" element={<ResetPasswordForm />} />

        {/* Protected Routes */}
        <Route
          path="/student/*"
          element={
            <ProtectedRoute allowedRoles={['member']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/*"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      {/* Modal global */}
      <StudentRegisterTest 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}

const App = () => {
  return (
    <div>
      <Router>
        <UserProvider>
          <AppContent />
        </UserProvider>
      </Router>
    </div>
  );
};

export default App;