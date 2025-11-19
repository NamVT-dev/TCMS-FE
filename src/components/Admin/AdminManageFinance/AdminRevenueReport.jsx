import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { Loader2, Filter, Wallet, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';
import moment from 'moment';


const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Màu cho biểu đồ tròn
const PIE_COLORS = ['#10B981', '#F59E0B', '#EF4444']; 

const AdminRevenueReport = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data State
  const [stats, setStats] = useState({});
  const [transactionStatus, setTransactionStatus] = useState({});
  const [chartData, setChartData] = useState([]);
  
  // Filter State
  const [filter, setFilter] = useState({
    mode: 'month', 
    date: moment().format('YYYY-MM'), 
  });

  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          mode: filter.mode,
          date: filter.date 
        };
        
        const res = await api.admin.finance.getRevenueReport(params);
        
        if (res.data.status === 'success') {
          setStats(res.data.data.stats);
          setTransactionStatus(res.data.data.transactionStatus);
          setChartData(res.data.data.chart);
        }
      } catch (err) {
        console.error(err);
        setError("Không thể tải dữ liệu báo cáo.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filter]);

  
  const pieData = [
    { name: 'Thành công', value: transactionStatus.succeeded || 0 },
    { name: 'Đang xử lý', value: transactionStatus.processing || 0 },
    { name: 'Thất bại', value: transactionStatus.failed || 0 },
  ].filter(item => item.value > 0); 

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Báo cáo Doanh thu</h1>
          <p className="text-gray-600">Theo dõi dòng tiền và hiệu quả kinh doanh</p>
        </div>
        
   
        <div className="flex bg-white p-1.5 rounded-lg shadow-sm border border-gray-200">
           <div className="flex items-center space-x-2 mr-4">
              <button
                onClick={() => setFilter({ ...filter, mode: 'month', date: moment().format('YYYY-MM') })}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filter.mode === 'month' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Theo Tháng
              </button>
              <button
                onClick={() => setFilter({ ...filter, mode: 'year', date: moment().format('YYYY') })}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filter.mode === 'year' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Theo Năm
              </button>
           </div>
           
           <div className="border-l pl-4 flex items-center">
              {filter.mode === 'month' ? (
                 <input 
                   type="month" 
                   value={filter.date}
                   onChange={(e) => setFilter({ ...filter, date: e.target.value })}
                   className="text-sm border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                 />
              ) : (
                 <select 
                    value={filter.date}
                    onChange={(e) => setFilter({ ...filter, date: e.target.value })}
                    className="text-sm border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 bg-white py-1 pr-8 pl-2 border"
                 >
                    {Array.from({ length: 5 }, (_, i) => moment().year() - i).map(y => (
                       <option key={y} value={y}>Năm {y}</option>
                    ))}
                 </select>
              )}
           </div>
        </div>
      </div>

      {loading ? (
         <div className="h-96 flex justify-center items-center">
            <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
         </div>
      ) : error ? (
         <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
      ) : (
        <>
         
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
         
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center">
                <div className="p-4 bg-green-100 rounded-full mr-4">
                   <Wallet className="w-8 h-8 text-green-600" />
                </div>
                <div>
                   <p className="text-sm text-gray-500 font-medium uppercase">Tổng Doanh thu</p>
                   <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue || 0)}</h3>
                   <p className="text-xs text-gray-400 mt-1">Trong khoảng thời gian đã chọn</p>
                </div>
             </div>

             
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center">
                <div className="p-4 bg-blue-100 rounded-full mr-4">
                   <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                   <p className="text-sm text-gray-500 font-medium uppercase">Trung bình Tháng</p>
                   <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(stats.avgMonthlyRevenue || 0)}</h3>
                   <p className="text-xs text-green-600 mt-1 flex items-center">
                      Doanh thu đều đặn
                   </p>
                </div>
             </div>

           
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center">
                <div className="p-4 bg-purple-100 rounded-full mr-4">
                   <Filter className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                   <p className="text-sm text-gray-500 font-medium uppercase">Trung bình Tuần</p>
                   <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(stats.avgWeeklyRevenue || 0)}</h3>
                   <p className="text-xs text-gray-400 mt-1">Hiệu suất tuần</p>
                </div>
             </div>
          </div>

          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             
           
             <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Biểu đồ tăng trưởng doanh thu</h3>
                <div className="h-80 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis 
                           dataKey="label" 
                           tick={{fontSize: 12}} 
                           tickFormatter={(val) => filter.mode === 'month' ? moment(val).format('DD/MM') : val}
                        />
                        <YAxis 
                           tickFormatter={(val) => new Intl.NumberFormat('en', { notation: "compact" }).format(val)} 
                        />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Area 
                           type="monotone" 
                           dataKey="revenue" 
                           stroke="#8884d8" 
                           fillOpacity={1} 
                           fill="url(#colorRevenue)" 
                           name="Doanh thu"
                        />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>
             </div>

            
             <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Trạng thái giao dịch</h3>
                
                <div className="h-48 w-full flex justify-center">
                   {pieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                            <Pie
                               data={pieData}
                               cx="50%"
                               cy="50%"
                               innerRadius={60}
                               outerRadius={80}
                               paddingAngle={5}
                               dataKey="value"
                            >
                               {pieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                               ))}
                            </Pie>
                            <Tooltip />
                         </PieChart>
                      </ResponsiveContainer>
                   ) : (
                      <div className="flex items-center justify-center text-gray-400 text-sm">Chưa có dữ liệu</div>
                   )}
                </div>

                
                <div className="mt-6 space-y-4">
                   <div className="flex justify-between items-center">
                      <div className="flex items-center">
                         <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                         <span className="text-sm text-gray-600">Thành công</span>
                      </div>
                      <span className="font-bold text-gray-800">{transactionStatus.succeeded || 0}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <div className="flex items-center">
                         <Clock className="w-4 h-4 text-yellow-500 mr-2" />
                         <span className="text-sm text-gray-600">Đang xử lý</span>
                      </div>
                      <span className="font-bold text-gray-800">{transactionStatus.processing || 0}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <div className="flex items-center">
                         <XCircle className="w-4 h-4 text-red-500 mr-2" />
                         <span className="text-sm text-gray-600">Thất bại/Hủy</span>
                      </div>
                      <span className="font-bold text-gray-800">{transactionStatus.failed || 0}</span>
                   </div>
                </div>
             </div>

          </div>
        </>
      )}
    </div>
  );
};

export default AdminRevenueReport;