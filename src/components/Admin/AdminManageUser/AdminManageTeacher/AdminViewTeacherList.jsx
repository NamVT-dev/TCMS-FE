import React, { useState, useEffect } from 'react';
import { Search, Eye, Edit, Trash2, Filter } from 'lucide-react';
import api from '../../../../utils/api';

const AdminViewTeacherList = () => {
    // State để lưu trữ dữ liệu từ API
    const [teachers, setTeachers] = useState([]);
    const [pagination, setPagination] = useState({});
    
    // State cho các chức năng của UI
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Sử dụng useEffect để gọi API khi component được render hoặc khi page/search thay đổi
    useEffect(() => {
        const fetchTeachers = async () => {
            setLoading(true);
            setError(null);
            try {
                // Chuẩn bị params cho API
                const params = {
                    page: currentPage,
                    search: searchTerm,
                };
                
                // Gọi API
                const response = await api.admin.getTeachers(params);

                // Cập nhật state với dữ liệu nhận được
                setTeachers(response.data.data.teachers);
                setPagination({
                    page: response.data.page,
                    totalPages: response.data.totalPages,
                    total: response.data.total,
                    results: response.data.results
                });

            } catch (err) {
                setError('Không thể tải dữ liệu giáo viên.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        // Thêm debounce để tránh gọi API liên tục khi người dùng gõ
        const debounceFetch = setTimeout(() => {
            fetchTeachers();
        }, 500); // Chờ 500ms sau khi người dùng ngừng gõ

        return () => clearTimeout(debounceFetch); // Dọn dẹp timeout

    }, [currentPage, searchTerm]); // Dependency array

    // Hàm tiện ích để render trạng thái hoạt động
    const getStatusBadge = (isActive) => {
        if (isActive) {
            return 'bg-green-100 text-green-800';
        }
        return 'bg-red-100 text-red-800';
    };

    // Các hàm xử lý sự kiện
    const handleView = (id) => console.log('View teacher:', id);
    const handleEdit = (id) => console.log('Edit teacher:', id);
    const handleDelete = (id) => console.log('Delete teacher:', id);

    // Render loading state
    if (loading) {
        return <div className="p-6 text-center">Đang tải dữ liệu...</div>;
    }

    // Render error state
    if (error) {
        return <div className="p-6 text-center text-red-500">{error}</div>;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Danh sách giáo viên</h1>
                <p className="text-gray-600">Quản lý thông tin giáo viên trong hệ thống</p>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search Box */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên hoặc email..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
                            }}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        />
                    </div>
                    {/* ... Các nút Filter và Add Teacher ... */}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tên giáo viên</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Trình độ</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Lịch rảnh</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {teachers.map((teacher) => (
                                <tr key={teacher._id} className="hover:bg-gray-50 transition-colors duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img className="w-10 h-10 rounded-full" src={teacher.profile.photo} alt={teacher.username} />
                                            <div className="ml-3">
                                                <div className="text-sm font-medium text-gray-900">{teacher.username}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{teacher.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{teacher.level}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 flex flex-wrap gap-1">
                                            {teacher.avaiable?.map((slot, index) => (
                                                <span key={index} className="inline-block bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs">
                                                    {slot}
                                                </span>
                                            )) || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(teacher.active)}`}>
                                            {teacher.active ? 'Hoạt động' : 'Tạm ngưng'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center space-x-3">
                                            <button onClick={() => handleView(teacher._id)} className="text-blue-600 hover:text-blue-800" title="Xem chi tiết"><Eye className="w-5 h-5" /></button>
                                            <button onClick={() => handleEdit(teacher._id)} className="text-green-600 hover:text-green-800" title="Chỉnh sửa"><Edit className="w-5 h-5" /></button>
                                            <button onClick={() => handleDelete(teacher._id)} className="text-red-600 hover:text-red-800" title="Xóa"><Trash2 className="w-5 h-5" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                        <div className="text-sm text-gray-700">
                            Hiển thị <span className="font-medium">{pagination.results}</span> trong tổng số <span className="font-medium">{pagination.total}</span> giáo viên
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Trước
                            </button>
                            <span className="px-3 py-1 text-sm">Trang {pagination.page} / {pagination.totalPages}</span>
                            <button
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                disabled={currentPage === pagination.totalPages}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminViewTeacherList;