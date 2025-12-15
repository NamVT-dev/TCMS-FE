import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Navbar from "../../components/Layout/Navbar";

const LoginForm = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const { login, error, isLoading } = useAuth();

  // Regex để validate email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle thay đổi email
  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    // Clear error khi user bắt đầu nhập
    if (emailError && newEmail) {
      setEmailError("");
    }
  };

  // Validate email khi blur (rời khỏi input)
  const handleEmailBlur = () => {
    if (email && !validateEmail(email)) {
      setEmailError("Email chưa đúng định dạng");
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email trước khi submit
    if (!validateEmail(email)) {
      setEmailError("Email chưa đúng định dạng");
      return;
    }
    
    const res = await login(email, password);

    if (res && res.success) {
      if (res.needVerify) {
        localStorage.setItem("pendingEmail", res.user.email);
        navigate("/verify-otp");
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col">
      <Navbar />

      <div className="flex-1 flex bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900">
        <div className="w-full md:w-1/2 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl px-8 py-10 space-y-6">
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
            <div className="text-center space-y-1">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                Chào mừng trở lại!
              </h2>
              <p className="text-gray-500 text-sm">
                Đăng nhập để tiếp tục học tập
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={handleEmailBlur}
                    placeholder="your.email@example.com"
                    className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      emailError
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-purple-500 focus:border-transparent"
                    }`}
                    required
                    disabled={isLoading}
                  />
                </div>
                {emailError && (
                  <p className="text-red-600 text-xs mt-1 ml-1 flex items-center">
                    <span className="inline-block w-1 h-1 bg-red-600 rounded-full mr-1.5"></span>
                    {emailError}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">
                  Mật khẩu
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
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    disabled={isLoading}
                  />
                  <span className="text-gray-600">Ghi nhớ đăng nhập</span>
                </label>

                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-purple-600 hover:text-purple-800 font-medium transition-colors"
                  disabled={isLoading}
                >
                  Quên mật khẩu?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>

              {error && (
                <div className="flex justify-center">
                  <p className="inline-block text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm font-medium hover:bg-red-600 hover:text-white transition-all duration-200">
                    {error}
                  </p>
                </div>
              )}
            </form>

            <p className="text-center text-sm text-gray-600">
              Chưa có tài khoản?{" "}
              <button
                onClick={() => navigate("/register")}
                disabled={isLoading}
                className="inline-block px-3 py-1 text-purple-600 hover:text-white font-semibold 
                  hover:bg-purple-600 rounded-lg transition-all duration-200 ease-in-out 
                  hover:shadow-md active:transform active:translate-y-0.5 disabled:opacity-50"
              >
                Đăng ký ngay
              </button>
            </p>
          </div>
        </div>

        <div className="hidden md:block md:w-1/2">
          <img
            src="/images/banner.png"
            alt="Login Illustration"
            className="w-full h-full object-cover rounded-l-[32px]"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginForm;