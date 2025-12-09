import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../../utils/api";
import {
    Loader2, ArrowLeft, BookOpen, User, Home,
    Calendar, Clock, Users, CalendarPlus, Ban, Eye,
    ArrowRightLeft, UserX, X, CheckCircle, AlertCircle, AlertTriangle
} from "lucide-react";
import ClassScheduleCalendar from "./ClassScheduleCalendar";
import ChangeTeacherModal from "./ChangeTeacherModal";
import ChangeClassModal from "./ChangeClassModal";
import CancelClassModal from "./CancelClassModal";

const ToastNotification = ({ notification, onClose }) => {
    if (!notification) return null;

    const isSuccess = notification.type === 'success';
    const bgColor = isSuccess ? 'bg-white' : 'bg-white';
    const borderColor = isSuccess ? 'border-green-500' : 'border-red-500';
    const textColor = isSuccess ? 'text-gray-800' : 'text-gray-800';
    const Icon = isSuccess ? CheckCircle : AlertCircle;
    const iconColor = isSuccess ? 'text-green-500' : 'text-red-500';

    return (
        <div className={`fixed top-5 right-5 z-[60] flex items-center p-4 rounded-lg shadow-xl border-l-4 ${bgColor} ${borderColor} animate-slide-in min-w-[300px]`}>
            <Icon className={`w-6 h-6 mr-3 ${iconColor}`} />
            <div className="flex-1">
                <h4 className={`font-bold text-sm ${iconColor}`}>
                    {isSuccess ? "Thành công" : "Lỗi"}
                </h4>
                <p className={`text-sm ${textColor}`}>{notification.message}</p>
            </div>
            <button onClick={onClose} className="ml-4 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
            </button>
        </div>
    );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, isLoading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                <div className="p-6">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-center text-gray-900 mb-2">{title}</h3>
                    <p className="text-center text-gray-600">{message}</p>
                </div>
                <div className="bg-gray-50 px-6 py-4 flex flex-row-reverse gap-3">
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm disabled:opacity-50"
                    >
                        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Xác nhận xóa
                    </button>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 text-base font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:text-sm"
                    >
                        Hủy bỏ
                    </button>
                </div>
            </div>
        </div>
    );
};

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

    const getDayLabel = (dayIndex) => {
        const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
        return days[dayIndex] || 'N/A';
    };

    return (
        <div className="bg-white shadow rounded-lg p-5 mb-6">
            <div className="flex items-center mb-4">
                <Calendar className="w-6 h-6 text-purple-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-800">Lịch Học Hàng Tuần</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {schedules?.map((slot, index) => {
                    const timeText = `${formatMinutes(slot.startMinute)} - ${formatMinutes(slot.endMinute)}`;
                    return (
                        <div key={index} className="p-4 bg-purple-50 rounded-lg border border-purple-200 hover:shadow-sm transition-shadow">
                            <p className="font-bold text-purple-800 text-lg mb-2 border-b border-purple-200 pb-1">
                                {getDayLabel(slot.dayOfWeek)}
                            </p>
                            <div className="text-sm text-gray-700 space-y-1.5">
                                <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-2 text-purple-500" />
                                    <span className="font-medium">{timeText}</span>
                                </div>
                                <div className="flex items-center">
                                    <User className="w-4 h-4 mr-2 text-purple-500" />
                                    <span className="truncate" title={slot.teacher?.profile?.fullname}>
                                        {slot.teacher?.profile?.fullname || 'Chưa xếp GV'}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <Home className="w-4 h-4 mr-2 text-purple-500" />
                                    <span>{slot.room?.name || 'Chưa xếp phòng'}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {(!schedules || schedules.length === 0) && (
                    <div className="col-span-full text-center py-4">
                        <p className="text-gray-500 italic">Chưa có lịch học cố định.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const StudentListCard = ({ students, maxStudents, onChangeClass, onRequestRemove }) => {
    return (
        <div className="bg-white shadow rounded-lg p-5 flex flex-col h-full max-h-[600px]">
            <div className="flex items-center justify-between mb-4 shrink-0">
                <div className="flex items-center">
                    <Users className="w-6 h-6 text-purple-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-800">Danh Sách Học Viên</h3>
                </div>
                <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-1 rounded-full">
                    {students?.length || 0}/{maxStudents || 0}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 -mr-2 space-y-3 custom-scrollbar">
                {students?.map((student) => (
                    <div
                        key={student._id}
                        className="group flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-purple-50 hover:border-purple-200 transition-all"
                    >
                        <div className="flex items-center gap-3 overflow-hidden flex-1">
                            <div className="relative shrink-0">
                                {student.photo ? (
                                    <img
                                        src={student.photo}
                                        alt={student.name}
                                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                        onError={(e) => e.target.src = 'https://via.placeholder.com/150'}
                                    />
                                ) : (
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm bg-purple-500 `}>
                                        {student.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-purple-700 transition-colors">
                                    {student.name}
                                </p>
                                <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    <span>{student.dob ? new Date(student.dob).toLocaleDateString('vi-VN') : 'N/A'}</span>
                                    <span className="mx-1.5 text-gray-300">|</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 pl-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChangeClass(student);
                                }}
                                className="p-2 text-blue-500 hover:bg-blue-100 rounded-md transition-colors"
                                title="Đổi lớp"
                            >
                                <ArrowRightLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRequestRemove(student); // Thay đổi tên prop để rõ nghĩa hơn
                                }}
                                className="p-2 text-red-500 hover:bg-red-100 rounded-md transition-colors"
                                title="Xóa khỏi lớp"
                            >
                                <UserX className="w-4 h-4" />
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

// --- MAIN COMPONENT ---

const AdminClassDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [classData, setClassData] = useState(null);
    const [sessions, setSessions] = useState([]);

    const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
    const [isChangeClassModalOpen, setIsChangeClassModalOpen] = useState(false);
    const [isCancelClassModalOpen, setIsCancelClassModalOpen] = useState(false);
    const [studentToChangeClass, setStudentToChangeClass] = useState(null);

    const [notification, setNotification] = useState(null); 

    const [removeStudentModal, setRemoveStudentModal] = useState({ isOpen: false, student: null });
    const [isRemovingStudent, setIsRemovingStudent] = useState(false);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        
        setTimeout(() => setNotification(null), 3000);
    };

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
        showNotification("Đã thay đổi giáo viên thành công!");
    };

    const handleClassChanged = () => {
        fetchClassDetail();
        showNotification("Đã chuyển lớp cho học viên thành công!");
    };

    const handleSessionUpdated = (updatedSession) => {
        setSessions(prevSessions =>
            prevSessions.map(session =>
                session._id === updatedSession._id ? updatedSession : session
            )
        );
        showNotification("Cập nhật buổi học thành công!");
    };

    const handleRequestRemoveStudent = (student) => {
        setRemoveStudentModal({ isOpen: true, student });
    };

    const handleConfirmRemoveStudent = async () => {
        const student = removeStudentModal.student;
        if (!student) return;

        setIsRemovingStudent(true);
        try {
            await api.admin.class.removeStudentFromClass(id, { studentId: student._id });
            
            setRemoveStudentModal({ isOpen: false, student: null });
            
            
            fetchClassDetail();
            
            
            showNotification(`Đã xóa học viên ${student.name} khỏi lớp.`, 'success');
        } catch (err) {
            console.error(err);
         
            setRemoveStudentModal({ isOpen: false, student: null }); 
            showNotification(err.response?.data?.message || "Lỗi khi xóa học viên.", 'error');
        } finally {
            setIsRemovingStudent(false);
        }
    };

    const handleChangeClass = (student) => {
        setStudentToChangeClass(student);
        setIsChangeClassModalOpen(true);
    };

    const handleConfirmCancelClass = async () => {
        await api.admin.class.cancelClass(id);
        fetchClassDetail();
        showNotification("Đã hủy lớp học thành công.", 'success');
    };

    const handleScheduleAction = () => {
        if (sessions && sessions.length > 0) {
            navigate(`/staff/classes/${id}/sessions`);
        } else {
            navigate(`/staff/classes/${id}/schedule-setup`);
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
        <div className="p-6 bg-gray-50 min-h-screen relative">
            <ToastNotification 
                notification={notification} 
                onClose={() => setNotification(null)} 
            />

            <div className="flex justify-between items-center mb-4">
                <Link
                    to="/staff/classes"
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
                        onClick={() => setIsTeacherModalOpen(true)}
                        disabled={isCanceled}
                        className={`inline-flex items-center px-4 py-2 text-white rounded-lg shadow-sm transition
                            ${isCanceled ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        <Users className="w-5 h-5 mr-2" />
                        Đổi Giáo viên
                    </button>

                    {!isCanceled && (
                        <button
                            onClick={() => setIsCancelClassModalOpen(true)}
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
                        <p><strong>Trạng thái:</strong> <span className="uppercase font-semibold text-purple-600">{classData.status}</span></p>
                        <p><strong>Sĩ số:</strong> {classData.student?.length || 0} / {classData.maxStudent} HS</p>
                    </InfoCard>

                    <StudentListCard
                        students={classData.student}
                        maxStudents={classData.maxStudent}
                        onChangeClass={handleChangeClass}
                        onRequestRemove={handleRequestRemoveStudent} 
                    />
                </div>

                <div className="lg:col-span-2">
                    <WeeklyScheduleCard schedules={classData.weeklySchedules} />
                    <ClassScheduleCalendar
                        sessions={sessions}
                        classInfo={classData}
                        onSessionUpdated={handleSessionUpdated}
                    />
                </div>
            </div>

            
            <ChangeTeacherModal
                isOpen={isTeacherModalOpen}
                onClose={() => setIsTeacherModalOpen(false)}
                classData={classData}
                sessions={sessions}
                onTeacherChanged={handleTeacherChanged}
            />

            <ChangeClassModal
                isOpen={isChangeClassModalOpen}
                onClose={() => setIsChangeClassModalOpen(false)}
                student={studentToChangeClass}
                currentClass={classData}
                onSuccess={handleClassChanged}
            />

            <CancelClassModal
                isOpen={isCancelClassModalOpen}
                onClose={() => setIsCancelClassModalOpen(false)}
                classData={classData}
                onConfirm={handleConfirmCancelClass}
            />

         
            <ConfirmationModal 
                isOpen={removeStudentModal.isOpen}
                onClose={() => setRemoveStudentModal({ ...removeStudentModal, isOpen: false })}
                onConfirm={handleConfirmRemoveStudent}
                title="Xóa học viên khỏi lớp"
                message={`Bạn có chắc chắn muốn xóa học viên "${removeStudentModal.student?.name}" khỏi lớp này không? Hành động này không thể hoàn tác.`}
                isLoading={isRemovingStudent}
            />
        </div>
    );
};

export default AdminClassDetail;