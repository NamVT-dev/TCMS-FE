import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import Loading from '../UI/Loading';
import { Calendar, Users, Clock, ArrowRightIcon } from 'lucide-react';
import StudentScheduleModal from './StudentScheduleModal';

// === Component Card Lớp học ===
const ClassCard = ({ classItem }) => {
  const { _id, name, classCode, preferredTeacher, startAt, endAt } = classItem;
  return (
    <div className="flex flex-col bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl">
      <div className="h-2 bg-purple-600"></div>
      <div className="p-6 flex-grow">
        <h3 className="text-xl font-bold text-purple-800 mb-2">{name}</h3>
        <p className="text-sm font-medium text-gray-500 mb-5">{classCode}</p>
        <div className="space-y-3">
          <div className="flex items-center text-gray-700">
            <Users className="w-5 h-5 mr-3 text-purple-500 flex-shrink-0" />
            <span><span className="font-medium">Giáo viên:</span> {preferredTeacher?.profile?.fullname || 'N/A'}</span>
          </div>
          <div className="flex items-start text-gray-700">
            <Clock className="w-5 h-5 mr-3 text-purple-500 mt-1 flex-shrink-0" />
            <span className="flex-1"><span className="font-medium">Thời gian:</span> 
              {new Date(startAt).toLocaleDateString('vi-VN')} - {new Date(endAt).toLocaleDateString('vi-VN')}
            </span>
          </div>
        </div>
      </div>
      <div className="p-5 bg-gray-50/70 border-t border-gray-100 flex justify-end">
        <button 
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-sm hover:shadow-md"
        >
          Xem chi tiết
          <ArrowRightIcon className="w-4 h-4 ml-2" />
        </button>
      </div>
    </div>
  );
};


// === Component Trang chính ===
const MyClassesPage = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClassesLoading, setIsClassesLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 1. Tải danh sách tất cả student (dùng API: /learner)
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        const res = await api.learner.getAllMyStudents();
        setStudents(res.data.data); // API trả về mảng data
        if (res.data.data && res.data.data.length > 0) {
          setSelectedStudentId(res.data.data[0]._id);
        }
      } catch (err) {
        setError("Lỗi khi tải danh sách học viên.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // 2. Tải danh sách lớp học CỦA student được chọn
  useEffect(() => {
    if (!selectedStudentId) {
      setClasses([]);
      return;
    }
    const fetchClasses = async () => {
      try {
        setIsClassesLoading(true);
        setError(null); // Xóa lỗi cũ
        // Dùng API đã sửa: /:id/classes
        const res = await api.learner.getMyEnrolledClasses(selectedStudentId);
        setClasses(res.data.data.classes); // API trả về { data: { classes: [...] } }
      } catch (err) {
        setError("Lỗi khi tải danh sách lớp học."); // Đây là lỗi bạn thấy
      } finally {
        setIsClassesLoading(false);
      }
    };
    fetchClasses();
  }, [selectedStudentId]);

  // Hàm xử lý khi bấm vào Card
  const handleClassClick = (classId) => {
    // Điều hướng đến trang chi tiết (route đã thêm ở LearnerLayout)
    navigate(`/learner/${selectedStudentId}/classes/${classId}`);
  };

  if (isLoading) {
    return <Loading fullscreen={true} message="Đang tải dữ liệu học viên..." />;
  }

  return (
    <div className="container mx-auto p-6">
      {/* 1. Bộ lọc chọn học viên và nút xem lịch */}
      <div className="mb-6 p-4 bg-white shadow-lg rounded-xl border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center w-full md:w-auto">
          <label htmlFor="student-select" className="text-lg font-semibold text-gray-700 mr-3">
            Chọn học viên:
          </label>
          <select
            id="student-select"
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="block w-full md:w-64 p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500"
            disabled={students.length === 0}
          >
            {students.length === 0 ? (
              <option>Không tìm thấy học viên</option>
            ) : (
              students.map(student => (
                <option key={student._id} value={student._id}>
                  {student.name}
                </option>
              ))
            )}
          </select>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={!selectedStudentId}
          className="inline-flex items-center justify-center w-full md:w-auto px-5 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Calendar className="w-5 h-5 mr-2" />
          Xem lịch tổng quan
        </button>
      </div>

      {/* 2. Lưới hiển thị các lớp học */}
      {isClassesLoading ? (
        <Loading fullscreen={false} message="Đang tải lớp học..." />
      ) : error ? (
        <div className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>
      ) : classes.length === 0 ? (
        <p className="text-gray-600 p-4 bg-white rounded-lg shadow-md">
          Học viên này chưa đăng ký lớp học nào.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {classes.map(classItem => (
            <div 
              key={classItem._id} 
              onClick={() => handleClassClick(classItem._id)} 
              className="cursor-pointer"
            >
              <ClassCard classItem={classItem} />
            </div>
          ))}
        </div>
      )}

      {/* 3. Modal Lịch học */}
      {selectedStudentId && (
        <StudentScheduleModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          studentId={selectedStudentId}
        />
      )}
    </div>
  );
};

export default MyClassesPage;