import React, { useState, useEffect } from 'react';
import { X, Loader2, UserPlus, Calendar, Clock, Users, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../../../utils/api';
import { getLevelFromScore } from '../../../../utils/scoreToLevel';
import moment from 'moment';

// Toast Notification Component
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
    <div className={`fixed top-4 right-4 z-[60] flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${styles[type]} transform transition-all duration-300 ease-out`}>
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

function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, isLoading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm transition-opacity duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-200 scale-100">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {title}
              </h3>
              <p className="text-sm text-gray-600">
                {message}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? "Đang xử lý..." : "Xác nhận"}
          </button>
        </div>
      </div>
    </div>
  );
}

const ClassSelectionModal = ({ isOpen, onClose, student, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [targetLevel, setTargetLevel] = useState(null);
  const [processingClassId, setProcessingClassId] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    classId: null,
    className: ''
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

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
      showToast("Lỗi khi tải danh sách lớp. Vui lòng thử lại.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToClassClick = (classId, className) => {
    setConfirmDialog({
      isOpen: true,
      classId,
      className
    });
  };

  const handleAddToClassConfirm = async () => {
    const { classId } = confirmDialog;
    setProcessingClassId(classId);

    try {
      const payload = {
        studentId: student._id
      };

      await api.admin.class.addStudentToClass(classId, payload);

      setConfirmDialog({ isOpen: false, classId: null, className: '' });
      showToast("Xếp lớp thành công!", "success");

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err) {
      showToast(err.response?.data?.message || "Lỗi khi thêm học viên vào lớp", "error");
      setConfirmDialog({ isOpen: false, classId: null, className: '' });
    } finally {
      setProcessingClassId(null);
    }
  };

  const handleConfirmDialogClose = () => {
    setConfirmDialog({ isOpen: false, classId: null, className: '' });
  };

  if (!isOpen) return null;

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={handleConfirmDialogClose}
        onConfirm={handleAddToClassConfirm}
        title="Xác nhận xếp lớp"
        message={`Bạn có chắc chắn muốn xếp học viên "${student?.name}" vào lớp "${confirmDialog.className}"?`}
        isLoading={processingClassId === confirmDialog.classId}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
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
                                ({Math.floor(sch.startMinute / 60)}h{sch.startMinute % 60})
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
                        onClick={() => handleAddToClassClick(cls._id, cls.name)}
                        disabled={processingClassId === cls._id}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center disabled:opacity-70 transition-colors"
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
    </>
  );
};

export default ClassSelectionModal;