import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  UserGroupIcon, 
  CalendarDaysIcon, 
  BookOpenIcon, 
  UserCircleIcon,
  ChevronDownIcon,
  UserIcon ,
} from '@heroicons/react/24/outline';
import api from '../../utils/api';
import Loading from '../UI/Loading';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const StudentClassDetail = () => {
  const { studentId, classId } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isSessionsExpanded, setIsSessionsExpanded] = useState(false);
  const [isStudentsExpanded, setIsStudentsExpanded] = useState(false);

  useEffect(() => {
    if (!studentId || !classId) {
      navigate('/learner/my-classes'); 
      return;
    }

    const fetchClassDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.learner.getStudentClassDetail(studentId, classId); 
        setClassData(res.data.data); 
      } catch (err) {
        setError(err.message || "Không thể tải chi tiết lớp học.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassDetail();
  }, [studentId, classId, navigate]);

  if (isLoading) {
    return <Loading fullscreen={true} message="Đang tải chi tiết lớp..." />;
  }

  if (error) {
    return <div className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>;
  }

  if (!classData) {
    return <p className="text-gray-600">Không tìm thấy dữ liệu lớp học.</p>;
  }

  const { classInfo, sessions, enrollments } = classData;

  return (
    <div className="container mx-auto p-4 md:p-6">
      <button
        onClick={() => navigate('/learner/my-classes')}
        className="flex items-center text-purple-600 hover:text-purple-800 font-medium mb-6"
      >
        <ArrowLeftIcon className="w-5 h-5 mr-2" />
        Quay lại Lớp học của tôi
      </button>

      <div className="grid grid-cols-1 gap-6">
        
        {/* THẺ 1: THÔNG TIN CHUNG */}
        <div className="bg-white p-6 shadow-lg rounded-xl border border-gray-100 h-fit">
          <h2 className="text-2xl font-bold text-gray-800 mb-5">{classInfo.name}</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <BookOpenIcon className="w-5 h-5 mr-3 text-purple-500 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Khóa học</p>
                <p className="font-semibold text-gray-800">{classInfo.course.name}</p>
              </div>
            </div>
           
            <div className="flex items-start">
              <UserIcon className="w-5 h-5 mr-3 text-purple-500 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Giáo viên</p>
                <p className="font-semibold text-gray-800">{classInfo.preferredTeacher?.profile?.fullname || 'N/A'}</p>
              </div>
            </div>
          
            <div className="flex items-start">
              <UserGroupIcon className="w-5 h-5 mr-3 text-purple-500 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Sĩ số</p>
                <p className="font-semibold text-gray-800">{enrollments.length} / {classInfo.maxStudent}</p>
              </div>
            </div>
            <div className="flex items-start">
              <CalendarDaysIcon className="w-5 h-5 mr-3 text-purple-500 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Thời gian</p>
                <p className="font-semibold text-gray-800">
                  {format(new Date(classInfo.startAt), 'dd/MM/yyyy')} - {format(new Date(classInfo.endAt), 'dd/MM/yyyy')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* THẺ 2: DANH SÁCH BUỔI HỌC */}
        <div className="bg-white p-6 shadow-lg rounded-xl border border-gray-100">
          <button
            onClick={() => setIsSessionsExpanded(!isSessionsExpanded)}
            className="flex justify-between items-center w-full"
          >
            <h2 className="text-2xl font-semibold text-gray-700">
              Các buổi học ({sessions.length})
            </h2>
            <ChevronDownIcon 
              className={`w-6 h-6 text-gray-500 transition-transform duration-200 ${
                isSessionsExpanded ? 'rotate-180' : 'rotate-0'
              }`} 
            />
          </button>
          
          <div className={`transition-all duration-300 ease-in-out ${isSessionsExpanded ? 'max-h-[450px] mt-4' : 'max-h-0 mt-0 overflow-hidden'}`}>
            <div className="overflow-y-auto" style={{ maxHeight: '450px' }}>
              {sessions.length > 0 ? (
                <ul className="divide-y divide-gray-200 pr-2">
                  {sessions.map((session, index) => (
                    <li key={session._id} className="py-4 flex justify-between items-center hover:bg-gray-50 rounded-md px-2">
                      <div className="flex items-center space-x-4">
                        <span className="font-bold text-purple-600 w-10 text-center text-lg">
                          B {session.sessionNo || (index + 1)}
                        </span>
                        <div className="border-l border-gray-200 pl-4">
                          <p className="font-semibold text-gray-800 capitalize">
                            {format(new Date(session.startAt), 'EEEE, dd/MM/yyyy', { locale: vi })}
                          </p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(session.startAt), 'HH:mm')} - {format(new Date(session.endAt), 'HH:mm')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-700">Phòng: {session.room.name}</p>
                        
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 pt-2">Chưa có buổi học nào được lên lịch cho lớp này.</p>
              )}
            </div>
          </div>
        </div>
        
        {/* THẺ 3: DANH SÁCH HỌC VIÊN */}
        <div className="bg-white p-6 shadow-lg rounded-xl border border-gray-100">
          <button
            onClick={() => setIsStudentsExpanded(!isStudentsExpanded)}
            className="flex justify-between items-center w-full"
          >
            <h2 className="text-2xl font-semibold text-gray-700">
              Bạn học ({enrollments.length})
            </h2>
            <ChevronDownIcon 
              className={`w-6 h-6 text-gray-500 transition-transform duration-200 ${
                isStudentsExpanded ? 'rotate-180' : 'rotate-0'
              }`} 
            />
          </button>
          
          <div className={`transition-all duration-300 ease-in-out ${isStudentsExpanded ? 'max-h-[400px] mt-4' : 'max-h-0 mt-0 overflow-hidden'}`}>
            <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
              {enrollments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-2">
                  {enrollments.map((enroll) => (
                    <div key={enroll._id} className="py-3 px-4 flex items-center space-x-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <UserCircleIcon className="w-8 h-8 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-800">{enroll.student?.name || 'Đang cập nhật'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 pt-2">Lớp học này chưa có học viên nào đăng ký.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentClassDetail;