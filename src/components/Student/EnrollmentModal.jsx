import React, { useState } from 'react';
import api from '../../utils/api';
import { Loader2, X, AlertTriangle, CheckCircle } from 'lucide-react'; // ⬅️ Đổi icon

const EnrollmentModal = ({ isOpen, onClose, classId, studentId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleConfirmHold = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        student: studentId,
        classId: classId,
      };
      const res = await api.learner.createSeatHold(payload);
      
      // ⬇️ SỬA LẠI: Bỏ qua thanh toán, gọi onSuccess ngay
      // 1. Lấy thông tin enrollment
      const enrollmentData = res.data.data.enrollment;
      
      // 2. Gọi callback báo thành công
      onSuccess(enrollmentData);
      
      /*
      // (Đoạn code thanh toán đã bị vô hiệu hóa)
      const paymentInfo = res.data.data.paymentInfo;
      if (paymentInfo && paymentInfo.checkoutUrl) {
        window.location.href = paymentInfo.checkoutUrl;
      } else {
        setError("Không thể lấy thông tin thanh toán.");
        setLoading(false);
      }
      */
      
    } catch (err) {
      setError(err.response?.data?.message || "Giữ chỗ thất bại.");
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.6)]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Xác nhận Đăng ký</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 rounded-full hover:bg-gray-100 hover:text-gray-600"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mt-6">
          {error ? (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
              <p className="font-bold">Không thể giữ chỗ</p>
              <p>{error}</p>
            </div>
          ) : (
            <div className="text-center">
              <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Bạn sắp đăng ký lớp này</h3>
              <p className="text-gray-600 mt-2">
                (Luồng thanh toán đang được tạm bỏ qua). Lớp sẽ được giữ chỗ ngay lập tức.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
            >
              Hủy
            </button>
            <button 
              type="button" 
              onClick={handleConfirmHold} 
              disabled={loading || error}
              className="inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md shadow-sm hover:bg-purple-700 focus:outline-none disabled:bg-gray-400"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-5 h-5 mr-2" /> 
              )}
              {loading ? "Đang xử lý..." : "Xác nhận Đăng ký"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentModal;