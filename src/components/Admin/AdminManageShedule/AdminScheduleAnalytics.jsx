// src/components/Admin/AdminManageShedule/AdminScheduleAnalytics.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../../utils/api";
import { Loader2, ArrowLeft, BarChart2, PieChart, AlertTriangle } from "lucide-react";

// Component con để hiển thị 1 thẻ thống kê
const AnalyticsCard = ({ icon: Icon, title, description, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
    <div className="flex items-center space-x-3 mb-4">
      <div className="p-3 bg-purple-100 rounded-lg">
        <Icon className="h-6 w-6 text-purple-600" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
    <div className="mt-4">{children}</div>
  </div>
);

// Component con (Giả lập) để hiển thị biểu đồ Lý do thất bại
const FailureReasonsChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-gray-500 text-center py-4">Chưa có dữ liệu thống kê.</p>;
  }

  // Sắp xếp dữ liệu
  const sortedData = [...data].sort((a, b) => b.count - a.count);

  return (
    <div>
      <h3 className="text-center font-medium text-gray-600 mb-4">
        (Ghi chú: Thay thế bảng này bằng Biểu Đồ Tròn)
      </h3>
      <div className="flow-root">
        <ul className="-my-4 divide-y divide-gray-200">
          {sortedData.map((item) => (
            <li key={item.reason} className="flex items-center space-x-4 py-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-purple-600 truncate">
                  {getFailureMessage(item.reason)}
                </p>
                <p className="text-sm text-gray-500">{item.reason}</p>
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {item.count} <span className="text-sm font-normal text-gray-500">lần</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Component con (Giả lập) để hiển thị biểu đồ Ép lịch
const ForcedWarningsChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-gray-500 text-center py-4">Không có giáo viên nào bị ép lịch.</p>;
  }

  // Sắp xếp dữ liệu
  const sortedData = [...data].sort((a, b) => b.forcedCount - a.count);

  return (
    <div>
      <h3 className="text-center font-medium text-gray-600 mb-4">
        (Ghi chú: Thay thế bảng này bằng Biểu Đồ Cột)
      </h3>
      <div className="flow-root">
        <ul className="-my-4 divide-y divide-gray-200">
          {sortedData.map((item) => (
            <li key={item.teacher} className="flex items-center space-x-4 py-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.teacher}
                </p>
              </div>
              <div className="text-lg font-semibold text-red-600">
                {item.forcedCount} <span className="text-sm font-normal text-gray-500">lần</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Hàm helper để dịch reasonCode (bạn có thể copy từ backend)
const getFailureMessage = (reasonCode) => {
  switch (reasonCode) {
    case "NO_TEACHER_SKILL":
      return "Không có GV kỹ năng phù hợp";
    case "NO_ROOM_CAPACITY":
      return "Không có phòng đủ sức chứa";
    case "ALL_SLOTS_TAKEN":
      return "Tất cả slot phù hợp đều kín";
    default:
      return "Lỗi không xác định";
  }
};


// Component "Cha"
function AdminScheduleAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.admin.schedule.getAnalytics();
        setAnalytics(res.data.data);
        setError(null);
      } catch (err) {
        console.error("Lỗi khi tải analytics:", err);
        setError(err.response?.data?.message || "Lỗi máy chủ");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Phân Tích Xếp Lịch
        </h1>
        <Link
          to="/admin/scheduler/dashboard"
          className="flex items-center text-purple-600 hover:text-purple-800 font-medium"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Quay lại Dashboard
        </Link>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center p-10 bg-white rounded-lg shadow">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
          <p className="mt-4 text-lg text-gray-600">Đang tải dữ liệu phân tích...</p>
        </div>
      )}

      {error && (
        <div className="p-10 bg-white rounded-lg shadow border border-red-200">
          <h2 className="text-2xl font-semibold text-red-600">Tải thất bại</h2>
          <p className="text-gray-700 mt-2">{error}</p>
        </div>
      )}

      {!loading && !error && analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cột 1: Lý do thất bại */}
          <AnalyticsCard
            icon={PieChart}
            title="Lý Do Xếp Lớp Thất Bại"
            description="Thống kê các lý do phổ biến nhất khiến lớp học không thể được xếp."
          >
            <FailureReasonsChart data={analytics.failureReasons} />
          </AnalyticsCard>

          {/* Cột 2: Cảnh báo ép lịch */}
          <AnalyticsCard
            icon={AlertTriangle}
            title="Giáo Viên Bị Ép Lịch"
            description="Số lần giáo viên bị xếp vào ca dạy mà họ không đăng ký rảnh."
          >
            <ForcedWarningsChart data={analytics.forcedScheduleWarnings} />
          </AnalyticsCard>
        </div>
      )}
    </div>
  );
}

export default AdminScheduleAnalytics;