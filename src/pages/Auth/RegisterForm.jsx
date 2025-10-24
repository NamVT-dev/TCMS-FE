import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, BookOpen, User, Phone, Calendar, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import toast from "react-hot-toast";

const RegisterForm = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(""); // ✅ Thông báo thành công
  const [error, setError] = useState(""); // ✅ Thông báo lỗi

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    dob: "",
    role: "student",
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

      const success = await signup(formData);

      if (success) {
        toast.success("Đăng ký thành công!");
        setMessage("✅ Đăng ký thành công! Vui lòng xác thực OTP trong email của bạn...");
        localStorage.setItem("pendingEmail", formData.email);

        // ⏳ Delay 1.5s rồi điều hướng sang trang nhập OTP
        setTimeout(() => navigate("/verify-otp"), 1500);
      } else {
        setError("Không thể đăng ký. Vui lòng thử lại sau!");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Đăng ký thất bại! Vui lòng kiểm tra lại thông tin.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900">
      <div className="w-full md:w-1/2 flex items-center justify-center">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl px-8 py-10 space-y-6">
          {/* Logo */}
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              TutorCenter
            </h1>
            {/* <p className="text-gray-500 text-sm tracking-wide">ENGLISH LEARNING CENTER</p> */}
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Tạo tài khoản mới!</h2>
            <p className="text-gray-500 text-sm">Đăng ký để bắt đầu hành trình học tập</p>
          </div>

          {/* Thông báo */}
          {message && <p className="text-green-600 text-center font-medium">{message}</p>}
          {error && <p className="text-red-500 text-center font-medium">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField label="Họ và tên" icon={<User />} name="name" type="text"
              placeholder="Nguyễn Văn A" value={formData.name} onChange={handleChange} required />
            <InputField label="Email" icon={<Mail />} name="email" type="email"
              placeholder="your.email@example.com" value={formData.email} onChange={handleChange} required />
            <InputField label="Số điện thoại" icon={<Phone />} name="phoneNumber" type="tel"
              placeholder="0123456789" value={formData.phoneNumber} onChange={handleChange} required />
            <InputField label="Ngày sinh" icon={<Calendar />} name="dob" type="date"
              value={formData.dob} onChange={handleChange} required />

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">Vai trò</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                >
                  <option value="student">Học viên</option>
                  <option value="parent">Phụ huynh</option>
                </select>
              </div>
            </div>

            <PasswordField label="Mật khẩu" name="password" value={formData.password}
              onChange={handleChange} show={showPassword} setShow={setShowPassword} />
            <PasswordField label="Xác nhận mật khẩu" name="passwordConfirm" value={formData.passwordConfirm}
              onChange={handleChange} show={showConfirmPassword} setShow={setShowConfirmPassword} />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
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

      <div className="hidden md:block md:w-1/2">
        <img src="/images/banner.png" alt="Register Illustration" className="w-full h-full object-cover rounded-l-[32px]" />
      </div>
    </div>
  );
};

/* ========== Sub Components ========== */
const InputField = ({ label, icon, ...props }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-700 block">{label}</label>
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>
      <input {...props} className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500" />
    </div>
  </div>
);

const PasswordField = ({ label, name, value, onChange, show, setShow }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-700 block">{label}</label>
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder="••••••••"
        className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
        required
      />
      <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
        {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  </div>
);

export default RegisterForm;
