
import React, { useEffect, useState, useCallback } from "react";
import api from "../../../utils/api";
import { Loader2, Save, Edit, X, CheckCircle, AlertCircle } from "lucide-react";

const DAY_NAMES = [
  { id: 0, label: "CN" },
  { id: 1, label: "T2" },
  { id: 2, label: "T3" },
  { id: 3, label: "T4" },
  { id: 4, label: "T5" },
  { id: 5, label: "T6" },
  { id: 6, label: "T7" },
];

const todayISO = () => new Date().toISOString().slice(0, 10);

const normalizeSlots = (rawSlots = []) =>
  (rawSlots || []).map((s) => ({
    dayOfWeek: typeof s.dayOfWeek === "number" ? s.dayOfWeek : Number(s.dayOfWeek || 0),
    shifts: Array.isArray(s.shifts) ? s.shifts.slice() : [],
    effective:
      s.effective && (s.effective.start || s.effective.end)
        ? {
            start: s.effective.start ? s.effective.start.slice(0, 10) : "",
            end: s.effective.end ? s.effective.end.slice(0, 10) : "",
          }
        : { start: "", end: "" },
  }));

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
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${styles[type]} transform transition-all duration-300 ease-out`}>
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

export default function TeacherRegisterSchedule() {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState(null);
  const [slots, setSlots] = useState([]);
  const [centerConfig, setCenterConfig] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [meRes, cfgRes] = await Promise.allSettled([
        api.user.getMe(),
        api.teacher.getShiftConfig(),
      ]);

      if (meRes.status === "fulfilled") {
        const teacher = meRes.value?.data?.data?.data || {};
        setSlots(normalizeSlots(teacher.availability || []));
      } else {
        throw new Error("Không thể tải thông tin giáo viên");
      }

      if (cfgRes.status === "fulfilled") {
        setCenterConfig(cfgRes.value?.data?.data?.config || null);
      } else {
        throw new Error("Không thể tải cấu hình trung tâm");
      }
    } catch (err) {
      console.error(err);
      showToast("Không thể tải dữ liệu. Vui lòng thử lại.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isAvailabilityOpen = centerConfig?.isAvailabilityOpen;

  const toggleDay = (dayId) => {
    if (!editing) return;
    setSlots((prev) => {
      const exists = prev.some((s) => s.dayOfWeek === dayId);
      if (exists) return prev.filter((s) => s.dayOfWeek !== dayId);
      const defaultShifts =
        centerConfig?.dayShifts?.find((d) => d.dayOfWeek === dayId)?.shifts || [];
      return [
        ...prev,
        {
          dayOfWeek: dayId,
          shifts: defaultShifts,
          effective: { start: todayISO(), end: "" },
        },
      ];
    });
  };

  const toggleShift = (dayId, shiftKey) => {
    if (!editing) return;
    setSlots((prev) =>
      prev.map((s) =>
        s.dayOfWeek === dayId
          ? {
              ...s,
              shifts: s.shifts.includes(shiftKey)
                ? s.shifts.filter((sh) => sh !== shiftKey)
                : [...s.shifts, shiftKey],
            }
          : s
      )
    );
  };

  const setEffective = (dayId, field, value) => {
    if (!editing) return;
    setSlots((prev) =>
      prev.map((s) =>
        s.dayOfWeek === dayId
          ? { ...s, effective: { ...s.effective, [field]: value } }
          : s
      )
    );
  };

  const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  const getShiftInfo = (shiftKey) => {
    if (!centerConfig?.shifts) {
      return null;
    }
    const shift = centerConfig.shifts.find(s => s.name === shiftKey);
    if (!shift) {
      return null;
    }
    return {
      name: shift.name,
      timeRange: `${minutesToTime(shift.startMinute)} - ${minutesToTime(shift.endMinute)}`
    };
  };

  const buildShiftPayloadSlots = () =>
    slots.map((s) => {
      const out = { dayOfWeek: s.dayOfWeek, shifts: s.shifts || [] };
      if (s.effective && (s.effective.start || s.effective.end))
        out.effective = { ...s.effective };
      return out;
    });

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.teacher.registerShift({ slots: buildShiftPayloadSlots() });
      await loadData();
      setEditing(false);
      showToast("Đã lưu thay đổi thành công!", "success");
    } catch (err) {
      console.error("Lưu thất bại:", err);
      showToast(err.response?.data?.message || "Lưu thất bại. Vui lòng thử lại.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    await loadData();
    setEditing(false);
  };

  const slotIsCurrentlyActive = (slot) => {
    if (!slot) return false;
    const start = slot.effective?.start || "";
    const end = slot.effective?.end || "";
    const today = todayISO();
    if (!start && !end) return true;
    if (start && today < start) return false;
    if (end && today > end) return false;
    return true;
  };

  const slotsByDayId = Object.fromEntries(
    (slots || []).map((s) => [s.dayOfWeek, s])
  );

  const currentVisibleSlots = (slots || [])
    .filter((s) => slotIsCurrentlyActive(s))
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  if (loading) return (
    <div className="p-8 text-center text-gray-600 flex justify-center items-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
    </div>
  );

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-8xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {editing ? "Cập nhật lịch giảng dạy" : "Lịch giảng dạy"}
          </h2>

          {/* --- Lịch hiện tại (đang có hiệu lực) --- */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Lịch hiện tại (đang có hiệu lực)</h3>
            {currentVisibleSlots.length === 0 ? (
              <p className="text-gray-500">Hiện không có lịch nào trong khoảng hiệu lực.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentVisibleSlots.map((s) => {
                  const dayLabel = DAY_NAMES.find((d) => d.id === s.dayOfWeek)?.label;
                  return (
                    <div key={s.dayOfWeek} className="flex items-center justify-between border rounded-lg px-4 py-3 bg-white">
                      <div>
                        <div className="text-sm font-semibold text-purple-700">{dayLabel}</div>
                        <div className="text-sm text-gray-600">
                          {s.shifts.length ? (
                            <div className="space-y-1">
                              {s.shifts
                                .slice()
                                .sort((a, b) => {
                                  const numA = parseInt(a.replace(/\D/g, '')) || 0;
                                  const numB = parseInt(b.replace(/\D/g, '')) || 0;
                                  return numA - numB;
                                })
                                .map((shift, idx) => {
                                  const shiftInfo = getShiftInfo(shift);
                                  return (
                                    <div key={shift}>
                                      {shift}
                                      {shiftInfo && (
                                        <span className="text-xs text-gray-500 ml-1">
                                          ({shiftInfo.timeRange})
                                        </span>
                                      )}
                                      {idx < s.shifts.length - 1 && ', '}
                                    </div>
                                  );
                                })}
                            </div>
                          ) : (
                            "Không có ca"
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {s.effective?.start || s.effective?.end
                          ? `${s.effective?.start || "?"} → ${s.effective?.end || "Không giới hạn"}`
                          : "Không giới hạn"}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* --- Chọn ngày --- */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Chọn ngày trong tuần
              {editing && <span className="text-red-500 ml-1">*</span>}
            </h3>
            <div className="flex flex-wrap gap-3">
              {DAY_NAMES.filter(
                (d) =>
                  !centerConfig?.activeDaysOfWeek ||
                  centerConfig.activeDaysOfWeek.includes(d.id)
              ).map((d) => {
                const isActive = !!slotsByDayId[d.id];
                return (
                  <label
                    key={d.id}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer border ${isActive
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-purple-50"
                      } ${!editing ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={() => toggleDay(d.id)}
                      disabled={!editing}
                      className="accent-purple-600"
                    />
                    <span className="text-sm font-medium">{d.label}</span>
                  </label>
                );
              })}
            </div>
          </section>

          {/* --- Thiết lập theo ngày --- */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Thiết lập ca cho từng ngày
              {editing && <span className="text-red-500 ml-1">*</span>}
            </h3>
            {!editing && slots.length === 0 && <p className="text-gray-500">Chưa chọn ngày nào.</p>}
            {editing && slots.length === 0 && <p className="text-gray-500">Hãy chọn một ngày ở trên để thiết lập ca.</p>}

            <div className="space-y-4">
              {slots
                .slice()
                .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                .map((slot) => {
                  const dayLabel = DAY_NAMES.find((d) => d.id === slot.dayOfWeek)?.label;
                  const availableShifts =
                    centerConfig?.dayShifts?.find((d) => d.dayOfWeek === slot.dayOfWeek)?.shifts ||
                    [];

                  return (
                    <div key={slot.dayOfWeek} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3">
                        <div className="text-lg font-bold text-purple-700">{dayLabel}</div>
                        <div className="text-sm text-gray-500 mt-1 sm:mt-0">Ngày kết thúc để trống, giá trị sẽ có hiệu lực vĩnh viễn.</div>
                      </div>

                      {/* shifts */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {availableShifts.length === 0 ? (
                          <p className="text-gray-500 text-sm">Trung tâm không mở ca nào vào ngày này.</p>
                        ) : (
                          availableShifts
                            .slice()
                            .sort((a, b) => {
                              const numA = parseInt(a.replace(/\D/g, '')) || 0;
                              const numB = parseInt(b.replace(/\D/g, '')) || 0;
                              return numA - numB;
                            })
                            .map((sk) => {
                              const checked = slot.shifts.includes(sk);
                              const shiftInfo = getShiftInfo(sk);
                              return (
                                <label
                                  key={sk}
                                  className={`px-3 py-2 rounded-md border cursor-pointer ${
                                    checked
                                      ? "bg-purple-600 text-white border-purple-600"
                                      : "bg-white text-gray-700 border-gray-300 hover:bg-purple-50"
                                  } ${!editing ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleShift(slot.dayOfWeek, sk)}
                                    disabled={!editing}
                                    className="hidden"
                                  />
                                  <div className="flex flex-col items-center">
                                    <span className="text-sm font-medium">{sk}</span>
                                    {shiftInfo && (
                                      <span className={`text-xs mt-0.5 ${checked ? 'text-purple-100' : 'text-gray-500'}`}>
                                        {shiftInfo.timeRange}
                                      </span>
                                    )}
                                  </div>
                                </label>
                              );
                            })
                        )}
                      </div>

                      {/* effective */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Bắt đầu từ ngày</div>
                          <input
                            value={slot.effective?.start || ""}
                            onChange={(e) =>
                              setEffective(slot.dayOfWeek, "start", e.target.value)
                            }
                            type="date"
                            disabled={!editing}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100"
                          />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Kết thúc vào ngày</div>
                          <input
                            value={slot.effective?.end || ""}
                            onChange={(e) =>
                              setEffective(slot.dayOfWeek, "end", e.target.value)
                            }
                            type="date"
                            disabled={!editing}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>

          {/* --- Thông báo nếu không thay đổi được lịch --- */}
          {isAvailabilityOpen === false && (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg mt-6">
              <p>Thời gian thay đổi lịch làm đã đóng. Vui lòng liên hệ admin để được thay đổi lịch làm.</p>
            </div>
          )}

          {/* --- Buttons --- */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className={`inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors ${isAvailabilityOpen === false ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isAvailabilityOpen === false}
              >
                <Edit className="w-4 h-4 mr-2" />
                Cập nhật
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <X className="w-4 h-4 mr-2" />
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
                  disabled={loading || isAvailabilityOpen === false}
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Lưu thay đổi
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}