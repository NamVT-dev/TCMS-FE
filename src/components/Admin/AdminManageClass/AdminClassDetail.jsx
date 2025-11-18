import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../../utils/api";
import { Loader2, ArrowLeft, BookOpen, User, Home, Calendar, Clock, Edit, Users, CalendarPlus } from "lucide-react";
import ClassScheduleCalendar from "./ClassScheduleCalendar";
import ChangeTeacherModal from "./ChangeTeacherModal";

const InfoCard = ({ icon: Icon, title, children }) => (
    <div className="bg-white shadow rounded-lg p-5">
        <div className="flex items-center mb-3">
            <Icon className="w-6 h-6 text-purple-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="text-gray-700 space-y-2">{children}</div>
    </div>
);

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
                {schedules.map((slot, index) => {
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

    // Callback khi session được update thành công
    const handleSessionUpdated = (updatedSession) => {
        // Update session trong state
        setSessions(prevSessions =>
            prevSessions.map(session =>
                session._id === updatedSession._id ? updatedSession : session
            )
        );

        // Optional: Refresh toàn bộ nếu cần
        // fetchClassDetail();
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
                <div className="flex space-x-3">
                    <button
                        onClick={() => navigate(`/admin/classes/${id}/schedule-setup`)}
                        className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-sm"
                    >
                        <CalendarPlus className="w-5 h-5 mr-2" />
                        {classData.weeklySchedules?.length > 0 ? "Sửa Lịch Học" : "Tạo Lịch Học"}
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
                    >
                        <Users className="w-5 h-5 mr-2" />
                        Đổi Giáo viên
                    </button>
                    <button
                        onClick={() => navigate(`/admin/classes/edit/${id}`)}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm"
                    >
                        <Edit className="w-5 h-5 mr-2" />
                        Sửa Lớp
                    </button>
                </div>
            </div>

            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-1">
                    {classData.name}
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <InfoCard icon={BookOpen} title="Thông Tin Khóa Học">
                        <p><strong>Khóa học:</strong> {classData.course?.name || "N/A"}</p>
                        <p><strong>Trạng thái:</strong> {classData.status}</p>
                        <p><strong>Sĩ số:</strong> {classData.minStudent} - {classData.maxStudent} HS</p>
                    </InfoCard>
                    <WeeklyScheduleCard schedules={classData.weeklySchedules} />
                </div>
                <div className="lg:col-span-2">
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