import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom'; 
import api from '../../utils/api';
import Loading from '../UI/Loading';
import { Calendar, Users, ArrowRightIcon, CheckCircle, BookOpen, Loader2 } from 'lucide-react';
import StudentScheduleModal from './StudentScheduleModal';

const ClassCard = ({ classItem }) => {
  const { _id, name, classCode, preferredTeacher, endAt } = classItem;
  const isEnded = endAt && new Date() > new Date(endAt);

  return (
    <div className="flex flex-col bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-purple-200 h-full group">
      <div className={`h-2 ${isEnded ? 'bg-green-500' : 'bg-purple-600'}`}></div>
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-bold text-gray-800 line-clamp-2 group-hover:text-purple-700 transition-colors">
              {name}
            </h3>
        </div>
        <div className="mb-5">
            {isEnded ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                    Đã hoàn thành
                </span>
            ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                    <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                    Đang học
                </span>
            )}
        </div>
        <div className="space-y-3 mt-auto pt-4 border-t border-gray-50">
          <div className="flex items-center text-gray-600 text-sm">
            <Users className="w-4 h-4 mr-2 text-purple-400 flex-shrink-0" />
            <span className="truncate">
                <span className="font-medium text-gray-700">GV:</span> {preferredTeacher?.profile?.fullname || 'Chưa cập nhật'}
            </span>
          </div>
        </div>
      </div>
      <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
        <button 
          className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all shadow-sm hover:shadow-md text-white
            ${isEnded ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'}
          `}
        >
          Xem chi tiết
          <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

const MyClassesPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams(); 
  
  // 
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  
  const [isPageLoading, setIsPageLoading] = useState(true); 
  const [isClassesLoading, setIsClassesLoading] = useState(false); 
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);

  const currentStudentId = searchParams.get('studentId') || '';

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsPageLoading(true);
        const res = await api.learner.getAllMyStudents();
        const studentList = res.data.data || [];
        setStudents(studentList);

        if (studentList.length > 0) {
          const isValidId = currentStudentId && studentList.some(s => s._id === currentStudentId);
          
          if (!isValidId) {
            setSearchParams({ studentId: studentList[0]._id }, { replace: true });
          }
        }
      } catch (err) {
        setError("Lỗi khi tải danh sách học viên.");
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchStudents();
  }, []); 


  useEffect(() => {
    if (!currentStudentId) {
      setClasses([]);
      return;
    }

    const fetchClasses = async () => {
      try {
        setIsClassesLoading(true);
        setError(null);
        const res = await api.learner.getMyEnrolledClasses(currentStudentId);
        const safeList = (res.data.data.classes ?? []).filter(c => c);
        setClasses(safeList);
      } catch (err) {
        setError("Lỗi khi tải danh sách lớp học.");
      } finally {
        setIsClassesLoading(false);
      }
    };

    fetchClasses();
  }, [currentStudentId]); 

  const handleStudentChange = (e) => {
    const newId = e.target.value;
    setSearchParams({ studentId: newId });
  };

  const handleClassClick = (classId) => {
    navigate(`/learner/${currentStudentId}/classes/${classId}`);
  };

  if (isPageLoading) {
    return <Loading fullscreen={true} message="Đang tải dữ liệu học viên..." />;
  }

  return (
    <div className="container mx-auto p-6 font-inter min-h-screen bg-gray-50/30">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Lớp học của tôi</h1>
        <p className="text-gray-500 text-sm mt-1">Quản lý và theo dõi tiến độ các lớp học</p>
      </div>

      {/* Action Bar */}
      <div className="mb-8 p-5 bg-white shadow-sm rounded-xl border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center w-full md:w-auto">
          <label htmlFor="student-select" className="text-sm font-bold text-gray-700 mr-3 uppercase tracking-wide whitespace-nowrap">
            Học viên:
          </label>
          <div className="relative w-full md:w-72">
            <select
                id="student-select"
                value={currentStudentId} 
                onChange={handleStudentChange} 
                className="block w-full p-2.5 pl-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none cursor-pointer hover:bg-gray-100"
                disabled={students.length === 0}
            >
                {students.length === 0 ? (
                  <option value="">Không tìm thấy học viên</option>
                ) : (
                  students.map(student => (
                    <option key={student._id} value={student._id}>
                      {student.name}
                    </option>
                  ))
                )}
            </select>
          </div>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={!currentStudentId}
          className="inline-flex items-center justify-center w-full md:w-auto px-5 py-2.5 bg-white text-gray-700 border border-gray-300 font-medium rounded-lg hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-sm"
        >
          <Calendar className="w-5 h-5 mr-2 text-gray-400 group-hover:text-purple-600 transition-colors" />
          Xem lịch tổng quan
        </button>
      </div>

      {error ? (
        <div className="text-red-600 bg-red-50 p-4 rounded-lg border border-red-100 text-center flex items-center justify-center gap-2">
            <span className="font-semibold">Lỗi:</span> {error}
        </div>
      ) : (
        <div className="relative min-h-[300px]">
            {isClassesLoading && (
                <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] flex flex-col items-center justify-center rounded-xl transition-all">
                    <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-3" />
                    <span className="text-sm font-medium text-purple-700">Đang cập nhật danh sách...</span>
                </div>
            )}

            {!isClassesLoading && classes.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg font-medium">Học viên này chưa đăng ký lớp học nào.</p>
                    <p className="text-gray-400 text-sm mt-2">Vui lòng đăng ký khóa học mới để bắt đầu.</p>
                </div>
            ) : (
                <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 transition-opacity duration-200 ${isClassesLoading ? 'opacity-50' : 'opacity-100'}`}>
                    {classes.map(classItem => (
                        <div 
                        key={classItem._id} 
                        onClick={() => handleClassClick(classItem._id)} 
                        className="cursor-pointer h-full"
                        >
                        <ClassCard classItem={classItem} />
                        </div>
                    ))}
                </div>
            )}
        </div>
      )}

      {currentStudentId && (
        <StudentScheduleModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          studentId={currentStudentId}
        />
      )}
    </div>
  );
};

export default MyClassesPage;