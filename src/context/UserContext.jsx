import { createContext, useEffect, useState } from "react";
import { authService, userService } from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await userService.getMe();
        const user = res.data.data.data;
        if (user) {
          setUser(user);
        }
        setLoading(false);
      } catch (error) {
        throw new Error(
          error.response?.data?.message ||
            "Không lấy được thông tin người dùng!"
        );
      }
    }
    fetchUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authService.login(email, password);
      if (res.data.status === "success") {
        setUser(res.data.data.user);
        return res.data.data.user;
      }
    } catch (err) {
      throw new Error(err.response?.data?.message || "Không thể đăng nhập");
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
