import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, Phone, Calendar as CalendarIcon } from "lucide-react"; 
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import toast from "react-hot-toast";
import Navbar from "../../components/Layout/Navbar";

import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { vi } from 'date-fns/locale';
import { format } from 'date-fns';

// Đăng ký tiếng Việt
registerLocale('vi', vi);

const RegisterForm = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    dob: "",
    password: "",
    passwordConfirm: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    dob: "", 
    password: "",
    passwordConfirm: "",
  });

  // --- REGEX VALIDATION ---
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10,11}$/;
    return phoneRegex.test(phone);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validateField = (name, value) => {
    let errorMsg = "";

    switch (name) {
      case "name":
        if (!value.trim()) errorMsg = "Vui lòng nhập họ và tên";
        break;
      case "email":
        if (!value.trim()) errorMsg = "Vui lòng nhập email";
        else if (!validateEmail(value)) errorMsg = "Email chưa đúng định dạng";
        break;
      case "phoneNumber":
        if (!value.trim()) errorMsg = "Vui lòng nhập số điện thoại";
        else if (!validatePhone(value)) errorMsg = "Số điện thoại phải có 10-11 chữ số";
        break;
      case "dob":
        if (!value) errorMsg = "Vui lòng chọn ngày sinh";
        break;
      case "password":
        if (!value) errorMsg = "Vui lòng nhập mật khẩu";
        else if (!validatePassword(value)) errorMsg = "Mật khẩu phải có ít nhất 6 ký tự";
        break;
      case "passwordConfirm":
        if (!value) errorMsg = "Vui lòng xác nhận mật khẩu";
        else if (value !== formData.password) errorMsg = "Mật khẩu xác nhận không khớp";
        break;
      default:
        break;
    }

    setFieldErrors((prev) => ({ ...prev, [name]: errorMsg }));
    return errorMsg === "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");
    setMessage("");
    setFormData({ ...formData, [name]: value });
    
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const validateForm = () => {
    let isValid = true;
    Object.keys(formData).forEach((key) => {
      if (!validateField(key, formData[key])) {
        isValid = false;
      }
    });
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin!");
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      setFieldErrors((prev) => ({ ...prev, passwordConfirm: "Mật khẩu xác nhận không khớp" }));
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const success = await signup(formData);

      if (success) {
        toast.success("Đăng ký thành công!");
        setMessage("✅ Đăng ký thành công! Vui lòng xác thực OTP trong email của bạn...");
        localStorage.setItem("pendingEmail", formData.email);
        setTimeout(() => navigate("/verify-otp"), 1500);
      } else {
        setError("Không thể đăng ký. Vui lòng thử lại sau!");
      }
    } catch (err) {
      console.error("Registration error:", err);
      let errorMessage = "Đăng ký thất bại! Vui lòng kiểm tra lại thông tin.";
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const commonInputClass = (hasError) => `w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 transition-all outline-none ${
    hasError
      ? "border-red-500 focus:ring-red-500"
      : "border-gray-300 focus:ring-purple-500 focus:border-transparent"
  }`;

  return (
    <div className="min-h-screen w-full flex flex-col">
      <Navbar />

      <div className="flex-1 flex bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900">
        <div className="w-full md:w-[55%] flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl px-8 py-10 space-y-6">
            <div className="flex flex-col items-center space-y-3">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                TutorCenter
              </h1>
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">Tạo tài khoản mới!</h2>
              <p className="text-gray-500 text-sm">Đăng ký để bắt đầu hành trình học tập</p>
            </div>

            {message && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                <p className="text-green-600 text-center font-medium">{message}</p>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <p className="text-red-600 text-center font-medium whitespace-pre-line">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Họ và tên"
                  icon={<User />}
                  name="name"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={fieldErrors.name}
                  required
                />
                <InputField
                  label="Email"
                  icon={<Mail />}
                  name="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={fieldErrors.email}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Số điện thoại"
                  icon={<Phone />}
                  name="phoneNumber"
                  type="tel"
                  placeholder="0123456789"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={fieldErrors.phoneNumber}
                  required
                />
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 block">
                    Ngày sinh <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <DatePicker
                      selected={formData.dob ? new Date(formData.dob) : null}
                      onChange={(date) => {
                        const val = date ? format(date, 'yyyy-MM-dd') : '';
                        setFormData(prev => ({ ...prev, dob: val }));
                        // Xóa lỗi nếu có
                        if (fieldErrors.dob) setFieldErrors(prev => ({ ...prev, dob: '' }));
                      }}
                      onBlur={() => validateField('dob', formData.dob)}
                      dateFormat="dd/MM/yyyy"
                      locale="vi"
                      showYearDropdown
                      scrollableYearDropdown
                      yearDropdownItemNumber={100} // Cho phép chọn 100 năm về trước
                      maxDate={new Date()} // Không chọn ngày tương lai
                      className={commonInputClass(fieldErrors.dob)}
                      placeholderText="01/01/2000"
                      wrapperClassName="w-full"
                      onKeyDown={(e) => e.preventDefault()} // Chặn nhập tay
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
                        <CalendarIcon className="w-5 h-5" />
                    </div>
                  </div>
                  {fieldErrors.dob && (
                    <p className="text-red-600 text-xs mt-1 ml-1 flex items-center">
                      <span className="inline-block w-1 h-1 bg-red-600 rounded-full mr-1.5"></span>
                      {fieldErrors.dob}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <PasswordField
                  label="Mật khẩu"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={fieldErrors.password}
                  show={showPassword}
                  setShow={setShowPassword}
                  required
                />
                <PasswordField
                  label="Xác nhận mật khẩu"
                  name="passwordConfirm"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={fieldErrors.passwordConfirm}
                  show={showConfirmPassword}
                  setShow={setShowConfirmPassword}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Đang xử lý..." : "Đăng ký"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-600">
              Đã có tài khoản?{" "}
              <button
                onClick={() => navigate("/login")}
                className="inline-block px-3 py-1 text-purple-600 hover:text-white font-semibold hover:bg-purple-600 rounded-lg transition-all"
              >
                Đăng nhập ngay
              </button>
            </p>
          </div>
        </div>

        <div className="hidden md:block md:w-[45%]">
          <img
            src="/images/banner.png"
            alt="Register Illustration"
            className="w-full h-full object-cover rounded-l-[32px]"
          />
        </div>
      </div>
    </div>
  );
};

const InputField = ({ label, icon, error, onBlur, required, ...props }) => {
    const inputClass = `w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 transition-all outline-none ${
        error
          ? "border-red-500 focus:ring-red-500"
          : "border-gray-300 focus:ring-purple-500 focus:border-transparent"
      }`;

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                {React.cloneElement(icon, { className: "w-5 h-5" })}
            </div>
            <input
                {...props}
                onBlur={onBlur}
                required={required}
                className={inputClass}
            />
            </div>
            {error && (
            <p className="text-red-600 text-xs mt-1 ml-1 flex items-center">
                <span className="inline-block w-1 h-1 bg-red-600 rounded-full mr-1.5"></span>
                {error}
            </p>
            )}
        </div>
    );
};

const PasswordField = ({ label, name, value, onChange, onBlur, error, show, setShow, required }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-700 block">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
      <input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder="••••••••"
        className={`w-full pl-11 pr-12 py-3 border rounded-xl focus:ring-2 transition-all outline-none ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:ring-purple-500 focus:border-transparent"
        }`}
        required={required}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
    {error && (
      <p className="text-red-600 text-xs mt-1 ml-1 flex items-center">
        <span className="inline-block w-1 h-1 bg-red-600 rounded-full mr-1.5"></span>
        {error}
      </p>
    )}
  </div>
);

export default RegisterForm;