import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../utils/api';
import {
  Users, UserCircle, GraduationCap, School,
  UserCog, Wallet, AlertCircle, TrendingUp,
  Calendar, ArrowRight, Loader2, RefreshCw
} from 'lucide-react';

// Hàm format tiền tệ VND
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Hàm format ngày giờ
const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('vi-VN', {
    hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
  });
};

// Component con: Thẻ Thống Kê (Stat Card)
const StatCard = ({ title, value, subValue, icon: Icon, color, to, loading }) => {
  // Map màu sắc
  const colorClasses = {
    purple: 'bg-purple-50 text-purple-600 border-purple-200 hover:border-purple-400',
    blue: 'bg-blue-50 text-blue-600 border-blue-200 hover:border-blue-400',
    green: 'bg-green-50 text-green-600 border-green-200 hover:border-green-400',
    orange: 'bg-orange-50 text-orange-600 border-orange-200 hover:border-orange-400',
    red: 'bg-red-50 text-red-600 border-red-200 hover:border-red-400',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:border-indigo-400',
  };

  const theme = colorClasses[color] || colorClasses.purple;

  return (
    <div className={`relative bg-white p-6 rounded-xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 group`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          {loading ? (
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
          )}
        </div>
        <div className={`p-3 rounded-lg ${theme}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {/* Sub-value (ví dụ: +55 tháng này) */}
      {subValue && !loading && (
        <div className="mt-4 flex items-center text-sm">
          <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" />
            {subValue}
          </span>
          <span className="text-gray-400 ml-2">trong tháng này</span>
        </div>
      )}

      {/* Link Button */}
      {to && (
        <Link
          to={to}
          className="absolute inset-0 flex items-end justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <span className={`inline-flex items-center text-xs font-semibold uppercase tracking-wider ${theme.split(' ')[1]}`}>
            Xem chi tiết <ArrowRight className="w-4 h-4 ml-1" />
          </span>
        </Link>
      )}
    </div>
  );
};

const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.admin.getDashboardOverview(); // Gọi API bạn đã định nghĩa
      if (res.data.status === 'success') {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error("Lỗi tải dashboard:", err);
      setError("Không thể tải dữ liệu thống kê.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={fetchDashboardData} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Thử lại</button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tổng quan hệ thống</h1>
          <p className="text-gray-500 text-sm mt-1">Chào mừng trở lại, đây là tình hình hoạt động của trung tâm hôm nay.</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 
             hover:bg-gray-50 active:scale-[0.98] transition"
        >
          <RefreshCw className={`w-4 h-4 text-gray-400 mr-2 ${loading ? 'animate-spin' : ''}`} />
          <span className="text-sm text-gray-600">
            Cập nhật lúc: <strong>{stats ? formatDate(stats.lastUpdatedAt) : '...'}</strong>
          </span>
        </button>

      </div>

      {/* Grid Thống kê Chính */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* 1. Doanh thu */}
        <StatCard
          title="Doanh thu tháng này"
          value={stats ? formatCurrency(stats.totalRevenueThisMonth) : 0}
          icon={Wallet}
          color="green"
          to="/admin/finance/revenue"
          loading={loading}
        />

        {/* 2. Học viên */}
        <StatCard
          title="Tổng Học viên"
          value={stats?.totalMembers || 0}
          subValue={stats ? `+${stats.newMembersThisMonth}` : 0}
          icon={UserCircle}
          color="blue"
          to="/admin/users/students"
          loading={loading}
        />

        {/* 3. Lớp học */}
        <StatCard
          title="Lớp đang hoạt động"
          value={stats?.totalClasses || 0}
          subValue={stats ? `+${stats.newClassesThisMonth}` : 0}
          icon={School}
          color="purple"
          to="/admin/classes"
          loading={loading}
        />

        {/* 4. Giáo viên */}
        <StatCard
          title="Tổng Giáo viên"
          value={stats?.totalTeachers || 0}
          icon={GraduationCap}
          color="orange"
          to="/admin/users/teachers"
          loading={loading}
        />
      </div>

      {/* Grid Thống kê Phụ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Cột 1: Xếp lớp & Ghi danh */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <UserCog className="w-5 h-5 mr-2 text-indigo-600" />
            Xếp lớp
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg border border-indigo-100">
              <div>
                <p className="text-sm text-gray-600">Số học viên đơi xếp lớp</p>
                <p className="text-2xl font-bold text-indigo-700">{loading ? '...' : stats?.newEnrollmentsThisMonth}</p>
              </div>
              <Link to="/admin/users/enrollments" className="text-sm text-indigo-600 hover:underline font-medium">Xử lý ngay</Link>
            </div>
            {/* Bạn có thể thêm các chỉ số khác ở đây nếu BE cung cấp thêm */}
          </div>
        </div>

        {/* Cột 2: Khiếu nại & Hỗ trợ */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
            Khiếu nại & Hỗ trợ
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-red-50 rounded-lg text-center border border-red-100">
              <p className="text-2xl font-bold text-red-600">{loading ? '...' : stats?.unprocessedComplaints}</p>
              <p className="text-xs text-gray-600 mt-1">Chưa xử lý</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center border border-gray-100">
              <p className="text-2xl font-bold text-gray-700">{loading ? '...' : stats?.processedComplaints}</p>
              <p className="text-xs text-gray-500 mt-1">Đã giải quyết</p>
            </div>
          </div>
          <div className="mt-4 text-center">
            {/* Link này tạm thời trỏ về students vì chưa có trang khiếu nại riêng trong menu */}
            <Link to="/admin/users/students" className="text-sm text-gray-500 hover:text-gray-700 underline">Xem danh sách yêu cầu</Link>
          </div>
        </div>

        {/* Cột 3: Quick Links (Lối tắt) */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-gray-600" />
            Lối tắt quản lý
          </h3>
          <div className="space-y-2">
            <Link to="/admin/classes/create" className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors text-sm font-medium text-gray-700">
              + Tạo lớp học mới
            </Link>
            <Link to="/admin/scheduler/dashboard" className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors text-sm font-medium text-gray-700">
              ⚙️ Chạy xếp lịch tự động
            </Link>
            <Link to="/admin/finance/transactions" className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors text-sm font-medium text-gray-700">
              💰 Xem giao dịch gần đây
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminOverview;