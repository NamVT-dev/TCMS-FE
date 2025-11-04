import { useContext, useState } from "react";
import UserContext from "../context/UserContext";

export const useAuth = () => {
  const {
    login,
    logout,
    signup,
    updatePassword,
    forgotPassword,
    resetPassword,
    user,
    updateProfile,
  } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await login(email, password);
      setIsLoading(false);

      if (!response.success) {
        setError(response.message); // ⬅️ HIỂN THỊ MESSAGE TỪ BACKEND
        return false;
      }

      return response.data;
    } catch (err) {
      setIsLoading(false);
      setError("Có lỗi xảy ra, vui lòng thử lại");
      return false;
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    await logout();
    setIsLoading(false);
  };

  const handleSignUp = async (name, email, password, passwordConfirm) => {
    try {
      setIsLoading(true);
      setError(null);
      return await signup(name, email, password, passwordConfirm);
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (
    passwordCurrent,
    password,
    passwordConfirm
  ) => {
    try {
      setIsLoading(true);
      setError(false);
      return await updatePassword(passwordCurrent, password, passwordConfirm);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Đã có sẵn trong code của bạn, chỉ cần kiểm tra lại
  const handleForgotPassword = async (email) => {
    try {
      setIsLoading(true);
      setError(null);
      return await forgotPassword(email);
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (email, token, password, passwordConfirm) => {
    try {
      setIsLoading(true);
      setError(null);
      return await resetPassword(email, token, password, passwordConfirm);
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (data) => {
    try {
      setIsLoading(true);
      setError(null);
      return await updateProfile(data);
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login: handleLogin,
    logout: handleLogout,
    signup: handleSignUp,
    updatePassword: handleUpdatePassword,
    forgotPassword: handleForgotPassword,
    resetPassword: handleResetPassword,
    updateProfile: handleUpdateProfile,
    user,
    isLoading,
    error,
  };
};

export default useAuth;
