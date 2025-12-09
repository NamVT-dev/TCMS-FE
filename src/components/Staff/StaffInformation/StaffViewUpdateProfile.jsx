import React, { useState, useEffect } from "react";
import api from "../../../utils/api";
import showToast from "../../../utils/showToast";

const StaffViewUpdateProfile = () => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const userData = JSON.parse(storedUser);

      const p = userData.profile || {};

      setProfile({
        name: p.fullname || "",
        email: userData.email || "",
        phone: p.phoneNumber || "",
        gender: p.gender === "male" ? "Nam" : p.gender === "female" ? "Nữ" : "Khác",
        dob: p.dob ? p.dob.slice(0, 10) : "",
        avatar: p.photo || "https://ui-avatars.com/api/?name=" + (p.fullname || "User"),
        address: p.address || "",
      });
    }
  }, []);

  if (!profile)
    return (
      <div className="text-center p-10 text-gray-500">
        Đang tải dữ liệu...
      </div>
    );

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (isEditing) {
      setProfile({ ...profile, [name]: value });
    }
  };

  const handleUpdate = () => {
    if (isEditing) {
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear(); 
  const month = String(today.getMonth() + 1).padStart(2, '0'); 
  const day = String(today.getDate()).padStart(2, '0'); 
  
  return `${year}-${month}-${day}`;
};
  const handleSave = async () => {
    setIsEditing(false);
    const toastId = showToast.loading("Đang cập nhật thông tin cá nhân...");
    try {
      const formData = new FormData();
      formData.append("profile[fullname]", profile.name);
      formData.append("profile[phoneNumber]", profile.phone);
      formData.append("profile[dob]", profile.dob);
      formData.append(
        "profile[gender]",
        profile.gender === "Nam" ? "male" : "female"
      );

      // ✅ Nếu có file mới thì gửi file
      // ✅ Nếu không có file mới thì gửi lại avatar cũ để giữ nguyên ảnh
      if (selectedFile) {
        formData.append("profile[photo]", selectedFile);
      } else if (profile.avatar) {
        formData.append("profile[photo]", profile.avatar);
      }

      const res = await api.user.updateProfile(formData);

      if (res.data.status === "success") {
        const updated = res.data.data.user.profile;
        setProfile({
          ...profile,
          name: updated.fullname,
          phone: updated.phoneNumber,
          dob: updated.dob.split("T")[0],
          gender: updated.gender === "male" ? "Nam" : "Nữ",
          avatar: updated.photo,
        });
        showToast.updateSuccess(toastId, "Cập nhật hồ sơ thành công!");
      } else {
        showToast.updateError(toastId, res.data.message || "Cập nhật hồ sơ thất bại!");
      }
    } catch (err) {
      showToast.updateError(toastId, err.response?.data?.message || "Đã xảy ra lỗi!");
    } finally {
      setIsEditing(false);
      setSelectedFile(null);
      setTimeout(() => 4000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-50 py-10">
      <div className="bg-white shadow-lg rounded-2xl p-10 w-full max-w-6xl">

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
                  className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition"
                >
                  ✏️
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setSelectedFile(file);
                      setProfile({
                        ...profile,
                        avatar: URL.createObjectURL(file),
                      });
                    }
                  }}
                />
              </>
            )}
          </div>

          <h2 className="mt-4 text-xl font-semibold text-gray-800">
            {profile.name}
          </h2>
          <p className="text-gray-500">{profile.email}</p>
        </div>

        {/* FORM */}
        <div className="grid grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="block text-gray-700 mb-2">Họ và tên</label>
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full border rounded-lg p-2 bg-gray-100"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full border rounded-lg p-2 bg-gray-100"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-gray-700 mb-2">Giới tính</label>
            <select
              name="gender"
              value={profile.gender}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full border rounded-lg p-2 bg-gray-100"
            >
              <option>Nam</option>
              <option>Nữ</option>
              <option>Khác</option>
            </select>
          </div>

          {/* Dob */}
          <div>
            <label className="block text-gray-700 mb-2">Ngày sinh</label>
            <input
              type="date"
              name="dob"
              value={profile.dob}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full border rounded-lg p-2 bg-gray-100"
              max={getTodayDateString()}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-gray-700 mb-2">Điện thoại</label>
            <input
              type="text"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full border rounded-lg p-2 bg-gray-100"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end mt-10 gap-4">
          <button
            onClick={handleUpdate}
            className={`px-6 py-2 rounded-lg transition font-medium ${isEditing
              ? "bg-gray-600 text-white hover:bg-gray-500"
              : "bg-purple-600 text-white hover:bg-purple-500"
              }`}
          >
            {isEditing ? 'Hủy' : 'Cập nhật'}
          </button>

          {isEditing && (
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
            >
              Lưu
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffViewUpdateProfile;
