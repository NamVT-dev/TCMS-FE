import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

import { Loader2, ArrowLeft, BookOpen, Check, Map, Clock, User, Home, AlertCircle } from 'lucide-react';
import EnrollmentModal from './EnrollmentModal'; 


function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}


const formatMinutes = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};


const ClassCard = ({ cls, studentId, onRegisterClick }) => {
  const { course, weeklySchedules, student, maxStudent } = cls;
  
  const currentSize = cls.currentSize || cls.student?.length || 0; 

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
      <div className="p-5">
        <h3 className="text-lg font-bold text-purple-700">{cls.name}</h3>
        <p className="text-sm text-gray-600 mb-4">{course.name}</p>
        
        <div className="space-y-2 mb-4">
          {weeklySchedules.map((slot, index) => (
            <div key={index} className="flex items-center text-sm text-gray-700">
              <Clock className="w-4 h-4 mr-2 text-gray-400" />
              <span className="font-medium w-16">{['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][slot.dayOfWeek]}:</span>
              <span>{formatMinutes(slot.startMinute)} - {formatMinutes(slot.endMinute)}</span>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <div className="text-gray-700">
            <User className="w-4 h-4 inline mr-1 text-gray-400" />
            Sĩ số: <span className="font-bold">{currentSize} / {maxStudent}</span>
          </div>
          <button
            onClick={() => onRegisterClick(cls._id)}
            disabled={currentSize >= maxStudent}
            className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400"
          >
            {currentSize >= maxStudent ? "Đã đầy" : "Đăng ký"}
          </button>
        </div>
      </div>
    </div>
  );
};



const LearnerRoadmapResults = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roadmap, setRoadmap] = useState({ stages: [], upcomingClasses: [] });
  
  
  const studentId = query.get('student');
  const categoryId = query.get('category');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(null);

  useEffect(() => {
    if (!studentId || !categoryId) {
      setError("Không tìm thấy thông tin học viên hoặc môn học.");
      setLoading(false);
      return;
    }

    const fetchRoadmap = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.learner.getRoadmap(studentId, categoryId);
        setRoadmap(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Lỗi khi tải lộ trình.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, [studentId, categoryId]);

  const handleRegisterClick = (classId) => {
    setSelectedClassId(classId);
    setIsModalOpen(true);
  };

  
  const handleEnrollmentSuccess = (enrollmentData) => {
    setIsModalOpen(false);
    
    alert("Giữ chỗ thành công! Chuẩn bị chuyển đến trang thanh toán...");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
        <p className="ml-4 text-lg text-gray-600">Đang tải lộ trình của bạn...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 py-10">
      <Link
        to="/learner/roadmap"
        className="flex items-center text-purple-600 hover:text-purple-800 font-medium mb-4"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Quay lại Bước 1
      </Link>
      
      {error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-md" role="alert">
          <p className="font-bold text-xl mb-2">Đã xảy ra lỗi</p>
          <p>{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Map className="w-6 h-6 mr-3 text-purple-600" />
                Lộ Trình Của Bạn
              </h2>
              {roadmap.stages.length === 0 ? (
                <p className="text-gray-600">{roadmap.message || "Bạn đã hoàn thành mục tiêu."}</p>
              ) : (
                <ol className="relative border-l border-purple-300 ml-3">
                  {roadmap.stages.map((stage, index) => (
                    <li key={stage._id} className="mb-6 ml-6">
                      <span className={`absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ${
                        index === 0 ? 'bg-purple-600 ring-8 ring-purple-100' : 'bg-gray-300'
                      }`}>
                        {index === 0 ? <Check className="w-4 h-4 text-white"/> : <BookOpen className="w-3 h-3 text-gray-600"/>}
                      </span>
                      <h3 className={`font-semibold ${index === 0 ? 'text-purple-800' : 'text-gray-700'}`}>
                        {stage.name}
                      </h3>
                      <p className="text-sm text-gray-500">Mức điểm: {stage.inputMinScore} - {stage.inputMaxScore}</p>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Các lớp học phù hợp ( cho {roadmap.stages[0]?.name || '...'} )
            </h2>
            
            {roadmap.upcomingClasses.length === 0 ? (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg shadow-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-yellow-800">Không tìm thấy lớp học</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>Rất tiếc, hiện không có lớp nào sắp khai giảng phù hợp với lịch rảnh của bạn.</p>
                      <button 
                        onClick={() => navigate(`/learner/custom-schedule?student=${studentId}&category=${categoryId}`)}
                        className="mt-4 px-4 py-2 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 transition"
                      >
                        Gửi Yêu Cầu Lịch Tùy Chỉnh
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {roadmap.upcomingClasses.map(cls => (
                  <ClassCard 
                    key={cls._id} 
                    cls={cls} 
                    studentId={studentId} 
                    onRegisterClick={handleRegisterClick} 
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ⬇️ THÊM MODAL BƯỚC 3 */}
      {isModalOpen && (
        <EnrollmentModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          classId={selectedClassId}
          studentId={studentId}
          onSuccess={handleEnrollmentSuccess}
        /> 
      )}
    </div>
  );
};

export default LearnerRoadmapResults;