import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../../utils/api';
import { Loader2, ArrowLeft, BookOpen, Check, Map, Clock, AlertCircle, CheckCircle, X, Calendar, Lock } from 'lucide-react';
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

// Function component Toast và ClassCard 
function Toast({ message, type = "success", onClose }) {
  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    info: <AlertCircle className="w-5 h-5" />
  };

  const styles = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    info: "bg-blue-50 border-blue-200 text-blue-800"
  };

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${styles[type]} transform transition-all duration-300 ease-out`}>
      <div className="flex-shrink-0">
        {icons[type]}
      </div>
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 ml-2 hover:opacity-70 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

const ClassCard = ({ cls, studentId, onRegisterClick }) => {
  const { course, weeklySchedules, maxStudent } = cls;
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

        <div className="flex justify-end">
          <button
            onClick={() => onRegisterClick(cls._id)}
            disabled={currentSize >= maxStudent}
            className={`px-4 py-2 font-semibold rounded-lg transition ${currentSize >= maxStudent
                ? 'bg-red-500 text-white cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
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

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [roadmap, setRoadmap] = useState({ stages: [], upcomingClasses: [] });
  const [studentScore, setStudentScore] = useState(0);
  
  // 1. Thêm state để check trạng thái đang học
  const [isStudying, setIsStudying] = useState(false);

  const studentId = query.get('student');
  const categoryId = query.get('category');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const fetchRoadmapAndProfile = useCallback(async () => {
    if (!studentId || !categoryId) {
      showToast("Không tìm thấy thông tin học viên hoặc môn học.", "error");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // 1. Params truyền vào 
      const now = new Date();
      const threeWeeksLater = new Date(now);
      threeWeeksLater.setDate(now.getDate() + 21);

      const scheduleParams = {
        startDate: now.toISOString(),
        endDate: threeWeeksLater.toISOString()
      };

      const [roadmapRes, profileRes, scheduleRes] = await Promise.all([
        api.learner.getRoadmap(studentId, categoryId),
        api.learner.getStudentProfile(studentId),
      
        api.learner.getMySchedule(studentId, scheduleParams) 
      ]);

      setRoadmap(roadmapRes.data.data);
      setStudentScore(profileRes.data.data.testScore || 0);

      
      const responseData = scheduleRes.data.data;

      // Bạn cần chọc sâu vào key 'sessions' để lấy mảng
      if (responseData && responseData.sessions && responseData.sessions.length > 0) {
        setIsStudying(true);
      } else {
        setIsStudying(false);
      }
      // --------------------

    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Lỗi khi tải dữ liệu.", "error");
    } finally {
      setLoading(false);
    }
  }, [studentId, categoryId]);

  useEffect(() => {
    fetchRoadmapAndProfile();
  }, [fetchRoadmapAndProfile]);

  const { suitableStage, filteredClasses } = useMemo(() => {
    if (!roadmap.stages.length) return { suitableStage: null, filteredClasses: [] };

    const stage = roadmap.stages.find(s =>
      studentScore >= s.inputMinScore && studentScore <= s.inputMaxScore
    );

    const targetStage = stage || null;

    if (!targetStage) return { suitableStage: null, filteredClasses: [] };

    const classes = roadmap.upcomingClasses.filter(cls =>
      cls.course._id === targetStage._id
    );

    return { suitableStage: targetStage, filteredClasses: classes };
  }, [roadmap, studentScore]);

  const handleRegisterClick = (classId) => {
    setSelectedClassId(classId);
    setIsModalOpen(true);
  };

  const handleEnrollmentSuccess = () => {
    setIsModalOpen(false);
    showToast("Giữ chỗ thành công! Lớp học đã được thêm vào hồ sơ của bạn.", "success");
    fetchRoadmapAndProfile();
  };

  const courseId = suitableStage ? suitableStage._id : '';
  const customScheduleUrl = `/learner/custom-schedule?student=${studentId}&category=${categoryId}${courseId ? `&course=${courseId}` : ''}`;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
        <p className="ml-4 text-lg text-gray-600">Đang tải lộ trình...</p>
      </div>
    );
  }

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-6xl mx-auto p-6 py-10">
        <Link
          to="/learner/roadmap"
          className="flex items-center text-purple-600 hover:text-purple-800 font-medium mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Quay lại
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Map className="w-6 h-6 mr-3 text-purple-600" />
                Lộ Trình Của Bạn
              </h2>

              <div className="mb-4 text-sm font-medium text-blue-600 bg-blue-50 p-3 rounded-md">
                Điểm đầu vào của bạn: <span className="font-bold text-lg">{studentScore}</span>
              </div>

              {roadmap.stages.length === 0 ? (
                <p className="text-gray-600">Không có thông tin lộ trình.</p>
              ) : (
                <ol className="relative border-l border-purple-300 ml-3">
                  {roadmap.stages.map((stage, index) => {
                    const isCurrent = suitableStage && stage._id === suitableStage._id;
                    return (
                      <li key={stage._id} className="mb-6 ml-6">
                        <span className={`absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 transition-colors duration-300 ${isCurrent
                            ? 'bg-green-500 ring-8 ring-green-100'
                            : 'bg-gray-300'
                          }`}>
                          {isCurrent ? <Check className="w-4 h-4 text-white" /> : <BookOpen className="w-3 h-3 text-gray-600" />}
                        </span>

                        <h3 className={`font-semibold flex flex-col items-start ${isCurrent ? 'text-green-700 text-lg' : 'text-gray-700'}`}>
                          <span>{stage.name}</span>
                          {isCurrent && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded mt-1">
                              Phù hợp nhất
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500">Mức điểm: {stage.inputMinScore} - {stage.inputMaxScore}</p>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Lớp học phù hợp ({suitableStage ? suitableStage.name : 'Đang tìm lớp...'})
            </h2>

            {isStudying ? (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-8 text-center shadow-sm">
                 <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
                    <Calendar className="w-8 h-8 text-orange-600" />
                 </div>
                 <h3 className="text-xl font-bold text-orange-800 mb-2">Bạn đang có lịch học</h3>
                 <p className="text-gray-600 max-w-md mx-auto">
                    Hệ thống ghi nhận bạn đang có lịch học trong 3 tuần tới. 
                    Vui lòng hoàn thành khóa học hiện tại trước khi đăng ký lớp mới để đảm bảo chất lượng học tập.
                 </p>
                 <div className="mt-6 flex justify-center gap-4">
                    <Link 
                        to={`/learner/my-classes?studentId=${studentId}`} 
                        className="px-4 py-2 bg-white border border-orange-300 text-orange-700 font-medium rounded-lg hover:bg-orange-50 transition"
                    >
                        Xem lịch học của tôi
                    </Link>
                 </div>
              </div>
            ) : (
                
                <>
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6 flex items-center gap-3">
                    <AlertCircle className="h-6 w-6 text-blue-500 flex-shrink-0" />
                    <p className="text-sm text-blue-700">
                        Không tìm thấy lớp có thời gian học phù hợp?
                        <Link
                        to={customScheduleUrl}
                        className="font-semibold underline hover:text-blue-900 ml-1"
                        >
                        Bấm vào đây để thiết lập lịch tùy chỉnh
                        </Link>
                    </p>
                    </div>

                    {filteredClasses.length === 0 ? (
                    <div className="text-center bg-gray-50 rounded-lg border border-gray-200 p-8">
                        <p className="text-gray-600 text-lg mb-2">
                        {suitableStage
                            ? "Hiện không có lớp nào sắp mở cho trình độ này."
                            : "Điểm số của bạn chưa phù hợp với bất kỳ lớp nào trong lộ trình này."}
                        </p>
                        <p className="text-gray-500 text-sm">Vui lòng liên hệ admin hoặc thử xếp lịch tùy chỉnh.</p>
                    </div>
                    ) : (
                    <div className="space-y-4">
                        {filteredClasses.map(cls => (
                        <ClassCard
                            key={cls._id}
                            cls={cls}
                            studentId={studentId}
                            onRegisterClick={handleRegisterClick}
                        />
                        ))}
                    </div>
                    )}
                </>
            )}
          </div>
        </div>

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
    </>
  );
};

export default LearnerRoadmapResults;