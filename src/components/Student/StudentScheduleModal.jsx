import React, { useState, useEffect } from 'react';
import api from '../../utils/api'; 
import Loading from '../UI/Loading'; 
import { X, Clock, BookOpen, Home, User } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const StudentScheduleModal = ({ isOpen, onClose, studentId }) => {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && studentId) {
      const fetchSchedule = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const startDate = new Date().toISOString().split('T')[0];
          const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

         
          const res = await api.learner.getMySchedule(studentId, { startDate, endDate });
          setSessions(res.data.data.sessions);
        } catch (err) {
          setError("Không thể tải lịch học.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchSchedule();
    }
  }, [isOpen, studentId]);

  if (!isOpen) return null;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 flex justify-center items-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
      >
      
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-purple-800">Lịch học (7 ngày tới)</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-500 hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

      
        <div className="p-6 overflow-y-auto">
          {isLoading ? (
            <Loading fullscreen={false} message="Đang tải lịch..." />
          ) : error ? (
            <div className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>
          ) : sessions.length === 0 ? (
            <p className="text-gray-600">Không có buổi học nào trong 7 ngày tới.</p>
          ) : (
            <ul className="space-y-4">
              {sessions.map(session => (
                <li key={session._id} className="p-4 border border-gray-200 rounded-lg shadow-sm">
                  <p className="text-lg font-semibold text-purple-700 capitalize">
                    {format(new Date(session.startAt), 'EEEE, dd/MM/yyyy', { locale: vi })}
                  </p>
                  
                  <div className="flex items-center text-gray-700 mt-2">
                    <Clock className="w-5 h-5 mr-3 text-purple-500" />
                    <span className="font-medium">
                      {format(new Date(session.startAt), 'HH:mm')} - {format(new Date(session.endAt), 'HH:mm')}
                    </span>
                  </div>
                  
                  <div className="border-t border-gray-100 my-3"></div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-2 text-gray-500" />
                      Lớp: <span className="font-medium text-gray-800 ml-1">{session.class.name}</span>
                    </div>
                    <div className="flex items-center">
                      <Home className="w-4 h-4 mr-2 text-gray-500" />
                      Phòng: <span className="font-medium text-gray-800 ml-1">{session.room.name}</span>
                    </div>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-gray-500" />
                      Giáo viên: <span className="font-medium text-gray-800 ml-1">{session.teacher.profile.fullname}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentScheduleModal;