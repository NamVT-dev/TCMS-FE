import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../../../utils/api';
import { ArrowLeft, Mail, Phone, Calendar, User as UserIcon, BookOpen, Info, Loader2, Edit } from 'lucide-react';

const renderAvailability = (availability) => {
  if (!availability || availability.length === 0) {
    return <p className="text-gray-500">Chưa đăng ký lịch rảnh.</p>;
  }
  const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const sortedSlots = [...availability].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  return (
    <div className="space-y-3">
      {sortedSlots.map(slot => (
        <div key={slot.dayOfWeek} className="flex">
          <span className="font-semibold w-20 text-purple-700">{days[slot.dayOfWeek]}:</span>
          <div className="flex flex-wrap gap-2">
            {slot.shifts.length > 0 ? (
              slot.shifts.map(shiftName => (
                <span key={shiftName} className="px-3 py-0.5 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  {shiftName}
                </span>
              ))
            ) : (
              <span className="text-gray-400 text-sm">Không có ca</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const AdminViewTeacherDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeacher = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await api.admin.getTeacherDetail(id);
        setTeacher(res.data.data.teacher);
        console.log("👀 Teacher data:", res.data.data.teacher);
      } catch (err) {
        console.error(err);
        setError("Không thể tải chi tiết giáo viên.");
      } finally {
        setLoading(false);
      }
    };
    fetchTeacher();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[300px]">
        <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }
  
  if (!teacher) {
    return <div className="p-6 text-center text-gray-500">Không tìm thấy giáo viên.</div>;
  }

  // Dòng này rất quan trọng: gán 'profile' (dù rỗng hay không) và các trường khác
  const { profile = {}, email, active, level, skills = [], availability, description } = teacher;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <Link
          to="/admin/users/teachers"
          className="flex items-center text-purple-600 hover:text-purple-800 font-medium"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Quay lại Danh sách
        </Link>
        <button
          onClick={() => navigate(`/admin/users/teachers/edit/${id}`)}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm"
        >
          <Edit className="w-5 h-5 mr-2" />
          Sửa thông tin
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center">
          <img
            className="w-24 h-24 rounded-full object-cover border-4 border-purple-100"
            // Dòng này fix lỗi: Dùng 'profile.fullname' (đã tồn tại) cho fallback
            src={profile.photo || `https://ui-avatars.com/api/?name=${profile.fullname || teacher.username}&background=ede9fe&color=7c3aed&size=128`}
            alt={profile.fullname || teacher.username}
          />
          <div className="sm:ml-6 mt-4 sm:mt-0">
            <h1 className="text-3xl font-bold text-gray-900">{profile.fullname || teacher.username}</h1>
            <div className="flex flex-wrap items-center mt-2 gap-x-4 gap-y-2 text-gray-600">
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {active ? 'Hoạt động' : 'Tạm ngưng'}
              </span>
              <span className="flex items-center">
                <Mail className="w-4 h-4 mr-1.5" /> {email}
              </span>
              {profile.phoneNumber && (
                <span className="flex items-center">
                  <Phone className="w-4 h-4 mr-1.5" /> {profile.phoneNumber}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Thông tin cá nhân</h3>
            <div className="space-y-3 text-gray-700">
              <p className="flex items-center"><UserIcon className="w-5 h-5 mr-3 text-purple-500" /> <b>Giới tính:</b> &nbsp; {profile.gender}</p>
              <p className="flex items-center"><Calendar className="w-5 h-5 mr-3 text-purple-500" /> <b>Ngày sinh:</b> &nbsp; {profile.dob ? new Date(profile.dob).toLocaleDateString('vi-VN') : 'N/A'}</p>
              <p className="flex items-center"><UserIcon className="w-5 h-5 mr-3 text-purple-500" /> <b>Trình độ:</b> &nbsp; {level || 'N/A'}</p>
            </div>
          </div>

          {description && (
             <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Mô tả</h3>
              <div className="space-y-3 text-gray-700">
                <p className="flex items-start">
                  <Info className="w-5 h-5 mr-3 text-purple-500 flex-shrink-0" /> 
                  <span className="italic">{description}</span>
                </p>
              </div>
            </div>
          )}

          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Kỹ năng giảng dạy</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                {skills.length > 0 ? skills.map((skill, i) => (
                  <div key={i} className="text-gray-700 text-sm p-2 bg-gray-50 rounded-md">
                    <p className="font-semibold text-purple-700">
                      {skill.category?.name || 'N/A'} 
                    </p>
                    <p className="pl-4">
                      {skill.anyLevel ? "Tất cả level" : (skill.levels || []).join(', ')}
                    </p>
                  </div>
                )) : <p className="text-gray-500 text-sm">Chưa đăng ký kỹ năng</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Lịch rảnh đã đăng ký</h3>
            {renderAvailability(availability)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminViewTeacherDetail;