import React, { useEffect, useState } from 'react';
import { 
  XMarkIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationCircleIcon, 
  CreditCardIcon,
  BanknotesIcon,
  UserIcon,
  DocumentTextIcon,
  TagIcon,
  CalendarDaysIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArrowUturnLeftIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import api from '../../../utils/api'; 
import Loading from '../../UI/Loading'; 

const AdminPaymentDetailModal = ({ isOpen, onClose, paymentId }) => {
  const [payment, setPayment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  
  useEffect(() => {
    const fetchDetail = async () => {
      if (!isOpen || !paymentId) return;

      setIsLoading(true);
      setError(null);
      try {
        // Gọi API theo cấu hình bạn cung cấp
        const res = await api.admin.payment.getPaymentDetail(paymentId);
        
        // Xử lý dữ liệu dựa trên JSON mẫu: { status: "success", data: { data: { ...paymentObj } } }
        if (res.data?.data?.data) {
            setPayment(res.data.data.data);
        } else {
            // Fallback nếu cấu trúc thay đổi
            setPayment(res.data?.data || null);
        }
      } catch (err) {
        console.error("Error fetching transaction detail:", err);
        setError("Không thể tải thông tin chi tiết giao dịch.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [isOpen, paymentId]);

  
  useEffect(() => {
    if (!isOpen) setPayment(null);
  }, [isOpen]);

  if (!isOpen) return null;

  // --- Helper Functions ---
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'succeeded':
        return { 
          label: 'Thành công', 
          color: 'text-green-700 bg-green-50 border-green-200', 
          icon: <CheckCircleIcon className="w-5 h-5 text-green-600" /> 
        };
      case 'pending':
        return { 
          label: 'Đang xử lý', 
          color: 'text-yellow-700 bg-yellow-50 border-yellow-200', 
          icon: <ClockIcon className="w-5 h-5 text-yellow-600" /> 
        };
      case 'failed':
        return { 
          label: 'Thất bại', 
          color: 'text-red-700 bg-red-50 border-red-200', 
          icon: <ExclamationCircleIcon className="w-5 h-5 text-red-600" /> 
        };
      case 'refunded':
        return { 
          label: 'Đã hoàn tiền', 
          color: 'text-purple-700 bg-purple-50 border-purple-200', 
          icon: <ArrowUturnLeftIcon className="w-5 h-5 text-purple-600" /> 
        };
      default:
        return { 
          label: status, 
          color: 'text-gray-700 bg-gray-50 border-gray-200', 
          icon: <TagIcon className="w-5 h-5 text-gray-600" /> 
        };
    }
  };

  // --- Render ---
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 font-sans">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fadeInUp">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <DocumentTextIcon className="w-6 h-6 text-indigo-600" />
            Chi tiết giao dịch
          </h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors outline-none focus:ring-2 focus:ring-gray-300"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loading />
              <p className="mt-3 text-gray-500 text-sm animate-pulse">Đang tải dữ liệu...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="bg-red-50 p-3 rounded-full mb-3">
                    <ExclamationCircleIcon className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-red-600 font-medium">{error}</p>
            </div>
          ) : payment ? (
            <div className="space-y-8">
              
              {/* 1. Overview Card */}
              <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-2xl p-6 text-center relative overflow-hidden">
                <div className="relative z-10">
                    <div className="inline-flex items-center justify-center p-3 bg-white rounded-full shadow-sm mb-3">
                        {payment.method === 'bank_transfer' ? <BanknotesIcon className="w-8 h-8 text-indigo-600" /> : <CreditCardIcon className="w-8 h-8 text-indigo-600" />}
                    </div>
                    <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Tổng thanh toán</p>
                    <h2 className="text-4xl font-extrabold text-indigo-900 mt-1 mb-3">
                        {formatCurrency(payment.amount)}
                    </h2>
                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold border ${getStatusConfig(payment.status).color}`}>
                        {getStatusConfig(payment.status).icon}
                        {getStatusConfig(payment.status).label}
                    </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 2. User Info */}
                <div className="space-y-3">
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-gray-500" />
                        Người thanh toán
                    </h4>
                    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm h-full">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="relative">
                                <img 
                                    src={payment.user?.profile?.photo || "https://via.placeholder.com/150"} 
                                    alt="Avatar" 
                                    className="w-14 h-14 rounded-full object-cover border-2 border-gray-100 shadow-sm"
                                    onError={(e) => { e.target.src = "https://via.placeholder.com/150" }}
                                />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 text-lg">{payment.user?.profile?.fullname || "N/A"}</p>
                                <p className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded inline-block uppercase font-medium mt-1">
                                    {payment.user?.role || "Member"}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm">
                             <div className="flex items-center gap-3 text-gray-600">
                                <EnvelopeIcon className="w-4 h-4 text-gray-400 shrink-0" />
                                <span className="truncate">{payment.user?.email}</span>
                             </div>
                             <div className="flex items-center gap-3 text-gray-600">
                                <PhoneIcon className="w-4 h-4 text-gray-400 shrink-0" />
                                <span>{payment.user?.profile?.phoneNumber || "---"}</span>
                             </div>
                             <div className="flex items-center gap-3 text-gray-600">
                                <CalendarDaysIcon className="w-4 h-4 text-gray-400 shrink-0" />
                                <span>{payment.user?.profile?.dob ? format(new Date(payment.user.profile.dob), "dd/MM/yyyy") : "---"}</span>
                             </div>
                        </div>
                    </div>
                </div>

                {/* 3. Transaction Details */}
                <div className="space-y-3">
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                        <DocumentTextIcon className="w-4 h-4 text-gray-500" />
                        Thông tin chi tiết
                    </h4>
                    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm h-full space-y-3 text-sm">
                        <div className="flex flex-col pb-2 border-b border-gray-100">
                            <span className="text-gray-500 text-xs">Mã giao dịch (System)</span>
                            <span className="font-mono font-medium text-gray-800 select-all break-all">{payment._id}</span>
                        </div>
                        
                        {payment.providerPaymentId && (
                             <div className="flex flex-col pb-2 border-b border-gray-100">
                                <span className="text-gray-500 text-xs">Mã tham chiếu (VNPAY)</span>
                                <span className="font-mono font-medium text-gray-800 select-all break-all">{payment.providerPaymentId}</span>
                            </div>
                        )}

                        <div className="flex justify-between items-center">
                            <span className="text-gray-500">Phương thức</span>
                            <span className="font-medium text-gray-800 capitalize">{payment.method?.replace('_', ' ')}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500">Thời gian tạo</span>
                            <span className="font-medium text-gray-800">
                                {format(new Date(payment.createdAt), "HH:mm - dd/MM/yyyy")}
                            </span>
                        </div>

                        {payment.updatedAt && (
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Cập nhật cuối</span>
                                <span className="font-medium text-gray-800">
                                    {format(new Date(payment.updatedAt), "HH:mm - dd/MM/yyyy")}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
              </div>
              
              {/* 4. Description Block */}
              <div className="space-y-2">
                 <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Nội dung giao dịch</h4>
                 <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-gray-700 text-sm leading-relaxed">
                    {payment.description || "Không có nội dung chi tiết."}
                 </div>
              </div>

            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm font-bold hover:bg-gray-100 hover:text-gray-900 transition-all shadow-sm"
          >
            Đóng 
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentDetailModal;