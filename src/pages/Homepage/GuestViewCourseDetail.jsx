// File: src/pages/GuestViewCourseDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import Navbar from '../../components/Layout/Navbar';

const DEFAULT_COURSE = {
  name: 'Đang tải...',
  description: '...',
  price: 0,
  category: '...',
  level: '...',
  session: 0,
  durationInMinutes: 0,
  imageCover: '',
};

const GuestViewCourseDetail = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(DEFAULT_COURSE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLoginMessage, setShowLoginMessage] = useState(false);


  // 🔹 Tính tháng khuyến mãi (tháng hiện tại +1)
  const currentDate = new Date();
  let promoMonth = currentDate.getMonth() + 2;
  let promoYear = currentDate.getFullYear();
  if (promoMonth > 12) {
    promoMonth = 1;
    promoYear += 1;
  }

  useEffect(() => {
    const fetchCourseDetail = async () => {
      setLoading(true);
      try {
        const res = await api.user.getCourseById(courseId);
        setCourse(res.data.data.course);
        setError(null);
      } catch (err) {
        console.error('Lỗi khi tải chi tiết khóa học:', err);
        setError('Không tìm thấy khóa học hoặc lỗi kết nối.');
        setCourse(DEFAULT_COURSE);
      } finally {
        setLoading(false);
      }
    };
    if (courseId) fetchCourseDetail();
  }, [courseId]);

  const formatPrice = (price) =>
    price ? `${parseInt(price).toLocaleString()}₫` : 'Liên hệ';

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} phút`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins === 0 ? `${hours} giờ` : `${hours} giờ ${mins} phút`;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="inline-block w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="ml-4 text-purple-600 font-semibold">
            Đang tải chi tiết khóa học...
          </p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8">
          <p className="text-xl text-red-600 mb-4">Lỗi: {error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition"
          >
            Quay về Trang chủ
          </button>
        </div>
      </>
    );
  }

  // Xử lý category nếu là object
  const categoryName =
    typeof course.category === 'object'
      ? course.category.name
      : course.category;

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 py-20 px-4 md:px-10">

        <div className="container mx-auto max-w-6xl bg-white shadow-xl rounded-2xl overflow-hidden p-10">

          {/* Header Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
            {/* Left: Info */}
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
                Khóa học {course.name}
              </h1>
              <p className="text-gray-700 mb-6 leading-relaxed">
                {course.description}
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Thông tin khóa học
              </h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                <li>Thời lượng: {course.session || 0} buổi</li>
                <li>Giờ học: {formatDuration(course.durationInMinutes || 0)} mỗi buổi</li>
                <li>Hình thức: Online & Offline</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Khóa học này dành cho ai
              </h2>
              <p className="text-gray-700 mb-6">
                Khóa học {course.name} dành cho học viên đã có nền tảng trình độ từ {course.inputMinScore || '...'} đến{' '}
                {course.inputMaxScore || '...'} điểm, giúp củng cố kỹ năng và
                chuẩn bị cho kỳ thi {categoryName} một cách hiệu quả. Giới hạn lớp: {course.minStudent || 5} - {course.maxStudent || 20} học viên.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Mục tiêu khóa học
              </h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-8">
                <li>Củng cố ngữ pháp và vốn từ vựng trọng tâm.</li>
                <li>Phát triển kỹ năng Nghe - Nói - Đọc - Viết theo chuẩn đề thi {categoryName}.</li>
                <li>Nâng cao điểm số và phản xạ tiếng Anh.</li>
                <li>Tự tin áp dụng kiến thức trong thực tế.</li>
              </ul>
            </div>

            {/* Right: Image + Price */}
            <div className="flex flex-col justify-start items-center space-y-6">
              {course.imageCover ? (
                <img
                  src={course.imageCover}
                  alt={course.name}
                  className="rounded-2xl shadow-lg w-full object-cover max-h-[400px] hover:scale-[1.02] transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-[300px] bg-gray-200 rounded-2xl flex items-center justify-center text-gray-500">
                  Image
                </div>
              )}

              <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 w-full">
                <p className="text-gray-800 text-lg mb-2">
                  <strong>Giá khóa học:</strong>{' '}
                  <span className="text-red-600 text-2xl font-bold">
                    {formatPrice(course.price)}
                  </span>
                </p>

                {/* ✅ Thêm state hiển thị thông báo login */}
                <button
                  onClick={() => {
                    const token = localStorage.getItem('token');
                    if (!token) {
                      // nếu chưa đăng nhập
                      setShowLoginMessage(true);
                    } else {
                      // nếu đã login thì chuyển trang
                      navigate('/register-first-test');
                    }
                  }}
                  className="mt-4 w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Đăng ký ngay
                </button>

                {/* ⚠️ Hiển thị cảnh báo nếu chưa login */}
                {showLoginMessage && (
                  <p className="text-center text-sm text-yellow-700 bg-yellow-100 border border-yellow-300 rounded-lg p-2 mt-3 animate-slideDown">
                    ⚠️ Vui lòng{' '}
                    <span
                      onClick={() => navigate('/login?redirect=/register-first-test')}
                      className="underline cursor-pointer hover:text-yellow-800"
                    >
                      đăng nhập
                    </span>{' '}
                    để đăng ký khóa học.
                  </p>
                )}

                <p className="text-center text-sm text-gray-500 mt-2">
                  Ưu đãi đặc biệt tháng {promoMonth}/{promoYear}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-10 text-center">
            <button
              onClick={() => navigate('/')}
              className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl shadow transition"
            >
              ← Quay lại Trang chủ
            </button>
          </div>
        </div>

      </div>
    </>
  );
};

export default GuestViewCourseDetail;
