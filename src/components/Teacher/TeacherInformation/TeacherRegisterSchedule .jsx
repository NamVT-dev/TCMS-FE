import React, { useState, useEffect, useCallback } from "react";
import api from "../../../utils/api";

// ===== HỖ TRỢ =====
const minutesToTime = (minutes) => {
  if (typeof minutes !== "number") return "";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h${mins.toString().padStart(2, "0")}`;
};

// 🎯 CN = 0, T2 = 1, ..., T7 = 6
const DAY_MAP = {
  0: "CN",
  1: "Thứ 2",
  2: "Thứ 3",
  3: "Thứ 4",
  4: "Thứ 5",
  5: "Thứ 6",
  6: "Thứ 7",
};
const DAY_MAP_REVERSE = Object.fromEntries(
  Object.entries(DAY_MAP).map(([k, v]) => [v, Number(k)])
);

const SHIFT_LABELS = {
  morning: "Buổi sáng",
  afternoon: "Buổi chiều",
  evening: "Buổi tối",
};

// ===== CHUYỂN ĐỔI =====
const parseAvailability = (availabilityArray) => {
  const schedule = {};
  if (!Array.isArray(availabilityArray)) return schedule;

  availabilityArray.forEach((item) => {
    const dayName = DAY_MAP[item.dayOfWeek]; // item.dayOfWeek: 0 = CN, ...
    if (!dayName) return;
    if (!schedule[dayName]) schedule[dayName] = {};
    (item.shifts || []).forEach((shift) => {
      schedule[dayName][shift] = true;
    });
  });

  return schedule;
};

const formatScheduleForApi = (scheduleObject) => {
  const slots = Object.entries(scheduleObject)
    .map(([dayName, shiftsObject]) => {
      const dayOfWeek = DAY_MAP_REVERSE[dayName]; // CN = 0, T2 = 1, ...
      const shifts = Object.keys(shiftsObject).filter(
        (shiftKey) => shiftsObject[shiftKey]
      );
      return { dayOfWeek, shifts };
    })
    .filter((slot) => slot.shifts.length > 0);
  return { slots };
};

// ===== COMPONENT CHÍNH =====
const TeacherRegisterSchedule = () => {
  const [centerConfig, setCenterConfig] = useState({
    activeDaysOfWeek: Object.keys(DAY_MAP).map((d) => Number(d)), // mặc định CN -> T7
    sessions: [],
  });
  const [schedule, setSchedule] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Lấy lịch giáo viên ---
  const fetchUserData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.user.getMe();
      const teacher = res?.data?.data?.data || {};
      const availabilityData =
        teacher.availability ||
        teacher.availabilitySlots ||
        teacher.schedule ||
        [];

      const parsed = parseAvailability(availabilityData);
      setSchedule(parsed);
    } catch (err) {
      console.error("❌ Lỗi fetchUserData:", err);
      setError("Không thể tải thông tin lịch dạy của bạn.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // --- Cập nhật lịch (lấy config trung tâm) ---
  const handleUpdate = async () => {
    setIsEditing(true);
    setLoading(true);
    try {
      const configRes = await api.teacher.getShiftConfig();
      const config = configRes.data.data.config;

      const activeSessions = Object.entries(config.shifts || {})
        .map(([key, value]) => ({
          key,
          label: `${SHIFT_LABELS[key]} (${minutesToTime(
            value.startMinute
          )} - ${minutesToTime(value.endMinute)})`,
        }))
        .filter((item) => !!item.label);

      setCenterConfig({
        activeDaysOfWeek:
          config.activeDaysOfWeek?.length > 0
            ? config.activeDaysOfWeek // theo quy ước mới: 0 = CN
            : Object.keys(DAY_MAP).map((d) => Number(d)),
        sessions: activeSessions.length
          ? activeSessions
          : Object.keys(SHIFT_LABELS).map((key) => ({
              key,
              label: SHIFT_LABELS[key],
            })),
      });
    } catch (err) {
      console.error("❌ Lỗi getShiftConfig:", err);
      setError("Không thể tải được lịch làm việc của trung tâm.");
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };

  // --- Lưu lịch ---
  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = formatScheduleForApi(schedule); // chuẩn mới 0 = CN
      await api.teacher.registerShift(payload);
      await fetchUserData();
      setIsEditing(false);
      alert("✅ Đã cập nhật lịch dạy thành công!");
    } catch (err) {
      console.error("❌ Lỗi lưu lịch:", err);
      setError("❌ Lưu lịch thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // --- Toggle ---
  const handleToggle = (day, shift) => {
    if (!isEditing) return;
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [shift]: !prev[day]?.[shift] },
    }));
  };

  // --- RENDER ---
  if (loading && !isEditing)
    return <div className="p-10 text-center">Đang tải dữ liệu...</div>;
  if (error)
    return <div className="p-10 text-center text-red-500">{error}</div>;

  const activeDays = Object.entries(DAY_MAP)
    .filter(([k]) => centerConfig.activeDaysOfWeek.includes(Number(k)))
    .map(([_, v]) => v);

  const sessionsToRender =
    centerConfig.sessions.length > 0
      ? centerConfig.sessions
      : Object.keys(SHIFT_LABELS).map((key) => ({
          key,
          label: SHIFT_LABELS[key],
        }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center pt-24 pb-10">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-6xl mx-4 relative">
        {loading && isEditing && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-2xl">
            <p className="text-gray-600 animate-pulse">
              Đang tải lịch trung tâm...
            </p>
          </div>
        )}

        <h1 className="text-3xl font-bold text-sky-700 mb-8 text-center">
          {isEditing ? "Chỉnh sửa lịch dạy của bạn" : "Lịch dạy hiện tại"}
        </h1>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-center text-gray-700">
            <thead className="bg-sky-100">
              <tr>
                <th className="p-3 border border-gray-200">Buổi</th>
                {activeDays.map((day) => (
                  <th key={day} className="p-3 border border-gray-200">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sessionsToRender.map((session) => (
                <tr key={session.key} className="hover:bg-gray-50 transition">
                  <td className="font-medium border border-gray-200 p-3 bg-gray-50">
                    {session.label}
                  </td>
                  {activeDays.map((day) => {
                    const isChecked = schedule[day]?.[session.key] || false;
                    return (
                      <td
                        key={`${day}-${session.key}`}
                        className={`border border-gray-200 p-3 ${
                          isChecked && !isEditing ? "bg-sky-100" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggle(day, session.key)}
                          disabled={!isEditing}
                          className={`w-5 h-5 ${
                            isEditing
                              ? "cursor-pointer accent-sky-600"
                              : "accent-sky-500 cursor-not-allowed"
                          }`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mt-8 gap-4">
          {!isEditing ? (
            <button
              onClick={handleUpdate}
              className="px-6 py-2 rounded-lg bg-sky-600 text-white font-medium hover:bg-sky-700 transition"
            >
              Cập nhật lịch dạy
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setIsEditing(false);
                  fetchUserData();
                }}
                className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 rounded-lg bg-sky-600 text-white font-medium hover:bg-sky-700 transition"
              >
                Lưu thay đổi
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherRegisterSchedule;
