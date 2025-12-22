
import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, Filter, RefreshCw, Loader2, UserPlus,
  ArrowRight, ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight,
  CheckCircle, Clock, XCircle, UserX, AlertCircle, RotateCcw, LayoutGrid
} from 'lucide-react';
import api from '../../../../utils/api';
import moment from 'moment';
import ClassSelectionModal from './ClassSelectionModal';

const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const SmartPagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  const renderPageNumbers = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) { startPage = 1; endPage = Math.min(5, totalPages); }
    if (currentPage >= totalPages - 2) { startPage = Math.max(1, totalPages - 4); endPage = totalPages; }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button key={i} onClick={() => onPageChange(i)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${i === currentPage ? 'bg-purple-600 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-100'}`}>
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="flex items-center space-x-2">
      <button onClick={() => onPageChange(1)} disabled={currentPage === 1} className="p-1 border rounded hover:bg-gray-100 disabled:opacity-50"><ChevronsLeft className="w-4 h-4" /></button>
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="p-1 border rounded hover:bg-gray-100 disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
      {renderPageNumbers()}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-1 border rounded hover:bg-gray-100 disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
      <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} className="p-1 border rounded hover:bg-gray-100 disabled:opacity-50"><ChevronsRight className="w-4 h-4" /></button>
    </div>
  );
};

const STATUS_CONFIG = {
  all: { label: "Tất cả", color: "bg-gray-800", icon: LayoutGrid, textColor: "text-gray-800" },
  confirmed: { label: "Đã xác nhận", color: "bg-green-600", icon: CheckCircle, textColor: "text-green-600" },
  hold: { label: "Giữ chỗ", color: "bg-amber-500", icon: Clock, textColor: "text-amber-600" },

  removed: { label: "Cần xếp lớp", color: "bg-orange-500", icon: RotateCcw, textColor: "text-orange-600" },

  canceled: { label: "Đã hủy", color: "bg-red-500", icon: XCircle, textColor: "text-red-600" },
  refunded: { label: "Hoàn tiền", color: "bg-purple-500", icon: RotateCcw, textColor: "text-purple-600" },
  waitlisted: { label: "Chờ lớp", color: "bg-blue-500", icon: AlertCircle, textColor: "text-blue-600" }
};

const AdminViewEnrollmentList = () => {
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);

  const [activeStatus, setActiveStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.admin.enrollment.getEnrollments({
        limit: 1000,
      });

      if (res.data.status === 'success') {
        const rawData = res.data.data.data || res.data.data || [];
        setEnrollments(rawData);
      }
    } catch (err) {
      console.error("Lỗi tải enrollment:", err);
    } finally {
      setLoading(false);
      setCurrentPage(1);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const statusCounts = useMemo(() => {
    const counts = { all: enrollments.length, confirmed: 0, hold: 0, removed: 0, canceled: 0, refunded: 0, waitlisted: 0 };
    enrollments.forEach(item => {
      if (counts[item.status] !== undefined) {
        counts[item.status]++;
      }
    });
    return counts;
  }, [enrollments]);

  const filteredList = useMemo(() => {
    return enrollments.filter(item => {
      const matchStatus = activeStatus === 'all' || item.status === activeStatus;
      const studentName = item.student?.name?.toLowerCase() || '';
      const categoryName = item.student?.category?.[0]?.name?.toLowerCase() || '';
      const searchLower = searchTerm.toLowerCase();

      const matchSearch = searchTerm === '' ||
        studentName.includes(searchLower) ||
        categoryName.includes(searchLower);

      return matchStatus && matchSearch;
    });
  }, [enrollments, activeStatus, searchTerm]);

  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const paginatedList = filteredList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleEnrollClick = (item) => {
    if (!item.student) return;
    const studentData = {
      ...item.student,
      _id: item.student._id,
      enrollmentId: item._id,
      courseId: item.course
    };
    setSelectedStudent(studentData);
    setIsModalOpen(true);
  };

  const renderStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || { label: status, color: "bg-gray-500", textColor: "text-gray-600" };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${config.textColor.replace('text', 'border').replace('600', '200')} ${config.textColor.replace('text', 'bg').replace('600', '50')}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản lý học viên đăng ký lớp</h1>
          <p className="text-gray-500 mt-1">Theo dõi trạng thái đăng ký và xếp lớp học viên</p>
        </div>

        <div>
          <button onClick={fetchData} className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-purple-600 transition shadow-sm font-medium">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Làm mới dữ liệu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        {Object.entries(STATUS_CONFIG).map(([key, config]) => {
          const Icon = config.icon;
          const isActive = activeStatus === key;
          const count = statusCounts[key] || 0;

          return (
            <button
              key={key}
              onClick={() => setActiveStatus(key)}
              className={`relative flex flex-col items-start p-4 rounded-xl border transition-all duration-200 ${isActive
                  ? 'bg-white border-purple-500 ring-2 ring-purple-100 shadow-md'
                  : 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-sm text-gray-500'
                }`}
            >
              <div className={`p-2 rounded-lg mb-2 ${isActive ? config.color + ' text-white' : 'bg-gray-100 text-gray-500'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-xs font-medium uppercase tracking-wider ${isActive ? 'text-gray-800' : 'text-gray-500'}`}>
                {config.label}
              </span>
              <span className={`text-2xl font-bold mt-1 ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm học viên, loại lớp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </div>
          {activeStatus !== 'all' && (
            <div className="flex items-center gap-1 px-4 py-2 
                bg-purple-50 text-purple-700 text-sm 
                rounded-lg border border-purple-100 
                animate-in fade-in">
              <Filter className="w-4 h-4" />
              <span>Đang lọc: </span>
              <span className="font-semibold">
                {STATUS_CONFIG[activeStatus]?.label}
              </span>
            </div>

          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Học viên</th>
                <th className="px-6 py-4">Chương trình</th>
                <th className="px-6 py-4">Điểm / Level</th>
                <th className="px-6 py-4">Trạng thái & Ngày</th>
                <th className="px-6 py-4">Học phí</th>
                <th className="px-6 py-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-12">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Loader2 className="w-10 h-10 animate-spin mb-3 text-purple-600" />
                      <p>Đang đồng bộ dữ liệu enrollment...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12">
                    {/* SỬA LỖI Ở ĐÂY: Bọc nội dung trong div để căn giữa chính xác */}
                    <div className="flex flex-col items-center justify-center text-center text-gray-500 italic">
                      <UserX className="w-12 h-12 text-gray-300 mb-2" />
                      <span className="text-base">Không tìm thấy dữ liệu phù hợp.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedList.map((item) => (
                  // ... (Phần render row giữ nguyên như cũ)
                  <tr key={item._id} className="hover:bg-purple-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      {item.student ? (
                        <div>
                          <div className="font-bold text-gray-900">{item.student.name}</div>
                        </div>
                      ) : (
                        <span className="text-red-500 italic text-xs">Không có dữ liệu học viên</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {item.student?.category?.map(cat => (
                        <span key={cat._id} className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded border border-blue-100 mr-1">
                          {cat.name}
                        </span>
                      )) || "--"}
                    </td>
                    <td className="px-6 py-4">
                      {item.student?.tested ? (
                        <span className="font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                          {item.student.testScore}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Chưa test</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5 items-start">
                        {renderStatusBadge(item.status)}
                        <span className="text-xs text-gray-500">
                          {moment(item.createdAt).format('HH:mm DD/MM/YYYY')}
                        </span>
                        {item.status === 'hold' && item.holdExpiresAt && (
                          <span className="text-[10px] text-amber-600 flex items-center">
                            <Clock className="w-3 h-3 mr-1" /> Hết hạn: {moment(item.holdExpiresAt).format('HH:mm DD/MM')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {['removed', 'waitlisted'].includes(item.status) && item.student && (
                        <button
                          onClick={() => handleEnrollClick(item)}
                          className={`inline-flex items-center px-3 py-1.5 border text-xs font-medium rounded-lg transition shadow-sm
                                ${item.status === 'removed'
                              ? 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100'
                              : 'bg-white border-purple-200 text-purple-700 hover:bg-purple-600 hover:text-white'
                            }`}
                        >
                          <UserPlus className="w-4 h-4 mr-1.5" />
                          Xếp lớp
                        </button>
                      )}

                      {(!['removed', 'waitlisted'].includes(item.status) || !item.student) && (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && totalPages > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between bg-gray-50 gap-4">
            <span className="text-sm text-gray-600">
              Hiển thị <span className="font-bold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-bold text-gray-900">{Math.min(currentPage * itemsPerPage, filteredList.length)}</span> trên tổng <span className="font-bold text-purple-600">{filteredList.length}</span>
            </span>

            <SmartPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      <ClassSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        student={selectedStudent}
        onSuccess={() => {
          fetchData();
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};

export default AdminViewEnrollmentList;