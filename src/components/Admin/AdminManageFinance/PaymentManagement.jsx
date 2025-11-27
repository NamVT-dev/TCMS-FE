import React, { useEffect, useState } from "react";
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  ArrowUturnLeftIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { toast } from "react-hot-toast"; 

import api from "../../../utils/api";
import Loading from "../../UI/Loading";
import PaymentHistoryDetailModal from "../../Student/StudentInformation/PaymentHistoryDetailModal";

const StaffPaymentManagement = () => {
  // --- State ---
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination & Filter
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [statusFilter, setStatusFilter] = useState(""); 
  
  // Search State
  const [searchTerm, setSearchTerm] = useState(""); 
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(""); 
  
  // Modal
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  
  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const params = {
        page,
        limit: 10, 
        sort: "-createdAt", 
      };

      
      if (statusFilter) {
        params.status = statusFilter;
      }
      
  
      if (debouncedSearchTerm) {
        params.search = debouncedSearchTerm;
      }

      const res = await api.admin.payment.getAllSystemPayments(params);
      
      setPayments(res.data.data.data || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalResults(res.data.results || 0);

    } catch (err) {
      console.error("Lỗi tải danh sách thanh toán:", err);
      toast.error("Không thể tải danh sách thanh toán");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
        if (searchTerm !== debouncedSearchTerm) {
            setPage(1); 
            setDebouncedSearchTerm(searchTerm);
        }
    }, 800);

    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearchTerm]);

  
  useEffect(() => {
    fetchPayments();
    
  }, [page, statusFilter, debouncedSearchTerm]);

  // --- Actions ---
  const handleRefund = async (paymentId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hoàn tiền cho giao dịch này? Hành động này cũng sẽ hủy đăng ký lớp học.")) return;

    const toastId = toast.loading("Đang xử lý hoàn tiền...");
    try {
      await api.admin.payment.refundPayment(paymentId);
      toast.success("Hoàn tiền thành công!", { id: toastId });
      fetchPayments(); 
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Lỗi khi hoàn tiền", { id: toastId });
    }
  };

  // --- Format Helpers ---
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "succeeded":
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Thành công</span>;
      case "refunded":
        return <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">Đã hoàn tiền</span>;
      case "failed":
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">Thất bại</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">{status}</span>;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý thanh toán</h1>
            <p className="text-sm text-gray-500 mt-1">
              Tổng cộng <span className="font-bold text-purple-600">{totalResults}</span> giao dịch trong hệ thống
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button 
                onClick={fetchPayments} 
                className="p-2 bg-white border border-gray-300 rounded-lg text-gray-500 hover:text-purple-600 hover:border-purple-300 transition-colors"
                title="Làm mới"
            >
                <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 justify-between">
          
          {/* Status Tabs */}
          <div className="flex p-1 bg-gray-100 rounded-lg self-start">
            {[
              { label: 'Tất cả', value: '' },
              { label: 'Thành công', value: 'succeeded' },
              { label: 'Hoàn tiền', value: 'refunded' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => { setStatusFilter(tab.value); setPage(1); }}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  statusFilter === tab.value
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              placeholder="Tìm theo tên học viên, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã GD</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người thanh toán</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiền</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nội dung</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                   <tr>
                     <td colSpan="7" className="px-6 py-10 text-center">
                        <Loading />
                        <p className="mt-2 text-gray-500 text-sm">Đang tải dữ liệu...</p>
                     </td>
                   </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                      Không tìm thấy giao dịch nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs font-mono font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            #{payment._id.slice(-6).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs overflow-hidden shrink-0">
                             {payment.user?.profile?.photo ? (
                                 <img src={payment.user.profile.photo} alt="" className="w-full h-full object-cover" />
                             ) : (
                                 (payment.user?.profile?.fullname || "U").charAt(0).toUpperCase()
                             )}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                                {payment.user?.profile?.fullname || "Unknown User"}
                            </div>
                            <div className="text-xs text-gray-500">{payment.user?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-purple-600">{formatCurrency(payment.amount)}</div>
                        <div className="text-xs text-gray-500 uppercase">{payment.method}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 line-clamp-2 max-w-xs" title={payment.description}>
                            {payment.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(payment.createdAt), "dd/MM/yyyy HH:mm")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-3">
                            {/* Nút Xem chi tiết */}
                            <button 
                                onClick={() => { setSelectedPaymentId(payment._id); setIsModalOpen(true); }}
                                className="text-gray-400 hover:text-purple-600 transition-colors" 
                                title="Xem chi tiết"
                            >
                                <EyeIcon className="w-5 h-5" />
                            </button>

                            {/* Nút Hoàn tiền (Chỉ hiện khi succeeded) */}
                            {payment.status === 'succeeded' && (
                                <button 
                                    onClick={() => handleRefund(payment._id)}
                                    className="text-gray-400 hover:text-red-600 transition-colors"
                                    title="Hoàn tiền & Hủy lớp"
                                >
                                    <ArrowUturnLeftIcon className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Footer Pagination */}
          {!isLoading && payments.length > 0 && (
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Trang <span className="font-medium">{page}</span> trên <span className="font-medium">{totalPages}</span>
                        </p>
                    </div>
                    <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button
                                onClick={() => setPage(curr => Math.max(curr - 1, 1))}
                                disabled={page === 1}
                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-300"
                            >
                                <span className="sr-only">Previous</span>
                                <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                            </button>
                            <button
                                onClick={() => setPage(curr => Math.min(curr + 1, totalPages))}
                                disabled={page === totalPages}
                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-300"
                            >
                                <span className="sr-only">Next</span>
                                <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
          )}
        </div>
      </div>

      
      <PaymentHistoryDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        paymentId={selectedPaymentId}
      />
    </div>
  );
};

export default StaffPaymentManagement;