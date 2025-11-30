import React, { useState, useEffect } from 'react';
import { Search, Eye, Ban, CheckCircle, XCircle, RefreshCw, ChevronLeft, ChevronRight, Filter, AlertTriangle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../../utils/api';
import toast from 'react-hot-toast';

const AdminViewStudentList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filterStatus, setFilterStatus] = useState('active'); 

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.admin.getAllmember({ role: 'member' });
      const studentList = res.data?.data?.data || [];
      setStudents(studentList);
    } catch (error) {
      console.error("Lỗi khi tải danh sách học viên:", error);
      toast.error("Không thể tải danh sách học viên");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const openDeactivateModal = (id) => {
    setSelectedStudentId(id);
    setIsDeactivateModalOpen(true);
  };

  const closeDeactivateModal = () => {
    setSelectedStudentId(null);
    setIsDeactivateModalOpen(false);
  };

  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
    setSuccessMessage("");
  };

  const handleConfirmDeactivate = async () => {
    if (!selectedStudentId) return;

    try {
      const res = await api.admin.unActiveAccount(selectedStudentId);
      
      setStudents(prev => prev.map(student => 
        student._id === selectedStudentId ? { ...student, active: false } : student
      ));
      
      closeDeactivateModal();

      setSuccessMessage(res.data?.message || "Vô hiệu hóa tài khoản thành công!");
      setIsSuccessModalOpen(true);

    } catch (error) {
      const errorMessage = error.response?.data?.message || "Lỗi khi vô hiệu hóa tài khoản";
      toast.error(errorMessage);
      console.error(error);
    }
  };

  const handleViewDetail = (id) => {
    navigate(`/admin/users/student/${id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const filteredStudents = students.filter(student => {
    const term = searchTerm.toLowerCase();
    const name = student.profile?.fullname?.toLowerCase() || '';
    const email = student.email?.toLowerCase() || '';
    const phone = student.profile?.phoneNumber || '';
    const matchesSearch = name.includes(term) || email.includes(term) || phone.includes(term);

    let matchesStatus = true;
    if (filterStatus === 'active') {
        matchesStatus = student.active === true;
    } else if (filterStatus === 'inactive') {
        matchesStatus = student.active === false;
    }

    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen relative">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản lý Học viên</h1>
        <p className="text-gray-600">Danh sách tất cả tài khoản Member trong hệ thống</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          
          <div className="flex-1 relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" strokeWidth={2.5} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, hoặc sđt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="flex space-x-3 w-full md:w-auto">
             <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter className="h-4 w-4 text-gray-500" strokeWidth={2.5} />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none appearance-none bg-white text-gray-700 font-medium cursor-pointer hover:border-purple-500 transition-colors"
                >
                    <option value="active">Đang hoạt động</option>
                    <option value="inactive">Vô hiệu hóa</option>
                    <option value="all">Tất cả trạng thái</option>
                </select>
             </div>

             <button 
                onClick={fetchStudents}
                className="p-2 text-gray-600 hover:bg-gray-100 hover:text-purple-600 rounded-lg transition-colors border border-gray-200"
                title="Tải lại dữ liệu"
             >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} strokeWidth={2.5} />
             </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        {loading ? (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="flex flex-col items-center">
                    <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mb-2" />
                    <span className="text-gray-500">Đang tải dữ liệu...</span>
                </div>
            </div>
        ) : (
        <>
        <div className="overflow-x-auto flex-1">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Thông tin học viên</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Liên hệ</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Ngày sinh / Giới tính</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Ngày tham gia</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentStudents.length > 0 ? (
                currentStudents.map((student) => (
                <tr key={student._id} className="hover:bg-purple-50 transition-colors duration-150 group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img 
                            className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm group-hover:border-purple-200 transition-colors" 
                            src={student.profile?.photo || "https://res.cloudinary.com/dmskqrjiu/image/upload/v1742210170/users/default.jpg.jpg"} 
                            alt="" 
                            onError={(e) => {e.target.src = "https://via.placeholder.com/40"}}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-gray-900">{student.profile?.fullname || "Chưa cập nhật"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{student.email}</div>
                    <div className="text-sm text-gray-500">{student.profile?.phoneNumber || "---"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(student.profile?.dob)}</div>
                    <div className="text-xs text-gray-500 capitalize">{student.profile?.gender === 'male' ? 'Nam' : student.profile?.gender === 'female' ? 'Nữ' : 'Khác'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {student.active ? (
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-green-100 text-green-700 items-center gap-1.5 border border-green-200">
                           <CheckCircle className="w-3.5 h-3.5" strokeWidth={2.5}/> Active
                        </span>
                    ) : (
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-red-100 text-red-700 items-center gap-1.5 border border-red-200">
                           <XCircle className="w-3.5 h-3.5" strokeWidth={2.5}/> Inactive
                        </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                    {formatDate(student.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-4">
                      <button
                        className="text-blue-600 hover:text-blue-800 transition-transform duration-200 hover:scale-110 p-1"
                        title="Xem chi tiết"
                        onClick={() => handleViewDetail(student._id)}
                      >
                        <Eye className="w-5 h-5" strokeWidth={2} />
                      </button>
                      
                      {student.active && (
                          <button
                            onClick={() => openDeactivateModal(student._id)}
                            className="text-red-500 hover:text-red-700 transition-transform duration-200 hover:scale-110 p-1"
                            title="Vô hiệu hóa tài khoản"
                          >
                            <Ban className="w-5 h-5" strokeWidth={2} />
                          </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
                <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center">
                            <Filter className="w-12 h-12 text-gray-300 mb-3" />
                            <p className="text-lg font-medium">Không tìm thấy dữ liệu</p>
                            <p className="text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                        </div>
                    </td>
                </tr>
            )}
            </tbody>
          </table>
        </div>
        
        {filteredStudents.length > 0 && (
          <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Hiển thị <span className="font-bold text-gray-900">{indexOfFirstItem + 1}</span> - <span className="font-bold text-gray-900">{Math.min(indexOfLastItem, filteredStudents.length)}</span> / <span className="font-bold text-gray-900">{filteredStudents.length}</span>
            </div>
            
            <div className="flex space-x-2">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center px-3 py-1.5 border rounded-lg text-sm font-medium transition-colors duration-200 ${
                  currentPage === 1 
                    ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 bg-white'
                }`}
              >
                <ChevronLeft className="w-4 h-4 mr-1" strokeWidth={2.5} /> Trước
              </button>
              
              <div className="hidden sm:flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => {
                  if (totalPages > 7 && (number !== 1 && number !== totalPages && Math.abs(currentPage - number) > 1)) {
                     if (number === 2 || number === totalPages - 1) return <span key={number} className="px-2 py-1.5 text-gray-400">...</span>;
                     return null;
                  }

                  return (
                    <button
                      key={number}
                      onClick={() => handlePageChange(number)}
                      className={`min-w-[32px] px-3 py-1.5 border rounded-lg text-sm font-bold transition-all duration-200 ${
                        currentPage === number 
                          ? 'bg-purple-600 text-white border-purple-600 shadow-md' 
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50 bg-white'
                      }`}
                    >
                      {number}
                    </button>
                  );
                })}
              </div>

              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`flex items-center px-3 py-1.5 border rounded-lg text-sm font-medium transition-colors duration-200 ${
                  currentPage === totalPages || totalPages === 0 
                    ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 bg-white'
                }`}
              >
                Sau <ChevronRight className="w-4 h-4 ml-1" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}
        </>
        )}
      </div>

      {isDeactivateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Xác nhận vô hiệu hóa?</h3>
              <p className="text-gray-500 mb-6">
                Bạn có chắc chắn muốn vô hiệu hóa tài khoản này? Người dùng sẽ không thể đăng nhập vào hệ thống sau khi thực hiện thao tác này.
              </p>
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={closeDeactivateModal}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleConfirmDeactivate}
                  className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-95"
                >
                  Vô hiệu hóa tài khoản 
                </button>
              </div>
            </div>
            <button 
                onClick={closeDeactivateModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            >
                <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden transform transition-all scale-100 animate-fadeIn">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 animate-bounce-short">
                <CheckCircle className="w-10 h-10 text-green-600" strokeWidth={3} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Thành công!</h3>
              <p className="text-gray-500 mb-8 text-lg">
                {successMessage}
              </p>
              
              <button
                onClick={closeSuccessModal}
                className="w-full px-6 py-3 rounded-xl bg-green-600 text-white font-bold text-lg hover:bg-green-700 shadow-lg shadow-green-200 transition-all active:scale-95"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminViewStudentList;