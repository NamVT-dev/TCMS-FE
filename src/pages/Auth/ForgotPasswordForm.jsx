import React, { useState } from "react";
import { Mail, BookOpen, ArrowLeft, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const ForgotPasswordForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const { forgotPassword, isLoading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await forgotPassword(email);
    
    if (result) {
      setIsSuccess(true);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen w-full flex bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900">
        <div className="w-full md:w-1/2 flex items-center justify-center">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl px-8 py-10 space-y-6">
            {/* Success Icon */}
            <div className="flex flex-col items-center space-y-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Kiểm tra email của bạn!
              </h2>
              <p className="text-gray-600 text-center max-w-md">
                Chúng tôi đã gửi link đặt lại mật khẩu đến email{" "}
                <span className="font-semibold text-purple-600">{email}</span>
              </p>
              <p className="text-sm text-gray-500 text-center">
                Link sẽ hết hạn sau 10 phút. Vui lòng kiểm tra cả thư mục spam.
              </p>
            </div>

            {/* Back to Login */}
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Quay lại đăng nhập
            </button>
          </div>
        </div>

        {/* Right side - Image */}
        <div className="hidden md:block md:w-1/2">
          <img
            src="/images/banner.png"
            alt="Forgot Password Illustration"
            className="w-full h-full object-cover rounded-l-[32px]"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900">
      {/* Left side - Form */}
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
              Quên mật khẩu?
            </h2>
            <p className="text-gray-500 text-sm">
              Nhập email để nhận link đặt lại mật khẩu
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? "Đang gửi..." : "Gửi link đặt lại mật khẩu"}
            </button>

            {/* Error message */}
            {error && (
              <div className="flex justify-center">
                <p className="inline-block text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm font-medium hover:bg-red-600 hover:text-white transition-all duration-200">
                  {error}
                </p>
              </div>
            )}
          </form>

          {/* Back to Login Link */}
          <button
            onClick={() => navigate("/login")}
            className="w-full flex items-center justify-center gap-2 text-purple-600 hover:text-purple-800 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại đăng nhập
          </button>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden md:block md:w-1/2">
        <img
          src="/images/banner.png"
          alt="Forgot Password Illustration"
          className="w-full h-full object-cover rounded-l-[32px]"
        />
      </div>
    </div>
  );
};

export default ForgotPasswordForm;