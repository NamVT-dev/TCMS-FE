import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import Loading from '../../UI/Loading';
import { Clock, BookOpen, ArrowRight, CalendarCheck, Home } from 'lucide-react'; // Thêm Home
import { format } from 'date-fns';

// Component Card cho mỗi buổi học (Đã cập nhật)
const SessionCard = ({ session, onStart }) => {
  const startTime = format(new Date(session.startAt), 'HH:mm');
  const endTime = format(new Date(session.endAt), 'HH:mm');

  // Giả định API 'getTodaySession' đã populate 'class' và 'room'
  const className = session.class?.name || "Lớp (không có tên)";
  const roomName = session.room?.name || "N/A";

  return (
    <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
      <div className="p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-3">
          {className}
        </h3>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center text-gray-700">
            <Clock className="w-5 h-5 mr-3 text-purple-500 flex-shrink-0" />
            <span className="text-lg font-semibold">{startTime} - {endTime}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <Home className="w-5 h-5 mr-3 text-purple-500 flex-shrink-0" />
            <span className="text-base">Phòng: {roomName}</span>
          </div>
        </div>

        <button 
          onClick={() => onStart(session._id)}
          className="w-full inline-flex items-center justify-center px-4 py-3 bg-purple-600 text-white text-base font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-md"
        >
          Bắt đầu điểm danh
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  );
};


// Trang chính (Đã cập nhật)
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
        // Giả định BE trả về session đã populate class và room
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

  // Xử lý khi bấm nút "Bắt đầu điểm danh"
  const handleStartSession = async (sessionId) => {
    setIsStarting(true);
    setError(null);
    try {
      // API Bước 2: /start-session/:sessionId
      const res = await api.teacher.attendance.startSession(sessionId);
      
      // API trả về phiếu điểm danh (Attendance)
      // Chúng ta GIẢ ĐỊNH BE đã populate 'attendance.student' và 'session'
      const attendanceData = res.data.data;
      const attendanceId = attendanceData._id;
      
      // Chuyển hướng sang trang chi tiết (Bước 3) VÀ gửi data qua state
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
    return <div className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <CalendarCheck className="w-8 h-8 text-purple-600 mr-3" />
        <h1 className="text-3xl font-bold text-gray-800">Điểm danh hôm nay</h1>
      </div>

      {isStarting && (
        <Loading fullscreen={true} message="Đang chuẩn bị danh sách lớp..." />
      )}

      {sessions.length === 0 ? (
        <p className="text-gray-600 p-6 bg-white rounded-lg shadow-md">
          Bạn không có buổi học nào được lên lịch vào hôm nay.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
  );
};

export default TodayAttendancePage;