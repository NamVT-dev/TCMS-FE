import React, { useState, useEffect, useMemo } from "react";
import api from "../../../../utils/api";
import { 
    Loader2, Eye, CheckCircle, AlertCircle, XCircle, 
    Lightbulb, BarChart2, Calendar, X 
} from "lucide-react";
import AdminRequestDetailModal from "./AdminRequestDetailModal";
import moment from "moment";

const DAYS = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
const SHIFTS = ["S1", "S2", "S3", "S4", "S5", "S6"];

const CourseSuggestionPanel = ({ courseId, courseName, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        if (!courseId) return;
        const analyze = async () => {
            setLoading(true);
            try {
                const res = await api.admin.request.getAll({
                    course: courseId,
                    status: 'open',
                    limit: 1000
                });
                const requests = res.data.data.data || [];

                const heatmap = {}; 
                const monthlyTrend = {}; 
                const uniqueStudents = new Set();

                DAYS.forEach((_, d) => {
                    heatmap[d] = {};
                    SHIFTS.forEach(s => heatmap[d][s] = new Set());
                });

                requests.forEach(req => {
                    const sId = req.student?._id;
                    if (!sId) return;
                    
                    uniqueStudents.add(sId);

                    const monthKey = moment(req.createdAt).format("MM/YYYY");
                    if (!monthlyTrend[monthKey]) monthlyTrend[monthKey] = new Set();
                    monthlyTrend[monthKey].add(sId);

                    (req.preferredDays || []).forEach(day => {
                        (req.preferredShifts || []).forEach(shift => {
                            if (heatmap[day] && heatmap[day][shift]) {
                                heatmap[day][shift].add(sId);
                            }
                        });
                    });
                });

                setStats({ heatmap, monthlyTrend, totalUnique: uniqueStudents.size });

            } catch (err) {
                console.error("Lỗi phân tích:", err);
            } finally {
                setLoading(false);
            }
        };
        analyze();
    }, [courseId]);

    const getCellColor = (size) => {
        if (size === 0) return "bg-gray-50 text-gray-300";
        if (size < 3) return "bg-blue-50 text-blue-600";
        if (size < 5) return "bg-blue-200 text-blue-800 font-bold";
        return "bg-purple-600 text-white font-bold shadow-md"; 
    };

    if (loading) return <div className="p-6 bg-purple-50 rounded-xl mb-6 flex items-center justify-center text-purple-700"><Loader2 className="animate-spin mr-2"/> Đang phân tích nhu cầu...</div>;
    if (!stats || stats.totalUnique === 0) return null;

    return (
        <div className="bg-white border-2 border-purple-100 rounded-xl mb-6 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-purple-50 px-6 py-4 flex justify-between items-center border-b border-purple-100">
                <div className="flex items-center gap-3">
                    
                    <div>
                        <h3 className="font-bold text-purple-900">Gợi Ý Mở Lớp: {courseName}</h3>
                        <p className="text-xs text-purple-700">Dựa trên <span className="font-bold">{stats.totalUnique}</span> học viên đang chờ (đã lọc trùng)</p>
                    </div>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center"><Calendar className="w-4 h-4 mr-2"/> Khung giờ được chọn nhiều nhất</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-center border-collapse">
                            <thead>
                                <tr>
                                    <th className="p-2 border-b border-gray-100 text-gray-400">Ca/Thứ</th>
                                    {DAYS.map(d => <th key={d} className="p-2 border-b border-gray-100 text-gray-600">{d}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {SHIFTS.map(shift => (
                                    <tr key={shift}>
                                        <td className="p-2 font-bold text-gray-500 border-r border-gray-100">{shift}</td>
                                        {DAYS.map((_, dayIdx) => {
                                            const count = stats.heatmap[dayIdx][shift].size;
                                            return (
                                                <td key={dayIdx} className="p-1">
                                                    <div className={`h-8 rounded flex items-center justify-center ${getCellColor(count)}`}>
                                                        {count > 0 ? count : "-"}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="lg:col-span-1 border-l border-gray-100 pl-8">
                    <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center"><BarChart2 className="w-4 h-4 mr-2"/> Xu hướng theo tháng</h4>
                    <div className="space-y-3">
                        {Object.entries(stats.monthlyTrend)
                            .sort((a, b) => b[1].size - a[1].size)
                            .slice(0, 5)
                            .map(([month, setIds]) => (
                                <div key={month} className="flex items-center justify-between group">
                                    <span className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded group-hover:bg-purple-50 transition">{month}</span>
                                    <div className="flex items-center">
                                        <div className="h-2 bg-purple-200 rounded-full mr-2 w-24 overflow-hidden">
                                            <div className="h-full bg-purple-600" style={{ width: `${(setIds.size / stats.totalUnique) * 100}%` }}></div>
                                        </div>
                                        <span className="text-sm font-bold text-purple-700">{setIds.size}</span>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdminRequestList = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [coursesForFilter, setCoursesForFilter] = useState([]); 
    
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    const [statusFilter, setStatusFilter] = useState(""); 
    const [courseFilter, setCourseFilter] = useState(""); 

    const [selectedId, setSelectedId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

   
    useEffect(() => {
        const fetchCoursesFromRequests = async () => {
            try {
                // Gọi API lấy nhiều requests để trích xuất danh sách khóa học thực tế
                const res = await api.admin.request.getAll({ limit: 1000 });
                const allRequests = res.data.data.data || [];

                // Dùng Map để lọc Course trùng lặp dựa trên ID
                const uniqueCoursesMap = new Map();

                allRequests.forEach(req => {
                    // Chỉ lấy những request có trường course và có _id
                    if (req.course && req.course._id) {
                        uniqueCoursesMap.set(req.course._id, req.course);
                    }
                });

                // Chuyển Map thành Array để map vào Dropdown
                setCoursesForFilter(Array.from(uniqueCoursesMap.values()));

            } catch (err) {
                console.error("Lỗi tải danh sách khóa học cho bộ lọc:", err);
            }
        };
        fetchCoursesFromRequests();
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [page, statusFilter, courseFilter]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: 10,
                sort: "-createdAt"
            };
            if (statusFilter) params.status = statusFilter;
            if (courseFilter) params.course = courseFilter; 

            const res = await api.admin.request.getAll(params);
            setRequests(res.data.data.data); 
            setTotalPages(res.data.totalPages);
        } catch (error) {
            console.error("Fetch requests error", error);
        } finally {
            setLoading(false);
        }
    };

    const openDetail = (id) => {
        setSelectedId(id);
        setIsModalOpen(true);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "open": return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium flex items-center w-fit"><AlertCircle className="w-3 h-3 mr-1"/> Chờ xử lý</span>;
            case "processed": return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center w-fit"><CheckCircle className="w-3 h-3 mr-1"/> Đã xử lý</span>;
            case "closed": return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium flex items-center w-fit"><XCircle className="w-3 h-3 mr-1"/> Đã đóng</span>;
            default: return status;
        }
    };

    const formatDays = (days) => {
        if (!days || days.length === 0) return "Chưa chọn";
        const map = { 0: "CN", 1: "T2", 2: "T3", 3: "T4", 4: "T5", 5: "T6", 6: "T7" };
        return days.map(d => map[d]).join(", ");
    };

    const statusMap = {
        "": "Tất cả",
        "open": "Mới",
        "processed": "Đã xử lý",
        "closed": "Đã đóng"
    };

    const selectedCourseName = coursesForFilter.find(c => c._id === courseFilter)?.name;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Quản Lý Yêu Cầu Riêng</h1>
                
                <div className="flex flex-wrap gap-3">
                    <select 
                        value={courseFilter}
                        onChange={(e) => { setCourseFilter(e.target.value); setPage(1); }}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white max-w-xs truncate"
                    >
                        <option value="">-- Lọc theo khóa học (Có yêu cầu) --</option>
                        {coursesForFilter.map(c => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                    </select>

                    <div className="flex items-center bg-white p-1 rounded-lg border shadow-sm">
                        {Object.keys(statusMap).map((st) => (
                            <button
                                key={st}
                                onClick={() => { setStatusFilter(st); setPage(1); }}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                                    statusFilter === st 
                                        ? "bg-purple-100 text-purple-700" 
                                        : "text-gray-600 hover:bg-gray-50"
                                }`}
                            >
                                {statusMap[st]}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {courseFilter && (
                <CourseSuggestionPanel 
                    courseId={courseFilter} 
                    courseName={selectedCourseName}
                    onClose={() => setCourseFilter("")}
                />
            )}

            <div className="bg-white rounded-lg shadow border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Học viên</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nhu cầu</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lịch mong muốn</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center"><Loader2 className="animate-spin mx-auto text-purple-600"/></td>
                                </tr>
                            ) : requests.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500 italic">Không có dữ liệu</td>
                                </tr>
                            ) : (
                                requests.map((req) => (
                                    <tr key={req._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{req.student?.name || "Unknown"}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {req.course ? (
                                                <div className="flex flex-col">
                                                    <span className="text-sm text-purple-600 font-bold">{req.course.name}</span>
                                                    <span className="text-xs text-gray-500">Level: {req.course.level}</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-green-600 font-medium">{req.category?.name || "N/A"}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-600">
                                                <p><span className="font-semibold text-xs text-gray-500">Ngày:</span> {formatDays(req.preferredDays)}</p>
                                                <p><span className="font-semibold text-xs text-gray-500">Ca:</span> {req.preferredShifts?.join(", ") || "Chưa chọn"}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {moment(req.createdAt).format("DD/MM/YYYY")}
                                        </td>
                                        <td className="px-6 py-4 flex justify-center">
                                            {getStatusBadge(req.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button 
                                                onClick={() => openDetail(req._id)}
                                                className="text-purple-600 hover:text-purple-900 p-1 hover:bg-purple-50 rounded" 
                                                title="Xem chi tiết"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 border-t flex items-center justify-between">
                    <span className="text-sm text-gray-700">Trang {page} / {totalPages}</span>
                    <div className="space-x-2">
                        <button 
                            disabled={page <= 1} 
                            onClick={() => setPage(p => p - 1)}
                            className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-100"
                        >
                            Trước
                        </button>
                        <button 
                            disabled={page >= totalPages} 
                            onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-100"
                        >
                            Sau
                        </button>
                    </div>
                </div>
            </div>

            <AdminRequestDetailModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                requestId={selectedId}
                onSuccess={fetchRequests}
            />
        </div>
    );
};

export default AdminRequestList;