import React from 'react';
import {
  Mail,
  Phone,
  Calendar,
  User,
  Briefcase,
  DollarSign,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Edit,
} from 'lucide-react';

const AdminViewTeacherDetail = ({ teacher, onBack, onEdit }) => {
  if (!teacher) return null;

  const {
    username,
    email,
    profile,
    role,
    level,
    salary,
    active,
    class: classes,
    description,
    availability,
  } = teacher;

  return (
    <div className="p-6 bg-white rounded-xl shadow-md max-w-6xl mx-auto mt-6 relative">
      {/* Header + Action buttons */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Thông tin chi tiết giảng viên</h1>
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            <ArrowLeft size={18} />
            <span>Quay lại</span>
          </button>

          <button
            onClick={() => onEdit && onEdit(teacher)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <Edit size={18} />
            <span>Chỉnh sửa</span>
          </button>
        </div>
      </div>

      {/* Thông tin cơ bản */}
      <div className="flex items-center gap-6 border-b pb-6 mb-6">
        <img
          src={profile?.photo}
          alt={username}
          className="w-28 h-28 rounded-full object-cover border"
        />
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">{username}</h2>
          <p className="text-gray-500">{role?.toUpperCase()}</p>
          <p
            className={`mt-2 inline-flex items-center text-sm font-medium ${
              active ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {active ? (
              <CheckCircle className="w-4 h-4 mr-1" />
            ) : (
              <XCircle className="w-4 h-4 mr-1" />
            )}
            {active ? 'Đang hoạt động' : 'Tạm ngưng'}
          </p>
        </div>
      </div>

      {/* Thông tin chi tiết */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Thông tin cá nhân</h3>
          <p className="flex items-center text-gray-600">
            <Mail className="w-4 h-4 mr-2 text-indigo-500" /> {email}
          </p>
          <p className="flex items-center text-gray-600">
            <Phone className="w-4 h-4 mr-2 text-indigo-500" /> {profile?.phoneNumber}
          </p>
          <p className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-indigo-500" /> {profile?.dob}
          </p>
          <p className="flex items-center text-gray-600">
            <User className="w-4 h-4 mr-2 text-indigo-500" /> {profile?.gender}
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Thông tin giảng dạy</h3>
          <p className="flex items-center text-gray-600">
            <Briefcase className="w-4 h-4 mr-2 text-indigo-500" /> Trình độ:{' '}
            <span className="ml-2 font-medium text-gray-800">{level}</span>
          </p>
          <p className="flex items-center text-gray-600">
            <DollarSign className="w-4 h-4 mr-2 text-indigo-500" /> Lương:{' '}
            <span className="ml-2 font-medium text-gray-800">{salary?.[0]} USD</span>
          </p>
          <p className="text-gray-600">
            Mô tả: <span className="ml-1 text-gray-800">{description}</span>
          </p>
        </div>
      </div>

      {/* Lớp phụ trách */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Lớp đang phụ trách</h3>
        <div className="flex flex-wrap gap-2">
          {classes?.length ? (
            classes.map((c, i) => (
              <span
                key={i}
                className="bg-indigo-50 text-indigo-700 text-sm px-3 py-1 rounded-full"
              >
                {c}
              </span>
            ))
          ) : (
            <span className="text-gray-500">Chưa có lớp nào</span>
          )}
        </div>
      </div>

      {/* Lịch rảnh */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Lịch rảnh</h3>
        <div className="flex flex-wrap gap-2">
          {availability?.length ? (
            availability.map((slot, i) => (
              <span
                key={i}
                className="bg-green-50 text-green-700 text-sm px-3 py-1 rounded-full"
              >
                {slot}
              </span>
            ))
          ) : (
            <span className="text-gray-500">Không có lịch rảnh</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminViewTeacherDetail;
