import React, { useState, useEffect } from "react";
import api from "../../../utils/api";
import { Loader2, X, Users, Search, AlertTriangle, CheckCircle, AlertOctagon, ArrowLeft, Check } from "lucide-react";

// Toast Component
const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: { bg: "bg-green-500", Icon: CheckCircle },
    error: { bg: "bg-red-500", Icon: AlertTriangle },
    warning: { bg: "bg-amber-500", Icon: AlertTriangle },
    info: { bg: "bg-blue-500", Icon: AlertTriangle }
  };

  const { bg, Icon } = styles[type] || styles.info;

  return (
    <div className={`fixed top-4 right-4 ${bg} text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 z-[100] animate-slide-in min-w-[320px] max-w-md`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="font-medium flex-1">{message}</span>
      <button onClick={onClose} className="ml-2 hover:bg-white/20 rounded p-1 transition">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Final Confirmation Dialog
const FinalConfirmDialog = ({ isOpen, onClose, onConfirm, teacherName, sessionsCount, hasConflicts, updatePreferred }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg animate-scale-in">
        <div className="p-6">
          <div className={`flex items-center justify-center w-14 h-14 rounded-full mx-auto mb-4 ${hasConflicts ? 'bg-orange-100' : 'bg-purple-100'}`}>
            {hasConflicts ? (
              <AlertTriangle className="w-7 h-7 text-orange-600" />
            ) : (
              <CheckCircle className="w-7 h-7 text-purple-600" />
            )}
          </div>
          
          <h3 className="text-xl font-bold text-gray-800 text-center mb-3">
            {hasConflicts ? "Xác nhận bỏ qua xung đột?" : "Xác nhận thay đổi giáo viên"}
          </h3>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Giáo viên mới:</span>
              <span className="font-semibold text-gray-900">{teacherName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Số buổi cập nhật:</span>
              <span className="font-semibold text-purple-600">{sessionsCount} buổi</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Làm GV chủ nhiệm:</span>
              <span className={`font-semibold ${updatePreferred ? 'text-green-600' : 'text-gray-500'}`}>
                {updatePreferred ? "Có" : "Không"}
              </span>
            </div>
          </div>

          {hasConflicts && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-orange-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Giáo viên có xung đột lịch. Hệ thống sẽ vẫn gán lịch cho giáo viên này.</span>
              </p>
            </div>
          )}

          <p className="text-center text-gray-600 text-sm mb-6">
            Bạn có chắc chắn muốn thực hiện thay đổi này?
          </p>
        </div>
        
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 font-medium rounded-lg transition shadow-sm ${
              hasConflicts 
                ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              Xác nhận
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

const getFirstUpcomingSessionNo = (sessions) => {
  if (!sessions || sessions.length === 0) return null;
  const now = new Date();
  const upcoming = sessions
    .filter(s => new Date(s.startAt) > now && s.status === 'scheduled')
    .sort((a, b) => a.sessionNo - b.sessionNo);
  return upcoming[0]?.sessionNo || null;
};

const ChangeTeacherModal = ({ isOpen, onClose, classData, sessions, onTeacherChanged }) => {
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [teachers, setTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [newTeacherId, setNewTeacherId] = useState("");
  const [updatePreferred, setUpdatePreferred] = useState(true);
  
  const [preview, setPreview] = useState(null);
  const [appliedScope, setAppliedScope] = useState({}); 
  const [confirmAllowBlocked, setConfirmAllowBlocked] = useState(false);

  // Toast & Confirm states
  const [toast, setToast] = useState(null);
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchTeachers = async () => {
        setLoading(true);
        try {
          const res = await api.admin.getTeachers({ limit: 1000, status: "true" });
          const currentTeacherId = classData.preferredTeacher;
          setTeachers(res.data.data.teachers.filter(t => t._id !== currentTeacherId));
        } catch (err) {
          setToast({ message: "Không thể tải danh sách giáo viên.", type: "error" });
        } finally {
          setLoading(false);
        }
      };
      fetchTeachers();
    }
  }, [isOpen, classData.preferredTeacher]);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setNewTeacherId("");
      setUpdatePreferred(true);
      setPreview(null);
      setError(null);
      setSearchTerm("");
      setConfirmAllowBlocked(false);
      setAppliedScope({});
      setToast(null);
      setShowFinalConfirm(false);
    }
  }, [isOpen]);

  const handlePreview = async () => {
    if (!newTeacherId) {
      setToast({ message: "Vui lòng chọn một giáo viên mới.", type: "warning" });
      return;
    }
    
    setLoading(true);
    setError(null);
    setPreview(null);
    setConfirmAllowBlocked(false);

    let scope = { onlyStatus: ["scheduled"] }; 
    const firstUpcomingNo = getFirstUpcomingSessionNo(sessions);
    
    if (firstUpcomingNo) {
      scope.fromSessionNo = firstUpcomingNo;
    } else {
      scope.fromSessionNo = 999999; 
    }

    setAppliedScope(scope);

    const payload = {
      newTeacher: newTeacherId,
      scope: scope,
      check: { skill: true, conflict: true },
    };

    try {
      const res = await api.admin.class.previewChangeTeacher(classData._id, payload);
      setPreview(res.data.preview);
      setStep(2); 
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Lỗi khi xem trước thay đổi.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = () => {
    const selectedTeacher = teachers.find(t => t._id === newTeacherId);
    const teacherName = selectedTeacher?.profile?.fullname || selectedTeacher?.username || "Giáo viên";
    
    setShowFinalConfirm(true);
  };

  const handleApply = async () => {
    setShowFinalConfirm(false);
    setLoading(true);
    setError(null);
    
    const payload = {
      newTeacher: newTeacherId,
      scope: appliedScope, 
      check: { skill: true, conflict: true },
      updatePreferred: updatePreferred, 
      allowBlocked: confirmAllowBlocked, 
    };
    
    try {
      await api.admin.class.applyChangeTeacher(classData._id, payload);
      setToast({ message: "Đổi giáo viên thành công!", type: "success" });
      
      setTimeout(() => {
        onTeacherChanged(); 
        onClose(); 
      }, 1500);
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Lỗi khi áp dụng thay đổi.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const hasSkillError = preview?.blocked?.some(b => b.reason === "NO_SKILL_GLOBAL");
  const hasConflictError = preview?.blocked?.some(b => b.reason === "TEACHER_BUSY");
  const isApplyDisabled = loading || hasSkillError || (hasConflictError && !confirmAllowBlocked);

  if (!isOpen) return null;

  const filteredTeachers = teachers.filter(t =>
    (t.profile?.fullname || t.username).toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedTeacher = teachers.find(t => t._id === newTeacherId);
  const selectedTeacherName = selectedTeacher?.profile?.fullname || selectedTeacher?.username || "";

  return (
    <>
      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
        .animate-scale-in { animation: scale-in 0.2s ease-out; }
      `}</style>

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <FinalConfirmDialog
        isOpen={showFinalConfirm}
        onClose={() => setShowFinalConfirm(false)}
        onConfirm={handleApply}
        teacherName={selectedTeacherName}
        sessionsCount={preview?.summary?.toUpdate || 0}
        hasConflicts={confirmAllowBlocked}
        updatePreferred={updatePreferred}
      />

      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.6)] backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-2xl p-6 bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-800">
              {step === 1 ? "Thay đổi Giáo viên (Các buổi sắp tới)" : "Xác nhận thay đổi"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 rounded-full hover:bg-gray-100 hover:text-gray-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 pr-1">
            
            {step === 1 && (
              <div className="space-y-5">
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">1. Tìm giáo viên mới</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Nhập tên hoặc email giáo viên..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">2. Chọn giáo viên thay thế <span className="text-red-500 ml-1">*</span></label>
                  <div className="h-60 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-gray-50/50 space-y-1">
                    {loading && <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-purple-600" /></div>}
                    
                    {!loading && filteredTeachers.length === 0 && (
                      <div className="text-center p-8 text-gray-500">
                        <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                        <p>Không tìm thấy giáo viên nào phù hợp</p>
                      </div>
                    )}

                    {filteredTeachers.map(t => (
                      <label 
                        key={t._id} 
                        className={`flex items-center p-3 rounded-lg cursor-pointer border transition-all 
                          ${newTeacherId === t._id 
                            ? 'bg-purple-50 border-purple-300 ring-1 ring-purple-300' 
                            : 'border-transparent hover:bg-white hover:shadow-sm'}`}
                      >
                        <input
                          type="radio"
                          name="teacher"
                          value={t._id}
                          checked={newTeacherId === t._id}
                          onChange={(e) => setNewTeacherId(e.target.value)}
                          className="h-4 w-4 accent-purple-600"
                        />
                        <img 
                          src={t.profile.photo || `https://ui-avatars.com/api/?name=${t.profile?.fullname || t.username}&background=ede9fe&color=7c3aed`} 
                          alt={t.profile?.fullname}
                          className="w-10 h-10 rounded-full ml-3 mr-3 object-cover border border-gray-200"
                        />
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{t.profile?.fullname || t.username}</p>
                          <p className="text-xs text-gray-500">{t.email}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <label className="flex items-start cursor-pointer group">
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        checked={updatePreferred}
                        onChange={(e) => setUpdatePreferred(e.target.checked)}
                        className="w-4 h-4 accent-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <span className="font-bold text-gray-900 group-hover:text-purple-700">Cập nhật làm Giáo viên Chính (Chủ nhiệm)</span>
                      <p className="text-gray-600 text-xs mt-1">
                        Nếu chọn: Giáo viên này sẽ thay thế giáo viên cũ trong hồ sơ lớp. <br/>
                        Nếu không chọn: Chỉ dạy thay các buổi trong lịch (Hồ sơ lớp giữ nguyên GV cũ).
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {step === 2 && preview && (
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="font-semibold text-blue-900 mb-1">Tổng quan thay đổi</h3>
                  <p className="text-sm text-blue-700">Hệ thống sẽ chỉ áp dụng cho các buổi học <b>chưa diễn ra</b>.</p>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 rounded-xl border border-green-200 text-center shadow-sm">
                    <p className="text-3xl font-bold text-green-600">{preview.summary.toUpdate}</p>
                    <p className="text-sm font-medium text-green-800 uppercase tracking-wide mt-1">Sẽ cập nhật</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center shadow-sm">
                    <p className="text-3xl font-bold text-gray-500">{preview.summary.unchanged}</p>
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mt-1">Giữ nguyên</p>
                  </div>
                  <div className={`p-4 rounded-xl border text-center shadow-sm ${preview.summary.blocked > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                    <p className={`text-3xl font-bold ${preview.summary.blocked > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                      {preview.summary.blocked}
                    </p>
                    <p className={`text-sm font-medium uppercase tracking-wide mt-1 ${preview.summary.blocked > 0 ? 'text-red-800' : 'text-gray-500'}`}>
                      Xung đột
                    </p>
                  </div>
                </div>

                {preview.summary.blocked > 0 && (
                  <div className={`p-4 rounded-lg border text-sm ${hasSkillError ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'}`}>
                    <div className="flex items-start gap-3">
                      {hasSkillError ? <AlertOctagon className="w-5 h-5 text-red-600 shrink-0" /> : <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0" />}
                      <div>
                        <p className={`font-bold mb-2 ${hasSkillError ? 'text-red-800' : 'text-orange-800'}`}>
                          Phát hiện {preview.summary.blocked} vấn đề:
                        </p>
                        <ul className="list-disc pl-4 space-y-1.5 text-gray-700">
                          {hasSkillError && (
                            <li className="text-red-700 font-medium">
                              Giáo viên không đủ kỹ năng chuyên môn (Lỗi: NO_SKILL_GLOBAL).
                            </li>
                          )}
                          {hasConflictError && (
                            <li>
                              Giáo viên bị trùng lịch dạy tại các buổi số: <span className="font-semibold">{preview.blocked.filter(b => b.reason === "TEACHER_BUSY").map(b => b.sessionNo).join(", ")}</span>.
                            </li>
                          )}
                        </ul>

                        {hasConflictError && !hasSkillError && (
                          <div className="mt-4 pt-3 border-t border-orange-200">
                            <label className="flex items-start cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={confirmAllowBlocked}
                                onChange={(e) => setConfirmAllowBlocked(e.target.checked)}
                                className="mt-1 h-4 w-4 accent-orange-600 text-orange-600 rounded focus:ring-orange-500"
                              />
                              <div className="ml-2">
                                <span className="font-bold text-gray-900 block">Tiếp tục đổi bất chấp trùng lịch</span>
                                <span className="text-xs text-gray-500">Hệ thống sẽ vẫn gán lịch cho giáo viên này.</span>
                              </div>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2" />
                {error}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-between items-center flex-shrink-0">
            {step === 2 ? (
              <button
                onClick={() => setStep(1)}
                className="flex items-center text-sm font-medium text-gray-600 hover:text-purple-600 transition"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại bước 1
              </button>
            ) : (
              <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">
                Hủy bỏ
              </button>
            )}

            {step === 1 ? (
              <button
                onClick={handlePreview}
                disabled={loading || !newTeacherId}
                className="inline-flex items-center px-6 py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Users className="w-5 h-5 mr-2" />}
                Xem Trước Thay Đổi
              </button>
            ) : (
              <button
                onClick={handleApplyClick}
                disabled={isApplyDisabled}
                className={`inline-flex items-center px-6 py-2.5 font-medium rounded-lg transition shadow-md
                  ${isApplyDisabled 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : confirmAllowBlocked 
                      ? 'bg-orange-600 text-white hover:bg-orange-700 hover:shadow-lg' 
                      : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg' 
                  }`}
              >
                {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle className="w-5 h-5 mr-2" />}
                {confirmAllowBlocked ? "Xác nhận (Bỏ qua lỗi)" : "Xác nhận & Lưu"}
              </button>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default ChangeTeacherModal;