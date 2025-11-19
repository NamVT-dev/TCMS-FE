import React, { useState, useEffect, useCallback } from 'react';
import { Search, Eye, Trash2, Loader2, Plus, User } from 'lucide-react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import api from '../../../../utils/api';
import { useDebounce } from '../../../../hooks/useDebounce';
import { Modal } from "antd";
import showToast from "../../../../utils/showToast";
import { ExclamationCircleFilled } from "@ant-design/icons";
import AdminStaffModal from './AdminStaffModal';

// ... (Pagination Component giữ nguyên) ...
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
            <button onClick={() => onPageChange(page - 1)} disabled={page === 1} className="px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 text-sm font-medium">Trước</button>
            {getPages().map((p, idx) => (
                <button key={idx} onClick={() => typeof p === 'number' && onPageChange(p)} disabled={p === '...'} className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-all ${p === page ? 'bg-purple-600 text-white shadow-sm' : p === '...' ? 'text-gray-400 cursor-default' : 'text-gray-600 hover:bg-gray-100 border border-transparent hover:border-gray-200'}`}>{p}</button>
            ))}
            <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages} className="px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 text-sm font-medium">Sau</button>
        </div>
    );
};

const AdminViewStaffList = () => {
    const [staffs, setStaffs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();
    const { id: paramId } = useParams();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const limit = 10;
    
    // Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    // Staff hiện tại chưa hỗ trợ Edit modal trong code mẫu, chỉ Create.
    // Nhưng ta vẫn bắt URL edit để nếu sau này mở rộng thì sẵn sàng.

    const [modal, contextHolder] = Modal.useModal();

    // --- LOGIC TỰ ĐỘNG MỞ MODAL ---
    useEffect(() => {
        if (location.pathname.includes('/staff/create')) {
            setIsCreateModalOpen(true);
        } else {
            setIsCreateModalOpen(false);
        }
    }, [location.pathname]);

    const handleOpenCreate = () => {
        navigate('/admin/users/staff/create');
    };

    const handleCloseModal = () => {
        navigate('/admin/users/staff');
    };

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

    const handleDelete = (id, name) => {
        modal.confirm({
            title: `Xác nhận xóa nhân viên?`,
            icon: <ExclamationCircleFilled />,
            content: `Bạn có chắc muốn xóa nhân viên "${name}"? Hành động này không thể hoàn tác.`,
            okText: "Xóa",
            cancelText: "Hủy",
            okButtonProps: { className: "bg-red-600 hover:bg-red-700" },
            zIndex: 2000,
            async onOk() {
                const toastId = showToast.loading("Đang xóa nhân viên...");
                try {
                    await api.admin.deleteStaff(id);
                    showToast.updateSuccess(toastId, "Xóa nhân viên thành công!");
                    if (staffs.length === 1 && page > 1) {
                        setPage(page - 1);
                    } else {
                        fetchStaffs(page, debouncedSearch, selectedStatus);
                    }
                } catch (err) {
                    showToast.updateError(toastId, err?.response?.data?.message || "Xóa thất bại!");
                }
            },
        });
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-sans">
            {contextHolder}
            
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Danh sách nhân viên</h1>
                    <p className="text-gray-500 mt-1">Quản lý hồ sơ nhân viên và phân quyền hệ thống.</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="inline-flex items-center px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium shadow-lg shadow-purple-200 transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Thêm Nhân Viên
                </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Tìm theo tên, email, SĐT..."
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

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                        <thead className="bg-gray-50/50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nhân viên</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Liên hệ</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Thông tin cá nhân</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="5" className="p-12 text-center"><Loader2 className="w-10 h-10 mx-auto animate-spin text-purple-500" /></td></tr>
                            ) : error ? (
                                <tr><td colSpan="5" className="p-12 text-center text-red-500 font-medium">{error}</td></tr>
                            ) : staffs.length > 0 ? (
                                staffs.map((staff) => (
                                    <tr key={staff._id} className="hover:bg-purple-50/30 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 ring-2 ring-white shadow-sm flex-shrink-0">
                                                    <img 
                                                        src={staff.profile.photo || `https://ui-avatars.com/api/?name=${staff.profile?.fullname || staff.username}&background=ede9fe&color=7c3aed`} 
                                                        alt="" 
                                                        className="w-full h-full object-cover" 
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-gray-900">{staff.profile?.fullname || staff.username}</div>
                                                    <div className="text-xs text-gray-500 mt-0.5">{staff.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-700">{staff.email}</div>
                                            <div className="text-xs text-gray-400 mt-0.5">{staff.profile?.phoneNumber || '---'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            <div>{staff.profile?.gender === 'male' ? 'Nam' : staff.profile?.gender === 'female' ? 'Nữ' : 'Khác'}</div>
                                            <div className="text-xs text-gray-400">{staff.profile?.dob ? new Date(staff.profile.dob).toLocaleDateString('vi-VN') : ''}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${staff.active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${staff.active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                {staff.active ? 'Hoạt động' : 'Tạm ngưng'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link to={`/admin/users/staff/detail/${staff._id}`} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Xem chi tiết">
                                                    <Eye size={18} />
                                                </Link>
                                                <button onClick={() => handleDelete(staff._id, staff.profile?.fullname)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Xóa">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="p-16 text-center text-gray-400 font-medium">Không tìm thấy nhân viên nào</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {!loading && totalResults > 0 && (
                    <div className="px-6 py-4 bg-white border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-gray-500">Hiển thị <span className="font-semibold text-gray-900">{(page - 1) * limit + 1}-{Math.min(page * limit, totalResults)}</span> trong số <span className="font-semibold text-gray-900">{totalResults}</span></div>
                        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                    </div>
                )}
            </div>

            <AdminStaffModal 
                isOpen={isCreateModalOpen}
                onClose={handleCloseModal}
                onSuccess={() => fetchStaffs(page, debouncedSearch, selectedStatus)}
            />
        </div>
    );
};

export default AdminViewStaffList;