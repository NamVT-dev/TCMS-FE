import React, { useState, useEffect } from 'react';
import { Search, Eye, Edit, Trash2 } from 'lucide-react';
import api from '../../../../utils/api';
import AdminViewTeacherDetail from './AdminViewTeacherDetail';

const AdminViewTeacherList = () => {
  const [teachers, setTeachers] = useState([]);
  const [filterOptions, setFilterOptions] = useState({ levels: [], availabilities: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState('');

  // 👉 Thêm state hiển thị chi tiết
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  useEffect(() => {
    const fetchTeachers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.admin.getTeachers({ limit: 1000 });
        const allTeachers = response.data.data.teachers;

        setTeachers(allTeachers);

        const uniqueLevels = [...new Set(allTeachers.map(t => t.level).filter(Boolean))];
        const uniqueAvailabilities = [...new Set(allTeachers.flatMap(t => t.avaiable || []).filter(Boolean))];

        setFilterOptions({
          levels: uniqueLevels.sort(),
          availabilities: uniqueAvailabilities.sort(),
        });
      } catch (err) {
        console.error(err);
        setError('Không thể tải dữ liệu giáo viên.');
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  // Search debounce
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  // Filter ở frontend
  const filteredTeachers = teachers.filter((t) => {
    const matchSearch =
      !debouncedSearch ||
      t.username.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      t.email.toLowerCase().includes(debouncedSearch.toLowerCase());

    const matchLevel = !selectedLevel || t.level === selectedLevel;
    const matchAvailability =
      !selectedAvailability ||
      (t.avaiable?.includes(selectedAvailability) ?? false);

    return matchSearch && matchLevel && matchAvailability;
  });

  const getStatusBadge = (isActive) =>
    isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

  // 👉 Hàm xem chi tiết
  const handleView = async (id) => {
    try {
      setLoading(true);
      const res = await api.admin.getTeacherDetail(id);
      setSelectedTeacher(res.data.data.teacher);
    } catch (err) {
      console.error(err);
      setError('Không thể tải thông tin giáo viên.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => console.log('Edit teacher:', id);
  const handleDelete = (id) => console.log('Delete teacher:', id);

  // 👉 Nếu đang xem chi tiết, chỉ hiển thị component AdminViewTeacherDetail
  if (selectedTeacher) {
    return (
      <AdminViewTeacherDetail
        teacher={selectedTeacher}
        onBack={() => setSelectedTeacher(null)}
      />
    );
  }

  // 👉 Giao diện danh sách
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Danh sách giáo viên</h1>
        <p className="text-gray-600">Quản lý thông tin giáo viên trong hệ thống</p>
      </div>

      {/* Thanh tìm kiếm & lọc */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Tất cả trình độ</option>
            {filterOptions.levels.map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>

          <select
            value={selectedAvailability}
            onChange={(e) => setSelectedAvailability(e.target.value)}
            className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Tất cả lịch rảnh</option>
            {filterOptions.availabilities.map((slot) => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bảng danh sách */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">Đang tải dữ liệu...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tên giáo viên</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Trình độ</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Lịch rảnh</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTeachers.length > 0 ? (
                  filteredTeachers.map((teacher) => (
                    <tr key={teacher._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            className="w-10 h-10 rounded-full object-cover"
                            src={teacher.profile.photo}
                            alt={teacher.username}
                          />
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{teacher.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{teacher.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{teacher.level}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {teacher.avaiable?.length ? (
                            teacher.avaiable.map((slot, index) => (
                              <span
                                key={index}
                                className="inline-block bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs"
                              >
                                {slot}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-sm">N/A</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(teacher.active)}`}
                        >
                          {teacher.active ? 'Hoạt động' : 'Tạm ngưng'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-3">
                          <button
                            onClick={() => handleView(teacher._id)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Xem"
                          >
                            <Eye size={20} />
                          </button>
                          <button
                            onClick={() => handleEdit(teacher._id)}
                            className="text-green-600 hover:text-green-800"
                            title="Sửa"
                          >
                            <Edit size={20} />
                          </button>
                          <button
                            onClick={() => handleDelete(teacher._id)}
                            className="text-red-600 hover:text-red-800"
                            title="Xóa"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center p-6 text-gray-500">
                      Không tìm thấy giáo viên nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminViewTeacherList;
