import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, Calendar, BookOpen, Home, Clock } from "lucide-react";
import api from "../../../../utils/api"; 
import Loading from '../../../UI/Loading';

// --- ĐỊNH NGHĨA CA HỌC (Lấy từ code mẫu của bạn) ---
const SHIFTS = [
  { name: "S1", start: "08:00", end: "09:50" },
  { name: "S2", start: "10:00", end: "11:50" },
  { name: "S3", start: "13:00", end: "14:50" },
  { name: "S4", start: "15:00", end: "16:50" },
  { name: "S5", start: "18:00", end: "19:50" },
  { name: "S6", start: "20:00", end: "21:50" },
];

// --- HÀM TIỆN ÍCH (Lấy từ code mẫu của bạn) ---
const getWeekDays = (date) => {
  const curr = new Date(date);
  const first = curr.getDate() - curr.getDay() + 1; // Thứ 2
  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(curr.setDate(first + i));
    days.push(day);
  }
  return days;
};

const formatDate = (date) => {
  return new Intl.DateTimeFormat('vi-VN', { 
    day: '2-digit', 
    month: '2-digit' 
  }).format(date);
};

const formatWeekRange = (days) => {
  const start = formatDate(days[0]);
  const end = formatDate(days[6]);
  return `${start} - ${end}`;
};

