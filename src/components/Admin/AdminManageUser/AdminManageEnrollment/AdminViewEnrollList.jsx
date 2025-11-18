import React, { useState, useEffect } from 'react';
import { Search, Calendar, Filter, ChevronLeft, ChevronRight, UserPlus, RefreshCw, Loader2, ArrowRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import api from '../../../../utils/api';
import moment from 'moment';

// Helper format ngày
const formatDateInput = (date) => moment(date).format('YYYY-MM-DD');

// --- COMPONENT PHÂN TRANG THÔNG MINH ---
const SmartPagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages = [];

    // Logic hiển thị: Luôn hiện trang đầu, trang cuối, và xung quanh trang hiện tại
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) {
      startPage = 1;
      endPage = Math.min(5, totalPages);
    }
    if (currentPage >= totalPages - 2) {
      startPage = Math.max(1, totalPages - 4);
      endPage = totalPages;
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${i === currentPage
              ? 'bg-purple-600 text-white'
              : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="p-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Trang đầu"
      >
        <ChevronsLeft className="w-4 h-4 text-gray-600" />
      </button>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Trang trước"
      >
        <ChevronLeft className="w-4 h-4 text-gray-600" />
      </button>

      {renderPageNumbers()}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Trang sau"
      >
        <ChevronRight className="w-4 h-4 text-gray-600" />
      </button>
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="p-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Trang cuối"
      >
        <ChevronsRight className="w-4 h-4 text-gray-600" />
      </button>
    </div>
  );
};


