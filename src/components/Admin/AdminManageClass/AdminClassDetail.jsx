import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../../utils/api"; // Đảm bảo đường dẫn đúng
import { 
    Loader2, ArrowLeft, BookOpen, User, Home, 
    Calendar, Clock, Users, CalendarPlus, Ban, Eye 
} from "lucide-react";
import ClassScheduleCalendar from "./ClassScheduleCalendar";
import ChangeTeacherModal from "./ChangeTeacherModal";

// Component InfoCard giữ nguyên
const InfoCard = ({ icon: Icon, title, children }) => (
    <div className="bg-white shadow rounded-lg p-5">
        <div className="flex items-center mb-3">
            <Icon className="w-6 h-6 text-purple-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="text-gray-700 space-y-2">{children}</div>
    </div>
);

// Component WeeklyScheduleCard giữ nguyên
const WeeklyScheduleCard = ({ schedules }) => {
    const formatMinutes = (minutes) => {
        if (minutes === undefined || minutes === null) return '';
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    return (
        <div className="bg-white shadow rounded-lg p-5">
            <div className="flex items-center mb-4">
                <Calendar className="w-6 h-6 text-purple-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-800">Lịch Học Hàng Tuần</h3>
            </div>
            <div className="space-y-4">
                {schedules?.map((slot, index) => {
                    const timeText = `${formatMinutes(slot.startMinute)} - ${formatMinutes(slot.endMinute)}`;
                    return (
                        <div key={index} className="p-3 bg-purple-50 rounded-md border border-purple-200">
                            <p className="font-semibold text-purple-800">
                                {['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'][slot.dayOfWeek]}
                            </p>
                            <div className="text-sm text-gray-700 mt-1 space-y-1">
                                <p><Clock className="w-4 h-4 inline mr-2" /> {timeText}</p>
                                <p><User className="w-4 h-4 inline mr-2" /> {slot.teacher?.profile?.fullname || 'N/A'}</p>
                                <p><Home className="w-4 h-4 inline mr-2" /> {slot.room?.name || 'N/A'}</p>
                            </div>
                        </div>
                    );
                })}
                {(!schedules || schedules.length === 0) && <p className="text-gray-500 italic">Chưa có lịch tuần cố định.</p>}
            </div>
        </div>
    );
};

const AdminClassDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [classData, setClassData] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchClassDetail = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = { withSessions: true, sessionLimit: 200 };
            const res = await api.admin.class.getClassDetail(id, params);
            setClassData(res.data.data.class);
            setSessions(res.data.data.sessions);
        } catch (err) {
            setError(err.response?.data?.message || "Lỗi khi tải chi tiết lớp học");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchClassDetail();
    }, [fetchClassDetail]);

    const handleTeacherChanged = () => {
        fetchClassDetail();
    };

    const handleSessionUpdated = (updatedSession) => {
        setSessions(prevSessions =>
            prevSessions.map(session =>
                session._id === updatedSession._id ? updatedSession : session
            )
        );
    };

    // --- Xử lý Hủy Lớp ---
    const handleCancelClass = async () => {
        if (!classData) return;
        
        // Kiểm tra điều kiện phía Client cho chắc chắn (dù server có check rồi)
        const hasStudents = classData.student && classData.student.length > 0;
        const hasReserved = classData.reservedCount > 0;

        if (hasStudents || hasReserved) {
            alert("Không thể hủy lớp khi đang có học viên (Confirmed hoặc Holding). Vui lòng chuyển học viên sang lớp khác trước.");
            return;
        }

        if (!window.confirm(`Bạn có chắc chắn muốn HỦY lớp "${classData.name}" không? Hành động này sẽ hủy toàn bộ lịch học liên quan.`)) {
            return;
        }

        try {
            setLoading(true);
            await api.admin.class.cancelClass(id);
            alert("Hủy lớp thành công!");
            // Sau khi hủy, load lại data để cập nhật status
            fetchClassDetail();
        } catch (err) {
            alert(err.response?.data?.message || "Lỗi khi hủy lớp.");
            setLoading(false);
        }
    };

    // --- Xử lý nút Lịch Học ---
    const handleScheduleAction = () => {
        if (sessions && sessions.length > 0) {
            navigate(`/admin/classes/${id}/sessions`); // Route này trỏ tới AdminViewDetailSessionClass
        }else {
            // Nếu chưa có session -> Sang trang setup lịch
            navigate(`/admin/classes/${id}/schedule-setup`);
        }
    };

    if (loading) {
        return (
            <div className="p-6 flex justify-center items-center min-h-[300px]">
                <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
            </div>
        );
    }

    if (error) {
        return <div className="p-6 text-center text-red-600">{error}</div>;
    }

    if (!classData) {
        return <div className="p-6 text-center text-gray-500">Không tìm thấy dữ liệu lớp.</div>;
    }

    // Kiểm tra xem đã có lịch chi tiết chưa
    const hasSessions = sessions && sessions.length > 0;
    // Kiểm tra xem lớp đã bị hủy chưa để disable các nút thao tác
    const isCanceled = classData.status === "canceled";

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-4">
                <Link
                    to="/admin/classes"
                    className="flex items-center text-purple-600 hover:text-purple-800 font-medium mb-2"
                >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Quay lại Danh sách lớp
                </Link>
                
                {/* Button Group */}
                <div className="flex space-x-3">
                    {/* 1. Nút Lịch Học (Logic thay đổi theo yêu cầu) */}
                    <button
                        onClick={handleScheduleAction}
                        disabled={isCanceled}
                        className={`inline-flex items-center px-4 py-2 text-white rounded-lg shadow-sm transition
                            ${isCanceled 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-purple-600 hover:bg-purple-700'}`}
                    >
                        {hasSessions ? (
                            <>
                                <Eye className="w-5 h-5 mr-2" />
                                Xem Lịch Chi Tiết
                            </>
                        ) : (
                            <>
                                <CalendarPlus className="w-5 h-5 mr-2" />
                                {classData.weeklySchedules?.length > 0 ? "Tạo Lịch Học (Từ Weekly)" : "Tạo Lịch Học"}
                            </>
                        )}
                    </button>

                    {/* 2. Nút Đổi Giáo Viên */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        disabled={isCanceled}
                        className={`inline-flex items-center px-4 py-2 text-white rounded-lg shadow-sm transition
                            ${isCanceled 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        <Users className="w-5 h-5 mr-2" />
                        Đổi Giáo viên
                    </button>

                    {/* 3. Nút Hủy Lớp (Thay cho nút Sửa Lớp) */}
                    {/* Chỉ hiển thị nút Hủy nếu lớp chưa bị hủy */}
                    {!isCanceled && (
                        <button
                            onClick={handleCancelClass}
                            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-sm"
                        >
                            <Ban className="w-5 h-5 mr-2" />
                            Hủy Lớp
                        </button>
                    )}
                    {isCanceled && (
                        <span className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-500 rounded-lg border border-gray-300 cursor-not-allowed">
                            <Ban className="w-5 h-5 mr-2" />
                            Đã Hủy
                        </span>
                    )}
                </div>
            </div>

            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-1 flex items-center gap-3">
                    {classData.name}
                    {isCanceled && <span className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded-full font-medium">Đã Hủy</span>}
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <InfoCard icon={BookOpen} title="Thông Tin Khóa Học">
                        <p><strong>Mã lớp:</strong> {classData.classCode || "N/A"}</p>
                        <p><strong>Khóa học:</strong> {classData.course?.name || "N/A"}</p>
                        <p><strong>Trạng thái:</strong> <span className="uppercase">{classData.status}</span></p>
                        <p><strong>Sĩ số:</strong> {classData.student?.length || 0} / {classData.maxStudent} HS</p>
                    </InfoCard>
                    <WeeklyScheduleCard schedules={classData.weeklySchedules} />
                </div>
                <div className="lg:col-span-2">
                    {/* Calendar hiển thị tổng quan */}
                    <ClassScheduleCalendar
                        sessions={sessions}
                        classInfo={classData}
                        onSessionUpdated={handleSessionUpdated}
                    />
                </div>
            </div>

            <ChangeTeacherModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                classData={classData}
                sessions={sessions}
                onTeacherChanged={handleTeacherChanged}
            />
        </div>
    );
};

export default AdminClassDetail;