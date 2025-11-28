import React, { useState, useEffect, useCallback } from 'react';
import { Search, Eye, Trash2, Loader2, Plus, Edit, User, MoreVertical } from 'lucide-react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom'; 
import api from '../../../../utils/api';
import { useDebounce } from '../../../../hooks/useDebounce'; 
import AdminTeacherModal from './AdminTeacherModal';

// ... (Giữ nguyên Component Pagination) ...
const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  const getPages = () => {
    let pages = [];
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
            pages.push(i);
        } else if (pages[pages.length - 1] !== '...') {
            pages.push('...');
        }
    }
    return pages;
  };
  return (
    <div className="flex items-center space-x-1">
      <button onClick={() => onPageChange(page - 1)} disabled={page === 1} className="px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 text-sm font-medium transition-colors">Trước</button>
      {getPages().map((p, idx) => (
        <button key={idx} onClick={() => typeof p === 'number' && onPageChange(p)} disabled={p === '...'} className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-all ${p === page ? 'bg-purple-600 text-white shadow-sm' : p === '...' ? 'text-gray-400 cursor-default' : 'text-gray-600 hover:bg-gray-100 border border-transparent hover:border-gray-200'}`}>{p}</button>
      ))}
      <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages} className="px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 text-sm font-medium transition-colors">Sau</button>
    </div>
  );
};

const AdminViewTeacherList = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hooks routing
  const navigate = useNavigate();
  const location = useLocation();
  const { id: paramId } = useParams(); // Lấy ID từ URL nếu có

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const limit = 8;

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);

  // --- LOGIC TỰ ĐỘNG MỞ MODAL DỰA TRÊN URL ---
  useEffect(() => {
    if (location.pathname.includes('/teachers/create')) {
        setIsModalOpen(true);
        setSelectedTeacherId(null);
    } else if (location.pathname.includes('/teachers/edit') && paramId) {
        setIsModalOpen(true);
        setSelectedTeacherId(paramId);
    } else {
        setIsModalOpen(false);
        setSelectedTeacherId(null);
    }
  }, [location.pathname, paramId]);

  // Hàm đóng modal: Quay về trang danh sách gốc
  const handleCloseModal = () => {
    navigate('/admin/users/teachers');
  };

  const fetchTeachers = useCallback(async (currentPage, search, status) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage, limit,
        search: search || undefined,
        status: status || undefined,
      };
      const response = await api.admin.getTeachers(params);
      const data = response.data;
      setTeachers(data.data.teachers);
      setPage(data.page);
      setTotalPages(data.totalPages);
      setTotalResults(data.total);
    } catch (err) {
      console.error(err);
      setError('Không thể tải dữ liệu giáo viên.');
    } finally {
      setLoading(false);
    }
  }, []); 

  useEffect(() => {
    fetchTeachers(page, debouncedSearch, selectedStatus);
  }, [page, debouncedSearch, selectedStatus, fetchTeachers]);

  const handleOpenCreate = () => {
    navigate('/admin/users/teachers/create'); // Navigate để URL thay đổi -> Modal tự mở
  };

  const handleOpenEdit = (id) => {
    navigate(`/admin/users/teachers/edit/${id}`); // Navigate để URL thay đổi -> Modal tự mở
  };

  const handleSuccess = () => {
    fetchTeachers(page, debouncedSearch, selectedStatus);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`CẢNH BÁO: Bạn có chắc chắn muốn xóa giáo viên "${name}"?\nHành động này không thể hoàn tác.`)) {
      try {
        await api.admin.deleteTeacher(id);
        alert("Đã xóa thành công!");
        if (teachers.length === 1 && page > 1) {
          setPage(page - 1); 
        } else {
          fetchTeachers(page, debouncedSearch, selectedStatus);
        }
      } catch (err) {
        alert(err.response?.data?.message || "Lỗi khi xóa giáo viên.");
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Danh sách giáo viên</h1>
            <p className="text-gray-500 mt-1">Quản lý hồ sơ và trạng thái hoạt động của đội ngũ giảng viên.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium shadow-lg shadow-purple-200 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5 mr-2" />
          Thêm Giáo Viên
        </button>
      </div>

      {/* Filter & Search Bar (Giữ nguyên UI) */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl text-gray-700 focus:ring-2 focus:ring-purple-100 focus:bg-white transition-all outline-none placeholder-gray-400"
            />
        </div>
        <div className="w-full md:w-56">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-gray-700 focus:ring-2 focus:ring-purple-100 focus:bg-white transition-all outline-none cursor-pointer"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="true">Đang hoạt động</option>
              <option value="false">Đã tạm ngưng</option>
            </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-50/50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Giáo viên</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Thông tin liên hệ</th>
               
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="5" className="p-12 text-center"><Loader2 className="w-10 h-10 mx-auto animate-spin text-purple-500" /></td></tr>
              ) : error ? (
                <tr><td colSpan="5" className="p-12 text-center text-red-500 font-medium">{error}</td></tr>
              ) : teachers.length > 0 ? (
                teachers.map((teacher) => (
                  <tr key={teacher._id} className="hover:bg-purple-50/30 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 ring-2 ring-white shadow-sm flex-shrink-0">
                            {teacher.profile.photo ? (
                                <img src={teacher.profile.photo} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-purple-600 font-bold bg-purple-100">
                                    {(teacher.profile?.fullname?.[0] || teacher.username?.[0] || 'U').toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900">{teacher.profile?.fullname || teacher.username}</div>
                          
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{teacher.email}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{teacher.profile?.phoneNumber || 'Chưa cập nhật SĐT'}</div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                            teacher.active 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${teacher.active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        {teacher.active ? 'Đang hoạt động' : 'Tạm ngưng'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          to={`/admin/users/teachers/detail/${teacher._id}`}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(teacher._id)}
                          className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(teacher._id, teacher.profile?.fullname)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa giáo viên"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                        <User className="w-12 h-12 mb-3 opacity-20" />
                        <p className="text-lg font-medium text-gray-500">Không tìm thấy giáo viên nào</p>
                        <p className="text-sm">Thử thay đổi bộ lọc hoặc tìm kiếm từ khóa khác</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!loading && totalResults > 0 && (
            <div className="px-6 py-4 bg-white border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-500">
                    Hiển thị <span className="font-semibold text-gray-900">{(page - 1) * limit + 1}-{Math.min(page * limit, totalResults)}</span> trong số <span className="font-semibold text-gray-900">{totalResults}</span> giáo viên
                </div>
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
        )}
      </div>

      {/* Modal */}
      <AdminTeacherModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        teacherId={selectedTeacherId}
      />

    </div>
  );
};

export default AdminViewTeacherList;