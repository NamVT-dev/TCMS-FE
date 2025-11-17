import React, { useState, useEffect, useCallback } from 'react';
import { Search, Eye, Trash2, Loader2, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../../utils/api';
import { useDebounce } from '../../../../hooks/useDebounce';
import { ExclamationCircleFilled } from "@ant-design/icons";
import { Modal } from "antd";
import showToast from "../../../../utils/showToast";

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
            ? 'bg-purple-600 text-white'
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

const AdminViewStaffList = () => {
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [modal, contextHolder] = Modal.useModal();
  const limit = 10;

  // Xóa state: selectedTeacher (không dùng master-detail nữa)

  const fetchStaffs = useCallback(async (currentPage, search, status) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage, limit,
        search: search || undefined,
        active: status || undefined,
      };
      const response = await api.admin.getStaffs(params);
      const data = response.data;
      console.log("Dữ liệu staff: ", data?.data);
      setStaffs(data.data.data);
      setPage(data.page);
      setTotalPages(data.totalPages);
      setTotalResults(data.total);
    } catch (err) {
      console.error(err);
      setError('Không thể tải dữ liệu nhân viên.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaffs(page, debouncedSearch, selectedStatus);
  }, [page, debouncedSearch, selectedStatus, fetchStaffs]);

  const getStatusBadge = (isActive) =>
    isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

  const handleDelete = (id, name) => {
    modal.confirm({
      title: `Bạn có chắc chắn muốn xóa nhân viên "${name}" không?`,
      icon: <ExclamationCircleFilled />,
      content: "Thao tác này không thể hoàn tác.",
      okText: "Xóa",
      cancelText: "Hủy",
      okType: "danger",
      getContainer: false,
      zIndex: 2000,
      async onOk() {
        const toastId = showToast.loading("Đang xóa nhân viên...");
        try {
          await api.admin.deleteStaff(id);
          showToast.updateSuccess(toastId, "Xóa nhân viên thành công!");
          // Nếu xóa xong trang hiện tại không còn item nào và không phải trang 1 -> lùi về trang trước
          if (staffs.length === 1 && page > 1) {
            setPage(page - 1); // Lùi trang nếu xóa item cuối cùng
          } else {
            fetchStaffs(page, debouncedSearch, selectedStatus);
          }
        } catch (err) {
          console.error(err);
          showToast.updateError(
            toastId,
            err?.response?.data?.message || "Xóa nhân viên thất bại!"
          );
        }
      },
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {contextHolder}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Danh sách nhân viên</h1>
          <p className="text-gray-600">Quản lý thông tin nhân viên trong hệ thống</p>
        </div>
        <button
          onClick={() => navigate('/admin/users/staff/create')}
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Thêm Nhân Viên
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm theo tên, email, trình độ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Tất cả Trạng thái</option>
            <option value="true">Hoạt động</option>
            <option value="false">Tạm ngưng</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tên nhân viên</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">SĐT</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ngày sinh</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Giới tính</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="5" className="p-6 text-center"><Loader2 className="w-8 h-8 mx-auto animate-spin text-purple-600" /></td></tr>
              ) : error ? (
                <tr><td colSpan="5" className="p-6 text-center text-red-500">{error}</td></tr>
              ) : staffs.length > 0 ? (
                staffs.map((staff) => (
                  <tr key={staff._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          className="w-10 h-10 rounded-full object-cover"
                          src={staff.profile.photo || `https://ui-avatars.com/api/?name=${staff.username}&background=ede9fe&color=7c3aed`}
                          alt={staff.username}
                        />
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{staff.profile?.fullname}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{staff.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{staff.profile?.phoneNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{staff.profile?.dob
                      ? new Date(staff.profile.dob).toLocaleDateString('vi-VN')
                      : "Chưa cập nhật"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{staff.profile?.gender === 'male' ? "Nam" : "Nữ"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(staff.active)}`}
                      >
                        {staff.active ? 'Hoạt động' : 'Tạm ngưng'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-3">
                        <Link
                          to={`/admin/users/staff/detail/${staff._id}`}
                          className="text-blue-600 hover:text-blue-800" title="Xem"
                        >
                          <Eye size={20} />
                        </Link>
                        {/* Nút Sửa đã bị xóa khỏi đây */}
                        <button
                          onClick={() => handleDelete(staff._id, staff.profile?.fullname || staff.username)}
                          className="text-red-600 hover:text-red-800" title="Xóa"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center p-6 text-gray-500">
                    Không tìm thấy nhân viên nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {(!loading && totalResults > 0) && (
          <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Hiển thị <span className="font-medium">{(page - 1) * limit + 1}</span> - <span className="font-medium">{Math.min(page * limit, totalResults)}</span> / <span className="font-medium">{totalResults}</span> nhân viên
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminViewStaffList;