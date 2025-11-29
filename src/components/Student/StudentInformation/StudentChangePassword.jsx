import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Lock, Check, X, AlertCircle } from "lucide-react";
import api from "../../../utils/api";
import toast from "react-hot-toast";

const StudentChangePassword = () => {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [errors, setErrors] = useState({
    match: false,
    length: false,
    pattern: false,
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); 

  const validatePassword = () => {
    const { newPassword, confirmPassword } = formData;
    setErrors({
      match: newPassword === confirmPassword,
      length: newPassword.length >= 8,
      pattern: /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(
        newPassword
      ),
    });
  };

  useEffect(() => {
    validatePassword();
  }, [formData.newPassword, formData.confirmPassword]);

  const isFormValid = () => {
    return (
      Object.values(errors).every((v) => v === true) &&
      formData.oldPassword.trim() !== ""
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) return;

    setLoading(true);
    setErrorMessage(""); 
    setSuccessMessage(""); 
    
    try {
      const payload = {
        passwordCurrent: formData.oldPassword,
        password: formData.newPassword,
        passwordConfirm: formData.confirmPassword,
      };

      const res = await api.user.updatePassword(payload);

      if (res.data.status === "success") {
        setFormData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setSuccessMessage("Đổi mật khẩu thành công!");
        toast.success("Đổi mật khẩu thành công!");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) {
      // ✅ Xử lý nhiều trường hợp lỗi
      let errorMsg = "Có lỗi xảy ra. Vui lòng thử lại!";
      
      if (error.response?.data) {
        const data = error.response.data;
        
        // Thử nhiều cách lấy message
        if (data.message) {
          errorMsg = data.message;
        } else if (typeof data === 'string') {
          errorMsg = data;
        } else if (data.error) {
          errorMsg = data.error;
        }
      } else if (error.response?.status === 401) {
        errorMsg = "Mật khẩu hiện tại không đúng.";
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      // ✅ Hiển thị error CẢ 2 CÁCH: toast + state
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
      
      // Auto clear error sau 5s
      setTimeout(() => setErrorMessage(""), 5000);
      
      console.error("Error changing password:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-8xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Thay đổi mật khẩu
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Old Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">
              Mật khẩu hiện tại
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPasswords.oldPassword ? "text" : "password"}
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleChange}
                className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("oldPassword")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.oldPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">
              Mật khẩu mới
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPasswords.newPassword ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("newPassword")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.newPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">
              Xác nhận mật khẩu mới
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPasswords.confirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("confirmPassword")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.confirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              {errors.match ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <X className="w-4 h-4 text-red-500" />
              )}
              <span
                className={errors.match ? "text-green-600" : "text-red-600"}
              >
                Mật khẩu mới và xác nhận phải trùng khớp
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {errors.length ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <X className="w-4 h-4 text-red-500" />
              )}
              <span
                className={errors.length ? "text-green-600" : "text-red-600"}
              >
                Mật khẩu phải có ít nhất 8 ký tự
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {errors.pattern ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <X className="w-4 h-4 text-red-500" />
              )}
              <span
                className={errors.pattern ? "text-green-600" : "text-red-600"}
              >
                Mật khẩu phải có chữ hoa, số và ký tự đặc biệt
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={!isFormValid() || loading}
            className={`w-full font-semibold py-3 rounded-xl shadow-lg transition-all duration-200 ${
              isFormValid()
                ? "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
          </button>

          {errorMessage && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 font-medium">{errorMessage}</p>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              <p className="text-green-700 font-medium">{successMessage}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default StudentChangePassword;
