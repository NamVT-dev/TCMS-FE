import React, { useEffect, useState } from 'react';
import { 
  XMarkIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationCircleIcon, 
  CreditCardIcon,
  BanknotesIcon,
  UserIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  TagIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';
import api from '../../../utils/api'; 
import Loading from '../../UI/Loading'; 
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const PaymentHistoryDetailModal = ({ isOpen, onClose, paymentId }) => {
  const [payment, setPayment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- Fetch Data ---
  useEffect(() => {
    const fetchPaymentDetail = async () => {
      if (!isOpen || !paymentId) return;

      setIsLoading(true);
      setError(null);
      try {
        // Gọi API getOneByMember: GET /payment/:id
        const res = await api.payment.getPaymentDetail(paymentId);
        // BE trả về: { status: "success", data: payment }
        setPayment(res.data.data); 
      } catch (err) {
        console.error("Error fetching payment detail:", err);
        setError("Không thể tải thông tin giao dịch. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentDetail();
  }, [isOpen, paymentId]);

  // --- Reset state khi đóng modal ---
  useEffect(() => {
    if (!isOpen) {
      setPayment(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // --- Helpers Format ---
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '---';
    return format(new Date(dateString), "HH:mm - dd/MM/yyyy", { locale: vi });
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'succeeded':
        return { 
          label: 'Thành công', 
          color: 'text-green-600 bg-green-50 border-green-200', 
          icon: <CheckCircleIcon className="w-12 h-12 text-green-500" /> 
        };
      case 'pending':
        return { 
          label: 'Đang xử lý', 
          color: 'text-yellow-600 bg-yellow-50 border-yellow-200', 
          icon: <ClockIcon className="w-12 h-12 text-yellow-500" /> 
        };
      case 'failed':
        return { 
          label: 'Thất bại', 
          color: 'text-red-600 bg-red-50 border-red-200', 
          icon: <ExclamationCircleIcon className="w-12 h-12 text-red-500" /> 
        };
      case 'refunded':
        return { 
          label: 'Đã hoàn tiền', 
          color: 'text-purple-600 bg-purple-50 border-purple-200', 
          icon: <ExclamationCircleIcon className="w-12 h-12 text-purple-500" /> 
        };
      default:
        return { 
          label: status, 
          color: 'text-gray-600 bg-gray-50 border-gray-200', 
          icon: <ExclamationCircleIcon className="w-12 h-12 text-gray-500" /> 
        };
    }
  };

  const getMethodLabel = (method) => {
    const map = {
      'bank_transfer': 'Chuyển khoản ngân hàng',
      'card': 'Thẻ tín dụng/Ghi nợ',
      'paypal': 'PayPal',
      'apple_pay': 'Apple Pay',
      'stripe': 'Stripe',
      'other': 'Khác'
    };
    return map[method] || method;
  };

  // --- Render Content ---
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center px-4 font-sans">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-fadeInUp">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <DocumentTextIcon className="w-5 h-5 text-purple-600" />
            Chi tiết giao dịch
          </h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loading /> 
              <p className="text-gray-500 text-sm font-medium animate-pulse">Đang tải dữ liệu từ hệ thống...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
                <ExclamationCircleIcon className="w-12 h-12 text-red-400 mb-3" />
                <p className="text-red-600 font-medium">{error}</p>
            </div>
          ) : payment ? (
            <div className="space-y-8">
              
              {/* 1. Status & Amount Banner */}
              <div className="flex flex-col items-center justify-center text-center">
                <div className="mb-4 p-3 bg-gray-50 rounded-full shadow-sm border border-gray-100">
                  {getStatusConfig(payment.status).icon}
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  {formatCurrency(payment.amount)}
                </h2>
                <div className={`mt-3 px-4 py-1.5 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusConfig(payment.status).color}`}>
                  {getStatusConfig(payment.status).label}
                </div>
                {payment.description && (
                    <p className="text-gray-500 text-sm mt-3 px-4 line-clamp-2 italic">
                        "{payment.description}"
                    </p>
                )}
              </div>

              {/* 2. Transaction Details Card */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center gap-2">
                    <TagIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-bold text-gray-500 uppercase">Thông tin thanh toán</span>
                </div>
                <div className="p-4 space-y-4 text-sm">
                  <div className="flex justify-between items-start">
                    <span className="text-gray-500">Mã giao dịch (System)</span>
                    <span className="font-mono font-medium text-gray-800 text-right break-all pl-4 select-all">
                      {payment._id}
                    </span>
                  </div>
                  
                  {payment.providerPaymentId && (
                      <div className="flex justify-between items-start">
                        <span className="text-gray-500">Mã tham chiếu (VNPAY)</span>
                        <span className="font-mono font-medium text-gray-800 text-right pl-4 select-all">
                          {payment.providerPaymentId}
                        </span>
                      </div>
                  )}

                  {payment.invoiceId && (
                      <div className="flex justify-between items-start">
                        <span className="text-gray-500">Mã hóa đơn (Invoice)</span>
                        <span className="font-mono font-medium text-gray-800 text-right pl-4 select-all">
                          {payment.invoiceId}
                        </span>
                      </div>
                  )}

                  <div className="border-t border-dashed border-gray-200 my-2"></div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Thời gian</span>
                    <span className="font-medium text-gray-800">
                      {formatDate(payment.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Phương thức</span>
                    <span className="font-medium text-purple-600 flex items-center gap-1.5">
                      {payment.method === 'bank_transfer' ? <BanknotesIcon className="w-4 h-4" /> : <CreditCardIcon className="w-4 h-4" />}
                      {getMethodLabel(payment.method)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. User Info Card */}
              {payment.user && (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-bold text-gray-500 uppercase">Người thanh toán</span>
                    </div>
                    <div className="p-4 flex items-center gap-4">
                        <div className="relative">
                            <img 
                                src={payment.user.profile?.photo || "https://via.placeholder.com/150"} 
                                alt="Avatar" 
                                className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-sm"
                                onError={(e) => { e.target.src = "https://via.placeholder.com/150" }}
                            />
                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 truncate">
                                {payment.user.profile?.fullname || "Không có tên"}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{payment.user.email}</p>
                            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-mono">
                                    {payment.user.profile?.phoneNumber || "N/A"}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
              )}

            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 hover:text-gray-900 transition-colors focus:ring-2 focus:ring-offset-1 focus:ring-gray-200 outline-none"
          >
            Đóng
          </button>
          
        </div>
      </div>
    </div>
  );
};

export default PaymentHistoryDetailModal;