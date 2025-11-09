import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

// Hàm helper để đọc query params từ URL
function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

const LearnerPaymentStatusPage = () => {
  const query = useQuery();
  const status = query.get('status');
  
  const isSuccess = status === 'success';

  return (
    <div className="max-w-2xl mx-auto p-6 py-20 text-center">
      {isSuccess ? (
        <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
      ) : (
        <XCircle className="w-24 h-24 text-red-500 mx-auto mb-6" />
      )}
      
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        {isSuccess ? 'Thanh toán Thành công!' : 'Thanh toán Thất bại'}
      </h1>
      
      <p className="text-lg text-gray-600 mb-8">
        {isSuccess
          ? 'Cảm ơn bạn đã đăng ký. Lớp học đã được xác nhận và thêm vào hồ sơ của bạn.'
          : 'Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.'
        }
      </p>

      <div className="flex justify-center gap-4">
        <Link
          to="/learner/roadmap"
          className="flex items-center text-purple-600 hover:text-purple-800 font-medium"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Về trang Lộ trình
        </Link>
        <Link
          to="/student/dashboard" // (Hoặc /my-courses)
          className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition shadow-md"
        >
          Xem các khóa học của tôi
        </Link>
      </div>
    </div>
  );
};

export default LearnerPaymentStatusPage;