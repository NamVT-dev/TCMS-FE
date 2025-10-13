import { createContext, useEffect, useState } from "react";
import { authService, userService } from "../utils/apiPaths";
import { useNavigate } from "react-router-dom";
const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
  const token = localStorage.getItem('token');
  const savedUser = localStorage.getItem('user');
  
  if (!token || !savedUser) {
    // Nếu không có token hoặc user data, và không ở trang login
    if (window.location.pathname !== '/login') {
      navigate('/login', { replace: true });
    }
    return;
  }

  try {
    const userData = JSON.parse(savedUser);
    setUser(userData);
    
    // Chỉ redirect khi ở trang login hoặc trang chủ
    if (window.location.pathname === '/login' || window.location.pathname === '/') {
      const { role } = userData;
      const roleRoutes = {
        admin: '/admin/overview',
        teacher: '/teacher/overview',
        student: '/student/overview',
        parent: '/parent/overview'
      };

      navigate(roleRoutes[role] || '/login', { replace: true });
    }
  } catch (error) {
    console.error('Error parsing user data:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  }
}, [navigate]);

  useEffect(() => {
  async function fetchUser() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, skipping user fetch');
        setLoading(false);
        return;
      }

      console.log('Fetching user profile...');
      const res = await userService.getMe();
      const userData = res.data.data.data;
      if (userData) {
        console.log('User profile loaded:', userData);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  }
  fetchUser();
}, []);

  const login = async (email, password) => {
  try {
    console.log('Attempting login...', { email });
    const response = await authService.login(email, password);

    if (response?.data?.data?.user) {
      const userData = response.data.data.user;
      const { role } = userData;
      
      // Lưu data trước
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', response.data.token);
      setUser(userData);

      // Sau đó mới navigate
      const roleRoutes = {
        admin: '/admin/overview',
        teacher: '/teacher/overview',
        student: '/student/overview',
        parent: '/parent/overview'
      };

      navigate(roleRoutes[role] || '/login', { replace: true });
      return response;
    }

    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

  const signup = async (name, email, password, passwordConfirm) => {
    try {
      const res = await authService.signup(
        name,
        email,
        password,
        passwordConfirm
      );
      if (res.data.status === "success") {
        setUser(res.data.data.user);
        return true;
      }
    } catch (err) {
      throw new Error(err.response?.data?.message || "Không thể đăng kí");
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      navigate("/");
      return true;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Không thể đăng xuất");
    }
  };

  const updatePassword = async (passwordCurrent, password, passwordConfirm) => {
    try {
      await userService.updatePassword(
        passwordCurrent,
        password,
        passwordConfirm
      );
      return true;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Không thể đổi mật khẩu");
    }
  };

  const forgotPassword = async (email) => {
    try {
      const res = await authService.forgotPassword(email);
      if (res.data.status === "success") return true;
    } catch (err) {
      throw new Error(
        err.response?.data?.message ||
          "Có vấn đề xảy ra trong quá trình xác nhận!"
      );
    }
  };

  const resetPassword = async (email, token, password, passwordConfirm) => {
    try {
      const res = await authService.resetPassword(
        email,
        token,
        password,
        passwordConfirm
      );
      if (res.data.status === "success") return true;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Không thể đặt lại mật khẩu"
      );
    }
  };

  const updateProfile = async (data) => {
    try {
      const res = await userService.updateProfile(data);
      if (res.data.status === "success") {
        setUser(res.data.data.user);
      }
      return true;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Không thể cập nhật hồ sơ"
      );
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        updatePassword,
        forgotPassword,
        resetPassword,
        isAuthenticated: !!user,
        updateProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
