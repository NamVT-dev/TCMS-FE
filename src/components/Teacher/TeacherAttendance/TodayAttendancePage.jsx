import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import Loading from '../../UI/Loading';
import { Clock, BookOpen, ArrowRight, CalendarCheck, Home, Users } from 'lucide-react';
import { format } from 'date-fns';

const SessionCard = ({ session, onStart }) => {
  const startTime = format(new Date(session.startAt), 'HH:mm');
  const endTime = format(new Date(session.endAt), 'HH:mm');

  const className = session.class?.name || "Lớp (không có tên)";
  const courseName = session.course?.name || "Khóa học (không có tên)";
  const roomName = session.room?.name || "N/A";
  
  const statusColor = "bg-purple-50 text-purple-700 border-purple-100";

  return (
    <div className="group relative flex flex-col h-full bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      
      <div className="h-1.5 w-full bg-gradient-to-r from-purple-500 to-indigo-500"></div>

      <div className="p-6 flex flex-col flex-1">
        <div className="mb-4">
          <div className="flex justify-between items-start mb-2">
             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColor}`}>
                {courseName}
             </span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 line-clamp-2 leading-snug min-h-[3.5rem]" title={className}>
            {className}
          </h3>
        </div>
        
        <div className="border-t border-gray-100 my-4"></div>

        <div className="space-y-3 mb-6 text-sm">
          <div className="flex items-center text-gray-600 bg-gray-50 p-2 rounded-lg">
            <Clock className="w-4 h-4 mr-3 text-purple-600 flex-shrink-0" />
            <span className="font-semibold text-gray-800">{startTime} - {endTime}</span>
          </div>
          
          <div className="flex items-center text-gray-600 p-2">
            <Home className="w-4 h-4 mr-3 text-blue-500 flex-shrink-0" />
            <span className="truncate">Phòng: <span className="font-medium text-gray-800">{roomName}</span></span>
          </div>
        </div>

        <div className="mt-auto pt-2">
          <button 
            onClick={() => onStart(session._id)}
            className="w-full group/btn inline-flex items-center justify-center px-4 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 active:bg-purple-800 transition-all shadow-purple-100 shadow-lg"
          >
            Bắt đầu điểm danh
            <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Trang chính
const TodayAttendancePage = () => {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTodaySessions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.teacher.attendance.getTodaySession();
        setSessions(res.data.data); 
      } catch (err) {
        console.error("Lỗi khi tải phiên học:", err);
        setError("Không thể tải các lớp học hôm nay.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTodaySessions();
  }, []);

  const handleStartSession = async (sessionId) => {
    setIsStarting(true);
    setError(null);
    try {
      const res = await api.teacher.attendance.startSession(sessionId);
      const attendanceData = res.data.data;
      const attendanceId = attendanceData._id;
      
      navigate(`/teacher/attendance/${attendanceId}`, { 
        state: { attendanceData } 
      });

    } catch (err) {
      console.error("Lỗi khi bắt đầu phiên:", err);
      setError(err.response?.data?.message || "Không thể bắt đầu phiên điểm danh.");
      setIsStarting(false);
    }
  };

  if (isLoading) {
    return <Loading fullscreen={true} message="Đang tìm lớp học hôm nay..." />;
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-red-50 rounded-3xl border border-red-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
             <CalendarCheck className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-red-800 mb-2">Đã xảy ra lỗi</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <span className="p-2 bg-purple-100 rounded-lg">
                <CalendarCheck className="w-8 h-8 text-purple-600" />
              </span>
              Điểm danh hôm nay
            </h1>
            <p className="mt-2 text-gray-500 ml-14">
              Quản lý các lớp học diễn ra trong ngày {format(new Date(), 'dd/MM/yyyy')}
            </p>
          </div>
          
          
        </div>

        {isStarting && (
          <Loading fullscreen={true} message="Đang chuẩn bị danh sách lớp..." />
        )}

        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-3xl border border-gray-200 border-dashed shadow-sm p-8 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
               <CalendarCheck className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Hôm nay trống lịch!</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Bạn không có buổi học nào được lên lịch vào ngày hôm nay. Hãy tận hưởng thời gian nghỉ ngơi hoặc chuẩn bị cho các buổi học tiếp theo.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {sessions.map(session => (
              <SessionCard 
                key={session._id} 
                session={session} 
                onStart={handleStartSession} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TodayAttendancePage;