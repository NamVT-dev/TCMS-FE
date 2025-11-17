import React, { useState, useEffect, useCallback } from 'react';
import { Search, Eye, Loader2 } from 'lucide-react';
import { useDebounce } from '../../../../hooks/useDebounce';
import StaffManageTeacherDetail from './StaffManageTeacherDetail';
import api from '../../../../utils/api';

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

const StaffManageTeacherView = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const limit = 10;

    // States for Detail Modal
    const [openDetail, setOpenDetail] = useState(false);
    const [teacherId, setTeacherId] = useState(null);
    const [detailMode, setDetailMode] = useState('view');

    const handleView = (id) => {
        setTeacherId(id);
        setDetailMode("view");
        setOpenDetail(true);
    };

    // Xóa state: selectedTeacher (không dùng master-detail nữa)

    const fetchTeachers = useCallback(async (currentPage, search, status) => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page: currentPage, limit,
                search: search || undefined,
                active: status || undefined,
            };
            const response = await api.staff.getTeachers(params);
            const data = response.data;
            setTeachers(data.data.data);
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

    const getStatusBadge = (isActive) =>
        isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Danh sách giáo viên</h1>
                    <p className="text-gray-600">Quản lý thông tin giáo viên trong hệ thống</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Tìm theo tên, email,..."
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
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tên giáo viên</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ngày sinh</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">SĐT</th>
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
                            ) : teachers.length > 0 ? (
                                teachers.map((teacher) => (
                                    <tr key={teacher._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <img
                                                    className="w-10 h-10 rounded-full object-cover"
                                                    src={teacher.profile.photo || `https://ui-avatars.com/api/?name=${teacher.username}&background=ede9fe&color=7c3aed`}
                                                    alt={teacher.username}
                                                />
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900">{teacher.profile?.fullname || teacher.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{teacher.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{teacher.profile.dob ? new Date(teacher.profile.dob).toLocaleDateString('vi-VN') : 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{teacher.profile?.phoneNumber}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{teacher.profile?.gender === 'male' ? "Nam" : "Nữ"}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(teacher.active)}`}
                                            >
                                                {teacher.active ? 'Hoạt động' : 'Tạm ngưng'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center space-x-3">
                                                    <Eye size={20} onClick={() => handleView(teacher._id)} />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center p-6 text-gray-500">
                                        Không tìm thấy giáo viên nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {(!loading && totalResults > 0) && (
                    <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-200">
                        <div className="text-sm text-gray-700">
                            Hiển thị <span className="font-medium">{(page - 1) * limit + 1}</span> - <span className="font-medium">{Math.min(page * limit, totalResults)}</span> / <span className="font-medium">{totalResults}</span> giáo viên
                        </div>
                        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                    </div>
                )}
            </div>

            {/* Modals */}
            <StaffManageTeacherDetail
                open={openDetail}
                teacherId={teacherId}
                mode={detailMode}
                onClose={() => setOpenDetail(false)}
                onUpdated={fetchTeachers}
            />
        </div>
    );
};

export default StaffManageTeacherView;