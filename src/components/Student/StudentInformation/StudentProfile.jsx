import React, { useEffect, useState } from "react";
import api from "../../../utils/api";

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // ✅ Gọi API theo chuẩn dự án
        const res = await api.user.getMe();

        // ✅ Lấy dữ liệu từ mock API
        const user = res.data.data.data;
        setProfile({
          name: user.profile.fullname,
          email: user.email,
          title: user.role === "member" ? "Học viên" : user.role,
          gender: "Nam",
          dob: user.profile.dob.split("T")[0],
          phone: user.profile.phoneNumber,
          
          avatar: user.profile.photo,
        });
      } catch (error) {
        console.error("Lỗi khi lấy thông tin user:", error);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (isEditing && profile) {
      setProfile({ ...profile, [name]: value });
    }
  };

  const handleUpdate = () => setIsEditing(true);
  const handleSave = () => {
    setIsEditing(false);
    alert("Đã lưu thay đổi:\n" + JSON.stringify(profile, null, 2));
  };

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600 text-lg">
        Đang tải thông tin...
      </div>
    );
  }

  return (
    
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-50 py-10">
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-6xl mx-auto">

        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <img
              src={profile.avatar}
              alt="Avatar"
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
            {isEditing && (
              <>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full p-2 cursor-pointer hover:bg-indigo-700 transition"
                >
                  ✏️
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      avatar: URL.createObjectURL(e.target.files[0]),
                    })
                  }
                />
              </>
            )}
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-800">
            {profile.name}
          </h2>
        </div>

        {/* Form */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 mb-2">Họ và tên</label>
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full border rounded-lg p-2 focus:outline-none ${
                isEditing
                  ? "bg-indigo-50 border-indigo-400 focus:ring-2 focus:ring-indigo-400"
                  : "bg-gray-100 border-gray-300 text-gray-700"
              }`}
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={profile.email}
              disabled
              className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100 text-gray-700"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Chức danh</label>
            <input
              type="text"
              name="title"
              value={profile.title}
              disabled
              className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100 text-gray-700"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Giới tính</label>
            <select
              name="gender"
              value={profile.gender}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full border rounded-lg p-2 focus:outline-none ${
                isEditing
                  ? "bg-indigo-50 border-indigo-400 focus:ring-2 focus:ring-indigo-400"
                  : "bg-gray-100 border-gray-300 text-gray-700"
              }`}
            >
              <option>Nam</option>
              <option>Nữ</option>
              <option>Khác</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Ngày sinh</label>
            <input
              type="date"
              name="dob"
              value={profile.dob}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full border rounded-lg p-2 focus:outline-none ${
                isEditing
                  ? "bg-indigo-50 border-indigo-400 focus:ring-2 focus:ring-indigo-400"
                  : "bg-gray-100 border-gray-300 text-gray-700"
              }`}
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Điện thoại</label>
            <input
              type="text"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full border rounded-lg p-2 focus:outline-none ${
                isEditing
                  ? "bg-indigo-50 border-indigo-400 focus:ring-2 focus:ring-indigo-400"
                  : "bg-gray-100 border-gray-300 text-gray-700"
              }`}
            />
          </div>

          
        </div>

        <div className="flex justify-end mt-10 gap-4">
          <button
            onClick={handleUpdate}
            disabled={isEditing}
            className={`px-6 py-2 rounded-lg transition font-medium ${
              isEditing
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gray-600 text-white hover:bg-gray-700"
            }`}
          >
            Cập nhật
          </button>
          {isEditing && (
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              Lưu
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
