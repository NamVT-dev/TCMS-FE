// File: StudentScheduleModal.jsx
import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/api';
import Loading from '../UI/Loading';
import {
  X, Clock, BookOpen, Home, User, Calendar,
  ChevronLeft, ChevronRight
} from 'lucide-react';

// ========================
// CONSTANTS
// ========================

const SHIFTS = [
  { name: "S1", start: "08:00", end: "09:50" },
  { name: "S2", start: "10:00", end: "11:50" },
  { name: "S3", start: "13:00", end: "14:50" },
  { name: "S4", start: "15:00", end: "16:50" },
  { name: "S5", start: "18:00", end: "19:50" },
  { name: "S6", start: "20:00", end: "21:50" },
];

// ========================
// UTILITIES
// ========================

const formatDate = (date) =>
  new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(date);

const getDayName = (date) => {
  const n = date.getDay();
  const dayNames = ['CN', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7'];
  return dayNames[n];
};

const isSameDay = (d1, d2) =>
  d1.getDate() === d2.getDate() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getFullYear() === d2.getFullYear();

const isToday = (date) => isSameDay(date, new Date());

const getWeekDays = (currDate) => {
  const current = new Date(currDate);
  const first = current.getDate() - current.getDay() + 1; // Monday
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(current);
    d.setDate(first + i);
    days.push(d);
  }
  return days;
};

// ========================
// MAIN COMPONENT
// ========================

