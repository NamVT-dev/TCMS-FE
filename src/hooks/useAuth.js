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
    loading,
  } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await login(email, password); 
      setIsLoading(false);

      if (!result.success) {
        setError(result.message); 
        return false;
      }
      
    
      return result; 
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
    loading,
    isLoading,
    error,
  };
};

export default useAuth;