const AdminViewEnrollmentList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data
  const [newLeads, setNewLeads] = useState([]);
  const [waitingStudents, setWaitingStudents] = useState([]);

  // ⬇️ SỬA: Đổi từ courses -> categories
  const [categories, setCategories] = useState([]);

  // Filter State
  const [dateRange, setDateRange] = useState({
    startDate: formatDateInput(moment().subtract(30, 'days')),
    endDate: formatDateInput(moment().add(30, 'days'))
  });
  const [activeTab, setActiveTab] = useState('newLeads');
  const [searchTerm, setSearchTerm] = useState('');

  // ⬇️ SỬA: Filter theo Category ID
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 1. Fetch Data Ban Đầu (Categories)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Gọi API lấy danh sách Category (TOEIC, IELTS...)
        const res = await api.admin.getCategories({ limit: 100 });
        // Dựa trên cấu trúc api getCategories thường thấy: res.data.data.data hoặc res.data.data.categories
        // Bạn kiểm tra lại response thực tế, ở đây tôi giả định data nằm trong res.data.data.data (giống AdminTeacherForm)
        setCategories(res.data.data.data || res.data.data.categories || []);
      } catch (err) {
        console.error("Lỗi tải danh sách chương trình học", err);
      }
    };
    fetchCategories();
  }, []);

  // 2. Fetch Student Data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.admin.enrollment.getStudentDemand({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });

      if (res.data.status === 'success') {
        setNewLeads(res.data.data.newLeads.students || []);
        setWaitingStudents(res.data.data.waitingStudents.students || []);
      }
    } catch (err) {
      console.error(err);
      setError("Không thể tải dữ liệu nhu cầu học viên.");
    } finally {
      setLoading(false);
      setCurrentPage(1);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- LOGIC CLIENT-SIDE FILTER ---

  const currentList = activeTab === 'newLeads' ? newLeads : waitingStudents;

  const filteredList = currentList.filter(s => {
    // Filter theo tên hoặc category name (Search text)
    const matchSearch =
      searchTerm === '' ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.category && s.category[0]?.name.toLowerCase().includes(searchTerm.toLowerCase()));

    // ⬇️ SỬA: Filter theo Category (Dropdown)
    let matchCategory = true;
    if (selectedCategoryId) {
      // Kiểm tra xem học viên có thuộc category đã chọn không
      matchCategory = s.category && s.category.some(cat => cat._id === selectedCategoryId);
    }

    return matchSearch && matchCategory;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const paginatedList = filteredList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handlers
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchTerm('');
    setSelectedCategoryId('');
  };

  const handleEnrollClick = (student) => {
    alert(`Mở modal xếp lớp cho: ${student.name} (ID: ${student._id})`);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Xếp Lớp Học Viên</h1>
        <p className="text-gray-600">Quản lý danh sách chờ và học viên mới cần xếp lớp.</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          {/* Bên Trái: Search */}
          <div className="w-full md:w-1/3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm tên học viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Bên Phải: Các bộ lọc & Date */}
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            {/* ⬇️ SỬA: Dropdown Filter Category */}
            <div className="relative w-full md:w-48">
              <select
                value={selectedCategoryId}
                onChange={(e) => { setSelectedCategoryId(e.target.value); setCurrentPage(1); }}
                className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none appearance-none bg-white"
              >
                <option value="">Tất cả Chương trình</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <Filter className="h-4 w-4" />
              </div>
            </div>

            {/* Filter Ngày */}
            <div className="flex gap-2 items-center">
              <div className="relative">
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="pl-3 pr-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-purple-500 outline-none w-36"
                />
              </div>
              <span className="text-gray-400">-</span>
              <div className="relative">
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="pl-3 pr-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-purple-500 outline-none w-36"
                />
              </div>
            </div>

            <button
              onClick={fetchData}
              className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition shadow-sm flex items-center justify-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Lọc
            </button>
          </div>
        </div>
      </div>

      {/* Tabs & Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">

        {/* Tabs Header */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => handleTabChange('newLeads')}
            className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${activeTab === 'newLeads'
                ? 'bg-white text-purple-600 border-b-2 border-purple-600'
                : 'bg-gray-50 text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
          >
            Học viên mới ({newLeads.length})
          </button>
          <button
            onClick={() => handleTabChange('waiting')}
            className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${activeTab === 'waiting'
                ? 'bg-white text-purple-600 border-b-2 border-purple-600'
                : 'bg-gray-50 text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
          >
            Học viên chờ lớp ({waitingStudents.length})
          </button>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase font-medium">
              <tr>
                <th className="px-6 py-3">Học viên</th>
                <th className="px-6 py-3">Chương trình</th>
                <th className="px-6 py-3">{activeTab === 'newLeads' ? 'Điểm Test' : 'Level Hiện tại'}</th>
                <th className="px-6 py-3">{activeTab === 'newLeads' ? 'Ngày Test' : 'Mục tiêu'}</th>
                <th className="px-6 py-3 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-gray-500">
                    <Loader2 className="w-8 h-8 mx-auto animate-spin mb-2 text-purple-600" />
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : paginatedList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-gray-500 italic">
                    Không tìm thấy học viên nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                paginatedList.map((student) => (
                  <tr key={student._id} className="hover:bg-purple-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{student.name}</div>
                      <div className="text-xs text-gray-500">{student.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold border border-purple-200">
                        {student.category && student.category[0]?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700 font-semibold">
                      {activeTab === 'newLeads' ? student.testScore : student.level}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {activeTab === 'newLeads' ? (
                        moment(student.testResultAt).format('DD/MM/YYYY')
                      ) : (
                        <span className="text-purple-700 font-medium flex items-center bg-purple-100 px-2 py-1 rounded w-fit">
                          {student.learningGoal?.targetScore} <ArrowRight className="w-3 h-3 ml-1" />
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleEnrollClick(student)}
                        className="inline-flex items-center px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded hover:bg-purple-700 transition shadow-sm"
                      >
                        <UserPlus className="w-4 h-4 mr-1.5" />
                        Xếp lớp
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Smart Pagination Footer */}
        {!loading && totalPages > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between bg-gray-50 gap-4">
            <span className="text-sm text-gray-600">
              Hiển thị <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> đến <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredList.length)}</span> trong tổng số <span className="font-medium">{filteredList.length}</span> học viên
            </span>

            <SmartPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminViewEnrollmentList;