import React, { useEffect, useState } from "react";
import api from "../../../utils/api";

const StudentRegisterTest = () => {
  const [isForSelf, setIsForSelf] = useState(true);
  const [students, setStudents] = useState([{ name: "", dob: "", categoryId: "" }]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 🧠 Lấy danh sách category khi load trang
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
    fetchCategories();
  }, []);

  // 🧠 Khi chọn “Đăng ký cho bản thân” → tự fill thông tin từ profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (isForSelf) {
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
      } else {
        // Khi chuyển sang đăng ký cho con, reset về 1 học sinh trống
        setStudents([{ name: "", dob: "", categoryId: "" }]);
      }
    };

    fetchProfile();
  }, [isForSelf]);

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

  // 🚀 Submit form
  const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage("");
  setLoading(true);

  try {
    let responseMessage = "";

    if (isForSelf) {
      // === Đăng ký cho bản thân ===
      const { name, dob, categoryId } = students[0];
      const res = await api.user.registerTest({ name, dob, categoryId });

      // Ưu tiên message từ backend
      responseMessage = res?.data?.message || "Đăng ký thành công! Kiểm tra email để biết thông tin test.";
    } else {
      // === Đăng ký cho nhiều học sinh ===
      for (const s of students) {
        await api.user.registerTest(s);
      }
      responseMessage = "Đã đăng ký thành công cho tất cả học sinh! Kiểm tra email để biết thông tin test.";
    }

    // Hiển thị thông báo
    setMessage(responseMessage);

    // Reset form
    setStudents([{ name: "", dob: "", categoryId: "" }]);
  } catch (err) {
    console.error("Lỗi khi đăng ký test:", err);
    const backendError = err?.response?.data?.message;
    setMessage(backendError || "Có lỗi xảy ra khi đăng ký! Vui lòng thử lại sau.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded-2xl border-4 border-indigo-500 shadow-xl">
      <h2 className="text-2xl font-semibold text-indigo-600 mb-4 text-center">
        Đăng ký Test đầu vào
      </h2>

      {/* Chọn hình thức đăng ký */}
      <div className="flex justify-center gap-6 mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isForSelf}
            onChange={handleToggle}
            className="w-5 h-5 accent-indigo-600"
          />
          <span className="font-medium text-gray-700">Đăng ký cho bản thân</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={!isForSelf}
            onChange={handleToggle}
            className="w-5 h-5 accent-indigo-600"
          />
          <span className="font-medium text-gray-700">Đăng ký cho con</span>
        </label>
      </div>

      {/* Form đăng ký */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {students.map((student, index) => (
          <div
            key={index}
            className="p-4 border rounded-xl shadow-sm bg-gray-50 relative"
          >
            {!isForSelf && (
              <span className="absolute -top-3 left-3 bg-indigo-600 text-white text-xs px-2 py-1 rounded">
                Học sinh {index + 1}
              </span>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Họ và tên
                </label>
                <input
                  type="text"
                  name="name"
                  value={student.name}
                  onChange={(e) => handleChange(index, e)}
                  required
                  disabled={isForSelf}
                  className={`w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-indigo-500 ${
                    isForSelf ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ngày sinh
                </label>
                <input
                  type="date"
                  name="dob"
                  value={student.dob}
                  onChange={(e) => handleChange(index, e)}
                  required
                  disabled={isForSelf}
                  className={`w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-indigo-500 ${
                    isForSelf ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Chọn khóa học
                </label>
                <select
                  name="categoryId"
                  value={student.categoryId}
                  onChange={(e) => handleChange(index, e)}
                  required
                  className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-indigo-500"
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
                className="text-red-500 mt-2 hover:underline"
              >
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
              className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              + Thêm học sinh
            </button>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          {loading ? "Đang đăng ký..." : "Đăng ký ngay"}
        </button>
      </form>

      {message && (
        <div
          className={`mt-4 text-center font-medium ${
            message.includes("thành công") ? "text-green-600" : "text-red-500"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default StudentRegisterTest;
