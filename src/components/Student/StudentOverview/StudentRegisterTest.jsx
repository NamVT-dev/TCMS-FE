import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User, Users, FileText, Calendar, BookOpen, Plus, Trash2, Rocket, Loader2, CheckCircle, XCircle, Sparkles } from "lucide-react";
import api from "../../../utils/api";

const StudentRegisterTest = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isForSelf, setIsForSelf] = useState(true);
  const [students, setStudents] = useState([{ name: "", dob: "", categoryId: "" }]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 🧠 Lấy danh sách category khi modal mở
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.user.getCourseCategories();
        const list = res.data?.data?.data || [];
        setCategories(list);
      } catch (err) {
        console.error("Lỗi khi tải categories:", err);
      }
    };
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (isForSelf && isOpen) {
        try {
          const res = await api.user.getMe();
          const profile = res.data?.data?.data?.profile;
          if (profile) {
            setStudents([
              {
                name: profile.fullname || "",
                dob: profile.dob ? profile.dob.slice(0, 10) : "",
                categoryId: "",
              },
            ]);
          }
        } catch (err) {
          console.error("Lỗi khi lấy thông tin người dùng:", err);
        }
      } else if (!isForSelf) {
        setStudents([{ name: "", dob: "", categoryId: "" }]);
      }
    };

    fetchProfile();
  }, [isForSelf, isOpen]);

  // 🔄 Update URL khi modal mở
  useEffect(() => {
    if (isOpen && location.pathname !== "/register-first-test") {
      navigate("/register-first-test", { replace: true });
    }
  }, [isOpen, navigate, location.pathname]);

  // 🧩 Toggle chế độ đăng ký
  const handleToggle = () => {
    setIsForSelf(!isForSelf);
    setMessage("");
  };

  // 🖋️ Xử lý thay đổi input
  const handleChange = (index, e) => {
    const updated = [...students];
    updated[index][e.target.name] = e.target.value;
    setStudents(updated);
  };

  // ➕ Thêm học sinh mới
  const handleAddStudent = () => {
    setStudents([...students, { name: "", dob: "", categoryId: "" }]);
  };

  // ❌ Xóa học sinh
  const handleRemoveStudent = (index) => {
    const updated = [...students];
    updated.splice(index, 1);
    setStudents(updated);
  };

  // 🚪 Đóng modal và quay về trang chủ
  const handleClose = () => {
    onClose();
    setMessage("");
    if (location.pathname === "/register-first-test") {
      navigate("/", { replace: true });
    }
  };

  // 🚀 Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      let responseMessage = "";

      if (isForSelf) {
        const { name, dob, categoryId } = students[0];
        const res = await api.user.registerTest({ name, dob, categoryId });
        responseMessage = res?.data?.message || "Đăng ký thành công! Kiểm tra email để biết thông tin test.";
      } else {
        for (const s of students) {
          await api.user.registerTest(s);
        }
        responseMessage = "Đã đăng ký thành công cho tất cả học sinh! Kiểm tra email để biết thông tin test.";
      }

      setMessage(responseMessage);
      setStudents([{ name: "", dob: "", categoryId: "" }]);

      // Đóng modal sau 2 giây
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      console.error("Lỗi khi đăng ký test:", err);
      const backendError = err?.response?.data?.message;
      setMessage(backendError || "Có lỗi xảy ra khi đăng ký! Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm animate-fadeIn p-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}>
     <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-slideUp scrollbar-thin">
        {/* Header với gradient */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 rounded-t-3xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8" />
              <div>
                <h2 className="text-3xl font-bold mb-2">Đăng ký Test Đầu Vào</h2>
                <p className="text-purple-100 text-sm">Khám phá trình độ của bạn - Hoàn toàn miễn phí!</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-300 transform hover:rotate-90"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-8">
          {/* Toggle buttons với design mới */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => !isForSelf && handleToggle()}
              className={`flex-1 py-4 px-6 rounded-2xl font-semibold transition-all duration-300 transform ${
                isForSelf
                  ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg scale-105"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <User className="w-8 h-8 mx-auto mb-2" />
              Đăng ký cho bản thân
            </button>
            <button
              onClick={() => isForSelf && handleToggle()}
              className={`flex-1 py-4 px-6 rounded-2xl font-semibold transition-all duration-300 transform ${
                !isForSelf
                  ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg scale-105"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Users className="w-8 h-8 mx-auto mb-2" />
              Đăng ký cho người khác
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {students.map((student, index) => (
              <div
                key={index}
                className="p-6 border-2 border-purple-100 rounded-2xl shadow-sm bg-gradient-to-br from-purple-50 to-white relative hover:shadow-md transition-shadow duration-300"
              >
                {!isForSelf && (
                  <div className="absolute -top-4 left-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-1 rounded-full shadow-md flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="font-semibold">Học sinh {index + 1}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-600" />
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={student.name}
                      onChange={(e) => handleChange(index, e)}
                      required
                      disabled={isForSelf}
                      className={`w-full border-2 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${
                        isForSelf ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                      }`}
                      placeholder="Nhập họ tên"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      Ngày sinh <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="dob"
                      value={student.dob}
                      onChange={(e) => handleChange(index, e)}
                      required
                      disabled={isForSelf}
                      className={`w-full border-2 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${
                        isForSelf ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-purple-600" />
                      Chọn khóa học <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="categoryId"
                      value={student.categoryId}
                      onChange={(e) => handleChange(index, e)}
                      required
                      className="w-full border-2 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-all"
                    >
                      <option value="">-- Chọn khóa học --</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {!isForSelf && students.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveStudent(index)}
                    className="mt-4 text-red-500 hover:text-red-700 font-medium flex items-center gap-2 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                    Xóa học sinh này
                  </button>
                )}
              </div>
            ))}

            {/* Nút thêm học sinh */}
            {!isForSelf && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleAddStudent}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Thêm học sinh
                </button>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang đăng ký...
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5" />
                  Đăng ký ngay
                </>
              )}
            </button>
          </form>

          {/* Message */}
          {message && (
            <div
              className={`mt-6 p-4 rounded-xl font-medium text-center animate-slideDown flex items-center justify-center gap-2 ${
                message.includes("thành công")
                  ? "bg-green-100 text-green-700 border-2 border-green-300"
                  : "bg-red-100 text-red-700 border-2 border-red-300"
              }`}
            >
              {message.includes("thành công") ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              {message}
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes slideDown {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}} />
    </div>
  );
};

export default StudentRegisterTest;