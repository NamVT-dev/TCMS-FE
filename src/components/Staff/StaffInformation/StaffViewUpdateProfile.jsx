import React, { useState, useEffect } from "react";

const StaffViewUpdateProfile = () => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

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
        title: "Nhân viên trung tâm",
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

  const handleUpdate = () => setIsEditing(true);

  const handleSave = () => {
    setIsEditing(false);
    localStorage.setItem(
      "user",
      JSON.stringify({
        ...JSON.parse(localStorage.getItem("user")),
        profile: {
          ...JSON.parse(localStorage.getItem("user")).profile,
          fullname: profile.name,
          phoneNumber: profile.phone,
          gender: profile.gender === "Nam" ? "male" : "female",
          dob: profile.dob,
          address: profile.address,
          photo: profile.avatar,
        },
      })
    );

    alert("Lưu thành công!");
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-50 py-10">
      <div className="bg-white shadow-lg rounded-2xl p-10 w-full max-w-4xl">
        
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
            disabled={isEditing}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Cập nhật
          </button>

          {isEditing && (
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
