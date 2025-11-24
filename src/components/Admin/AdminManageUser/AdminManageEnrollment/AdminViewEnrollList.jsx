import React, { useState, useEffect, useMemo } from 'react';
import ClassSelectionModal from './ClassSelectionModal';
import { Search, Filter, RefreshCw, Loader2, UserPlus, ArrowRight, ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight, BarChart } from 'lucide-react';
import api from '../../../../utils/api';
import moment from 'moment';
import { LEVEL_RANGES } from '../../../../utils/scoreToLevel';

const formatDateInput = (date) => moment(date).format('YYYY-MM-DD');

const SmartPagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages = [];
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Data
  const [newLeads, setNewLeads] = useState([]);
  const [waitingStudents, setWaitingStudents] = useState([]);
  const [categories, setCategories] = useState([]);

  // Filter State
  const [dateRange, setDateRange] = useState({
    startDate: formatDateInput(moment().subtract(30, 'days')),
    endDate: formatDateInput(moment().add(30, 'days'))
  });
  const [activeTab, setActiveTab] = useState('newLeads');
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedCategoryId, setSelectedCategoryId] = useState('');


  const [selectedLevelStr, setSelectedLevelStr] = useState('');


  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.admin.getCategories({ limit: 100 });
        setCategories(res.data.data.data || res.data.data.categories || []);
      } catch (err) {
        console.error("Lỗi tải danh sách chương trình học", err);
      }
    };
    fetchCategories();
  }, []);


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


  const levelOptions = useMemo(() => {
    if (!selectedCategoryId || categories.length === 0) return [];


    const selectedCat = categories.find(c => c._id === selectedCategoryId);
    if (!selectedCat) return [];

    const catName = selectedCat.name.toUpperCase();

    if (catName.includes('IELTS')) return LEVEL_RANGES.IELTS;
    if (catName.includes('TOEIC')) return LEVEL_RANGES.TOEIC;

    return [];
  }, [selectedCategoryId, categories]);


  const currentList = activeTab === 'newLeads' ? newLeads : waitingStudents;

  const filteredList = currentList.filter(s => {

    const matchSearch =
      searchTerm === '' ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.category && s.category[0]?.name.toLowerCase().includes(searchTerm.toLowerCase()));


    let matchCategory = true;
    if (selectedCategoryId) {
      matchCategory = s.category && s.category.some(cat => cat._id === selectedCategoryId);
    }


    let matchLevel = true;
    if (selectedLevelStr && selectedCategoryId) {
      const [min, max] = selectedLevelStr.split('-').map(Number);
      const score = Number(s.testScore || 0);


      matchLevel = score >= min && score <= max;
    }

    return matchSearch && matchCategory && matchLevel;
  });


  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const paginatedList = filteredList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchTerm('');
    setSelectedCategoryId('');
    setSelectedLevelStr('');
  };


  const handleCategoryChange = (e) => {
    setSelectedCategoryId(e.target.value);
    setSelectedLevelStr('');
    setCurrentPage(1);
  };

  const handleEnrollClick = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleSuccessEnroll = () => {
    fetchData();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Xếp Lớp Học Viên</h1>
        <p className="text-gray-600">Quản lý danh sách chờ và học viên mới cần xếp lớp.</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col gap-4">

          <div className="flex flex-col md:flex-row justify-between gap-4">
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
            <div className="flex gap-2 items-center">
              <input type="date" value={dateRange.startDate} onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))} className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" />
              <span>-</span>
              <input type="date" value={dateRange.endDate} onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))} className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" />
              <button onClick={fetchData} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center"><RefreshCw className="w-4 h-4 mr-2" /> Lọc</button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-gray-100">

            <div className="relative w-full md:w-1/4">
              <select
                value={selectedCategoryId}
                onChange={handleCategoryChange}
                className="w-full pl-3 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none appearance-none bg-white font-medium text-gray-700"
              >
                <option value="">-- Tất cả Chương trình --</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
            </div>

            <div className="relative w-full md:w-1/4">
              <select
                value={selectedLevelStr}
                onChange={(e) => setSelectedLevelStr(e.target.value)}
                disabled={!selectedCategoryId || levelOptions.length === 0}
                className={`w-full pl-3 pr-8 py-2.5 border rounded-lg outline-none appearance-none font-medium 
                  ${!selectedCategoryId ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white border-gray-300 text-gray-700 focus:ring-2 focus:ring-purple-500'}`}
              >
                <option value="">-- Tất cả Level / Điểm --</option>
                {levelOptions.map((opt, idx) => (
                  <option key={idx} value={`${opt.min}-${opt.max}`}>
                    {opt.level} ({opt.min} - {opt.max})
                  </option>
                ))}
              </select>
              <BarChart className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
            </div>

            {selectedLevelStr && (
              <div className="flex items-center px-8 py-2 bg-purple-50 text-purple-700 text-sm rounded-lg border border-purple-100">
                Đang lọc: Điểm từ <b>{selectedLevelStr.split('-')[0]}</b>{"   "}
                đến{"   "}
                <b>{selectedLevelStr.split('-')[1]}</b>

              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase font-medium">
              <tr>
                <th className="px-6 py-3">Học viên</th>
                <th className="px-6 py-3">Chương trình</th>
                <th className="px-6 py-3">
                  <div className="flex items-center">
                    {activeTab === 'newLeads' ? 'Điểm Test' : 'Level Hiện tại'}
                    {selectedLevelStr && <Filter className="w-3 h-3 ml-1 text-purple-600" />}
                  </div>
                </th>
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
                      <span className="px-2.5 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold border border-gray-200">
                        {student.category && student.category[0]?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {activeTab === 'newLeads' ? (
                        <span className={`font-bold text-base ${selectedLevelStr ? 'text-purple-700' : 'text-gray-700'}`}>
                          {student.testScore}
                        </span>
                      ) : (
                        student.level
                      )}
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
      <ClassSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        student={selectedStudent}
        onSuccess={handleSuccessEnroll}
      />
    </div>

  );
};

export default AdminViewEnrollmentList;