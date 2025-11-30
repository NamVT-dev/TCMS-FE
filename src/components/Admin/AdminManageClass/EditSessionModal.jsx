import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle, User, Home, Clock, Calendar, Ban, RefreshCw, CheckCircle, Loader2, AlertTriangle } from "lucide-react";
import api from "../../../utils/api";
import moment from "moment-timezone";

const TIMEZONE = "Asia/Ho_Chi_Minh";

// Toast Component
const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: { bg: "bg-green-500", Icon: CheckCircle },
    error: { bg: "bg-red-500", Icon: AlertCircle },
    warning: { bg: "bg-amber-500", Icon: AlertTriangle },
  };

  const { bg, Icon } = styles[type] || styles.success;

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

// Confirmation Dialog Component
const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, type = "warning" }) => {
  if (!isOpen) return null;

  const styles = {
    warning: { bg: "bg-amber-100", iconColor: "text-amber-600", btnBg: "bg-amber-600 hover:bg-amber-700" },
    danger: { bg: "bg-red-100", iconColor: "text-red-600", btnBg: "bg-red-600 hover:bg-red-700" },
    success: { bg: "bg-green-100", iconColor: "text-green-600", btnBg: "bg-green-600 hover:bg-green-700" }
  };

  const style = styles[type] || styles.warning;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-scale-in">
        <div className="p-6">
          <div className={`flex items-center justify-center w-14 h-14 rounded-full ${style.bg} mx-auto mb-4`}>
            <AlertTriangle className={`w-7 h-7 ${style.iconColor}`} />
          </div>
          
          <h3 className="text-xl font-bold text-gray-800 text-center mb-3">
            {title}
          </h3>
          
          <p className="text-gray-600 text-center mb-6 whitespace-pre-line">
            {message}
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
            className={`flex-1 px-4 py-2.5 text-white font-medium rounded-lg transition shadow-sm ${style.btnBg}`}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

const formatMinutes = (mins) => {
  if (typeof mins !== "number" || isNaN(mins)) return "00:00";
  const h = String(Math.floor(mins / 60)).padStart(2, "0");
  const m = String(mins % 60).padStart(2, "0");
  return `${h}:${m}`;
};

const EditSessionModal = ({ isOpen, onClose, session, onSessionUpdated }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedShiftName, setSelectedShiftName] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  
  const [isCanceled, setIsCanceled] = useState(false);

  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [centerConfig, setCenterConfig] = useState(null);

  const [loadingResources, setLoadingResources] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Toast & Confirm states
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, type: '', title: '', message: '', onConfirm: null });

  useEffect(() => {
    if (isOpen) {
      const fetchResources = async () => {
        setLoadingResources(true);
        try {
          const [teacherRes, roomRes, configRes] = await Promise.all([
            api.admin.getTeachers({ limit: 1000, status: 'true' }),
            api.admin.getRooms({ status: 'active', limit: 1000 }),
            api.admin.center.getConfig()
          ]);

          setTeachers(teacherRes.data.data.teachers || []);
          setRooms(roomRes.data.data.rooms || []);
          setCenterConfig(configRes.data.data.config);
        } catch (err) {
          console.error("Lỗi tải dữ liệu:", err);
          setToast({ message: "Không thể tải dữ liệu hệ thống.", type: "error" });
        } finally {
          setLoadingResources(false);
        }
      };
      fetchResources();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && session && centerConfig) {
      const startMoment = moment(session.startAt).tz(TIMEZONE);
      setSelectedDate(startMoment.format("YYYY-MM-DD"));

      const currentStartMinute = startMoment.hours() * 60 + startMoment.minutes();
      const matchedShift = centerConfig.shifts.find(s => Math.abs(s.startMinute - currentStartMinute) < 5);
      
      if (matchedShift) {
        setSelectedShiftName(matchedShift.name);
      } else {
        setSelectedShiftName(""); 
      }

      setSelectedTeacher(session.teacher?._id || session.teacher || "");
      setSelectedRoom(session.room?._id || session.room || "");
      
      setIsCanceled(session.status === 'canceled');
      
      setError(null);
    }
  }, [isOpen, session, centerConfig]);

  useEffect(() => {
    if (!isOpen) {
      setToast(null);
      setConfirmDialog({ isOpen: false, type: '', title: '', message: '', onConfirm: null });
    }
  }, [isOpen]);

  const getAvailableShiftsForDate = () => {
    if (!centerConfig || !selectedDate) return [];
    const dayOfWeek = moment(selectedDate).day();
    const dayRule = centerConfig.dayShifts.find(d => d.dayOfWeek === dayOfWeek);
    if (!dayRule) return [];
    return dayRule.shifts.map(shiftName => centerConfig.shifts.find(s => s.name === shiftName)).filter(Boolean);
  };

  const availableShifts = getAvailableShiftsForDate();

  const toggleCancelStatus = () => {
    if (isCanceled) {
      // Khôi phục buổi học
      setConfirmDialog({
        isOpen: true,
        type: 'success',
        title: 'Khôi phục buổi học?',
        message: 'Buổi học này sẽ được đưa trở lại lịch trình và diễn ra bình thường.',
        onConfirm: () => {
          setIsCanceled(false);
          setConfirmDialog({ ...confirmDialog, isOpen: false });
          setToast({ message: "Đã đánh dấu khôi phục buổi học", type: "success" });
        }
      });
    } else {
      // Hủy buổi học
      setConfirmDialog({
        isOpen: true,
        type: 'danger',
        title: 'Hủy buổi học này?',
        message: 'Buổi học sẽ bị hủy và không diễn ra. Học viên và giáo viên sẽ được thông báo.',
        onConfirm: () => {
          setIsCanceled(true);
          setConfirmDialog({ ...confirmDialog, isOpen: false });
          setToast({ message: "Đã đánh dấu hủy buổi học", type: "warning" });
        }
      });
    }
  };

  const handleSubmitClick = () => {
    if (!isCanceled && (!selectedDate || !selectedShiftName || !selectedTeacher || !selectedRoom)) {
      setToast({ message: "Vui lòng điền đầy đủ thông tin.", type: "warning" });
      return;
    }

    const teacher = teachers.find(t => t._id === selectedTeacher);
    const room = rooms.find(r => r._id === selectedRoom);
    const shift = centerConfig?.shifts.find(s => s.name === selectedShiftName);

    let confirmMessage = '';
    if (isCanceled) {
      confirmMessage = 'Xác nhận hủy buổi học này? Học viên và giáo viên sẽ được thông báo.';
    } else {
      confirmMessage = `Xác nhận cập nhật buổi học?\n\n• Ngày: ${moment(selectedDate).format('DD/MM/YYYY')}\n• Ca: ${shift?.name}\n• GV: ${teacher?.profile?.fullname || teacher?.username}\n• Phòng: ${room?.name}`;
    }

    setConfirmDialog({
      isOpen: true,
      type: isCanceled ? 'danger' : 'warning',
      title: isCanceled ? 'Xác nhận hủy buổi học' : 'Xác nhận cập nhật',
      message: confirmMessage,
      onConfirm: handleSubmit
    });
  };

  const handleSubmit = async () => {
    setConfirmDialog({ ...confirmDialog, isOpen: false });
    setSaving(true);
    setError(null);

    try {
      const shiftInfo = centerConfig.shifts.find(s => s.name === selectedShiftName);
      if (!shiftInfo && !isCanceled) throw new Error("Ca học không hợp lệ");

      let newStartAt, newEndAt;

      if (shiftInfo) {
        newStartAt = moment.tz(selectedDate, TIMEZONE).startOf('day').add(shiftInfo.startMinute, 'minutes').toDate();
        newEndAt = moment.tz(selectedDate, TIMEZONE).startOf('day').add(shiftInfo.endMinute, 'minutes').toDate();
      } else {
        newStartAt = session.startAt;
        newEndAt = session.endAt;
      }

      const payload = {
        startAt: newStartAt,
        endAt: newEndAt,
        teacher: selectedTeacher,
        room: selectedRoom,
        status: isCanceled ? 'canceled' : 'scheduled' 
      };

      const res = await api.admin.class.updateSession(session._id, payload);
      onSessionUpdated(res.data.data.session);
      
      setToast({ 
        message: isCanceled ? "Đã hủy buổi học thành công!" : "Cập nhật buổi học thành công!", 
        type: "success" 
      });

      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err) {
      console.error(err);
      setToast({ 
        message: err.response?.data?.message || "Lỗi khi cập nhật buổi học.", 
        type: "error" 
      });
    } finally {
      setSaving(false);
    }
  };
  
  if (!isOpen) return null;

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

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
          
          <div className={`p-4 flex justify-between items-center text-white transition-colors ${isCanceled ? 'bg-red-600' : 'bg-purple-600'}`}>
            <div className="flex items-center gap-2">
               {isCanceled ? <Ban className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
               <div>
                 <h2 className="text-lg font-bold">{isCanceled ? "Buổi học (Đã Hủy)" : "Chỉnh sửa buổi học"}</h2>
                 <p className="text-xs opacity-80">{isCanceled ? "Buổi học này sẽ không diễn ra" : "Cập nhật thời gian & địa điểm"}</p>
               </div>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors"><X className="w-5 h-5"/></button>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {loadingResources ? (
               <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-purple-600"/></div>
            ) : (
              <div className={`space-y-4 transition-opacity duration-300 ${isCanceled ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-xs font-medium text-gray-500 mb-1">Ngày học <span className="text-red-500 ml-1">*</span></label>
                       <div className="relative">
                          <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                          <input 
                             type="date" 
                             value={selectedDate}
                             onChange={(e) => { setSelectedDate(e.target.value); setSelectedShiftName(""); }} 
                             className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                          />
                       </div>
                    </div>
                    <div>
                       <label className="block text-xs font-medium text-gray-500 mb-1">Ca học<span className="text-red-500 ml-1">*</span></label>
                       <div className="relative">
                          <Clock className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                          <select 
                             value={selectedShiftName}
                             onChange={(e) => setSelectedShiftName(e.target.value)}
                             className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                             disabled={!selectedDate}
                          >
                             <option value="">-- Chọn Ca --</option>
                             {availableShifts.length > 0 ? (
                                availableShifts.map(s => (
                                   <option key={s.name} value={s.name}>
                                      {s.name} ({formatMinutes(s.startMinute)} - {formatMinutes(s.endMinute)})
                                   </option>
                                ))
                             ) : (
                                <option disabled>Không có ca</option>
                             )}
                          </select>
                       </div>
                    </div>
                 </div>

                 
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-xs font-medium text-gray-500 mb-1">Giáo viên<span className="text-red-500 ml-1">*</span></label>
                       <div className="relative">
                          <User className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                          <select 
                             value={selectedTeacher}
                             onChange={(e) => setSelectedTeacher(e.target.value)}
                             className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                          >
                             <option value="">-- Chọn GV --</option>
                             {teachers.map(t => (
                                <option key={t._id} value={t._id}>{t.profile?.fullname || t.username}</option>
                             ))}
                          </select>
                       </div>
                    </div>
                    <div>
                       <label className="block text-xs font-medium text-gray-500 mb-1">Phòng học<span className="text-red-500 ml-1">*</span></label>
                       <div className="relative">
                          <Home className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                          <select 
                             value={selectedRoom}
                             onChange={(e) => setSelectedRoom(e.target.value)}
                             className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                          >
                             <option value="">-- Chọn Phòng --</option>
                             {rooms.map(r => (
                                <option key={r._id} value={r._id}>{r.name}</option>
                             ))}
                          </select>
                       </div>
                    </div>
                 </div>
              </div>
            )}

            <div className="mt-8 pt-4 border-t border-gray-100 flex justify-between items-center">
               
               <button
                  type="button"
                  onClick={toggleCancelStatus}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                    isCanceled 
                      ? "text-green-700 bg-green-50 hover:bg-green-100 border border-green-200"
                      : "text-red-700 bg-red-50 hover:bg-red-100 border border-red-200"
                  }`}
               >
                  {isCanceled ? <RefreshCw className="w-4 h-4"/> : <Ban className="w-4 h-4"/>}
                  {isCanceled ? "Khôi phục buổi học" : "Hủy buổi học này"}
               </button>

               <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Đóng
                  </button>
                  <button 
                    type="button"
                    onClick={handleSubmitClick}
                    disabled={saving || loadingResources}
                    className={`px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 ${
                       isCanceled ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isCanceled ? "Xác nhận Hủy" : "Lưu thay đổi"}
                  </button>
               </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default EditSessionModal;