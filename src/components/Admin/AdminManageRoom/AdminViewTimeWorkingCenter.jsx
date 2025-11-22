import React, { useEffect, useState, useCallback } from "react";
import api from "../../../utils/api";
import { Loader2, Save, Pencil, X, Lock, Unlock } from "lucide-react";

const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const SHIFT_NAMES = ["S1", "S2", "S3", "S4", "S5", "S6"];

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
  
  // State UI
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false); 

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
    } finally {
      setLoading(false);
    }
  }, []);

  const handleToggleStatus = async () => {
    try {
      setToggling(true);
      const newValue = !config.isAvailabilityOpen;
      
      await api.admin.center.toggleAvailability({ isOpen: newValue });
      
      setConfig(prev => ({ ...prev, isAvailabilityOpen: newValue }));
      
      setOriginalConfig(prev => ({ ...prev, isAvailabilityOpen: newValue }));

    } catch (err) {
      console.error("Lỗi khi toggle trạng thái:", err);
      alert("Không thể thay đổi trạng thái. Vui lòng thử lại.");
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

  const handleSave = async () => {
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

      alert("✅ Cập nhật cấu hình thành công!");
      setIsEditing(false); 
    } catch (err) {
      console.error("❌ Lỗi khi lưu:", err.response?.data || err);
      alert("❌ Lưu thất bại, vui lòng thử lại.");
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

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm max-w-7xl mx-auto mt-8 border border-gray-200">
        
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-gray-100">
        <div>
            <h1 className="text-3xl font-bold text-gray-800">Cấu hình Hệ thống</h1>
            <p className="text-gray-500 mt-1">Quản lý thời gian hoạt động và cổng đăng ký</p>
        </div>

        <div className={`flex items-center p-4 rounded-lg border ${isAvailabilityOpen ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="mr-4">
                <div className="text-sm font-bold text-gray-700 uppercase mb-1">Đăng ký lịch làm</div>
                <div className={`text-xs font-semibold ${isAvailabilityOpen ? 'text-green-600' : 'text-red-600'}`}>
                    {isAvailabilityOpen ? 'ĐANG MỞ (Giáo viên có thể đăng ký)' : 'ĐANG ĐÓNG (Giáo viên không thể đăng ký )'}
                </div>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
                <input 
                    type="checkbox" 
                    checked={isAvailabilityOpen} 
                    onChange={handleToggleStatus} 
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
                className="flex items-center justify-between border p-4 rounded-lg hover:bg-gray-50 transition bg-white"
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
            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <table className="w-full text-center border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border-b border-gray-200 p-3 w-24 text-sm font-bold text-gray-600 uppercase">Ngày</th>
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
                        <td className="border-r border-gray-200 p-3 font-bold text-gray-800 bg-gray-50">
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
        )}
      </fieldset>

      <div className="text-right mt-8 border-t pt-6">
        {isEditing ? (
          <div className="flex justify-end gap-3">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="inline-flex items-center px-6 py-2.5 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition disabled:bg-gray-200 shadow-sm"
            >
              <X className="w-5 h-5 mr-2" />
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center px-6 py-2.5 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400 shadow-md hover:shadow-lg"
            >
              {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
              {saving ? "Đang lưu..." : "Lưu cấu hình"}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-6 py-2.5 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition shadow-md hover:shadow-lg"
          >
            <Pencil className="w-5 h-5 mr-2" />
            Cập nhật cấu hình
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminViewTimeWorkingCenter;