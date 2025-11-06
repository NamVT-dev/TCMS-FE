import React, { useEffect, useState } from "react";
import api from "../../../utils/api";

// 🗓 Backend: 0 = CN, 1 = T2, ..., 6 = T7
const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

// 🕒 Chuyển đổi phút <-> "HH:mm"
const minutesToTime = (mins) => {
  if (typeof mins !== "number" || isNaN(mins)) return "00:00";
  const h = String(Math.floor(mins / 60)).padStart(2, "0");
  const m = String(mins % 60).padStart(2, "0");
  return `${h}:${m}`;
};
const timeToMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const AdminViewTimeWorkingCenter = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ✅ Lấy config từ backend
  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await api.admin.center.getConfig();
      const conf = res.data?.data?.config;

      // ✅ Chuẩn hóa danh sách shifts (thêm mặc định nếu thiếu)
      const defaultShifts = ["morning", "afternoon", "evening"];
      const shiftObj = {};
      defaultShifts.forEach((name) => {
        const found = conf.shifts?.find((s) => s.name === name);
        shiftObj[name] = {
          startMinute: found?.startMinute ?? 480, // 08:00
          endMinute: found?.endMinute ?? 720, // 12:00
        };
      });

      // ✅ Đảm bảo đủ 7 ngày (0–6)
      const defaultDays = Array.from({ length: 7 }, (_, i) => ({
        dayOfWeek: i,
        shifts: [],
      }));
      const mergedDayShifts = defaultDays.map((d) => {
        const found = conf.dayShifts?.find((x) => x.dayOfWeek === d.dayOfWeek);
        return found || d;
      });

      setConfig({
        ...conf,
        shifts: shiftObj,
        dayShifts: mergedDayShifts,
        activeDaysOfWeek: conf.activeDaysOfWeek ?? [],
      });
    } catch (err) {
      console.error(err);
      alert("❌ Không thể tải cấu hình trung tâm.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Toggle chọn ngày hoạt động
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
      }

      return {
        ...prev,
        activeDaysOfWeek: newDays.sort((a, b) => a - b),
        dayShifts: newDayShifts,
      };
    });
  };

  // ✅ Cập nhật giờ từng ca
  const handleShiftTimeChange = (shift, field, value) => {
    setConfig((prev) => ({
      ...prev,
      shifts: {
        ...prev.shifts,
        [shift]: {
          ...prev.shifts[shift],
          [field]: timeToMinutes(value),
        },
      },
    }));
  };

  // ✅ Chọn ca hoạt động cho từng ngày
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

  // ✅ Lưu lại config
  const handleSave = async () => {
    try {
      setSaving(true);

      // Convert shifts object -> array
      const shiftsArray = Object.entries(config.shifts).map(([name, s]) => ({
        name,
        startMinute: s.startMinute,
        endMinute: s.endMinute,
      }));

      const payload = {
        timezone: config.timezone,
        activeDaysOfWeek: config.activeDaysOfWeek,
        shifts: shiftsArray,
        dayShifts: config.dayShifts,
      };

      const res = await api.admin.center.updateConfig(payload);
      const updatedConf = res.data?.data?.config;

      // Cập nhật lại state
      const updatedShiftsObj = {};
      updatedConf.shifts.forEach((s) => {
        updatedShiftsObj[s.name] = {
          startMinute: s.startMinute,
          endMinute: s.endMinute,
        };
      });

      setConfig({
        ...updatedConf,
        shifts: updatedShiftsObj,
      });

      alert("✅ Cập nhật cấu hình thành công!");
    } catch (err) {
      console.error("❌ Lỗi khi lưu:", err.response?.data || err);
      alert("❌ Lưu thất bại, vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  if (loading || !config)
    return (
      <div className="p-8 text-gray-600 text-center">Đang tải dữ liệu...</div>
    );

  const { shifts, activeDaysOfWeek, dayShifts } = config;

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md max-w-5xl mx-auto mt-8 border border-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-purple-700 flex items-center gap-2">
        Cấu hình thời gian hoạt động trung tâm
      </h1>

      {/* 1️⃣ Ngày hoạt động */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">
          Chọn ngày hoạt động trong tuần
        </h2>
        <div className="flex flex-wrap gap-3">
          {dayNames.map((day, i) => {
            const isActive = activeDaysOfWeek.includes(i);
            return (
              <button
                key={i}
                onClick={() => toggleDay(i)}
                className={`px-4 py-2 rounded-lg border font-medium transition-all ${
                  isActive
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-gray-100 text-gray-700 hover:bg-purple-50 border-gray-300"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2️⃣ Giờ ca học */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">
          Cập nhật khung giờ học
        </h2>
        <div className="space-y-4">
          {[
            { key: "morning", label: "Buổi sáng" },
            { key: "afternoon", label: "Buổi chiều" },
            { key: "evening", label: "Buổi tối" },
          ].map(({ key, label }) => (
            <div
              key={key}
              className="flex items-center justify-between border p-4 rounded-xl hover:bg-gray-50 transition"
            >
              <div className="font-medium text-gray-800">{label}</div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-500">Bắt đầu:</label>
                <input
                  type="time"
                  value={minutesToTime(shifts[key]?.startMinute)}
                  onChange={(e) =>
                    handleShiftTimeChange(key, "startMinute", e.target.value)
                  }
                  className="border rounded px-2 py-1 text-sm"
                />
                <label className="text-sm text-gray-500">Kết thúc:</label>
                <input
                  type="time"
                  value={minutesToTime(shifts[key]?.endMinute)}
                  onChange={(e) =>
                    handleShiftTimeChange(key, "endMinute", e.target.value)
                  }
                  className="border rounded px-2 py-1 text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3️⃣ Ca hoạt động theo từng ngày */}
      {activeDaysOfWeek.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">
            Thiết lập ca học cho từng ngày đã chọn
          </h2>
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-center border-collapse">
              <thead className="bg-purple-50">
                <tr>
                  <th className="border p-2 w-24">Ngày</th>
                  <th className="border p-2">Sáng</th>
                  <th className="border p-2">Chiều</th>
                  <th className="border p-2">Tối</th>
                </tr>
              </thead>
              <tbody>
                {dayShifts
                  .filter((d) => activeDaysOfWeek.includes(d.dayOfWeek))
                  .map((d) => (
                    <tr key={d.dayOfWeek}>
                      <td className="border p-2 font-medium text-gray-800 bg-gray-50">
                        {dayNames[d.dayOfWeek]}
                      </td>
                      {["morning", "afternoon", "evening"].map((shift) => (
                        <td key={shift} className="border p-2">
                          <input
                            type="checkbox"
                            checked={d.shifts.includes(shift)}
                            onChange={() =>
                              toggleShiftForDay(d.dayOfWeek, shift)
                            }
                            className="w-5 h-5 accent-purple-600"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Nút lưu */}
      <div className="text-right">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400"
        >
          {saving ? "Đang lưu..." : "Lưu cấu hình"}
        </button>
      </div>
    </div>
  );
};

export default AdminViewTimeWorkingCenter;
