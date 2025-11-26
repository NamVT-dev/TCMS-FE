import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { CheckCircle, XCircle, ArrowLeft, Loader2, RefreshCcw } from 'lucide-react';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const LearnerPaymentStatusPage = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const location = useLocation();

  const [status, setStatus] = useState('verifying'); 
  const [message, setMessage] = useState('Đang xác thực giao dịch với ngân hàng...');
  
  const [savedStudentId, setSavedStudentId] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!location.search) {
        setStatus('fail');
        setMessage('Không tìm thấy thông tin giao dịch.');
        return;
      }

      try {
        const params = Object.fromEntries(query.entries());
        await api.payment.confirmPayment(params);

        setStatus('success');
        setMessage('Giao dịch thành công. Lớp học đã được thêm vào hồ sơ của bạn.');

        const storedId = localStorage.getItem('pendingPaymentStudentId');
        if (storedId) {
          setSavedStudentId(storedId);
          localStorage.removeItem('pendingPaymentStudentId');
        }

      } catch (err) {
        setStatus('fail');
        const errMessage = err.response?.data?.message || 'Giao dịch thất bại hoặc bị hủy.';
        setMessage(errMessage);
        localStorage.removeItem('pendingPaymentStudentId'); 
      }
    };

    verifyPayment();
  }, [location.search, query]);

  const myClassesLink = savedStudentId 
    ? `/learner/my-classes?studentId=${savedStudentId}` 
    : '/learner/my-classes';

  const roadmapLink = savedStudentId 
    ? `/learner/roadmap?student=${savedStudentId}` 
    : '/learner/roadmap';

  if (status === 'verifying') {
    return (
      <div className="max-w-2xl mx-auto p-6 py-20 text-center">
        <Loader2 className="w-16 h-16 text-indigo-600 mx-auto mb-6 animate-spin" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Đang xử lý thanh toán...</h1>
        <p className="text-gray-600">Vui lòng không tắt trình duyệt.</p>
      </div>
    );
  }

  const isSuccess = status === 'success';

  return (
    <div className="max-w-2xl mx-auto p-6 py-20 text-center bg-white rounded-xl shadow-sm mt-10 border border-gray-100">
      {isSuccess ? (
        <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
      ) : (
        <XCircle className="w-24 h-24 text-red-500 mx-auto mb-6" />
      )}
      
      <h1 className={`text-3xl font-bold mb-4 ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
        {isSuccess ? 'Thanh toán Thành công!' : 'Thanh toán Thất bại'}
      </h1>
      
      <p className="text-lg text-gray-600 mb-8 px-4">
        {message}
      </p>

      <div className="flex justify-center gap-4 flex-col sm:flex-row">
        {isSuccess ? (
          <>
            <Link
              to={roadmapLink}
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Về trang Lộ trình
            </Link>
            
            {/* Nút này dẫn về trang /learner/my-classes kèm param */}
            <button
              onClick={() => navigate(myClassesLink)}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-md"
            >
              Vào lớp học ngay
            </button>
          </>
        ) : (
          <>
            <button
               onClick={() => navigate(roadmapLink)}
               className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Quay lại
            </button>
            <button
               onClick={() => navigate(-1)}
               className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-md"
            >
               <RefreshCcw className="h-5 w-5 mr-2" />
               Thử lại
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default LearnerPaymentStatusPage;