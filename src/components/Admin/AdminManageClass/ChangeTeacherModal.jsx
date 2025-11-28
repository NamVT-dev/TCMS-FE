import React, { useState, useEffect } from "react";
import api from "../../../utils/api";
import { Loader2, X, Users, Search, AlertTriangle, CheckCircle } from "lucide-react";


const getFirstUpcomingSessionNo = (sessions) => {
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
  const [scopeType, setScopeType] = useState("future"); 
  const [updatePreferred, setUpdatePreferred] = useState(true);
  
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const fetchTeachers = async () => {
        setLoading(true);
        try {
          const res = await api.admin.getTeachers({ limit: 1000, status: "true" });
          const currentTeacherId = classData.preferredTeacher;
          setTeachers(res.data.data.teachers.filter(t => t._id !== currentTeacherId));
        } catch (err) {
          setError("Không thể tải danh sách giáo viên.");
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
      setScopeType("future");
      setUpdatePreferred(true);
      setPreview(null);
      setError(null);
      setSearchTerm("");
    }
  }, [isOpen]);

  
  const handlePreview = async () => {
    if (!newTeacherId) {
      setError("Vui lòng chọn một giáo viên mới.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setPreview(null);

    
    let scope = { onlyStatus: ["scheduled"] }; 
    if (scopeType === 'future') {
      const firstUpcomingNo = getFirstUpcomingSessionNo(sessions);
      if (firstUpcomingNo) {
        scope.fromSessionNo = firstUpcomingNo;
      } else {
        scope.fromSessionNo = 99999; 
      }
    }
    

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
      setError(err.response?.data?.message || "Lỗi khi xem trước.");
    } finally {
      setLoading(false);
    }
  };

  
  const handleApply = async () => {
    setLoading(true);
    setError(null);
    
    
    const payload = {
      newTeacher: newTeacherId,
      scope: preview.scope || { onlyStatus: ["scheduled"] }, 
      check: { skill: true, conflict: true },
      updatePreferred: updatePreferred,
      allowBlocked: false, 
    };
    
    
    if (scopeType === 'future') {
      const firstUpcomingNo = getFirstUpcomingSessionNo(sessions);
      if (firstUpcomingNo) {
        payload.scope.fromSessionNo = firstUpcomingNo;
      } else {
        payload.scope.fromSessionNo = 99999;
      }
    }
    
    try {
      await api.admin.class.applyChangeTeacher(classData._id, payload);
      alert("Đổi giáo viên thành công!");
      onTeacherChanged(); 
      onClose(); 
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi áp dụng thay đổi.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredTeachers = teachers.filter(t =>
    (t.profile?.fullname || t.username).toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.6)]"
      onClick={onClose}
    >
     
      <div
        className="relative w-full max-w-2xl p-6 bg-white rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {step === 1 ? "Thay đổi Giáo viên" : "Xem trước Thay đổi"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 rounded-full hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

      
        {step === 1 && (
          <div className="mt-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">1. Tìm giáo viên mới</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm theo tên hoặc email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">2. Chọn giáo viên thay thế</label>
              <div className="h-48 overflow-y-auto border border-gray-300 rounded-lg p-2 bg-gray-50">
                {loading && <Loader2 className="w-6 h-6 mx-auto animate-spin text-purple-600" />}
                {!loading && filteredTeachers.length === 0 && <p className="text-gray-500 text-center p-4">Không tìm thấy giáo viên.</p>}
                {filteredTeachers.map(t => (
                  <label 
                    key={t._id} 
                    className={`flex items-center p-3 rounded-md cursor-pointer hover:bg-purple-50 ${newTeacherId === t._id ? 'bg-purple-100 border border-purple-300' : ''}`}
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
                      className="w-8 h-8 rounded-full ml-3 mr-2 object-cover"
                    />
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">{t.profile?.fullname || t.username}</p>
                      <p className="text-gray-500">{t.email}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">3. Phạm vi áp dụng</label>
              <select
                value={scopeType}
                onChange={(e) => setScopeType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="future">Chỉ các buổi học SẮP TỚI</option>
                <option value="all">Tất cả buổi học (bao gồm cả quá khứ)</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={updatePreferred}
                  onChange={(e) => setUpdatePreferred(e.target.checked)}
                  className="h-4 w-4 accent-purple-600"
                />
                <span className="ml-2 text-sm text-gray-700">Cập nhật giáo viên này thành GV ưu tiên của lớp</span>
              </label>
            </div>

            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                onClick={handlePreview}
                disabled={loading || !newTeacherId}
                className="inline-flex items-center px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400"
              >
                {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Users className="w-5 h-5 mr-2" />}
                Xem Trước
              </button>
            </div>
          </div>
        )}

     
        {step === 2 && preview && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800">Kết quả xem trước:</h3>
            
            <div className="grid grid-cols-3 gap-4 my-4">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-center">
                <p className="text-3xl font-bold text-green-700">{preview.summary.toUpdate}</p>
                <p className="text-sm font-medium text-green-600">Sẽ cập nhật</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
                <p className="text-3xl font-bold text-gray-700">{preview.summary.unchanged}</p>
                <p className="text-sm font-medium text-gray-600">Giữ nguyên</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-center">
                <p className="text-3xl font-bold text-red-700">{preview.summary.blocked}</p>
                <p className="text-sm font-medium text-red-600">Bị chặn</p>
              </div>
            </div>

            {preview.summary.blocked > 0 && (
              <div className="bg-red-100 border border-red-300 p-3 rounded-md text-sm text-red-800">
                <p className="font-semibold">Lý do bị chặn:</p>
                <ul className="list-disc pl-5">
                
                  {preview.blocked.map(b => b.reason).includes("NO_SKILL_GLOBAL") && (
                    <li>Giáo viên không đủ kỹ năng (NO_SKILL_GLOBAL)</li>
                  )}
                  {preview.blocked.map(b => b.reason).includes("TEACHER_BUSY") && (
                    <li>Giáo viên bị trùng lịch (TEACHER_BUSY)</li>
                  )}
                </ul>
              </div>
            )}
            
            {error && <p className="text-sm text-red-600 my-4">{error}</p>}

            <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-6">
              <button
                onClick={() => setStep(1)}
                className="text-sm font-medium text-gray-600 hover:text-purple-600"
              >
                Quay lại
              </button>
              <button
                onClick={handleApply}
                disabled={loading || preview.summary.blocked > 0} 
                className="inline-flex items-center px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
              >
                {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle className="w-5 h-5 mr-2" />}
                Xác Nhận Đổi
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ChangeTeacherModal;