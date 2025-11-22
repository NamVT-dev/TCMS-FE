import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  CalendarDaysIcon, 
  BookOpenIcon, 
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  UserIcon,
  UserGroupIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import api from '../../utils/api';
import Loading from '../UI/Loading';
import { format, isPast, isToday, isFuture } from 'date-fns';
import { vi } from 'date-fns/locale';

const StudentClassDetail = () => {
  const { studentId, classId } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!studentId || !classId) {
      navigate('/learner/my-classes'); 
      return;
    }

    const fetchClassDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.learner.getStudentClassDetail(studentId, classId); 
        setClassData(res.data.data); 
      } catch (err) {
        console.error(err);
        setError(err.message || "Không thể tải chi tiết lớp học.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassDetail();
  }, [studentId, classId, navigate]);

  if (isLoading) return <Loading fullscreen={true} message="Đang tải chi tiết lớp..." />;
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-red-100">
            <p className="text-red-600 font-medium mb-4">{error}</p>
            <button onClick={() => navigate('/learner/my-classes')} className="text-gray-600 hover:text-purple-600 underline">
                Quay lại danh sách lớp
            </button>
        </div>
    </div>
  );

  if (!classData) return <p className="p-8 text-center text-gray-600">Không tìm thấy dữ liệu lớp học.</p>;

  const { classInfo, sessions, enrollments } = classData;
  const sortedSessions = sessions?.sort((a, b) => new Date(a.startAt) - new Date(b.startAt)) || [];
  
  // Tìm buổi học tiếp theo gần nhất
  const nextSessionIndex = sortedSessions.findIndex(s => !isPast(new Date(s.endAt)));

  const teacherInfo = sessions?.[0]?.teacher || classInfo.preferredTeacher;
  const teacherName = teacherInfo?.profile?.fullname || teacherInfo?.username || 'Chưa phân công';
  const teacherEmail = teacherInfo?.email || '---';
  const teacherPhoto = teacherInfo?.profile?.photo;

  return (
    <div className="min-h-screen bg-gray-50 pb-12 font-sans">
      {/* --- HEADER BANNER (Modern Glassmorphism) --- */}
      <div className="relative bg-gradient-to-br from-[#6366f1] to-[#a855f7] text-white pt-8 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
            <div className="absolute top-[-10%] right-[-5%] w-64 h-64 rounded-full bg-white blur-3xl"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 rounded-full bg-purple-300 blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
            <button
                onClick={() => navigate('/learner/my-classes')}
                className="flex items-center text-white/80 hover:text-white mb-6 transition-colors group text-sm font-medium"
            >
                <ArrowLeftIcon className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Quay lại
            </button>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="px-3 py-1 rounded-full bg-white/20 border border-white/10 text-xs font-semibold backdrop-blur-md shadow-sm">
                            {classInfo.course?.name || "Khóa học"}
                        </span>
                        <span className={`px-3 py-1 rounded-full border text-xs font-bold backdrop-blur-md uppercase tracking-wider ${classInfo.status === 'approved' ? 'bg-green-400/20 border-green-400/30 text-green-100' : 'bg-white/10 border-white/20 text-gray-100'}`}>
                            {classInfo.status === 'approved' ? 'Đang hoạt động' : classInfo.status}
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight drop-shadow-sm">
                        {classInfo.name}
                    </h1>
                    <p className="text-indigo-100 flex items-center text-sm md:text-base font-medium">
                        <CalendarDaysIcon className="w-5 h-5 mr-2 opacity-80" />
                        {format(new Date(classInfo.startAt), 'dd/MM/yyyy')} - {format(new Date(classInfo.endAt), 'dd/MM/yyyy')}
                    </p>
                </div>
                
                {/* Stats Box */}
                <div className="flex gap-3">
                     <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 min-w-[100px] text-center shadow-lg">
                        <p className="text-[10px] text-indigo-100 uppercase font-bold tracking-wider mb-1">Sĩ số</p>
                        <p className="text-2xl font-extrabold">{enrollments.length}<span className="text-sm text-indigo-200 font-medium"></span></p>
                     </div>
                     <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 min-w-[100px] text-center shadow-lg">
                        <p className="text-[10px] text-indigo-100 uppercase font-bold tracking-wider mb-1">Số buổi</p>
                        <p className="text-2xl font-extrabold">{sessions.length}</p>
                     </div>
                </div>
            </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN (2/3): TIMELINE STYLE */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center">
                            <CalendarDaysIcon className="w-5 h-5 mr-2 text-indigo-600" />
                            Lịch trình học tập
                        </h2>
                        <span className="text-xs font-medium text-gray-500">
                            {sortedSessions.filter(s => isPast(new Date(s.endAt))).length} / {sessions.length} buổi đã xong
                        </span>
                    </div>
                    
                    <div className="p-6 relative">
                        {/* Vertical Line (đường kẻ dọc vẫn giữ để kết nối các buổi) */}
                        <div className="absolute left-9 top-6 bottom-6 w-0.5 bg-gray-100 hidden sm:block"></div>

                        {sortedSessions.length > 0 ? (
                            <div className="space-y-6">
                                {sortedSessions.map((session, index) => {
                                    const sessionDate = new Date(session.startAt);
                                    const isFinished = isPast(sessionDate) && !isToday(sessionDate);
                                    const isHappening = isToday(sessionDate);
                                    const isNext = index === nextSessionIndex; 
                                    
                                    return (
                                        <div key={session._id} className="relative flex flex-col sm:flex-row gap-5 group">
                                            
                                            {/* ĐÃ GỠ BỎ PHẦN TIMELINE DOT (HÌNH TRÒN) TẠI ĐÂY */}

                                            {/* Date Box */}
                                            <div className={`flex-shrink-0 w-full sm:w-20 h-20 rounded-2xl flex flex-col items-center justify-center border transition-all z-10 bg-white
                                                ${isHappening 
                                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105 border-indigo-600' 
                                                    : isNext 
                                                        ? 'bg-white border-indigo-200 text-indigo-600 shadow-md'
                                                        : isFinished
                                                            ? 'bg-gray-50 border-gray-100 text-gray-400'
                                                            : 'bg-white border-gray-200 text-gray-600'
                                                }`}>
                                                <span className={`text-[10px] font-bold uppercase tracking-wide ${isHappening ? 'text-indigo-200' : ''}`}>
                                                    {format(sessionDate, 'EEE', { locale: vi })}
                                                </span>
                                                <span className="text-2xl font-bold leading-none my-0.5">{format(sessionDate, 'dd')}</span>
                                                <span className={`text-[10px] font-medium ${isHappening ? 'text-indigo-200' : ''}`}>
                                                    {format(sessionDate, 'MM/yyyy')}
                                                </span>
                                            </div>

                                            {/* Content Box */}
                                            <div className={`flex-1 p-4 rounded-xl border transition-all relative
                                                ${isHappening 
                                                    ? 'bg-indigo-50/50 border-indigo-100 shadow-sm' 
                                                    : isNext
                                                        ? 'bg-white border-indigo-200 shadow-sm ring-1 ring-indigo-50'
                                                        : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'
                                                }
                                            `}>
                                                {isNext && <div className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">NEXT</div>}
                                                
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                                                            ${isFinished ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-blue-700 border border-blue-100'}
                                                        `}>
                                                            Buổi {session.sessionNo || index + 1}
                                                        </span>
                                                        {isHappening && (
                                                            <span className="flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-600">
                                                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5 animate-ping"></span>
                                                                Hôm nay
                                                            </span>
                                                        )}
                                                    </div>
                                                    {isFinished && <CheckCircleIcon className="w-5 h-5 text-green-500" />}
                                                </div>
                                                
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-y-2 gap-x-6 text-sm text-gray-600">
                                                    <div className="flex items-center">
                                                        <ClockIcon className="w-4 h-4 mr-2 text-gray-400" />
                                                        <span className="font-medium text-gray-700">
                                                            {format(new Date(session.startAt), 'HH:mm')} - {format(new Date(session.endAt), 'HH:mm')}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <MapPinIcon className="w-4 h-4 mr-2 text-gray-400" />
                                                        <span>Phòng: <span className="font-semibold text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded">{session.room?.name || '---'}</span></span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="py-12 text-center flex flex-col items-center justify-center">
                                <CalendarDaysIcon className="w-16 h-16 text-gray-200 mb-3" />
                                <p className="text-gray-500 font-medium">Chưa có lịch học nào.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN (1/3): INFO SIDEBAR */}
            <div className="space-y-6">
                
                {/* Teacher Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative group">
                    <div className="h-20 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                    <div className="px-5 pb-5">
                        <div className="relative -mt-10 mb-3 flex justify-center">
                            <div className="w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden bg-white">
                                {teacherPhoto ? (
                                    <img src={teacherPhoto} alt={teacherName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-indigo-500 font-bold text-2xl">
                                        {teacherName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg font-bold text-gray-800">{teacherName}</h3>
                            <p className="text-sm text-gray-500 mb-4">{teacherEmail}</p>
                            <button className="w-full py-2 rounded-lg border border-indigo-100 text-indigo-600 text-sm font-medium hover:bg-indigo-50 transition-colors">
                                Xem hồ sơ
                            </button>
                        </div>
                    </div>
                </div>

                {/* Classmates List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center">
                            <UserGroupIcon className="w-4 h-4 mr-2 text-gray-400" />
                            Thành viên ({enrollments.length})
                        </h3>
                    </div>
                    
                    {enrollments.length > 0 ? (
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                            {enrollments.map((enroll) => (
                                <div key={enroll._id} className="flex items-center p-2.5 hover:bg-gray-50 rounded-xl transition-colors cursor-default">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs mr-3 border border-blue-100 shadow-sm">
                                        {enroll.student?.name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 truncate">
                                            {enroll.student?.name || 'Ẩn danh'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <UserGroupIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-xs text-gray-500">Chưa có thành viên khác</p>
                        </div>
                    )}
                </div>

                {/* Important Note */}
                <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
                    <h3 className="text-amber-800 font-bold mb-3 flex items-center text-sm">
                        <SparklesIcon className="w-4 h-4 mr-2 text-amber-600" /> 
                        Lưu ý
                    </h3>
                    <ul className="text-xs text-amber-800 space-y-2.5 list-disc pl-4 leading-relaxed opacity-90">
                        <li>Tham gia lớp đúng giờ để điểm danh.</li>
                        <li>Phòng học có thể thay đổi, vui lòng kiểm tra trước khi đến.</li>
                        <li>Liên hệ giáo viên nếu bạn cần nghỉ phép.</li>
                    </ul>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};

export default StudentClassDetail;