const StudentScheduleModal = ({ isOpen, onClose, studentId }) => {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // week calculation states
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [weekDays, setWeekDays] = useState([]);
  const [weekRange, setWeekRange] = useState({ start: "", end: "" });

  // -------------------------
  // Calculate week days & range
  // -------------------------
  useEffect(() => {
    const days = getWeekDays(currentWeek);

    const startISO = days[0].toISOString().split("T")[0];
    const endISO = days[6].toISOString().split("T")[0];

    setWeekDays(days);
    setWeekRange({ start: startISO, end: endISO });
  }, [currentWeek]);

  // -------------------------
  // Fetch schedule when week change
  // -------------------------
  useEffect(() => {
    if (!isOpen || !studentId || !weekRange.start) return;

    const fetchSchedule = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await api.learner.getMySchedule(studentId, {
          startDate: weekRange.start,
          endDate: weekRange.end
        });

        setSessions(res.data.data.sessions || []);
      } catch (err) {
        setError("Không thể tải lịch học tuần này.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedule();
  }, [isOpen, studentId, weekRange.start, weekRange.end]);

  // -------------------------
  // Pre-group sessions by day
  // -------------------------
  const sessionsByDay = useMemo(() => {
    const map = {};
    sessions.forEach(s => {
      const key = s.startAt.split("T")[0];
      if (!map[key]) map[key] = [];
      map[key].push(s);
    });
    return map;
  }, [sessions]);

  const getSessionsForShift = (date, shift) => {
    const key = date.toISOString().split("T")[0];
    const daySessions = sessionsByDay[key] || [];
    return daySessions.find(s => {
      const timeStr = new Date(s.startAt).toTimeString().substring(0, 5);
      return timeStr === shift.start;
    });
  };

  const totalSessionsInWeek = sessions.length;

  // -------------------------
  // Week navigation handlers
  // -------------------------

  const goPrev = () => {
    const d = new Date(currentWeek);
    d.setDate(d.getDate() - 7);
    setCurrentWeek(d);
  };

  const goNext = () => {
    const d = new Date(currentWeek);
    d.setDate(d.getDate() + 7);
    setCurrentWeek(d);
  };

  const goToToday = () => setCurrentWeek(new Date());

  // -------------------------
  // UI RENDER
  // -------------------------

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 flex justify-center items-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col"
      >
        {/* HEADER */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-5 rounded-t-xl">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6" />
              <h2 className="text-xl font-bold">Lịch học của học viên</h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={goToToday}
                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-md text-sm"
              >
                Tuần này
              </button>

              <div className="flex items-center gap-1 bg-white/10 rounded-md p-0.5">
                <button onClick={goPrev} className="p-1.5 hover:bg-white/20 rounded">
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <span className="px-3 text-sm min-w-[150px] flex items-center justify-center gap-2">
                  {formatDate(new Date(weekRange.start))} - {formatDate(new Date(weekRange.end))}
                  {isLoading && (
                    <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                  )}
                </span>

                <button onClick={goNext} className="p-1.5 hover:bg-white/20 rounded">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/20">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-auto p-4">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              <p className="font-bold">Lỗi</p>
              <p>{error}</p>
            </div>
          )}

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse table-fixed min-w-[950px]">
              <thead>
                <tr className="bg-gray-50">
                  <th className="w-28 p-3 text-left border-b border-r border-gray-200 bg-gray-100 text-sm font-semibold text-gray-600">

                    Ca học
                  </th>

                  {weekDays.map((day, i) => {
                    const today = isToday(day);
                    return (
                      <th
                        key={i}
                        className={`p-3 border-b ${today ? 'bg-purple-50' : ''}`}
                      >
                        <div className="text-center">
                          <div className={`text-sm font-semibold ${today ? 'text-purple-700' : 'text-gray-700'}`}>
                            {getDayName(day)}
                          </div>
                          <div className={`text-xs mt-0.5 ${today ? 'text-purple-600' : 'text-gray-500'}`}>
                            {formatDate(day)}
                          </div>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                {SHIFTS.map((shift, sIndex) => (
                  <tr key={sIndex} className="hover:bg-gray-50/40">
                    {/* Shift Column */}
                    <td className="w-28 p-3 border-r border-b border-gray-200 bg-gray-50">

                      <div className="text-right pr-2">
                        <div className="text-base font-bold text-purple-700">{shift.name}</div>
                        <div className="text-xs text-gray-500">{shift.start} - {shift.end}</div>
                      </div>
                    </td>

                    {weekDays.map((day, dIndex) => {
                      const session = getSessionsForShift(day, shift);
                      const today = isToday(day);

                      return (
                        <td
                          key={dIndex}
                          className={`p-2 border-b border-r border-gray-200 align-top transition-colors duration-200
                            ${today ? 'bg-purple-50/40' : ''}`}
                          style={{ minWidth: 95, height: 85 }}
                        >

                          {session ? (
                            <div className="bg-white border-l-4 border-purple-500 rounded shadow-sm p-2 h-full hover:shadow-md transition-all">
                              <div className="flex items-center gap-1.5 mb-1">
                                <Clock className="w-3 h-3 text-purple-600" />
                                <span className="text-[11px] font-semibold text-gray-600">
                                  {shift.start} - {shift.end}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 mb-1">
                                <BookOpen className="w-3 h-3 text-purple-600" />
                                <span className="text-[11px] truncate font-bold text-gray-800" title={session.class?.name}>
                                  {session.class?.name || 'N/A'}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 mb-1">
                                <Home className="w-3 h-3 text-purple-600" />
                                <span className="text-[11px] truncate text-gray-600" title={session.room?.name}>
                                  {session.room?.name || 'N/A'}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <User className="w-3 h-3 text-purple-600" />
                                <span className="text-[11px] truncate text-gray-600" title={session.teacher?.profile?.fullname}>
                                  {session.teacher?.profile?.fullname || 'N/A'}
                                </span>
                              </div>
                            </div>
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-gray-50 px-4 py-3 border-t rounded-b-xl">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              Tổng số buổi học (tuần này):{" "}
              <span className="font-bold text-purple-700 text-lg ml-1">{totalSessionsInWeek}</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-white border-l-4 border-purple-500 rounded shadow-sm"></div>
                <span>Có lịch</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-50/50 border border-gray-200"></div>
                <span>Hôm nay</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentScheduleModal;
