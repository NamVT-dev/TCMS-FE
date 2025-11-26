import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom"; 
import api from "../../../utils/api"; 
import { 
    Loader2, ArrowLeft, BookOpen, User, Home, 
    Calendar, Clock, Users, CalendarPlus, Ban, Eye, Pencil 
} from "lucide-react";
import ClassScheduleCalendar from "./ClassScheduleCalendar";
import ChangeTeacherModal from "./ChangeTeacherModal";

// --- 1. Component InfoCard ---
const InfoCard = ({ icon: Icon, title, children }) => (
    <div className="bg-white shadow rounded-lg p-5">
        <div className="flex items-center mb-3">
            <Icon className="w-6 h-6 text-purple-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="text-gray-700 space-y-2">{children}</div>
    </div>
);

// --- 2. Component WeeklyScheduleCard ---
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

// --- 3. Component StudentListCard 
const StudentListCard = ({ students, onEditStudent }) => {
    return (
        <div className="bg-white shadow rounded-lg p-5 flex flex-col h-full max-h-[500px]"> 
            {/* Header */}
            <div className="flex items-center justify-between mb-4 shrink-0">
                <div className="flex items-center">
                    <Users className="w-6 h-6 text-purple-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-800">Danh Sách Học Viên</h3>
                </div>
                <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-1 rounded-full">
                    {students?.length || 0}/20
                </span>
            </div>

            {/* List có scroll */}
            <div className="flex-1 overflow-y-auto pr-1 -mr-2 space-y-2 custom-scrollbar">
                {students?.map((student) => (
                    <div 
                        key={student._id} 
                        className="group flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-purple-50 hover:border-purple-200 transition-all cursor-pointer"
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            {/* Avatar màu sắc theo giới tính */}
                            <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm
                                ${student.gender === 'male' ? 'bg-blue-500' : 'bg-pink-400'}`}>
                                {student.name.charAt(0).toUpperCase()}
                            </div>
                            
                            {/* Info */}
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-purple-700 transition-colors">
                                    {student.name}
                                </p>
                                <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    <span>{new Date(student.dob).toLocaleDateString('vi-VN')}</span>
                                    {/* Hiển thị giới tính tinh tế hơn */}
                                    <span className="mx-1.5">•</span>
                                    <span className={student.gender === 'male' ? 'text-blue-600' : 'text-pink-600'}>
                                        {student.gender === 'male' ? 'Nam' : 'Nữ'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Nút Edit chỉ hiện khi Hover */}
                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pl-2">
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEditStudent && onEditStudent(student); // Hàm xử lý khi bấm Edit
                                }}
                                className="p-2 text-gray-400 hover:text-purple-600 hover:bg-white rounded-full transition-colors shadow-sm"
                                title="Chỉnh sửa thông tin"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}

                {(!students || students.length === 0) && (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p className="text-gray-500 text-sm">Chưa có học viên nào.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- 4. Component Chính: AdminClassDetail ---
const AdminClassDetail = () => {
    const { id } = useParams(); // <-- Hàm này cần được import ở dòng 2
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

    // Hàm giả lập xử lý khi bấm nút Edit học viên
    const handleEditStudent = (student) => {
        console.log("Edit student:", student);
        alert(`Bạn muốn sửa học viên: ${student.name}`);
        // Logic mở modal sửa học viên sẽ viết ở đây
    };

    const handleCancelClass = async () => {
        if (!classData) return;
        
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
            fetchClassDetail();
        } catch (err) {
            alert(err.response?.data?.message || "Lỗi khi hủy lớp.");
            setLoading(false);
        }
    };

    const handleScheduleAction = () => {
        if (sessions && sessions.length > 0) {
            navigate(`/admin/classes/${id}/sessions`);
        } else {
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

    const hasSessions = sessions && sessions.length > 0;
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
                
                <div className="flex space-x-3">
                    <button
                        onClick={handleScheduleAction}
                        disabled={isCanceled}
                        className={`inline-flex items-center px-4 py-2 text-white rounded-lg shadow-sm transition
                            ${isCanceled ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
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

                    <button
                        onClick={() => setIsModalOpen(true)}
                        disabled={isCanceled}
                        className={`inline-flex items-center px-4 py-2 text-white rounded-lg shadow-sm transition
                            ${isCanceled ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        <Users className="w-5 h-5 mr-2" />
                        Đổi Giáo viên
                    </button>

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
                    
                    {/* Sử dụng Component Mới */}
                    <StudentListCard 
                        students={classData.student} 
                        onEditStudent={handleEditStudent} // Truyền hàm edit vào
                    />
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