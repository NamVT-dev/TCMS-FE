import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle, User, Home, Clock, Calendar, Ban, RefreshCw, CheckCircle, Loader2, } from "lucide-react";
import api from "../../../utils/api";
import moment from "moment-timezone";

const TIMEZONE = "Asia/Ho_Chi_Minh";

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
          setError("Không thể tải dữ liệu hệ thống.");
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

  const getAvailableShiftsForDate = () => {
    if (!centerConfig || !selectedDate) return [];
    const dayOfWeek = moment(selectedDate).day();
    const dayRule = centerConfig.dayShifts.find(d => d.dayOfWeek === dayOfWeek);
    if (!dayRule) return [];
    return dayRule.shifts.map(shiftName => centerConfig.shifts.find(s => s.name === shiftName)).filter(Boolean);
  };

  const availableShifts = getAvailableShiftsForDate();

  const toggleCancelStatus = () => {
    setIsCanceled(!isCanceled);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isCanceled && (!selectedDate || !selectedShiftName || !selectedTeacher || !selectedRoom)) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }

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
      onClose();
      alert(isCanceled ? "Đã hủy buổi học!" : "Cập nhật buổi học thành công!");

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Lỗi khi cập nhật buổi học.");
    } finally {
      setSaving(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        
        <div className={`p-4 flex justify-between items-center text-white transition-colors ${isCanceled ? 'bg-red-600' : 'bg-purple-600'}`}>
          <div className="flex items-center gap-2">
             {isCanceled ? <Ban className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
             <div>
               <h2 className="text-lg font-bold">{isCanceled ? "Buổi học (Đã Hủy)" : "Chỉnh sửa Buổi học"}</h2>
               <p className="text-xs opacity-80">{isCanceled ? "Buổi học này sẽ không diễn ra" : "Cập nhật thời gian & địa điểm"}</p>
             </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors"><X className="w-5 h-5"/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
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
                     <label className="block text-xs font-medium text-gray-500 mb-1">Ngày học</label>
                     <div className="relative">
                        <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                        <input 
                           type="date" 
                           value={selectedDate}
                           onChange={(e) => { setSelectedDate(e.target.value); setSelectedShiftName(""); }} 
                           className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                           required={!isCanceled}
                        />
                     </div>
                  </div>
                  <div>
                     <label className="block text-xs font-medium text-gray-500 mb-1">Ca học</label>
                     <div className="relative">
                        <Clock className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                        <select 
                           value={selectedShiftName}
                           onChange={(e) => setSelectedShiftName(e.target.value)}
                           className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                           required={!isCanceled}
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
                     <label className="block text-xs font-medium text-gray-500 mb-1">Giáo viên</label>
                     <div className="relative">
                        <User className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                        <select 
                           value={selectedTeacher}
                           onChange={(e) => setSelectedTeacher(e.target.value)}
                           className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                           required={!isCanceled}
                        >
                           <option value="">-- Chọn GV --</option>
                           {teachers.map(t => (
                              <option key={t._id} value={t._id}>{t.profile?.fullname || t.username}</option>
                           ))}
                        </select>
                     </div>
                  </div>
                  <div>
                     <label className="block text-xs font-medium text-gray-500 mb-1">Phòng học</label>
                     <div className="relative">
                        <Home className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                        <select 
                           value={selectedRoom}
                           onChange={(e) => setSelectedRoom(e.target.value)}
                           className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                           required={!isCanceled}
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
                  type="submit"
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
        </form>

      </div>
    </div>
  );
};

export default EditSessionModal;