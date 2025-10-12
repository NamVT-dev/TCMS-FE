import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from "./pages/Auth/LoginForm";
import RegisterForm from "./pages/Auth/RegisterForm";
import StudentDashboard from "./pages/Dashboard/StudentDashboard";
import TeacherDashboard from "./pages/Dashboard/TeacherDashboard";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import HomePage from "./pages/Homepage/HomePage";
import { UserProvider } from "./context/UserContext";

const App = () => {
  return (
    <div>
      <Router>
        <UserProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/student/*" element={<StudentDashboard />} />
            <Route path="/teacher/*" element={<TeacherDashboard />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
          </Routes>
        </UserProvider>
      </Router>
    </div>
  );
};

export default App;
