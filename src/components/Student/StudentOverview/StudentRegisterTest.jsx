import React, { useState } from "react";
import api from "../../../utils/api"; 

const StudentRegisterTest = () => {
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    course: "",
    testId: "", 
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const res = await api.user.registerTest(formData);
      setMessage(res.data.message || "Đăng ký thành công!");
      setFormData({ name: "", dob: "", course: "", testId: "" });
    } catch (err) {
      setMessage(err.response?.data?.message || "Có lỗi xảy ra khi đăng ký!");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý input thay đổi
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
   <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-2xl border-4 border-indigo-500 shadow-xl">
      <h2 className="text-2xl font-semibold text-indigo-600 mb-4 text-center">
        Đăng ký Test đầu vào
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Ngày sinh</label>
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Khóa học</label>
          <input
            type="text"
            name="course"
            value={formData.course}
            onChange={handleChange}
            required
            placeholder="VD: IELTS, TOEIC, ..."
            className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Mã đề</label>
          <input
            type="text"
            name="testId"
            value={formData.testId}
            onChange={handleChange}
            required
            placeholder="VD: Test001"
            className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

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

export default StudentRegisterTest ;
