import React, { useEffect, useState } from "react";
import {
  BanknotesIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  CreditCardIcon,
  ExclamationCircleIcon,
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ReceiptPercentIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import api from "../../../utils/api"; 
import Loading from "../../UI/Loading"; 
import PaymentHistoryDetailModal from "./PaymentHistoryDetailModal"; 
import { format } from "date-fns";

const StudentPaymentHistoryView = () => {
  // --- State ---
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State cho Modal
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State cho Filter/Search
  const [filterStatus, setFilterStatus] = useState("all"); // all, succeeded, pending, failed
  const [searchTerm, setSearchTerm] = useState("");

  // --- Fetch Data ---
  const fetchPayments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Gọi API lấy danh sách. Có thể truyền params nếu backend hỗ trợ phân trang/filter server-side
      const res = await api.payment.getAllPayments();
      // Dựa vào JSON bạn cung cấp: res.data.data là mảng các giao dịch
      setPayments(res.data.data || []);
    } catch (err) {
      console.error("Lỗi lấy lịch sử thanh toán:", err);
      setError("Không thể tải dữ liệu lịch sử thanh toán.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // --- Helpers ---
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "succeeded":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
            <CheckCircleIcon className="w-3 h-3 mr-1" /> Thành công
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
            <ExclamationCircleIcon className="w-3 h-3 mr-1" /> Đang xử lý
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
            <XCircleIcon className="w-3 h-3 mr-1" /> Thất bại
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  // --- Handlers ---
  const handleViewDetail = (id) => {
    setSelectedPaymentId(id);
    setIsModalOpen(true);
  };

  // Client-side filtering (Lọc dữ liệu ở phía client)
  const filteredPayments = payments.filter((payment) => {
    const matchesStatus = filterStatus === "all" || payment.status === filterStatus;
    const matchesSearch =
      payment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatCurrency(payment.amount).includes(searchTerm);

    return matchesStatus && matchesSearch;
  });

  // --- Render ---

  if (isLoading) return <Loading fullscreen message="Đang tải lịch sử giao dịch..." />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <ReceiptPercentIcon className="w-8 h-8 text-purple-600" />
            Lịch sử thanh toán
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Xem lại toàn bộ các giao dịch học phí và thanh toán của bạn.
          </p>
        </div>

        {/* Stats Summary (Optional - Tính tổng tiền đã thanh toán) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <p className="text-xs font-medium text-gray-500 uppercase">Tổng chi tiêu</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">
              {formatCurrency(payments.reduce((acc, cur) => (cur.status === 'succeeded' ? acc + cur.amount : acc), 0))}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <p className="text-xs font-medium text-gray-500 uppercase">Giao dịch thành công</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {payments.filter(p => p.status === 'succeeded').length}
            </p>
          </div>
           <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <p className="text-xs font-medium text-gray-500 uppercase">Giao dịch gần nhất</p>
            <p className="text-sm font-semibold text-gray-700 mt-2 truncate">
              {payments.length > 0 ? format(new Date(payments[0].createdAt), "dd/MM/yyyy") : "Chưa có"}
            </p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition duration-150 ease-in-out"
              placeholder="Tìm theo nội dung, mã giao dịch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <FunnelIcon className="w-5 h-5 text-gray-400 hidden md:block" />
            {['all', 'succeeded', 'pending', 'failed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                  ${filterStatus === status 
                    ? 'bg-purple-600 text-white shadow-md' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
              >
                {status === 'all' ? 'Tất cả' : 
                 status === 'succeeded' ? 'Thành công' :
                 status === 'pending' ? 'Đang xử lý' : 'Thất bại'}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        {error ? (
           <div className="text-center p-10 bg-red-50 rounded-xl border border-red-200 text-red-600">
             {error}
             <button onClick={fetchPayments} className="block mx-auto mt-2 text-sm font-bold hover:underline">Thử lại</button>
           </div>
        ) : filteredPayments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <BanknotesIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Không tìm thấy giao dịch nào</h3>
            <p className="text-gray-500 mt-1">Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã giao dịch
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nội dung
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số tiền
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Hành động</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => handleViewDetail(payment._id)}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                        {payment._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 line-clamp-1 max-w-xs" title={payment.description}>
                          {payment.description}
                        </div>
                        <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                           <CreditCardIcon className="w-3 h-3" /> {payment.method === 'bank_transfer' ? 'Chuyển khoản' : payment.method}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                            <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
                            {format(new Date(payment.createdAt), "dd/MM/yyyy")}
                        </div>
                        <span className="text-xs text-gray-400 ml-6">{format(new Date(payment.createdAt), "HH:mm")}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-purple-600">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={(e) => {
                              e.stopPropagation(); // Ngăn sự kiện click row
                              handleViewDetail(payment._id);
                          }}
                          className="text-purple-600 hover:text-purple-900 bg-purple-50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Xem chi tiết"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-100">
               {filteredPayments.map((payment) => (
                   <div 
                      key={payment._id} 
                      onClick={() => handleViewDetail(payment._id)}
                      className="p-4 bg-white active:bg-gray-50 cursor-pointer"
                   >
                      <div className="flex justify-between items-start mb-2">
                          <div>
                              <span className="text-xs font-mono text-gray-400 mr-2">#{payment._id.slice(-6).toUpperCase()}</span>
                              <span className="text-xs text-gray-500">{format(new Date(payment.createdAt), "dd/MM/yyyy HH:mm")}</span>
                          </div>
                          {getStatusBadge(payment.status)}
                      </div>
                      
                      <div className="mb-3">
                          <h4 className="text-sm font-semibold text-gray-800 line-clamp-2">{payment.description}</h4>
                      </div>

                      <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-purple-600">{formatCurrency(payment.amount)}</span>
                          <div className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              <CreditCardIcon className="w-3 h-3 mr-1" />
                              {payment.method === 'bank_transfer' ? 'CK Ngân hàng' : payment.method}
                          </div>
                          <ChevronRightIcon className="w-5 h-5 text-gray-300" />
                      </div>
                   </div>
               ))}
            </div>
          </div>
        )}

        
        

      </div>

      {/* Modal Chi tiết */}
      <PaymentHistoryDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        paymentId={selectedPaymentId}
      />
    </div>
  );
};

export default StudentPaymentHistoryView;