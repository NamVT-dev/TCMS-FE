import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Lock, BookOpen, CheckCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const ResetPasswordForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const { resetPassword, isLoading, error } = useAuth();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    if (!token || !email) {
      navigate("/login");
    }
  }, [token, email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== passwordConfirm) {
      return;
    }

    const result = await resetPassword(email, token, password, passwordConfirm);
    
    if (result) {
      setIsSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen w-full flex bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900">
        <div className="w-full md:w-1/2 flex items-center justify-center">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl px-8 py-10 space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Đặt lại mật khẩu thành công!
              </h2>
              <p className="text-gray-600 text-center">
                Mật khẩu của bạn đã được cập nhật. Đang chuyển đến trang đăng nhập...
              </p>
            </div>
          </div>
        </div>
        <div className="hidden md:block md:w-1/2">
          <img
            src="/images/banner.png"
            alt="Success Illustration"
            className="w-full h-full object-cover rounded-l-[32px]"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900">
      <div className="w-full md:w-1/2 flex items-center justify-center">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl px-8 py-10 space-y-6">
          {/* Logo Section */}
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center shadow-lg">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              TutorCenter
            </h1>
            <p className="text-gray-500 text-sm tracking-wide">
              ENGLISH LEARNING CENTER
            </p>
          </div>

          {/* Title */}
          <div className="text-center space-y-1">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              Đặt lại mật khẩu
            </h2>
            <p className="text-gray-500 text-sm">
              Nhập mật khẩu mới cho tài khoản của bạn
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">
                Mật khẩu mới
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                  disabled={isLoading}
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Confirm Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPasswordConfirm ? "text" : "password"}
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                  disabled={isLoading}
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPasswordConfirm ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Password requirements */}
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-xs text-gray-600">
                Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || password !== passwordConfirm}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
            </button>

            {/* Error message */}
            {error && (
              <div className="flex justify-center">
                <p className="inline-block text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm font-medium hover:bg-red-600 hover:text-white transition-all duration-200">
                  {error}
                </p>
              </div>
            )}

            {/* Password mismatch warning */}
            {password && passwordConfirm && password !== passwordConfirm && (
              <div className="flex justify-center">
                <p className="inline-block text-orange-600 bg-orange-50 border border-orange-200 rounded-lg px-4 py-2 text-sm font-medium">
                  Mật khẩu xác nhận không khớp
                </p>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden md:block md:w-1/2">
        <img
          src="/images/banner.png"
          alt="Reset Password Illustration"
          className="w-full h-full object-cover rounded-l-[32px]"
        />
      </div>
    </div>
  );
};

export default ResetPasswordForm;