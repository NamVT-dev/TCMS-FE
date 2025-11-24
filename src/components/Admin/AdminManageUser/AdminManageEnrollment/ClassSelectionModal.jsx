import React, { useState, useEffect } from 'react';
import { X, Loader2, UserPlus, Calendar, Clock, Users, CheckCircle } from 'lucide-react';
import api from '../../../../utils/api';
import { getLevelFromScore } from '../../../../utils/scoreToLevel'; 
import moment from 'moment';

const ClassSelectionModal = ({ isOpen, onClose, student, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [targetLevel, setTargetLevel] = useState(null);
  const [processingClassId, setProcessingClassId] = useState(null); 

  useEffect(() => {
    if (isOpen && student) {
      fetchSuitableClasses();
    }
  }, [isOpen, student]);

  const fetchSuitableClasses = async () => {
    setLoading(true);
    try {
      
      const categoryObj = student.category && student.category.length > 0 ? student.category[0] : null;
      const categoryName = categoryObj?.name || '';
      const categoryId = categoryObj?._id || '';
      const score = student.testScore;

      const level = getLevelFromScore(categoryName, score);
      setTargetLevel(level);

      
      const res = await api.admin.class.listClasses({ 
        limit: 100, 
        status: 'approved',
        
      });

      const allClasses = res.data.data.classes || [];

      
      const suitableClasses = allClasses.filter(cls => {
        
        const isSameCategory = cls.course?.category === categoryId || cls.course?.category?._id === categoryId;
        
        
        const isSameLevel = level ? cls.course?.level === level : true;

        const isNotFull = (cls.currentSize || 0) < cls.maxStudent;
        
        const isActive = cls.status === 'approved';

        return isSameCategory && isSameLevel && isActive && isNotFull;
      });

      setClasses(suitableClasses);

    } catch (err) {
      console.error("Lỗi tải lớp:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToClass = async (classId) => {
    if(!confirm("Xác nhận xếp học viên vào lớp này?")) return;

    setProcessingClassId(classId);
    try {
      const payload = {
        studentId: student._id
      };

      await api.admin.class.addStudentToClass(classId, payload);
      
      alert("Xếp lớp thành công!");
      onSuccess(); 
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi thêm học viên vào lớp");
    } finally {
      setProcessingClassId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Xếp lớp cho: {student?.name}</h2>
            <div className="flex gap-3 mt-1 text-sm">
              <span className="text-gray-600">Điểm Test: <span className="font-bold text-purple-600">{student?.testScore}</span></span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">Chương trình: <b>{student?.category?.[0]?.name}</b></span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">Level phù hợp: <b className="text-indigo-600">{targetLevel || "Chưa xác định"}</b></span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 bg-gray-50">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              <span className="mt-2 text-gray-500">Đang tìm lớp phù hợp...</span>
            </div>
          ) : classes.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-2">Không tìm thấy lớp <b>{targetLevel}</b> nào đang mở hoặc còn chỗ.</p>
              <button 
                onClick={fetchSuitableClasses}
                className="text-purple-600 hover:underline text-sm"
              >
                Thử tải lại
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {classes.map((cls) => (
                <div key={cls._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-800 text-lg line-clamp-2" title={cls.name}>
                      {cls.name}
                    </h3>
                    <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">
                      {cls.classCode}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 space-y-2 mb-4 flex-1">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      <span>Level: <b>{cls.course?.level}</b></span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                      <span>KG: {moment(cls.startAt).format("DD/MM/YYYY")}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-orange-500" />
                      <span>GV: {cls.preferredTeacher?.profile?.fullname || "Chưa xếp"}</span>
                    </div>
                    
                    <div className="flex items-start mt-2">
                      <Clock className="w-4 h-4 mr-2 text-purple-500 mt-0.5" />
                      <div className="flex flex-wrap gap-1">
                        {cls.weeklySchedules && cls.weeklySchedules.length > 0 ? (
                           cls.weeklySchedules.map((sch, idx) => (
                             <span key={idx} className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded text-xs border border-purple-100">
                               T{sch.dayOfWeek === 0 ? 'CN' : sch.dayOfWeek + 1} 
                               ({Math.floor(sch.startMinute/60)}h{sch.startMinute%60})
                             </span>
                           ))
                        ) : (
                          <span className="italic text-gray-400">Chưa có lịch</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex justify-between items-center mt-auto">
                     <div className="text-xs text-gray-500">
                        Sĩ số: <b className={(cls.student?.length || 0) >= cls.maxStudent ? "text-red-500" : "text-green-600"}>
                           {cls.student?.length || 0}/{cls.maxStudent}
                        </b>
                     </div>
                     <button
                        onClick={() => handleAddToClass(cls._id)}
                        disabled={processingClassId === cls._id}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center disabled:opacity-70"
                     >
                        {processingClassId === cls._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Chọn lớp này
                          </>
                        )}
                     </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassSelectionModal;