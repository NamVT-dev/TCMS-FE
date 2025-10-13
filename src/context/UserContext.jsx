import { createContext, useEffect, useState } from "react";

import api from "../utils/api";
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
      if (window.location.pathname !== '/login') {
        navigate('/login', { replace: true });
      }
      return;
    }

    try {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      
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
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        console.log('Fetching user profile...');
        
        const res = await api.user.getMe();
        const userData = res.data.data.data;
        if (userData) {
          console.log('User profile loaded:', userData);
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData)); // Đồng bộ lại localStorage
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
      
      const response = await api.auth.login({ email, password });

      if (response?.data?.data?.user) {
        const userData = response.data.data.user;
        const token = response.data.token;
        const { role } = userData;
        
        
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        setUser(userData);

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

  const signup = async (signupData) => {
    try {
      
      const res = await api.auth.signup(signupData);
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
      await api.auth.logout();
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate("/");
      return true;
    } catch (err) {
      
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate("/");
      console.error(err.response?.data?.message || "Lỗi khi đăng xuất");
    }
  };

  const updatePassword = async (passwordData) => {
    try {
     
      await api.user.updatePassword(passwordData);
      return true;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Không thể đổi mật khẩu");
    }
  };

  const forgotPassword = async (email) => {
    try {
      const res = await api.auth.forgotPassword(email);
      return res.data.status === "success";
    } catch (err) {
      throw new Error(err.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const resetPassword = async (resetData) => {
    try {
      
      const res = await api.auth.resetPassword(resetData);
      return res.data.status === "success";
    } catch (err) {
      throw new Error(err.response?.data?.message || "Không thể đặt lại mật khẩu");
    }
  };

  const updateProfile = async (data) => {
    try {
      const res = await api.user.updateProfile(data);
      if (res.data.status === "success") {
        const updatedUser = res.data.data.user;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser)); // Cập nhật lại user trong localStorage
      }
      return true;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Không thể cập nhật hồ sơ");
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