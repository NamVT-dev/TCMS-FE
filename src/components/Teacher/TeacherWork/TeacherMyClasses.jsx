import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AcademicCapIcon, ClockIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import api from '../../../utils/api'; 
import Loading from '../../UI/Loading';


const ClassCard = ({ classItem }) => {
  const { _id, name, classCode, course, weeklySchedules } = classItem;

 
  const formatSchedule = (schedules) => {
    const days = ["CN", "Th 2", "Th 3", "Th 4", "Th 5", "Th 6", "Th 7"];
    const minutesToTime = (min) => {
      const h = Math.floor(min / 60).toString().padStart(2, '0');
      const m = (min % 60).toString().padStart(2, '0');
      return `${h}:${m}`;
    };
    return schedules.map(s => 
      `${days[s.dayOfWeek]} (${minutesToTime(s.startMinute)} - ${minutesToTime(s.endMinute)})`
    ).join(' | ');
  };

  return (
   
    <div 
      className="flex flex-col bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl"
    >
     
      <div className="h-2 bg-purple-600"></div>

      
      <div className="p-6 flex-grow">
        
        <Link to={`/teacher/my-classes/${_id}`}>
          <h3 className="text-xl font-bold text-purple-800 hover:text-purple-600 transition-colors mb-2">
            {name}
          </h3>
        </Link>
        
        <p className="text-sm font-medium text-gray-500 mb-5">{classCode}</p>
        
        <div className="space-y-3">
          <div className="flex items-center text-gray-700">
            
            <AcademicCapIcon className="w-5 h-5 mr-3 text-purple-500 flex-shrink-0" />
            <span><span className="font-medium">Khóa:</span> {course.name} ({course.level})</span>
          </div>
          <div className="flex items-start text-gray-700">
           
            <ClockIcon className="w-5 h-5 mr-3 text-purple-500 mt-1 flex-shrink-0" />
            <span className="flex-1"><span className="font-medium">Lịch:</span> {formatSchedule(weeklySchedules)}</span>
          </div>
        </div>
      </div>

     
      <div className="p-5 bg-gray-50/70 border-t border-gray-100 flex justify-end">
        <Link 
          to={`/teacher/my-classes/${_id}`} 
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-sm hover:shadow-md"
        >
          Xem chi tiết
          <ArrowRightIcon className="w-4 h-4 ml-2" />
        </Link>
      </div>
    </div>
  );
};

// --- Component chính của trang (Không thay đổi logic) ---
const TeacherMyClasses = () => {
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClasses = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.teacher.getMyClasses();
        setClasses(res.data.data.teacher.class);
      } catch (err) {
        console.error("Lỗi khi tải danh sách lớp học:", err);
        setError(err.message || "Không thể tải danh sách lớp học.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchClasses();
  }, []);

  if (isLoading) {
    return <Loading fullscreen={true} message="Đang tải danh sách lớp..." />;
  }

  if (error) {
    return <div className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>;
  }

  return (
    // Thêm padding cho container
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Lớp học của tôi</h1>

      {classes.length === 0 ? (
        <p className="text-gray-600">Bạn hiện không được phân công lớp học nào.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {classes.map(classItem => (
            <ClassCard key={classItem._id} classItem={classItem} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherMyClasses;