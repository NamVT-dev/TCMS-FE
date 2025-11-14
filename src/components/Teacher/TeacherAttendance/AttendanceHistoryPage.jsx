import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../utils/api';
import Loading from '../../UI/Loading';
import { History, UserCheck, UserX, Users, Eye, X } from 'lucide-react'; // Thêm Eye, X
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

// === MODAL XEM CHI TIẾT (MỚI) ===
const AttendanceDetailModal = ({ report, onClose }) => {
  if (!report) return null;

  const { session, attendance } = report;
  const stats = calculateStats(attendance);

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 flex justify-center items-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-purple-800">
              {session.class?.name || "Chi tiết Điểm danh"}
            </h2>
            <p className="text-sm text-gray-600 capitalize">
              {format(new Date(session.startAt), 'EEEE, dd/MM/yyyy', { locale: vi })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-500 hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Thống kê nhỏ */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50">
          <div className="text-center p-3 bg-white rounded-lg border">
            <p className="text-2xl font-bold text-green-600">{stats.present}</p>
            <p className="text-xs text-gray-600">Có mặt</p>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border">
            <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
            <p className="text-xs text-gray-600">Vắng mặt</p>
          </div>
           <div className="text-center p-3 bg-white rounded-lg border">
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-xs text-gray-600">Sĩ số</p>
          </div>
        </div>

        {/* Danh sách học viên */}
        <div className="p-6 overflow-y-auto">
          <ul className="space-y-3">
            {attendance.map((item, index) => (
              <li key={item._id} className={`p-3 border rounded-lg flex justify-between items-center ${
                item.status === 'present' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center">
                  <span className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm mr-3 ${
                    item.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {index + 1}
                  </span>
                  <div>
                    {/* API của bạn đã populate 'student' thành object */}
                    <p className="font-medium text-gray-800">{item.student?.name || 'Học viên (lỗi tên)'}</p>
                    {item.note && (
                      <p className="text-sm text-gray-600 italic">Ghi chú: {item.note}</p>
                    )}
                  </div>
                </div>
                {item.status === 'present' ? (
                  <span className="text-sm font-semibold text-green-700">Có mặt</span>
                ) : (
                  <span className="text-sm font-semibold text-red-700">Vắng mặt</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

// Hàm helper (giữ nguyên)
const calculateStats = (attendanceArray) => {
  const present = attendanceArray.filter(item => item.status === 'present').length;
  const absent = attendanceArray.filter(item => item.status === 'absent').length;
  return {
    present,
    absent,
    total: attendanceArray.length
  };
};


// === TRANG LỊCH SỬ (Đã cập nhật) ===
const AttendanceHistoryPage = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // --- STATE MỚI ---
  const [selectedReport, setSelectedReport] = useState(null); // Lưu report đang xem

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // API của bạn đã populate đầy đủ
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
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center p-6 text-gray-500">
                    Chưa có lịch sử điểm danh nào.
                  </td>
                </tr>
              ) : (
                reports.map(report => {
                  // Đảm bảo chỉ render nếu session và class tồn tại (do BE populate lồng)
                  if (!report.session || !report.session.class) return null;

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
                          {report.session.class.name}
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
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {/* --- THÊM NÚT XEM --- */}
                        <button 
                          onClick={() => setSelectedReport(report)}
                          className="text-purple-600 hover:text-purple-800 text-sm font-medium inline-flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Xem
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- HIỂN THỊ MODAL --- */}
      {selectedReport && (
        <AttendanceDetailModal 
          report={selectedReport} 
          onClose={() => setSelectedReport(null)} 
        />
      )}
    </div>
  );
};

export default AttendanceHistoryPage;