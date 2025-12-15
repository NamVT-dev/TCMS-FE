import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User, Users, FileText, Calendar, BookOpen, Plus, Trash2, Rocket, Loader2, CheckCircle, XCircle, Sparkles, AlertTriangle, Info, Ban } from "lucide-react";
import api from "../../../utils/api";

const StudentRegisterTest = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isForSelf, setIsForSelf] = useState(true);
  const [students, setStudents] = useState([{ name: "", dob: "", categoryId: "" }]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  // State lưu lỗi validation
  const [validationErrors, setValidationErrors] = useState({});

  // State mới để lưu số lượng học sinh hiện có của user
  const [existingStudentCount, setExistingStudentCount] = useState(0);
  const MAX_STUDENTS = 3;

  // Lấy ngày hiện tại theo format YYYY-MM-DD để làm giới hạn max
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const maxDate = getCurrentDate();

  // Lấy danh sách category khi modal mở
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

  // Lấy profile và check số lượng student
  useEffect(() => {
    const fetchProfile = async () => {
      if (isOpen) {
        try {
          const res = await api.user.getMe();
          const userData = res.data?.data?.data;

          // Cập nhật số lượng học sinh đã có từ mảng student
          if (userData && Array.isArray(userData.student)) {
            setExistingStudentCount(userData.student.length);
          }

          if (isForSelf && userData?.profile) {
            setStudents([
              {
                name: userData.profile.fullname || "",
                dob: userData.profile.dob ? userData.profile.dob.slice(0, 10) : "",
                categoryId: "",
              },
            ]);
          } else if (!isForSelf) {
            // Reset form khi chuyển sang đăng ký cho người khác
            setStudents([{ name: "", dob: "", categoryId: "" }]);
          }
          // Reset lỗi khi load lại form
          setValidationErrors({});
        } catch (err) {
          console.error("Lỗi khi lấy thông tin người dùng:", err);
        }
      }
    };

    fetchProfile();
  }, [isForSelf, isOpen]);

  // Update URL khi modal mở
  useEffect(() => {
    if (isOpen && location.pathname !== "/register-first-test") {
      navigate("/register-first-test", { replace: true });
    }
  }, [isOpen, navigate, location.pathname]);

  const handleToggle = () => {
    setIsForSelf(!isForSelf);
    setMessage("");
    setValidationErrors({});
  };

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...students];
    updated[index][name] = value;
    setStudents(updated);

    // Xóa lỗi validation của trường đang nhập (nếu có)
    if (validationErrors[`${name}_${index}`]) {
        setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[`${name}_${index}`];
            return newErrors;
        });
    }
  };

  // Logic thêm học sinh có validate giới hạn
  const handleAddStudent = () => {
    if (existingStudentCount + students.length < MAX_STUDENTS) {
      setStudents([...students, { name: "", dob: "", categoryId: "" }]);
    }
  };

  const handleRemoveStudent = (index) => {
    const updated = [...students];
    updated.splice(index, 1);
    setStudents(updated);
    
    // Reset lỗi khi xóa dòng để tránh index bị lệch
    setValidationErrors({});
  };

  const handleClose = () => {
    onClose();
    setMessage("");
    setValidationErrors({});
    if (location.pathname === "/register-first-test") {
      navigate("/", { replace: true });
    }
  };

  // --- Hàm Validate Form ---
  const validateForm = () => {
    let isValid = true;
    const errors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    students.forEach((student, index) => {
        // 1. Validate Tên
        if (!student.name || student.name.trim() === "") {
            errors[`name_${index}`] = "Họ và tên không được để trống.";
            isValid = false;
        }

        // 2. Validate Ngày sinh
        if (!student.dob) {
            errors[`dob_${index}`] = "Vui lòng chọn ngày sinh.";
            isValid = false;
        } else {
            const dobDate = new Date(student.dob);
            if (dobDate > today) {
                errors[`dob_${index}`] = "Ngày sinh không được ở tương lai.";
                isValid = false;
            }
        }

        // 3. Validate Category
        if (!student.categoryId) {
            errors[`categoryId_${index}`] = "Vui lòng chọn khóa học.";
            isValid = false;
        }
    });

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
        setMessage("Vui lòng kiểm tra lại thông tin nhập liệu.");
        return;
    }

    if (!isForSelf && (existingStudentCount + students.length > MAX_STUDENTS)) {
      setMessage(`Bạn đã vượt quá giới hạn đăng ký. Tài khoản chỉ được phép có tối đa ${MAX_STUDENTS} học sinh.`);
      return;
    }

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
        setExistingStudentCount(prev => prev + students.length);
        responseMessage = "Đã đăng ký thành công cho tất cả học sinh! Kiểm tra email để biết thông tin test.";
      }

      setMessage(responseMessage);
      if (!isForSelf) setStudents([{ name: "", dob: "", categoryId: "" }]);
      setValidationErrors({});

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

  const remainingSlots = MAX_STUDENTS - existingStudentCount;
  const canAddMore = (existingStudentCount + students.length) < MAX_STUDENTS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm animate-fadeIn p-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}>
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-slideUp scrollbar-thin">
        {/* Header */}
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

        <div className="p-8">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => !isForSelf && handleToggle()}
              className={`flex-1 py-4 px-6 rounded-2xl font-semibold transition-all duration-300 transform ${isForSelf
                  ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg scale-105"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              <User className="w-8 h-8 mx-auto mb-2" />
              Đăng ký cho bản thân
            </button>
            <button
              onClick={() => isForSelf && handleToggle()}
              className={`flex-1 py-4 px-6 rounded-2xl font-semibold transition-all duration-300 transform ${!isForSelf
                  ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg scale-105"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              <Users className="w-8 h-8 mx-auto mb-2" />
              Đăng ký cho người khác
            </button>
          </div>

          {!isForSelf && (
            <div className={`mb-6 p-4 rounded-xl border flex items-start gap-3 transition-all duration-300 ${remainingSlots <= 0
                ? "bg-orange-50 border-orange-200 text-orange-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
              }`}>
              {remainingSlots <= 0 ? (
                <AlertTriangle className="w-6 h-6 flex-shrink-0 text-orange-600 mt-1" />
              ) : (
                <Info className="w-6 h-6 flex-shrink-0 text-blue-600 mt-1" />
              )}
              <div>
                <h4 className="font-bold text-lg">
                  {remainingSlots <= 0
                    ? "Giới hạn đăng ký"
                    : "Thông tin tài khoản"}
                </h4>
                <p className="text-sm mt-1">
                  {remainingSlots <= 0
                    ? `Tài khoản của bạn đã đạt giới hạn tối đa ${MAX_STUDENTS} học sinh. Bạn không thể thêm học sinh mới.`
                    : `Tài khoản của bạn hiện đã có ${existingStudentCount} học sinh. Bạn còn có thể đăng ký thêm ${remainingSlots - students.length} người trong lần này.`
                  }
                </p>
              </div>
            </div>
          )}

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
                    <span className="font-semibold">Học sinh mới {index + 1}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
                  {/* --- Input Name --- */}
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
                      disabled={isForSelf || (remainingSlots <= 0 && index >= remainingSlots)}
                      className={`w-full border-2 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all 
                        ${isForSelf ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
                        ${validationErrors[`name_${index}`] ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""}
                      `}
                      placeholder="Nhập họ tên"
                    />
                    {validationErrors[`name_${index}`] && (
                        <p className="text-red-500 text-xs mt-1 font-medium">{validationErrors[`name_${index}`]}</p>
                    )}
                  </div>

                  {/* --- Input DOB --- */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      Ngày sinh <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="dob"
                      max={maxDate} // Disable ngày tương lai
                      value={student.dob}
                      onChange={(e) => handleChange(index, e)}
                      disabled={isForSelf}
                      className={`w-full border-2 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all 
                        ${isForSelf ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
                        ${validationErrors[`dob_${index}`] ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""}
                      `}
                    />
                    {validationErrors[`dob_${index}`] && (
                        <p className="text-red-500 text-xs mt-1 font-medium">{validationErrors[`dob_${index}`]}</p>
                    )}
                  </div>

                  {/* --- Input Category --- */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-purple-600" />
                      Chọn khóa học <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="categoryId"
                      value={student.categoryId}
                      onChange={(e) => handleChange(index, e)}
                      className={`w-full border-2 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-all
                         ${validationErrors[`categoryId_${index}`] ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""}
                      `}
                    >
                      <option value="">-- Chọn khóa học --</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    {validationErrors[`categoryId_${index}`] && (
                        <p className="text-red-500 text-xs mt-1 font-medium">{validationErrors[`categoryId_${index}`]}</p>
                    )}
                  </div>
                </div>

                {!isForSelf && students.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveStudent(index)}
                    className="mt-4 text-red-500 hover:text-red-700 font-medium flex items-center gap-2 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                    Xóa dòng này
                  </button>
                )}
              </div>
            ))}

            {!isForSelf && (
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddStudent}
                  disabled={!canAddMore}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform flex items-center gap-2 shadow-lg ${canAddMore
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:scale-105"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed shadow-none"
                    }`}
                >
                  
                  {canAddMore ? (
                    <Plus className="w-5 h-5" />
                  ) : (
                    <Ban className="w-5 h-5" />
                  )}

                  {canAddMore ? "Thêm học sinh khác" : "Đã đạt giới hạn tối đa"}
                </button>

                {!canAddMore && (
                  <span className="text-sm text-red-500 font-medium animate-pulse">
                    Tài khoản đã đăng ký tối đa 3 người dùng.
                  </span>
                )}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || (!isForSelf && remainingSlots <= 0 && students.length > 0 && students[0].name === "")}
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
                  {isForSelf ? "Đăng ký ngay" : `Đăng ký cho ${students.length} học sinh`}
                </>
              )}
            </button>
          </form>

          {/* Message */}
          {message && (
            <div
              className={`mt-6 p-4 rounded-xl font-medium text-center animate-slideDown flex items-center justify-center gap-2 ${message.includes("thành công")
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

      {/* Style css animation */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slideDown { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.4s ease-out; }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
      `}} />
    </div>
  );
};

export default StudentRegisterTest;