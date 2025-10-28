import React, { useState, useEffect, useCallback } from "react";
import { Search, Trash2, Eye, Edit } from "lucide-react";
import api from "../../../utils/api";
import AdminCreateCourseModal from "./AdminCreateCourseModal";
import AdminCourseDetailModal from "./AdminCourseDetailModal";
import showToast from "../../../utils/showToast";
import { Modal, Card, Avatar, Flex, Typography, Switch } from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";

const { Title, Text } = Typography;

const AdminViewCourseList = () => {
    const [courses, setCourse] = useState([]);
    const [categories, setCategories] = useState([]);
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
    const PAGE_SIZE = 8;

    const [openCreate, setOpenCreate] = useState(false);
    const [openDetail, setOpenDetail] = useState(false);
    const [detailMode, setDetailMode] = useState("view");
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

    const fetchCategories = async () => {
        try {
            const response = await api.admin.getCategories();
            setCategories(response.data?.data || []);
        } catch (err) {
            console.error(err);
            setError("Không thể tải danh mục.");
        }
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
        fetchCategories();
        fetchCourse();
    }, [fetchCourse]);

    if (loading) return <div className="p-6 text-center">Đang tải dữ liệu...</div>;
    if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

    return (
        <div className="bg-gray-50 min-h-screen">
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
                            placeholder="Tìm kiếm khóa học..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        />
                    </div>

                    <button
                        onClick={() => setOpenCreate(true)}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        + Thêm Mới
                    </button>
                </div>
            </div>

            {/* Cards layout */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "16px",
                }}
            >
                {courses.length > 0 ? (
                    courses.map((course) => (
                        <Card
                            key={course._id}
                            style={{
                                borderRadius: 12,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            }}
                            actions={[
                                <div key="view" style={{ display: "flex", justifyContent: "center" }}>
                                    <Eye onClick={() => handleView(course._id)} />
                                </div>,
                                <div key="edit" style={{ display: "flex", justifyContent: "center" }}>
                                    <Edit onClick={() => handleEdit(course._id)} />
                                </div>,
                                <div key="delete" style={{ display: "flex", justifyContent: "center" }}>
                                    <Trash2 onClick={() => handleDelete(course._id)} color="red" />
                                </div>,
                            ]}
                        >
                            <img
                                src={course.imageCover}
                                alt={course.imageCover}
                                style={{
                                    width: "100%",
                                    height: 160,
                                    objectFit: "cover",
                                    borderBottom: "1px solid #f0f0f0",
                                }}
                            />
                            <Card.Meta
                                title={<Title style={{textAlign:"center", marginTop: 8, marginBottom: 0}} level={3}>{course.name}</Title>}
                                description={
                                    <div
                                        style={{
                                            textAlign: "center",
                                            marginTop: 8
                                        }}>
                                        <Text>
                                            Category: {course.category?.name || "N/A"}
                                        </Text>
                                        <br />
                                        <Text>
                                            Level: {course.level || "N/A"}
                                        </Text>
                                        <br />
                                        <Text>Session: {course.session || 0}</Text>
                                        <br />
                                        <Text>Duration: {course.durationInMinutes || 0} min</Text>
                                        <br />
                                        <Text>Price:</Text>
                                        <Text strong className="text-purple-700"> {Number(course.price).toLocaleString()} VND
                                        </Text>
                                    </div>
                                }
                            />
                        </Card>
                    ))
                ) : (
                    <div className="text-center text-gray-500 w-full py-10">
                        Không có dữ liệu khóa học
                    </div>
                )}
            </div>


            {/* Pagination */}
            <div className="mt-8 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                    Hiển thị <span className="font-medium">{pagination.results}</span> /
                    <span className="font-medium">{pagination.total}</span> khóa học
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
                        onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                        disabled={currentPage === pagination.totalPages}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Sau
                    </button>
                </div>
            </div>

            {/* Modals */}
            <AdminCreateCourseModal
                open={openCreate}
                categories={categories}
                onClose={() => setOpenCreate(false)}
                onSuccess={fetchCourse}
            />

            <AdminCourseDetailModal
                open={openDetail}
                courseId={courseId}
                categories={categories}
                mode={detailMode}
                onClose={() => setOpenDetail(false)}
                onUpdated={fetchCourse}
            />
        </div>
    );
};

export default AdminViewCourseList;
