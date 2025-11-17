import React, { useState, useEffect, useCallback } from 'react';
import { Search, Eye, Trash2, Loader2, ListFilter, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import { useDebounce } from '../../../hooks/useDebounce';

// Component Phân trang
const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  const pages = [...Array(totalPages).keys()].map(i => i + 1);
  return (
    <div className="flex space-x-2">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
      >
        Trước
      </button>
      {pages.map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-3 py-1 rounded-md text-sm ${p === page
              ? 'bg-purple-600 text-white' // ⬅️ Màu Purple
              : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
      >
        Sau
      </button>
    </div>
  );
};

const AdminViewClassList = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const limit = 10;

  const debouncedSearch = useDebounce(searchTerm, 500);

  const statusOptions = [
    { value: "", label: "Tất cả Trạng Thái" },
    { value: "approved", label: "Đang hoạt động" },
    { value: "archived", label: "Đã lưu trữ" },
    { value: "canceled", label: "Đã hủy" },
  ];

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.admin.getCourse({ page: 1, limit: 1000 });
        setCourses(res.data.data.courses || []);
      } catch (err) {
        console.error("Lỗi khi tải khóa học:", err);
      }
    };
    fetchCourses();
  }, []);

  const fetchClasses = useCallback(async (currentPage, search, course, status) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage, limit,
        search: search || undefined,
        course: course || undefined,
        status: status || undefined,
      };

      const res = await api.admin.class.listClasses(params);

      setClasses(res.data.data.classes);
      setPage(res.data.page);
      setTotalPages(res.data.totalPages);
      setTotalResults(res.data.total);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi tải danh sách lớp");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses(page, debouncedSearch, selectedCourse, selectedStatus);
  }, [page, debouncedSearch, selectedCourse, selectedStatus, fetchClasses]);

  const getStatusColor = (status) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-700";
      case "archived": return "bg-gray-100 text-gray-700";
      case "canceled": return "bg-red-100 text-red-700";
      default: return "bg-yellow-100 text-yellow-700";
    }
  };

  const getStatusText = (status) => {
    return statusOptions.find(opt => opt.value === status)?.label || status;
  }

  const getTeacherNames = (weeklySchedules) => {
    if (!weeklySchedules || weeklySchedules.length === 0) return "N/A";
    const names = weeklySchedules.map(s => s.teacher?.profile?.fullname).filter(Boolean);
    return [...new Set(names)].join(', ') || "Chưa gán";
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Bạn có chắc chắn muốn XÓA lớp "${name}"?`)) {
      try {
        await api.admin.class.deleteClass(id);
        alert("Xóa lớp thành công!");
        fetchClasses(page, debouncedSearch, selectedCourse, selectedStatus);
      } catch (err) {
        alert(err.response?.data?.message || "Lỗi khi xóa lớp.");
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Quản lý Lớp học
          </h1>
          <p className="text-gray-600">Thêm, xem, và xóa các lớp học trong hệ thống.</p>
        </div>

        <button
          onClick={() => navigate('/admin/classes/create')}
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Tạo Lớp Mới
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm theo tên lớp, mã lớp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="relative">
            <select
              value={selectedCourse}
              onChange={(e) => { setSelectedCourse(e.target.value); setPage(1); }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none appearance-none"
            >
              <option value="">Tất cả Khóa học</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none appearance-none"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Tên lớp</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Khóa học</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Giáo viên</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Sĩ số</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && (
                <tr>
                  <td colSpan="6" className="p-6 text-center">
                    <Loader2 className="w-8 h-8 mx-auto animate-spin text-purple-600" />
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr><td colSpan="6" className="p-6 text-center text-red-600">{error}</td></tr>
              )}
              {!loading && !error && classes.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center p-6 text-gray-500">Không tìm thấy lớp học nào.</td>
                </tr>
              )}
              {!loading && !error && classes.map((cls) => (
                <tr key={cls._id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 font-medium text-gray-900">{cls.name}</td>
                  <td className="px-6 py-4 text-gray-700">{cls.course?.name || "N/A"}</td>
                  <td className="px-6 py-4 text-gray-700">{getTeacherNames(cls.weeklySchedules)}</td>
                  <td className="px-6 py-4 text-gray-700">{cls.maxStudent || "N/A"}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(cls.status)}`}>
                      {getStatusText(cls.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-3">
                      <Link
                        to={`/admin/classes/detail/${cls._id}`}
                        className="text-blue-600 hover:text-blue-800" title="Xem Chi tiết"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(cls._id, cls.name)}
                        className="text-red-600 hover:text-red-800"
                        title="Xóa Lớp"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(!loading && totalResults > 0) && (
          <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Hiển thị <span className="font-medium">{(page - 1) * limit + 1}</span> - <span className="font-medium">{Math.min(page * limit, totalResults)}</span> / <span className="font-medium">{totalResults}</span> lớp
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminViewClassList;