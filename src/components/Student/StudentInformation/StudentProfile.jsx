import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import moment from "moment"; 

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [selectedFile, setSelectedFile] = useState(null);
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.user.getMe();
        const user = res.data.data.data;

        setProfile({
          name: user.profile.fullname,
          email: user.email,
          gender: user.profile.gender === "male" ? "Nam" : "Nữ",
          dob: user.profile.dob ? user.profile.dob.split("T")[0] : "",
          phone: user.profile.phoneNumber,
          avatar: user.profile.photo,
        });
      } catch (error) {
        console.error("Lỗi khi lấy thông tin user:", error);
      }
    };

    fetchProfile();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    const { name, phone, dob } = profile;

    if (!name || !name.trim()) {
      newErrors.name = "Họ và tên không được để trống.";
    }

    if (!phone) {
      newErrors.phone = "Số điện thoại không được để trống.";
    } else {
      const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g; 
      if (!phoneRegex.test(phone)) {
        newErrors.phone = "Số điện thoại không hợp lệ.";
      }
    }

    if (!dob) {
      newErrors.dob = "Vui lòng chọn ngày sinh.";
    } else {
      const selectedDate = moment(dob);
      const today = moment().startOf("day");
      if (selectedDate.isAfter(today)) {
        newErrors.dob = "Ngày sinh không được ở tương lai.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (isEditing && profile) {
      setProfile({ ...profile, [name]: value });

      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  const handleUpdate = () => {
    if (isEditing) {
      setIsEditing(false);
      setErrors({});
      setMessage({ text: "", type: "" });
      
    } else {
      setIsEditing(true);
      setMessage({ text: "", type: "" });
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
        setMessage({ text: "Vui lòng kiểm tra lại thông tin.", type: "error" });
        return;
    }

    try {
      const formData = new FormData();
      formData.append("profile[fullname]", profile.name);
      formData.append("profile[phoneNumber]", profile.phone);
      formData.append("profile[dob]", profile.dob);
      formData.append(
        "profile[gender]",
        profile.gender === "Nam" ? "male" : "female"
      );

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
        setMessage({ text: "Cập nhật hồ sơ thành công!", type: "success" });
        setIsEditing(false); 
      } else {
        setMessage({
          text: res.data.message || "Cập nhật thất bại!",
          type: "error",
        });
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Đã xảy ra lỗi!",
        type: "error",
      });
    } finally {
      setSelectedFile(null);
      setTimeout(() => setMessage({ text: "", type: "" }), 4000);
    }
  };

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600 text-lg">
        Đang tải thông tin...
      </div>
    );
  }

  const getInputClass = (fieldName) => {
    let baseClass = "w-full border rounded-lg p-2 focus:outline-none transition-all ";
    
    if (errors[fieldName]) {
        return baseClass + "bg-white border-red-500 focus:ring-2 focus:ring-red-200";
    }

    if (isEditing) {
        return baseClass + "bg-purple-50 border-purple-400 focus:ring-2 focus:ring-purple-400";
    }

    return baseClass + "bg-gray-100 border-gray-300 text-gray-700";
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-50 py-10">
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-8xl mx-auto">
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
                  className="absolute bottom-0 right-0 bg-purple-600 text-white rounded-full p-2 cursor-pointer hover:bg-purple-700 transition"
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
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 mb-2">Họ và tên <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              disabled={!isEditing}
              className={getInputClass("name")}
            />
            {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={profile.email}
              disabled
              className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100 text-gray-700 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Giới tính</label>
            <select
              name="gender"
              value={profile.gender}
              onChange={handleChange}
              disabled={!isEditing}
              className={getInputClass("gender")}
            >
              <option>Nam</option>
              <option>Nữ</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Ngày sinh <span className="text-red-500">*</span></label>
            <input
              type="date"
              name="dob"
              value={profile.dob}
              onChange={handleChange}
              disabled={!isEditing}
              max={moment().format("YYYY-MM-DD")}
              className={getInputClass("dob")}
            />
            {errors.dob && (
                <p className="text-red-500 text-xs mt-1">{errors.dob}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Điện thoại <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              disabled={!isEditing}
              className={getInputClass("phone")}
            />
            {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-10 gap-4 flex-col items-end">
          <div className="flex gap-4">
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

          {message.text && (
            <p
              className={`mt-2 px-4 py-2 rounded-lg text-white text-sm w-fit ${message.type === "success" ? "bg-blue-600" : "bg-red-500"
                }`}
            >
              {message.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;