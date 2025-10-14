import React, { useEffect, useState } from "react";
import api from "../../../utils/api";

// 🗓 0 = CN, 1 = T2, ..., 6 = T7
const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

// 🕒 Chuyển đổi phút <-> "HH:mm"
const minutesToTime = (mins) => {
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

  // ✅ Gọi API lấy config trung tâm
  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await api.admin.center.getConfig();
      const conf = res.data?.data?.config;
      setConfig(conf);
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
      const newDays = prev.activeDaysOfWeek.includes(index)
        ? prev.activeDaysOfWeek.filter((d) => d !== index)
        : [...prev.activeDaysOfWeek, index];
      return { ...prev, activeDaysOfWeek: newDays.sort((a, b) => a - b) };
    });
  };

  // ✅ Cập nhật giờ cho từng khung
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

  // ✅ Lưu config
  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        timezone: config.timezone,
        shifts: config.shifts,
        activeDaysOfWeek: config.activeDaysOfWeek,
      };
      const res = await api.admin.center.updateConfig(payload);
      setConfig(res.data.data.config);
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

  const { shifts, activeDaysOfWeek } = config;

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md max-w-4xl mx-auto mt-8 border border-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-indigo-700 flex items-center gap-2">
        ⚙️ Cấu hình thời gian hoạt động trung tâm
      </h1>

      {/* Ngày hoạt động */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">
          📅 Chọn ngày hoạt động
        </h2>
        <div className="flex flex-wrap gap-3">
          {dayNames.map((day, i) => {
            const isActive = activeDaysOfWeek.includes(i);
            return (
              <button
                key={i}
                onClick={() => toggleDay(i)}
                className={`px-4 py-2 rounded-lg border transition-all font-medium ${
                  isActive
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-gray-100 text-gray-700 hover:bg-indigo-50 border-gray-300"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Khung giờ hoạt động */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-3">
          ⏰ Khung giờ hoạt động
        </h2>
        <div className="space-y-4">
          {[
            { key: "morning", label: "🌅 Buổi sáng" },
            { key: "afternoon", label: "🌞 Buổi chiều" },
            { key: "evening", label: "🌙 Buổi tối" },
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
                  value={minutesToTime(shifts[key].startMinute)}
                  onChange={(e) =>
                    handleShiftTimeChange(key, "startMinute", e.target.value)
                  }
                  className="border rounded px-2 py-1 text-sm"
                />
                <label className="text-sm text-gray-500">Kết thúc:</label>
                <input
                  type="time"
                  value={minutesToTime(shifts[key].endMinute)}
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

      {/* Nút lưu */}
      <div className="mt-8 text-right">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400"
        >
          {saving ? "Đang lưu..." : "💾 Lưu cấu hình"}
        </button>
      </div>
    </div>
  );
};

export default AdminViewTimeWorkingCenter;
