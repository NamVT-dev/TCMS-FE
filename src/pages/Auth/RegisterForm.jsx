import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, Phone, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import toast from "react-hot-toast";
import Navbar from "../../components/Layout/Navbar";  

const RegisterForm = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    dob: "",
    password: "",
    passwordConfirm: "",
  });

  const handleChange = (e) => {
    setError("");
    setMessage("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.passwordConfirm) {
      setError("Mật khẩu xác nhận không khớp!");
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      console.log("📤 Data being sent:", formData);

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
      console.error("❌ Error details:", err.response?.data);
      
      const msg =
        err?.response?.data?.message || "Đăng ký thất bại! Vui lòng kiểm tra lại thông tin.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

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

            {message && <p className="text-green-600 text-center font-medium">{message}</p>}
            {error && <p className="text-red-500 text-center font-medium">{error}</p>}

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
                  required 
                />
                <InputField 
                  label="Ngày sinh" 
                  icon={<Calendar />} 
                  name="dob" 
                  type="date"
                  value={formData.dob} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <PasswordField 
                  label="Mật khẩu" 
                  name="password" 
                  value={formData.password}
                  onChange={handleChange} 
                  show={showPassword} 
                  setShow={setShowPassword} 
                  required
                />
                <PasswordField 
                  label="Xác nhận mật khẩu" 
                  name="passwordConfirm" 
                  value={formData.passwordConfirm}
                  onChange={handleChange} 
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

const InputField = ({ label, icon, required, ...props }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-700 block">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>
      <input 
        {...props}
        required={required}
        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none" 
      />
    </div>
  </div>
);

const PasswordField = ({ label, name, value, onChange, show, setShow, required }) => (
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
        placeholder="••••••••"
        className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
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
  </div>
);

export default RegisterForm;