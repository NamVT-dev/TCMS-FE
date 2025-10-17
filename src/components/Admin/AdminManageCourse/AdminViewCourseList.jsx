import React, { useState, useEffect, useCallback } from "react";
import { Search, Trash2, Eye, Edit } from "lucide-react";
import api from "../../../utils/api";
import AdminCreateCourseModal from "./AdminCreateCourseModal";
import AdminCourseDetailModal from "./AdminCourseDetailModal";
import showToast from "../../../utils/showToast";
import { Modal } from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";

const AdminViewCourseList = () => {
    const [courses, setCourse] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        total: 0,
        results: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 10;

    // Modal tạo mới
    const [openCreate, setOpenCreate] = useState(false);

    // Modal chi tiết/sửa
    const [openDetail, setOpenDetail] = useState(false);
    const [detailMode, setDetailMode] = useState("view"); // "view" | "edit"
    const [courseId, setCourseId] = useState(null);
    const [modal, contextHolder] = Modal.useModal();

    const handleView = (id) => {
        setCourseId(id);
        setDetailMode("view");
        setOpenDetail(true);
    };

    const handleEdit = (id) => {
        setCourseId(id);
        setDetailMode("edit");
        setOpenDetail(true);
    };

    const handleDelete = (id) => {
        modal.confirm({
            title: "Xác nhận xóa khóa học?",
            icon: <ExclamationCircleFilled />,
            content: "Thao tác này không thể hoàn tác.",
            okText: "Xóa",
            cancelText: "Hủy",
            okType: "danger",
            getContainer: false,
            zIndex: 2000,
            async onOk() {
                const toastId = showToast.loading("Đang xóa khóa học...");
                try {
                    await api.admin.deleteCourseById(id);
                    showToast.updateSuccess(toastId, "Xóa khóa học thành công!");
                    // Nếu xóa xong trang hiện tại không còn item nào và không phải trang 1 -> lùi về trang trước
                    if (courses.length === 1 && currentPage > 1) {
                        setCurrentPage((p) => p - 1);
                    } else {
                        fetchCourse();
                    }
                } catch (err) {
                    console.error(err);
                    showToast.updateError(
                        toastId,
                        err?.response?.data?.message || "Xóa khóa học thất bại!"
                    );
                }
            },
        });
    };

    const fetchCourse = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = { page: currentPage, limit: PAGE_SIZE, search: searchTerm };
            const response = await api.admin.getCourse(params);

            const data = response.data;
            const total = data.total ?? 0;
            const results = data.results;

            setCourse(data?.data?.courses ?? []);
            setPagination({
                page: data.page ?? currentPage,
                totalPages: Math.ceil(total / PAGE_SIZE),
                total,
                results,
            });
        } catch (err) {
            console.error(err);
            setError("Không thể tải dữ liệu khóa học.");
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm]);

    useEffect(() => {
        const debounce = setTimeout(fetchCourse, 300);
        return () => clearTimeout(debounce);
    }, [fetchCourse]);

    if (loading) return <div className="p-6 text-center">Đang tải dữ liệu...</div>;
    if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {contextHolder}
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Danh sách khóa học</h1>
                <p className="text-gray-600">Quản lý khóa học</p>
            </div>

            {/* Search + Create Button */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên phòng hoặc chỗ học..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        />
                    </div>

                    {/* Nút mở Modal tạo phòng */}
                    <button
                        onClick={() => setOpenCreate(true)}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        + Thêm Mới
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] text-center">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">STT</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Tên Khóa học</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Giá (VNĐ)</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Danh mục</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Mức độ</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Số buổi học</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Thời lượng buổi học (phút)</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200">
                            {courses.length > 0 ? (
                                courses.map((course, index) => (
                                    <tr key={course._id} className="hover:bg-gray-50 transition-colors duration-150 text-gray-700">
                                        {/* STT theo trang */}
                                        <td className="px-6 py-4 font-medium text-gray-800">
                                            {(currentPage - 1) * PAGE_SIZE + index + 1}
                                        </td>
                                        <td className="px-6 py-4">{course.name}</td>
                                        <td className="px-6 py-4">{Number(course.price).toLocaleString()}₫</td>
                                        <td className="px-6 py-4">{course.category}</td>
                                        <td className="px-6 py-4">{course.level}</td>
                                        <td className="px-6 py-4">{course.session}</td>
                                        <td className="px-6 py-4">{course.durationInMinutes}</td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-3">
                                                <button onClick={() => handleView(course._id)} className="text-blue-600 hover:text-blue-800" title="Xem chi tiết">
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => handleEdit(course._id)} className="text-green-600 hover:text-green-800" title="Chỉnh sửa">
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => handleDelete(course._id)} className="text-red-600 hover:text-red-800" title="Xóa">
                                                    <Trash2 className="text-red-600 hover:text-red-800 w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                                        Không có dữ liệu khóa học
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination bar */}
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                    <div className="text-sm text-gray-700">
                        Hiển thị <span className="font-medium">{pagination.results}</span>{" "}
                        trong tổng số <span className="font-medium">{pagination.total}</span> khóa học
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Trước
                        </button>

                        <span className="px-3 py-1 text-sm">
                            Trang {pagination.page} / {pagination.totalPages}
                        </span>

                        <button
                            onClick={() =>
                                setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
                            }
                            disabled={currentPage === pagination.totalPages}
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Sau
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal tạo khóa học */}
            <AdminCreateCourseModal
                open={openCreate}
                onClose={() => setOpenCreate(false)}
                onSuccess={fetchCourse}
            />

            {/* Modal xem chi tiết / chỉnh sửa */}
            <AdminCourseDetailModal
                open={openDetail}
                courseId={courseId}
                mode={detailMode}
                onClose={() => setOpenDetail(false)}
                onUpdated={fetchCourse}
            />

        </div>
    );
};

export default AdminViewCourseList;