const getDayName = (date) => {
  const dayNames = ['CN', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7'];
  return dayNames[date.getDay()];
};

const isSameDay = (d1, d2) => {
  return d1.getDate() === d2.getDate() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getFullYear() === d2.getFullYear();
};

const isToday = (date) => {
  return isSameDay(date, new Date());
};

// Hàm helper để lấy ngày đầu và cuối tuần theo format yyyy-MM-dd
const getWeekSpanForAPI = (date) => {
  const curr = new Date(date);
  const first = curr.getDate() - curr.getDay() + 1; // Thứ 2
  const last = first + 6; // Chủ nhật

  const startDate = new Date(curr.setDate(first));
  const endDate = new Date(curr.setDate(last));

  const f = (d) => d.toISOString().split('T')[0]; // format yyyy-MM-dd
  return { startDate: f(startDate), endDate: f(endDate) };
};


// --- COMPONENT CHÍNH (Trang Lịch Dạy) ---
function TeacherViewSchedule() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const weekDays = useMemo(() => getWeekDays(currentWeek), [currentWeek]);

  // --- LOGIC FETCH DATA ---
  const fetchSchedule = useCallback(async (week) => {
    setIsLoading(true);
    setError(null);
    const { startDate, endDate } = getWeekSpanForAPI(week);
    
    try {
      const res = await api.teacher.getMySchedule({ startDate, endDate });
      setSessions(res.data.data.sessions);
    } catch (err) {
      console.error("Lỗi khi tải lịch dạy:", err);
      setError(err.message || "Không thể tải lịch dạy.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch data khi component mount hoặc tuần thay đổi
  useEffect(() => {
    fetchSchedule(currentWeek);
  }, [currentWeek, fetchSchedule]);

  // --- LOGIC TỪ CODE MẪU ---
  // Nhóm sessions theo ngày
  const sessionsByDay = useMemo(() => {
    const grouped = {};
    sessions.forEach(session => {
      const sessionDate = new Date(session.startAt);
      // Dùng key đơn giản hơn
      const dayKey = sessionDate.toISOString().split('T')[0];
      if (!grouped[dayKey]) {
        grouped[dayKey] = [];
      }
      grouped[dayKey].push(session);
    });
    return grouped;
  }, [sessions]);

  // Lấy sessions của 1 ngày cụ thể
  const getSessionsForDay = (date) => {
    const dayKey = date.toISOString().split('T')[0];
    return sessionsByDay[dayKey] || [];
  };

  // Lấy sessions của 1 ca cụ thể trong 1 ngày
  const getSessionForShift = (date, shift) => {
    const daySessions = getSessionsForDay(date);
    return daySessions.find(session => {
      const sessionDate = new Date(session.startAt);
      const timeStr = sessionDate.toTimeString().substring(0, 5);
      return timeStr === shift.start;
    });
  };

  const goToPrevWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeek(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeek(newDate);
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };
  
  // Đếm tổng số session trong tuần
  const totalSessionsInWeek = Object.values(sessionsByDay).flat().length;

  return (
    <div className="container mx-auto relative"> 
      {/* --- PHẦN GIAO DIỆN (Lấy từ code mẫu) --- */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        
        {/* Lớp phủ loading */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 flex justify-center items-center z-10 rounded-lg">
            <Loading />
          </div>
        )}

        {/* Header - Toolbar */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {/* Thay thế bằng title cố định */}
              <h2 className="text-lg font-bold">Thời khóa biểu của tôi</h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={goToToday}
                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-md text-sm font-medium transition-colors"
                disabled={isLoading}
              >
                Hôm nay
              </button>
              <div className="flex items-center gap-1">
                <button
                  onClick={goToPrevWeek}
                  className="p-1.5 hover:bg-white/20 rounded-md transition-colors"
                  disabled={isLoading}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-3 text-sm font-medium min-w-[140px] text-center">
                  {formatWeekRange(weekDays)}
                </span>
                <button
                  onClick={goToNextWeek}
                  className="p-1.5 hover:bg-white/20 rounded-md transition-colors"
                  disabled={isLoading}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Báo lỗi */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
            <p className="font-bold">Lỗi</p>
            <p>{error}</p>
          </div>
        )}

        {/* Calendar Grid */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[900px]">
            {/* Header - Tên các ngày */}
            <thead>
              <tr className="bg-gray-50">
                <th className="w-24 p-3 text-left border-b border-r border-gray-200 bg-gray-100">
                  <span className="text-sm font-semibold text-gray-600">Ca học</span>
                </th>
                {weekDays.map((day, idx) => (
                  <th
                    key={idx}
                    className={`p-3 border-b border-gray-200 ${
                      isToday(day) ? 'bg-purple-50' : ''
                    }`}
                  >
                    <div className="text-center">
                      <div className={`text-sm font-semibold ${
                        isToday(day) ? 'text-purple-700' : 'text-gray-700'
                      }`}>
                        {getDayName(day)}
                      </div>
                      <div className={`text-xs mt-0.5 ${
                        isToday(day) ? 'text-purple-600' : 'text-gray-500'
                      }`}>
                        {formatDate(day)}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body - Các ca học */}
            <tbody>
              {SHIFTS.map((shift, shiftIdx) => (
                <tr key={shiftIdx} className="hover:bg-gray-50/50">
                  {/* Cột CA HỌC */}
                  <td className="p-3 border-r border-b border-gray-200 bg-gray-50">
                    <div className="text-right pr-2">
                      <div className="text-base font-bold text-purple-700">
                        {shift.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {shift.start}
                      </div>
                    </div>
                  </td>

                  {/* Các ô BUỔI HỌC theo ngày */}
                  {weekDays.map((day, dayIdx) => {
                    const session = getSessionForShift(day, shift);
                    const isTodayCell = isToday(day);

                    return (
                      <td
                        key={dayIdx}
                        className={`p-2 border-b border-gray-200 ${
                          isTodayCell ? 'bg-purple-50/30' : ''
                        }`}
                      >
                        {session ? (
                          // Đây là phần hiển thị 1 session (Đã chỉnh sửa)
                          <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-lg p-2 shadow-md hover:shadow-lg transition-shadow max-w-[140px] mx-auto">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Clock className="w-3 h-3 flex-shrink-0" />
                              <span className="text-[11px] font-semibold">
                                {shift.start} - {shift.end}
                              </span>
                            </div>
                            
                            {/* Thay vì Tên GV, hiển thị Tên Lớp */}
                            <div className="flex items-center gap-1.5 mb-1">
                              <BookOpen className="w-3 h-3 flex-shrink-0" />
                              <span className="text-[11px] truncate" title={session.class?.name}>
                                {session.class?.name || 'N/A'}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <Home className="w-3 h-3 flex-shrink-0" />
                              <span className="text-[11px] truncate" title={session.room?.name}>
                                {session.room?.name || 'N/A'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          // Ô trống
                          <div className="h-16 flex items-center justify-center text-gray-300">
                            <span className="text-xs">-</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer - Thống kê */}
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              Tổng số buổi học (tuần này): <span className="font-semibold text-gray-900">{totalSessionsInWeek}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-600 rounded"></div>
                <span>Có lịch</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <span>Trống</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherViewSchedule;