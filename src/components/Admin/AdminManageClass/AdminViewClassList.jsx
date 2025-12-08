import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Eye, Loader2, Plus, Filter, Calendar, X } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../../../utils/api';
import { useDebounce } from '../../../hooks/useDebounce';
import AdminCreateClassModal from './AdminCreateClassModal';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;


  let startPage = Math.max(1, page - 2);
  let endPage = Math.min(totalPages, page + 2);

  if (endPage - startPage < 4) {
    if (startPage === 1) endPage = Math.min(5, totalPages);
    else if (endPage === totalPages) startPage = Math.max(1, totalPages - 4);
  }

  const pages = [...Array(endPage - startPage + 1).keys()].map(i => startPage + i);

  return (
    <div className="flex space-x-2">
      <button onClick={() => onPageChange(page - 1)} disabled={page === 1} className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50">Trước</button>
      {pages.map(p => (
        <button key={p} onClick={() => onPageChange(p)} className={`px-3 py-1 rounded-md text-sm ${p === page ? 'bg-purple-600 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-100'}`}>{p}</button>
      ))}
      <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages} className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50">Sau</button>
    </div>
  );
};

const getCurrentMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const AdminViewClassList = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [displayedClasses, setDisplayedClasses] = useState([]);

  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [modalPrefillData, setModalPrefillData] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const limit = 10;

  const debouncedSearch = useDebounce(searchTerm, 500);

  const statusOptions = [
    { value: "", label: "Tất cả Trạng Thái" },
    { value: "approved", label: "Đang hoạt động" },
    // { value: "archived", label: "Đã lưu trữ" },
    { value: "canceled", label: "Đã hủy" },
  ];
  const LEVEL_PRIORITY = {
    "Starter": 1,
    "Beginner": 2,
    "Elementary": 3,
    "Pre-Intermediate": 4,
    "Intermediate": 5,
    "Upper-Intermediate": 6,
    "Advanced": 7,
    "Expert": 8
  };
  
  useEffect(() => {
    const initData = async () => {
      try {
        const [courseRes, catRes] = await Promise.all([
          api.admin.getCourse({ page: 1, limit: 1000 }),
          api.admin.getCategories({ limit: 100 })
        ]);
        let fetchedCourses = courseRes.data.data.courses || [];

        // --- BẮT ĐẦU LOGIC SẮP XẾP ---
        fetchedCourses.sort((a, b) => {
          // 1. Ưu tiên sắp xếp theo Tên Khóa học (IELTS gom vào 1 chỗ, TOEIC gom vào 1 chỗ)
          // Nếu bạn chỉ muốn sort thuần Level thì bỏ đoạn if này đi
          const nameA = a.name || "";
          const nameB = b.name || "";
          
          // Kiểm tra xem là IELTS hay TOEIC để gom nhóm (Tuỳ chọn, nhưng nên dùng cho dropdown đẹp)
          if (nameA.includes("IELTS") && !nameB.includes("IELTS")) return -1;
          if (!nameA.includes("IELTS") && nameB.includes("IELTS")) return 1;

          // 2. Sắp xếp theo Level từ bé đến lớn
          const levelA = LEVEL_PRIORITY[a.level] || 99; // 99 là giá trị mặc định nếu level không nằm trong list
          const levelB = LEVEL_PRIORITY[b.level] || 99;

          return levelA - levelB;
        });
        
        setCourses(courseRes.data.data.courses || []);
        setCategories(catRes.data.data.data || catRes.data.data.categories || []);
      } catch (err) {
        console.error("Lỗi khi khởi tạo dữ liệu:", err);
      }
    };
    initData();
  }, []);

  const availableCourses = useMemo(() => {
    if (selectedCategories.length === 0) return courses;
    return courses.filter(course => {
      const catId = typeof course.category === 'object' && course.category !== null
        ? course.category._id
        : course.category;
      return selectedCategories.includes(catId);
    });
  }, [courses, selectedCategories]);

  useEffect(() => {
    if (selectedCourse && availableCourses.length > 0) {
      const exists = availableCourses.find(c => c._id === selectedCourse);
      if (!exists) setSelectedCourse("");
    }
  }, [availableCourses, selectedCourse]);


  const fetchAndFilterClasses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {

      const isFeFiltering = (selectedMonth !== "") || (selectedCategories.length > 0);

      const fetchLimit = isFeFiltering ? 1000 : limit;
      const fetchPage = isFeFiltering ? 1 : page;

      const params = {
        page: fetchPage,
        limit: fetchLimit,
        search: debouncedSearch || undefined,
        course: selectedCourse || undefined,
        status: selectedStatus || undefined,
      };

      const res = await api.admin.class.listClasses(params);
      let fetchedClasses = res.data.data.classes || [];
      let serverTotal = res.data.total;

      if (isFeFiltering) {
        if (selectedMonth) {
          fetchedClasses = fetchedClasses.filter(cls => {
            if (!cls.startAt) return false;
            return cls.startAt.substring(0, 7) === selectedMonth;
          });
        }

        if (selectedCategories.length > 0) {
          fetchedClasses = fetchedClasses.filter(cls => {
            const courseData = cls.course;
            if (!courseData) return false;

            const catId = typeof courseData.category === 'object' && courseData.category !== null
              ? courseData.category._id
              : courseData.category;

            return selectedCategories.includes(catId);
          });
        }

        const totalItemsAfterFilter = fetchedClasses.length;
        setTotalResults(totalItemsAfterFilter);
        setTotalPages(Math.ceil(totalItemsAfterFilter / limit));

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        setDisplayedClasses(fetchedClasses.slice(startIndex, endIndex));

      } else {
        setDisplayedClasses(fetchedClasses);
        setTotalResults(serverTotal);
        setTotalPages(res.data.totalPages);
      }

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Lỗi khi tải danh sách lớp");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, selectedCourse, selectedStatus, selectedCategories, selectedMonth]);

  useEffect(() => {
    fetchAndFilterClasses();
  }, [fetchAndFilterClasses]);

  useEffect(() => {
    if (location.pathname.includes('/classes/create')) {
      setIsCreateModalOpen(true);
      if (location.state && location.state.prefill) {
        setModalPrefillData(location.state.prefill);
      } else {
        setModalPrefillData(null);
      }
    } else {
      setIsCreateModalOpen(false);
      setModalPrefillData(null);
    }
  }, [location.pathname, location.state]);

  const openCreateModal = () => navigate('/admin/classes/create');
  const closeCreateModal = () => navigate('/admin/classes');

  const handleCategoryChange = (catId) => {
    setPage(1);
    setSelectedCategories(prev => {
      if (prev.includes(catId)) return prev.filter(id => id !== catId);
      else return [...prev, catId];
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategories([]);
    setSelectedCourse("");
    setSelectedStatus("");
    setSelectedMonth("");
    setPage(1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-700";
      case "archived": return "bg-gray-100 text-gray-700";
      case "canceled": return "bg-red-100 text-red-700";
      default: return "bg-yellow-100 text-yellow-700";
    }
  };

  const getStatusText = (status) => statusOptions.find(opt => opt.value === status)?.label || status;

  const getTeacherNames = (cls) => {
    const firstSchedule = cls?.weeklySchedules?.[0];
    const preferredTeacherName = cls?.preferredTeacher?.profile?.fullname;
    const teacherNameFromSchedule = firstSchedule?.teacher?.profile?.fullname;
    return preferredTeacherName || teacherNameFromSchedule || "Chưa có giáo viên";
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-inter">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản Lý Lớp Học</h1>
          <p className="text-gray-600">Thêm, xem, và xóa các lớp học trong hệ thống.</p>
        </div>
        <button onClick={openCreateModal} className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-sm font-medium">
          <Plus className="w-5 h-5 mr-2" /> Tạo Lớp Mới
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5 mb-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700 flex items-center">
            <Filter className="w-5 h-5 mr-2 text-purple-600" /> Bộ lọc tìm kiếm
          </h2>
          {(searchTerm || selectedCategories.length > 0 || selectedCourse || selectedStatus || selectedMonth) && (
            <button onClick={clearFilters} className="text-sm text-red-500 hover:text-red-700 flex items-center">
              <X className="w-4 h-4 mr-1" /> Xóa bộ lọc
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm tên lớp, mã lớp..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="lg:col-span-8 flex flex-wrap items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-200">
              <span className="text-sm font-medium text-gray-600 px-2">Danh mục:</span>
              {categories.length > 0 ? categories.map(cat => (
                <label key={cat._id} className={`cursor-pointer inline-flex items-center px-3 py-1.5 rounded-full text-sm border transition-all select-none ${selectedCategories.includes(cat._id) ? 'bg-purple-100 border-purple-300 text-purple-700 font-medium' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-100'}`}>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={selectedCategories.includes(cat._id)}
                    onChange={() => handleCategoryChange(cat._id)}
                  />
                  {cat.name}
                </label>
              )) : <span className="text-xs text-gray-400 italic">Đang tải danh mục...</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Tháng mở lớp</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => { setSelectedMonth(e.target.value); setPage(1); }}
                  placeholder="Chọn tháng mở lớp"
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm text-gray-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Khóa học {selectedCategories.length > 0 && "(Theo danh mục)"}</label>
              <select
                value={selectedCourse}
                onChange={(e) => { setSelectedCourse(e.target.value); setPage(1); }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm bg-white"
              >
                <option value="">-- Tất cả Khóa học --</option>
                {availableCourses.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Trạng thái</label>
              <select
                value={selectedStatus}
                onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm bg-white"
              >
                {statusOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tên lớp / Mã lớp</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Khóa học</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Giáo viên</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ngày bắt đầu</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && (<tr><td colSpan="7" className="p-8 text-center"><Loader2 className="w-8 h-8 mx-auto animate-spin text-purple-600" /></td></tr>)}
              {!loading && error && (<tr><td colSpan="7" className="p-8 text-center text-red-600 bg-red-50">{error}</td></tr>)}

              {!loading && !error && displayedClasses.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center p-12 flex flex-col items-center justify-center text-gray-500">
                    <div className="bg-gray-100 p-4 rounded-full mb-3"><Search className="w-6 h-6 text-gray-400" /></div>
                    <p>Không tìm thấy lớp học nào phù hợp với bộ lọc.</p>
                    <button onClick={clearFilters} className="mt-2 text-purple-600 font-medium hover:underline">Xóa bộ lọc</button>
                  </td>
                </tr>
              )}

              {!loading && !error && displayedClasses.map((cls) => (
                <tr key={cls._id} className="hover:bg-purple-50 transition-colors duration-150 group">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{cls.name}</div>
                    <div className="text-xs text-gray-500 mt-1 font-mono">{cls.classCode || "---"}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-700 text-sm">{cls.course?.name || "N/A"}</td>
                  <td className="px-6 py-4 text-gray-700 text-sm">{getTeacherNames(cls)}</td>
                  <td className="px-6 py-4 text-gray-700 text-sm">
                    {cls.startAt ? new Date(cls.startAt).toLocaleDateString('vi-VN') : "N/A"}
                  </td>

                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(cls.status)}`}>
                      {getStatusText(cls.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-3 opacity-80 group-hover:opacity-100 transition-opacity">
                      <Link to={`/admin/classes/detail/${cls._id}`} className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition" title="Xem Chi tiết"><Eye className="w-4 h-4" /></Link>
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
              Hiển thị <span className="font-medium">{displayedClasses.length}</span> / {totalResults} kết quả
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      <AdminCreateClassModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        onSuccess={() => fetchAndFilterClasses()}
        prefillData={modalPrefillData}
      />
    </div>
  );
};

export default AdminViewClassList;