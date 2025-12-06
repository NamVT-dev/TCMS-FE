import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import { Loader2, ArrowLeft, Calendar, Clock, MapPin, User, Edit3, AlertCircle } from 'lucide-react';
import moment from 'moment-timezone';

const TIMEZONE = "Asia/Ho_Chi_Minh";

const AdminViewDetailSessionClass = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [classData, setClassData] = useState(null);
    const [sessions, setSessions] = useState([]);

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Gọi API lấy chi tiết lớp + sessions
                // params: withSessions=true để lấy list sessions
                const res = await api.admin.class.getClassDetail(id, { withSessions: true, sessionLimit: 200 });
                
                if (res.data && res.data.data) {
                    setClassData(res.data.data.class);
                    // Sort sessions theo sessionNo để hiển thị đúng thứ tự
                    const sortedSessions = (res.data.data.sessions || []).sort((a, b) => a.sessionNo - b.sessionNo);
                    setSessions(sortedSessions);
                }
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.message || "Không thể tải dữ liệu lịch học.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id]);

    // --- HELPER: FORMAT DATE/TIME ---
    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        return moment(dateStr).tz(TIMEZONE).format("DD/MM/YYYY");
    };

    const formatTimeRange = (start, end) => {
        if (!start || !end) return "N/A";
        const s = moment(start).tz(TIMEZONE).format("HH:mm");
        const e = moment(end).tz(TIMEZONE).format("HH:mm");
        return `${s} - ${e}`;
    };

    const getDayOfWeek = (dateStr) => {
        if (!dateStr) return "";
        const day = moment(dateStr).tz(TIMEZONE).day();
        const map = ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
        return map[day];
    };

    // --- HELPER: STATUS BADGE ---
    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed':
                return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Đã học</span>;
            case 'scheduled':
                return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Sắp tới</span>;
            case 'canceled':
                return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Đã hủy</span>;
            default:
                return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">{status}</span>;
        }
    };

    // // --- HANDLERS ---
    // const handleEditSession = (sessionId) => {
    //     // Navigate to edit session modal or page (tùy logic app của bạn)
    //     // Ví dụ: hiện tại chưa có trang edit riêng từng session, có thể log ra hoặc mở modal
    //     console.log("Edit session:", sessionId);
    //     // navigate(`/admin/classes/${id}/sessions/${sessionId}/edit`); 
    // };

    if (loading) {
        return (
            <div className="p-10 flex justify-center items-center min-h-screen bg-gray-50">
                <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-gray-50 min-h-screen">
                <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Đã xảy ra lỗi</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link to="/staff/classes" className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                        Quay lại danh sách
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                {/* HEADER */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <button 
                            onClick={() => navigate(`/staff/classes/detail/${id}`)} 
                            className="mr-4 text-gray-600 hover:text-purple-600 transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Chi tiết lịch học</h1>
                            <p className="text-sm text-gray-500 mt-1">{classData?.name}</p>
                        </div>
                    </div>
                    {/* Nút thao tác phụ nếu cần */}
                    <div className="flex space-x-2">
                         {/* Ví dụ: Nút Export hoặc Print */}
                    </div>
                </div>

                {/* CLASS INFO SUMMARY CARD */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-start space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Khóa học</p>
                            <p className="font-semibold text-gray-800">{classData?.course?.name || "N/A"}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg text-green-600">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Tổng số buổi</p>
                            <p className="font-semibold text-gray-800">
                                {sessions.length} buổi ({classData?.course?.session || 0} theo chương trình)
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start space-x-3">
                        <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Trạng thái lớp</p>
                            <span className="uppercase font-bold text-xs text-gray-700">
                                {classData?.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* SESSION LIST TABLE */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                        <h3 className="text-lg font-semibold text-gray-800">Danh sách buổi học</h3>
                        <span className="text-sm text-gray-500">Tổng: {sessions.length}</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                                        Buổi
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ngày & Thứ
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thời gian
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Phòng học
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Giáo viên đứng lớp
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    {/* <th scope="col" className="relative px-6 py-3">
                                        <span className="sr-only">Edit</span>
                                    </th> */}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sessions.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-10 text-center text-gray-500 italic">
                                            Chưa có lịch học nào được tạo cho lớp này.
                                        </td>
                                    </tr>
                                ) : (
                                    sessions.map((session) => {
                                        // Check if session is in the past
                                        const isPast = moment(session.endAt).isBefore(moment());
                                        const rowClass = isPast ? "bg-gray-50 opacity-75" : "hover:bg-gray-50 transition-colors";

                                        return (
                                            <tr key={session._id} className={rowClass}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-purple-100 text-purple-700 font-bold text-sm">
                                                        {session.sessionNo}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {formatDate(session.startAt)}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {getDayOfWeek(session.startAt)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center text-sm text-gray-700">
                                                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                                        {formatTimeRange(session.startAt, session.endAt)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center text-sm text-gray-700">
                                                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                                        {session.room?.name || "N/A"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-2 overflow-hidden">
                                                            {session.teacher?.profile?.photo ? (
                                                                <img src={session.teacher.profile.photo} alt="" className="h-full w-full object-cover" />
                                                            ) : (
                                                                <User className="w-4 h-4" />
                                                            )}
                                                        </div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {session.teacher?.profile?.fullname || session.teacher?.username || "N/A"}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    {getStatusBadge(session.status)}
                                                </td>
                                                {/* <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button 
                                                        onClick={() => handleEditSession(session._id)}
                                                        className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-50"
                                                        title="Chỉnh sửa buổi này"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                </td> */}
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminViewDetailSessionClass;