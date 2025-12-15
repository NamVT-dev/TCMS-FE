import React, { useEffect, useState, useCallback } from "react";
import api from "../../../utils/api";
import { Loader2, Save, Pencil, X, Lock, Unlock, CheckCircle, AlertCircle } from "lucide-react";

const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const SHIFT_NAMES = ["S1", "S2", "S3", "S4", "S5", "S6"];

// Toast Component
const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: { bg: "bg-green-500", Icon: CheckCircle },
    error: { bg: "bg-red-500", Icon: AlertCircle },
    warning: { bg: "bg-amber-500", Icon: AlertCircle },
  };

  const { bg, Icon } = styles[type] || styles.success;

  return (
    <div className={`fixed top-4 right-4 ${bg} text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 z-[100] animate-slide-in min-w-[320px] max-w-md`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="font-medium flex-1 break-words">{message}</span>
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
    success: { bg: "bg-green-100", iconColor: "text-green-600", btnBg: "bg-green-600 hover:bg-green-700", Icon: CheckCircle },
    warning: { bg: "bg-amber-100", iconColor: "text-amber-600", btnBg: "bg-amber-600 hover:bg-amber-700", Icon: AlertCircle },
  };

  const style = styles[type] || styles.warning;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-scale-in">
        <div className="p-6">
          <div className={`flex items-center justify-center w-14 h-14 rounded-full ${style.bg} mx-auto mb-4`}>
            <style.Icon className={`w-7 h-7 ${style.iconColor}`} />
          </div>
          
          <h3 className="text-xl font-bold text-gray-800 text-center mb-3">
            {title}
          </h3>
          
          <p className="text-gray-600 text-center mb-6">
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

const minutesToTime = (mins) => {
  if (typeof mins !== "number" || isNaN(mins)) return "00:00";
  const h = String(Math.floor(mins / 60)).padStart(2, "0");
  const m = String(mins % 60).padStart(2, "0");
  return `${h}:${m}`;
};

const timeToMinutes = (time) => {
  if (!time) return 0;
  const [h, m] = time.split(":").map(Number);
  return (h * 60) + m;
};

const AdminViewTimeWorkingCenter = () => {
  const [config, setConfig] = useState(null);
  const [originalConfig, setOriginalConfig] = useState(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);

  // Toast & Confirm states
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, action: '', data: null });

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.admin.center.getConfig();
      const conf = res.data?.data?.config;

      const shiftObj = {};
      const beShifts = conf.shifts || [];
      for (const shift of beShifts) {
        shiftObj[shift.name] = {
          startMinute: shift.startMinute,
          endMinute: shift.endMinute,
        };
      }
      const defaultShiftValues = { S1: { startMinute: 480, endMinute: 590 }, S2: { startMinute: 600, endMinute: 710 }, S3: { startMinute: 780, endMinute: 890 }, S4: { startMinute: 900, endMinute: 1010 }, S5: { startMinute: 1080, endMinute: 1190 }, S6: { startMinute: 1200, endMinute: 1310 } };
      for (const name of SHIFT_NAMES) {
        if (!shiftObj[name]) {
          shiftObj[name] = defaultShiftValues[name];
        }
      }
      const defaultDays = Array.from({ length: 7 }, (_, i) => ({ dayOfWeek: i, shifts: [] }));
      const mergedDayShifts = defaultDays.map((d) => {
        const found = conf.dayShifts?.find((x) => x.dayOfWeek === d.dayOfWeek);
        return found || d;
      });

      const finalConfig = {
        ...conf,
        shifts: shiftObj,
        dayShifts: mergedDayShifts,
        activeDaysOfWeek: conf.activeDaysOfWeek ?? [],
        isAvailabilityOpen: conf.isAvailabilityOpen ?? false,
      };
      setConfig(finalConfig);
      setOriginalConfig(JSON.parse(JSON.stringify(finalConfig)));

    } catch (err) {
      console.error(err);
      setToast({ message: "Lỗi khi tải cấu hình hệ thống", type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleToggleClick = () => {
    const newValue = !config.isAvailabilityOpen;
    setConfirmDialog({
      isOpen: true,
      action: 'toggle',
      data: newValue,
    });
  };

  const handleToggleStatus = async () => {
    const newValue = confirmDialog.data;
    setConfirmDialog({ isOpen: false, action: '', data: null });

    try {
      setToggling(true);
      await api.admin.center.toggleAvailability({ isOpen: newValue });
      
      setConfig(prev => ({ ...prev, isAvailabilityOpen: newValue }));
      setOriginalConfig(prev => ({ ...prev, isAvailabilityOpen: newValue }));
      
      setToast({ 
        message: newValue ? "Đã mở cổng đăng ký lịch làm!" : "Đã đóng cổng đăng ký lịch làm!", 
        type: "success" 
      });

    } catch (err) {
      console.error("Lỗi khi toggle trạng thái:", err);
      // ✅ CẬP NHẬT: Lấy message từ BE cho Toggle
      const errorMessage = err.response?.data?.message || "Không thể thay đổi trạng thái. Vui lòng thử lại.";
      setToast({ message: errorMessage, type: "error" });
    } finally {
      setToggling(false);
    }
  };

  const toggleDay = (index) => {
    setConfig((prev) => {
      const isActive = prev.activeDaysOfWeek.includes(index);
      let newDays;
      let newDayShifts = [...prev.dayShifts];

      if (isActive) {
        newDays = prev.activeDaysOfWeek.filter((d) => d !== index);
        newDayShifts = newDayShifts.map((d) =>
          d.dayOfWeek === index ? { ...d, shifts: [] } : d
        );
      } else {
        newDays = [...prev.activeDaysOfWeek, index];
        const existingDay = newDayShifts.find(d => d.dayOfWeek === index);
        if (!existingDay) {
          newDayShifts.push({ dayOfWeek: index, shifts: [] });
        }
      }

      return {
        ...prev,
        activeDaysOfWeek: newDays.sort((a, b) => a - b),
        dayShifts: newDayShifts,
      };
    });
  };

  const handleShiftTimeChange = (shiftName, field, value) => {
    setConfig((prev) => ({
      ...prev,
      shifts: {
        ...prev.shifts,
        [shiftName]: {
          ...prev.shifts[shiftName],
          [field]: timeToMinutes(value),
        },
      },
    }));
  };

  const toggleShiftForDay = (dayIndex, shiftName) => {
    setConfig((prev) => {
      const updated = prev.dayShifts.map((d) => {
        if (d.dayOfWeek !== dayIndex) return d;
        const hasShift = d.shifts.includes(shiftName);
        const newShifts = hasShift
          ? d.shifts.filter((s) => s !== shiftName)
          : [...d.shifts, shiftName];
        return { ...d, shifts: newShifts };
      });
      return { ...prev, dayShifts: updated };
    });
  };

  const handleSaveClick = () => {
    setConfirmDialog({
      isOpen: true,
      action: 'save',
      data: null,
    });
  };

  const handleSave = async () => {
    setConfirmDialog({ isOpen: false, action: '', data: null });

    try {
      setSaving(true);
      const shiftsArray = Object.entries(config.shifts).map(([name, s]) => ({
        name,
        startMinute: s.startMinute,
        endMinute: s.endMinute,
      }));
      const activeDayShifts = config.dayShifts.filter(d =>
        config.activeDaysOfWeek.includes(d.dayOfWeek)
      );
      const payload = {
        timezone: config.timezone,
        activeDaysOfWeek: config.activeDaysOfWeek,
        shifts: shiftsArray,
        dayShifts: activeDayShifts,
      };

      await api.admin.center.updateConfig(payload);
      await fetchConfig();

      setToast({ message: "Cập nhật cấu hình thành công!", type: "success" });
      
      setTimeout(() => {
        setIsEditing(false);
      }, 1000);

    } catch (err) {
      console.error("Lỗi khi lưu:", err.response?.data || err);
      // ✅ CẬP NHẬT: Lấy message từ BE cho Save
      const errorMessage = err.response?.data?.message || "Lưu thất bại, vui lòng thử lại.";
      setToast({ message: errorMessage, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setConfig(originalConfig);
    setIsEditing(false);
  };

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  if (loading || !config)
    return (
      <div className="p-8 text-gray-600 text-center flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );

  const { shifts, activeDaysOfWeek, dayShifts, isAvailabilityOpen } = config;

  const getConfirmDialogProps = () => {
    switch (confirmDialog.action) {
      case 'toggle':
        return {
          title: confirmDialog.data ? 'Mở cổng đăng ký?' : 'Đóng cổng đăng ký?',
          message: confirmDialog.data 
            ? 'Giáo viên sẽ có thể đăng ký lịch làm việc khi cổng được mở.'
            : 'Giáo viên sẽ không thể đăng ký lịch làm việc khi cổng được đóng.',
          type: confirmDialog.data ? 'success' : 'warning',
          onConfirm: handleToggleStatus
        };
      case 'save':
        return {
          title: 'Xác nhận lưu cấu hình',
          message: 'Các thay đổi sẽ được áp dụng ngay lập tức và ảnh hưởng đến toàn bộ hệ thống.',
          type: 'success',
          onConfirm: handleSave
        };
      default:
        return { title: '', message: '', type: 'warning', onConfirm: () => {} };
    }
  };

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
        onClose={() => setConfirmDialog({ isOpen: false, action: '', data: null })}
        {...getConfirmDialogProps()}
      />

      {/* ✅ CẬP NHẬT: Responsive padding (p-4 trên mobile, p-6 trên desktop) */}
      <div className="p-4 md:p-6 bg-white rounded-lg shadow-sm max-w-7xl mx-auto mt-8 border border-gray-200">
          
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-gray-100 gap-4">
          <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Cấu hình Hệ thống</h1>
              <p className="text-gray-500 mt-1">Quản lý thời gian hoạt động và cổng đăng ký</p>
          </div>

          <div className={`flex items-center p-4 rounded-lg border ${isAvailabilityOpen ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="mr-4">
                  <div className="text-sm font-bold text-gray-700 uppercase mb-1">Đăng ký lịch làm</div>
                  <div className={`text-xs font-semibold ${isAvailabilityOpen ? 'text-green-600' : 'text-red-600'}`}>
                      {isAvailabilityOpen ? 'ĐANG MỞ' : 'ĐANG ĐÓNG'}
                  </div>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                      type="checkbox" 
                      checked={isAvailabilityOpen} 
                      onChange={handleToggleClick} 
                      disabled={toggling}
                      className="sr-only peer" 
                  />
                  <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
                  
                  <div className="absolute left-2 text-white pointer-events-none peer-checked:opacity-0 transition-opacity">
                      {toggling ? <Loader2 className="w-3 h-3 animate-spin" /> : <Lock className="w-3 h-3" />}
                  </div>
                  <div className="absolute right-2 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity">
                      {toggling ? <Loader2 className="w-3 h-3 animate-spin" /> : <Unlock className="w-3 h-3" />}
                  </div>
              </label>
          </div>
        </div>

        <fieldset disabled={!isEditing && !loading}>
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">
              1. Ngày hoạt động trong tuần
            </h2>
            <div className="flex flex-wrap gap-3">
              {dayNames.map((day, i) => {
                const isActive = activeDaysOfWeek.includes(i);
                return (
                  <button
                    key={i}
                    onClick={() => toggleDay(i)}
                    disabled={!isEditing}
                    className={`px-4 py-2 rounded-lg border font-medium transition-all ${isActive
                      ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                      : "bg-white text-gray-700 hover:bg-purple-50 border-gray-300"
                      } disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">
              2. Định nghĩa khung giờ (Ca)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SHIFT_NAMES.map((shiftName) => (
                <div
                  key={shiftName}
                  className="flex items-center justify-between border p-4 rounded-lg hover:bg-gray-50 transition bg-white shadow-sm"
                >
                  <div className="font-bold text-lg text-purple-700 bg-purple-50 w-10 h-10 flex items-center justify-center rounded-full">
                      {shiftName}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={minutesToTime(shifts[shiftName]?.startMinute)}
                      onChange={(e) =>
                        handleShiftTimeChange(shiftName, "startMinute", e.target.value)
                      }
                      disabled={!isEditing}
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 cursor-pointer"
                    />
                    <span className="text-gray-400 font-bold">-</span>
                    <input
                      type="time"
                      value={minutesToTime(shifts[shiftName]?.endMinute)}
                      onChange={(e) =>
                        handleShiftTimeChange(shiftName, "endMinute", e.target.value)
                      }
                      disabled={!isEditing}
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 cursor-pointer"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {activeDaysOfWeek.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-3">
                3. Chọn ca hoạt động cho từng ngày
              </h2>
              {/* ✅ CẬP NHẬT: Xử lý responsive cho bảng */}
              <div className="border border-gray-200 rounded-lg shadow-sm bg-white overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-center border-collapse min-w-[800px]">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="border-b border-gray-200 p-3 w-24 text-sm font-bold text-gray-600 uppercase sticky left-0 bg-gray-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Ngày</th>
                                {SHIFT_NAMES.map((name) => (
                                    <th key={name} className="border-b border-gray-200 p-3 text-sm font-bold text-gray-600">
                                        {name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {dayShifts
                            .filter((d) => activeDaysOfWeek.includes(d.dayOfWeek))
                            .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                            .map((d) => (
                                <tr key={d.dayOfWeek} className="even:bg-white odd:bg-gray-50/50 hover:bg-purple-50/30 transition-colors">
                                    <td className="border-r border-gray-200 p-3 font-bold text-gray-800 bg-gray-50 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                        {dayNames[d.dayOfWeek]}
                                    </td>
                                    {SHIFT_NAMES.map((shiftName) => (
                                        <td key={shiftName} className="border-r border-gray-200 last:border-r-0 p-3">
                                            <div className="flex justify-center">
                                                <input
                                                    type="checkbox"
                                                    checked={d.shifts.includes(shiftName)}
                                                    onChange={() =>
                                                        toggleShiftForDay(d.dayOfWeek, shiftName)
                                                    }
                                                    disabled={!isEditing}
                                                    className="w-5 h-5 accent-purple-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 transform transition-transform hover:scale-110"
                                                />
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
              </div>
            </div>
          )}
        </fieldset>

        <div className="text-right mt-8 border-t pt-6">
          {isEditing ? (
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition disabled:bg-gray-200 shadow-sm"
              >
                <X className="w-5 h-5 mr-2" />
                Hủy
              </button>
              <button
                onClick={handleSaveClick}
                disabled={saving}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400 shadow-md hover:shadow-lg"
              >
                {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                {saving ? "Đang lưu..." : "Lưu cấu hình"}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition shadow-md hover:shadow-lg"
            >
              Cập nhật cấu hình
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminViewTimeWorkingCenter;