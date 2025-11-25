import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import Loading from '../../UI/Loading';
import { Clock, BookOpen, ArrowRight, CalendarCheck, Home } from 'lucide-react';
import { format } from 'date-fns';

// Component Card cho mỗi buổi học
const SessionCard = ({ session, onStart }) => {
  const startTime = format(new Date(session.startAt), 'HH:mm');
  const endTime = format(new Date(session.endAt), 'HH:mm');

  const className = session.class?.name || "Lớp (không có tên)";
  const courseName = session.course?.name || "Khóa học (không có tên)";
  const roomName = session.room?.name || "N/A";

  return (
    <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
      <div className="p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          {className}
        </h3>
        
        <div className="flex items-center text-purple-600 mb-4">
          <BookOpen className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="text-sm font-medium">{courseName}</span>
        </div>
        
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
      <div className="container mx-auto p-6">
        <div className="text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
          {error}
        </div>
      </div>
    );
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
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <CalendarCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">
            Bạn không có buổi học nào được lên lịch vào hôm nay.
          </p>
        </div>
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