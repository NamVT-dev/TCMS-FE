import React, { useState, useEffect, useCallback } from "react";
import { Search, Trash2, Eye, Plus, BookOpen, Book, Layers, Clock, DollarSign, FolderOpen, GraduationCap } from "lucide-react";
import api from "../../../utils/api";
import AdminCreateCourseModal from "./AdminCreateCourseModal";
import AdminCourseDetailModal from "./AdminCourseDetailModal";
import showToast from "../../../utils/showToast";
import { Modal } from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";

const AdminViewCourseList = () => {
    const [courses, setCourses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal states
    const [openCreate, setOpenCreate] = useState(false);
    const [openDetail, setOpenDetail] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState(null);

    // Antd Modal hook
    const [modal, contextHolder] = Modal.useModal();

    // --- FETCH DATA ---
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [catRes, courseRes] = await Promise.all([
                api.admin.getCategories(),
                api.admin.getCourse({ limit: 1000 })
            ]);

            setCategories(catRes.data?.data || []);
            setCourses(courseRes.data?.data?.courses || []);
        } catch (err) {
            console.error(err);
            showToast.error("Lỗi tải dữ liệu hệ thống");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- HANDLERS ---
    const handleView = (id) => {
        setSelectedCourseId(id);
        setOpenDetail(true);
    };

    const handleDelete = (id) => {
        modal.confirm({
            title: "Xác nhận xóa khóa học?",
            icon: <ExclamationCircleFilled />,
            content: "Hành động này sẽ xóa khóa học vĩnh viễn và không thể hoàn tác.",
            okText: "Xóa ngay",
            cancelText: "Hủy",
            okButtonProps: { className: "bg-red-600 hover:bg-red-700 border-none" },
            zIndex: 3000,
            async onOk() {
                try {
                    await api.admin.deleteCourseById(id);
                    showToast.success("Đã xóa khóa học");
                    fetchData();
                } catch (err) {
                    showToast.error(err?.response?.data?.message || "Lỗi khi xóa");
                }
            },
        });
    };

    // Handler cho update thành công
    const handleUpdateSuccess = useCallback(() => {
        // Reload data
        fetchData();
        // Hiển thị toast thông báo
        showToast.success("Cập nhật khóa học thành công!");
    }, [fetchData]);

  
    // 1. Trích xuất mảng category an toàn
    const categoryList = Array.isArray(categories) ? categories : (categories?.data || []);

    // 2. Filter theo search term
    const filteredCourses = courses.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 3. Group theo Category ID
    const groupedCourses = categoryList.reduce((acc, cat) => {
        const coursesInCat = filteredCourses.filter(c =>
            c.category?._id === cat._id || c.category === cat._id
        );

        if (coursesInCat.length > 0) {
            acc.push({
                category: cat,
                courses: coursesInCat
            });
        }
        return acc;
    }, []);

    const categoryIds = categoryList.map(c => c._id);
    const otherCourses = filteredCourses.filter(c => {
        const cCatId = c.category?._id || c.category;
        return !categoryIds.includes(cCatId);
    });

    if (otherCourses.length > 0) {
        groupedCourses.push({
            category: { _id: 'other', name: 'Khác / Chưa phân loại' },
            courses: otherCourses
        });
    }

    // --- RENDER HELPERS ---
    const LevelBadge = ({ level }) => {
        const colors = {
            'Starter': 'bg-indigo-100 text-indigo-700 border-indigo-200',
            'Beginner': 'bg-green-100 text-green-700 border-green-200',
            'Pre-Intermediate': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'Upper-Intermediate': 'bg-orange-100 text-orange-700 border-orange-200',
            'Advanced': 'bg-red-100 text-red-700 border-red-200',
            'Elementary': 'bg-teal-100 text-teal-700 border-teal-200',
            'Intermediate': 'bg-blue-100 text-blue-700 border-blue-200',
            'Expert': 'bg-red-100 text-red-700 border-red-200',
        };
        return (
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide border ${colors[level] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                {level}
            </span>
        );
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-sans">
            {contextHolder}

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-purple-600" />
                        Quản lý Khóa học
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">Danh sách khóa học được phân nhóm theo danh mục.</p>
                </div>
                <button
                    onClick={() => setOpenCreate(true)}
                    className="group inline-flex items-center px-5 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all shadow-sm hover:shadow-md active:scale-95"
                >
                    <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                    Tạo Khóa Học
                </button>
            </div>

            <div className="sticky top-0 z-30 bg-gray-50 pb-4 -mx-6 px-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm khóa học..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                        />
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            {loading ? (
                <div className="text-center py-20"><div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto"></div></div>
            ) : groupedCourses.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                    <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Không tìm thấy khóa học nào</h3>
                </div>
            ) : (
                <div className="space-y-10">
                    {groupedCourses.map((group) => (
                        <div key={group.category._id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Category Title */}
                            <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-200">
                                <div className="p-2 bg-purple-100 rounded-lg text-purple-700">
                                    <FolderOpen className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">{group.category.name}</h2>
                                <span className="text-sm font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                    {group.courses.length}
                                </span>
                            </div>

                            {/* Courses Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {group.courses.map((course) => (
                                    <div
                                        key={course._id}
                                        className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full relative"
                                    >
                                        {/* Image */}
                                        <div className="relative h-40 overflow-hidden bg-gray-100 flex items-center justify-center">
                                            {course.imageCover ? (
                                                <img
                                                    src={course.imageCover}
                                                    alt={course.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = "none";
                                                    }}
                                                />
                                            ) : (
                                                <Book className="w-12 h-12 text-purple-400" />
                                            )}

                                            {/* Price badge */}
                                            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-purple-700 flex items-center shadow-sm">
                                                {Number(course.price).toLocaleString()}
                                            </div>
                                        </div>

                                        {/* Body */}
                                        <div className="p-4 flex-1 flex flex-col">
                                            <div className="mb-2">
                                                <LevelBadge level={course.level} />
                                            </div>
                                            <h3
                                                className="text-base font-bold text-gray-800 mb-1 line-clamp-2 group-hover:text-purple-600 transition-colors cursor-pointer"
                                                onClick={() => handleView(course._id)}
                                            >
                                                {course.name}
                                            </h3>

                                            <div className="mt-auto grid grid-cols-2 gap-2 pt-3 text-xs text-gray-500">
                                                <div className="flex items-center bg-gray-50 p-1.5 rounded border border-gray-100">
                                                    <Layers className="w-3 h-3 mr-1.5 text-gray-400" />
                                                    {course.session || 0} buổi
                                                </div>
                                                <div className="flex items-center bg-gray-50 p-1.5 rounded border border-gray-100">
                                                    <Clock className="w-3 h-3 mr-1.5 text-gray-400" />
                                                    {course.durationInMinutes || 0}p
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer Actions */}
                                        <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-100 flex gap-2">
                                            <button
                                                onClick={() => handleView(course._id)}
                                                className="flex-1 flex items-center justify-center py-1.5 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded transition-colors"
                                            >
                                                <Eye className="w-4 h-4 mr-1.5" /> Chi tiết
                                            </button>
                                            <button
                                                onClick={() => handleDelete(course._id)}
                                                className="w-9 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                title="Xóa"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modals */}
            <AdminCreateCourseModal
                open={openCreate}
                categories={categories}
                onClose={() => setOpenCreate(false)}
                onSuccess={fetchData}
            />

            <AdminCourseDetailModal
                open={openDetail}
                courseId={selectedCourseId}
                categories={categories}
                onClose={() => setOpenDetail(false)}
                onUpdated={handleUpdateSuccess}
            />
        </div>
    );
};

export default AdminViewCourseList;