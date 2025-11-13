import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import Loading from '../../UI/Loading';
import { History, UserCheck, UserX, Users } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

// Hàm helper để tính sĩ số
const calculateStats = (attendanceArray) => {
  const present = attendanceArray.filter(item => item.status === 'present').length;
  const absent = attendanceArray.filter(item => item.status === 'absent').length;
  return {
    present,
    absent,
    total: attendanceArray.length
  };
};

const AttendanceHistoryPage = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.teacher.attendance.getAllAttendanceReport();
      setReports(res.data.data);
    } catch (err) {
      console.error("Lỗi khi tải lịch sử:", err);
      setError("Không thể tải lịch sử điểm danh.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  if (isLoading) {
    return <Loading fullscreen={true} message="Đang tải lịch sử..." />;
  }

  if (error) {
    return <div className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <History className="w-8 h-8 text-purple-600 mr-3" />
        <h1 className="text-3xl font-bold text-gray-800">Lịch sử Điểm danh</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ngày</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Lớp học</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Có mặt</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Vắng mặt</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Sĩ số</th>
                {/* <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Thao tác</th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center p-6 text-gray-500">
                    Chưa có lịch sử điểm danh nào.
                  </td>
                </tr>
              ) : (
                reports.map(report => {
                  const stats = calculateStats(report.attendance);
                  return (
                    <tr key={report._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 capitalize">
                          {format(new Date(report.session.startAt), 'EEEE, dd/MM/yyyy', { locale: vi })}
                        </div>
                        <div className="text-sm text-gray-500">
                          {format(new Date(report.session.startAt), 'HH:mm')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-purple-800">
                          {report.session.class?.name || '(Lớp đã bị xóa)'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-semibold text-green-600 flex items-center justify-center">
                          <UserCheck className="w-4 h-4 mr-1" /> {stats.present}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-semibold text-red-600 flex items-center justify-center">
                          <UserX className="w-4 h-4 mr-1" /> {stats.absent}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                         <span className="text-sm font-semibold text-blue-600 flex items-center justify-center">
                          <Users className="w-4 h-4 mr-1" /> {stats.total}
                        </span>
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button 
                          onClick={() => alert("Mở modal xem chi tiết " + report._id)}
                          className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                        >
                          Xem
                        </button>
                      </td> 
                      */}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceHistoryPage;