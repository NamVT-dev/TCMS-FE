// File: src/pages/GuestViewCourseDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Users, Zap, BookOpen } from 'lucide-react';
import api from '../../utils/api';
import Navbar from '../../components/Layout/Navbar'; // Import Navbar component

const DEFAULT_COURSE = {
  name: 'Khóa học đang tải...',
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

    if (courseId) {
      fetchCourseDetail();
    }
  }, [courseId]);

  const formatPrice = (price) => {
    return price ? `${parseInt(price).toLocaleString()}₫` : 'Liên hệ';
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} phút`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours} giờ`;
    return `${hours} giờ ${mins} phút`;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="inline-block w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="ml-4 text-purple-600 font-semibold">Đang tải chi tiết khóa học...</p>
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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white">
        {/* Header Banner Section */}
        <div className="relative pt-20 pb-40 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-500 to-purple-800 text-white overflow-hidden">
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 flex items-center text-white/90 hover:text-white transition bg-black/20 p-2 rounded-full z-10"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back
          </button>

          <div className="container mx-auto max-w-7xl relative z-10">
            <span className="inline-block px-4 py-1 text-sm font-semibold rounded-full bg-white/30 mb-4 shadow-md">
              {course.category || 'Chuyên đề'}
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-2 leading-tight">
              {course.name}
            </h1>
            <div className="flex items-center space-x-6 text-lg text-white/90 font-medium">
              <span className="flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-300" />
                Level: {course.level || 'Cơ bản'}
              </span>
              <span className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-yellow-300" />
                Thời lượng: {course.session || 0} buổi
              </span>
            </div>
          </div>
          
          <div className="absolute top-0 right-0 h-full w-1/3 bg-purple-900/10 opacity-50 transform skew-x-12 -translate-x-1/2 hidden lg:block"></div>
        </div>

        {/* Main Content Area */}
        <div className="container mx-auto max-w-7xl -mt-28 relative z-20 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Cột chính: Chi tiết & Mô tả */}
            <div className="lg:w-2/3 bg-white p-8 rounded-xl shadow-2xl">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">
                Mô tả Khóa học
              </h2>
              <div className="text-gray-700 leading-relaxed space-y-4">
                  <p className='font-semibold'>Description:</p>
                  <p>{course.description}</p>

                  <h3 className="text-xl font-bold text-purple-700 pt-4">Mục tiêu Khóa học (Course Objectives):</h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600">
                      <li>Nắm vững cấu trúc bài thi {course.name} (Nghe & Đọc).</li>
                      <li>Tăng cường ngữ pháp và từ vựng cơ bản thường gặp.</li>
                      <li>Phát triển kỹ năng nghe và đọc hiểu đoạn văn ngắn.</li>
                      <li>Xây dựng phản xạ tiếng Anh và chiến lược làm bài hiệu quả.</li>
                  </ul>
                  
                  <h3 className="text-xl font-bold text-purple-700 pt-4">Phù hợp với (Suitable for):</h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600">
                      <li>Người học chưa có nền tảng tiếng Anh hoặc ở trình độ sơ cấp (A1-A2).</li>
                      <li>Những ai muốn bắt đầu luyện thi {course.name} từ con số 0.</li>
                  </ul>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-100">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                      <BookOpen className="w-6 h-6 mr-3 text-purple-600" />
                      Tổng quan
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-gray-700">
                      <p><strong>Cấp độ:</strong> {course.level || 'Cơ bản'}</p>
                      <p><strong>Danh mục:</strong> {course.category || 'Khác'}</p>
                      <p><strong>Số buổi:</strong> {course.session || 0} buổi</p>
                      <p><strong>Tổng thời gian:</strong> {formatDuration(course.durationInMinutes || 0)}</p>
                  </div>
              </div>
            </div>

            {/* Cột phụ: Thông tin tóm tắt & CTA */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-xl shadow-2xl border border-purple-100 sticky top-20 p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Giá Khóa học</h3>
                  <p className="text-4xl font-extrabold mb-4 text-red-600">
                      {formatPrice(course.price)}
                  </p>
                  <div className="space-y-3 text-gray-700 mb-6">
                      <div className="flex items-center">
                          <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          <span>Miễn phí tài liệu độc quyền</span>
                      </div>
                      <div className="flex items-center">
                          <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          <span>Giảng viên kinh nghiệm</span>
                      </div>
                      <div className="flex items-center">
                          <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                          <span>Cơ sở vật chất hiện đại</span>
                      </div>
                  </div>

                  <button
                      onClick={() => alert(`Bạn đã chọn đăng ký khóa học ${course.name}!`)}
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                      Đăng ký ngay
                  </button>
                  <p className="text-center text-sm text-gray-500 mt-2">
                      Ưu đãi đặc biệt tháng 10/2025
                  </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GuestViewCourseDetail;