import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../../utils/api";
import { Loader2, ArrowLeft, BarChart2, PieChart as PieChartIcon, AlertTriangle, Info } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";


const COLORS = ["#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#ec4899"];


const formatTeacherLabel = (name) => {
    if (!name) return "Unknown";
    if (name.length === 24 && /^[0-9a-fA-F]+$/.test(name)) {
        return `GV-${name.substr(-4).toUpperCase()}`; 
    }
    if (name.length > 25) {
        return name.substring(0, 25) + "...";
    }
    return name;
};

const getFailureMessage = (reasonCode) => {
  switch (reasonCode) {
    case "NO_TEACHER_SKILL": return "Thiếu GV kỹ năng";
    case "NO_ROOM_CAPACITY": return "Thiếu phòng";
    case "ALL_SLOTS_TAKEN": return "Slot đã kín";
    case "TEACHER_CONFLICT": return "GV trùng lịch";
    case "ROOM_CONFLICT": return "Phòng trùng lịch";
    default: return reasonCode;
  }
};


const AnalyticsCard = ({ icon: Icon, title, description, children, className = "" }) => (
  <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 ${className}`}>
    <div className="flex items-start space-x-4 mb-6">
      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
        <Icon className="h-6 w-6 text-purple-600" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        <p className="text-sm text-gray-500 mt-1 leading-relaxed">{description}</p>
      </div>
    </div>
    <div className="mt-4">{children}</div>
  </div>
);

const FailureReasonsChart = ({ data }) => {
  if (!data || data.length === 0) return <p className="text-gray-400 text-center py-12">Không có dữ liệu.</p>;

  const chartData = data.map(item => ({
      name: getFailureMessage(item.reason),
      value: item.count
  }));

  const total = chartData.reduce((acc, cur) => acc + cur.value, 0);

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-8 h-full">
        <div className="w-full h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60} 
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                >
                    {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip 
                    formatter={(value) => [`${value} ca`, "Số lượng"]}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-gray-800">{total}</span>
                <span className="text-xs text-gray-400 uppercase font-medium">Lỗi</span>
            </div>
        </div>
    </div>
  );
};

const ForcedWarningsChart = ({ data }) => {
  if (!data || data.length === 0) return <p className="text-gray-400 text-center py-12">Không có dữ liệu.</p>;

  const sortedData = [...data]
    .sort((a, b) => b.forcedCount - a.forcedCount)
    .map(item => ({
        ...item,
        displayLabel: formatTeacherLabel(item.teacher)
    }));

  const dynamicHeight = Math.max(400, sortedData.length * 50); 

  return (
    <div style={{ width: '100%', height: dynamicHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
          barSize={24} 
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="displayLabel" 
            type="category" 
            width={130} 
            tick={{fontSize: 13, fill: '#4b5563', fontWeight: 500}}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            cursor={{ fill: '#f3f4f6', radius: 4 }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            formatter={(value) => [<span className="text-red-600 font-bold">{value} lần</span>, "Bị ép lịch"]}
            labelStyle={{ color: '#111827', fontWeight: 'bold', marginBottom: '4px' }}
          />
          <Bar 
            dataKey="forcedCount" 
            name="Số lần bị ép lịch" 
            fill="#f87171" 
            radius={[0, 4, 4, 0]} 
            background={{ fill: '#f9fafb' }} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

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
      } catch (err) {
        console.error("Analytics Error:", err);
        setError(err.response?.data?.message || "Lỗi máy chủ");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <BarChart2 className="w-8 h-8 text-purple-600"/>
                Phân Tích Hiệu Suất Xếp Lịch
            </h1>
            <p className="text-gray-500 mt-1 ml-10">Theo dõi các chỉ số và cảnh báo từ thuật toán tự động</p>
        </div>
        
        <Link
          to="/admin/scheduler/dashboard"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Dashboard
        </Link>
      </div>

      {loading && (
        <div className="h-[60vh] flex flex-col items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-purple-600 mb-4" />
          <p className="text-gray-500 font-medium">Đang tổng hợp dữ liệu...</p>
        </div>
      )}

      {!loading && !error && analytics && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* CỘT TRÁI (LỚN): BIỂU ĐỒ CỘT */}
          <div className="xl:col-span-2">
            <AnalyticsCard
                icon={AlertTriangle}
                title="Top Giáo Viên Bị Ép Lịch"
                description="Những giáo viên bị xếp dạy vào khung giờ không đăng ký rảnh (do thiếu nhân sự)."
                className="h-full border-l-4 border-l-red-400"
            >
                <div className="pr-2 custom-scrollbar overflow-y-auto max-h-[600px]">
                     <ForcedWarningsChart data={analytics.forcedScheduleWarnings} />
                </div>
            </AnalyticsCard>
          </div>

          <div className="flex flex-col gap-6">
            <AnalyticsCard
                icon={PieChartIcon}
                title="Tỷ Lệ Lỗi"
                description="Phân bố các nguyên nhân gây lỗi xếp lịch."
            >
                <FailureReasonsChart data={analytics.failureReasons} />
            </AnalyticsCard>

            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2 opacity-90">
                        <Info className="w-5 h-5" />
                        <span className="font-medium text-sm uppercase tracking-wider">Tổng số lỗi ghi nhận</span>
                    </div>
                    <div className="text-5xl font-bold mt-2">
                        {analytics.failureReasons?.reduce((acc, curr) => acc + curr.count, 0) || 0}
                    </div>
                    <p className="mt-2 text-purple-100 text-sm opacity-80">
                        Trường hợp cần xử lý thủ công
                    </p>
                </div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
                <div className="absolute top-[-20px] right-[20px] w-16 h-16 bg-white opacity-10 rounded-full blur-xl"></div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default AdminScheduleAnalytics;