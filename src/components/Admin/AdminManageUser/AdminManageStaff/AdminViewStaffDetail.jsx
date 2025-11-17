import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../../../utils/api";
import { Mail, Phone, Calendar, User as UserIcon, ArrowLeft, Edit, Loader2 } from "lucide-react";

const AdminViewStaffDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      const res = await api.admin.getStaffDetail(id);
      setStaff(res.data.data.data);
      setLoading(false);
    };
    fetchStaff();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
      </div>
    );
  }

  const { profile = {}, email, active } = staff || {};

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link
            to="/admin/users/staff"
            className="flex items-center text-purple-600 hover:text-purple-800 font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay lại danh sách
          </Link>
          <button
            onClick={() => navigate(`/admin/users/staff/edit/${id}`)}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm"
          >
            <Edit className="w-5 h-5 mr-2" />
            Sửa thông tin
          </button>
        </div>

        {/* Thẻ thông tin chính */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {/* Gradient Header */}
          <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-40 relative">
            <div className="absolute left-1/2 -bottom-12 transform -translate-x-1/2">
              <img
                src={profile.photo || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                alt="Avatar"
                className="w-28 h-28 rounded-full border-4 border-white shadow-lg object-cover bg-white"
              />
            </div>
          </div>

          {/* Nội dung thông tin */}
          <div className="pt-16 pb-8 px-6 text-center">
            <h1 className="text-2xl font-semibold text-gray-900">
              {profile.fullname || staff.username}
            </h1>
            <p className="text-gray-500">{email}</p>

            <div className="mt-2">
              <span
                className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
              >
                {active ? "Đang hoạt động" : "Tạm ngưng"}
              </span>
            </div>

            {/* Các thông tin chi tiết */}
            <div className="grid sm:grid-cols-2 gap-4 mt-8">
              <div className="flex items-center border rounded-lg px-4 py-3 text-gray-700">
                <UserIcon className="w-5 h-5 mr-2 text-purple-600" />
                <b>Giới tính:</b>&nbsp; {profile.gender === "male" ? "Nam" : "Nữ"}
              </div>
              <div className="flex items-center border rounded-lg px-4 py-3 text-gray-700">
                <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                <b>Ngày sinh:</b>&nbsp;{" "}
                {profile.dob ? new Date(profile.dob).toLocaleDateString("vi-VN") : "N/A"}
              </div>
              <div className="flex items-center border rounded-lg px-4 py-3 text-gray-700">
                <Mail className="w-5 h-5 mr-2 text-purple-600" />
                <b>Email:</b>&nbsp; {email}
              </div>
              {profile.phoneNumber && (
                <div className="flex items-center border rounded-lg px-4 py-3 text-gray-700">
                  <Phone className="w-5 h-5 mr-2 text-purple-600" />
                  <b>Số điện thoại:</b>&nbsp; {profile.phoneNumber}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminViewStaffDetail;
