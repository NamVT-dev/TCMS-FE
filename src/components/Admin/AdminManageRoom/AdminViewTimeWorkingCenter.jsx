// src/components/Admin/AdminManageUser/AdminManageRoom/AdminViewTimeWorkingCenter.jsx
// (Hoặc đường dẫn file của bạn)

import React, { useEffect, useState, useCallback } from "react";
import api from "../../../utils/api";
import { Loader2, Save } from "lucide-react";

// 🗓 Backend: 0 = CN, 1 = T2, ..., 6 = T7
const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
// ⬇️ Dùng 6 ca S1-S6
const SHIFT_NAMES = ["S1", "S2", "S3", "S4", "S5", "S6"];

// 🕒 Chuyển đổi phút <-> "HH:mm"
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ✅ Lấy config từ backend
  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.admin.center.getConfig();
      const conf = res.data?.data?.config;

      // Chuẩn hóa 6 ca S1-S6
      const shiftObj = {};
      const beShifts = conf.shifts || [];

      for (const shift of beShifts) {
        shiftObj[shift.name] = {
          startMinute: shift.startMinute,
          endMinute: shift.endMinute,
        };
      }

      const defaultShiftValues = {
        S1: { startMinute: 480, endMinute: 590 },
        S2: { startMinute: 600, endMinute: 710 },
        S3: { startMinute: 780, endMinute: 890 },
        S4: { startMinute: 900, endMinute: 1010 },
        S5: { startMinute: 1080, endMinute: 1190 },
        S6: { startMinute: 1200, endMinute: 1310 },
      };

      for (const name of SHIFT_NAMES) {
        if (!shiftObj[name]) {
          shiftObj[name] = defaultShiftValues[name];
        }
      }

      // Đảm bảo đủ 7 ngày (0–6)
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
    } finally {
      setLoading(false);
    }
  }, []); // Mảng rỗng fix lỗi lặp vô tận

  // ⬇️ BẮT ĐẦU SỬA LỖI LOGIC
  // ✅ Toggle chọn ngày hoạt động
  const toggleDay = (index) => {
    setConfig((prev) => {
      const isActive = prev.activeDaysOfWeek.includes(index);
      let newDays;
      let newDayShifts = [...prev.dayShifts];

      if (isActive) {
        // Logic khi *bỏ chọn* một ngày
        newDays = prev.activeDaysOfWeek.filter((d) => d !== index);
        // Tự động bỏ check tất cả các ca của ngày đó
        newDayShifts = newDayShifts.map((d) =>
          d.dayOfWeek === index ? { ...d, shifts: [] } : d
        );
      } else {
        // Logic khi *chọn thêm* một ngày
        newDays = [...prev.activeDaysOfWeek, index];

        // FIX: Đảm bảo hàng cho ngày này TỒN TẠI trong Bảng 3
        const existingDay = newDayShifts.find(d => d.dayOfWeek === index);
        if (!existingDay) {
          // Nếu chưa có (trường hợp này không nên xảy ra vì fetchConfig đã tạo 7 ngày)
          // nhưng chúng ta vẫn thêm để đảm bảo an toàn
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
  // ⬆️ KẾT THÚC SỬA LỖI LOGIC

  // ✅ Cập nhật giờ từng ca
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
      const shiftsArray = Object.entries(config.shifts).map(([name, s]) => ({
        name,
        startMinute: s.startMinute,
        endMinute: s.endMinute,
      }));

      // Lọc ra Bảng 3 (dayShifts) CHỈ cho những ngày active
      const activeDayShifts = config.dayShifts.filter(d =>
        config.activeDaysOfWeek.includes(d.dayOfWeek)
      );

      const payload = {
        timezone: config.timezone,
        activeDaysOfWeek: config.activeDaysOfWeek,
        shifts: shiftsArray,
        dayShifts: activeDayShifts, // ⬅️ Chỉ gửi những ngày active
      };
      const res = await api.admin.center.updateConfig(payload);
      const updatedConf = res.data?.data?.config;
      const updatedShiftsObj = {};
      updatedConf.shifts.forEach((s) => {
        updatedShiftsObj[s.name] = {
          startMinute: s.startMinute,
          endMinute: s.endMinute,
        };
      });

      // Tải lại toàn bộ config cho nhất quán
      //       setConfig((prev) => ({
      //       ...prev,
      //         ...updatedConf,
      //         shifts: updatedShiftsObj,
      //       }));
      await fetchConfig(); // Tải lại toàn bộ config sau khi lưu

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
  }, [fetchConfig]);

  if (loading || !config)
    return (
      <div className="p-8 text-gray-600 text-center flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );

  const { shifts, activeDaysOfWeek, dayShifts } = config;

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm max-w-5xl mx-auto mt-8 border border-gray-200">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Cấu hình thời gian hoạt động
      </h1>

      {/* 1️⃣ Ngày hoạt động */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-3">
          1. Ngày hoạt động
        </h2>
        <div className="flex flex-wrap gap-3">
          {dayNames.map((day, i) => {
            const isActive = activeDaysOfWeek.includes(i);
            return (
              <button
                key={i}
                onClick={() => toggleDay(i)}
                className={`px-4 py-2 rounded-lg border font-medium transition-all ${isActive
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white text-gray-700 hover:bg-purple-50 border-gray-300"
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
        <h2 className="text-xl font-semibold text-gray-700 mb-3">
          2. Định nghĩa khung giờ ca
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SHIFT_NAMES.map((shiftName) => (
            <div
              key={shiftName}
              className="flex items-center justify-between border p-4 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="font-semibold text-lg text-purple-700">{shiftName}</div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-500 sr-only">Bắt đầu:</label>
                <input
                  type="time"
                  value={minutesToTime(shifts[shiftName]?.startMinute)}
                  onChange={(e) =>
                    handleShiftTimeChange(shiftName, "startMinute", e.target.value)
                  }
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-purple-500 focus:border-purple-500"
                />
                <span className="text-gray-400">-</span>
                <label className="text-sm text-gray-500 sr-only">Kết thúc:</label>
                <input
                  type="time"
                  value={minutesToTime(shifts[shiftName]?.endMinute)}
                  onChange={(e) =>
                    handleShiftTimeChange(shiftName, "endMinute", e.target.value)
                  }
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3️⃣ Ca hoạt động theo từng ngày */}
      {/* ⬇️ SỬA LỖI LOGIC: Hiển thị Bảng 3 dựa trên 'activeDaysOfWeek' */}
      {activeDaysOfWeek.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            3. Chọn ca hoạt động cho từng ngày
          </h2>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-center border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border-b border-gray-200 p-3 w-24 text-sm font-semibold text-gray-600">Ngày</th>
                  {SHIFT_NAMES.map((name) => (
                    <th key={name} className="border-b border-gray-200 p-3 text-sm font-semibold text-gray-600">
                      {name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dayShifts
                  // 1. Lọc ra những ngày được chọn (giữ nguyên)
                  .filter((d) => activeDaysOfWeek.includes(d.dayOfWeek))
                  // 2. Sắp xếp lại theo thứ tự (CN -> T7)
                  .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                  .map((d) => (
                    <tr key={d.dayOfWeek} className="even:bg-white odd:bg-gray-50/50">
                      <td className="border-r border-gray-200 p-3 font-medium text-gray-800 bg-gray-50">
                        {dayNames[d.dayOfWeek]}
                      </td>
                      {SHIFT_NAMES.map((shiftName) => (
                        <td key={shiftName} className="border-r border-gray-200 last:border-r-0 p-3">
                          <input
                            type="checkbox"
                            checked={d.shifts.includes(shiftName)}
                            onChange={() =>
                              toggleShiftForDay(d.dayOfWeek, shiftName)
                            }
                            className="w-5 h-5 accent-purple-600 cursor-pointer"
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
      {/* ⬆️ KẾT THÚC SỬA LỖI LOGIC */}

      {/* Nút lưu */}
      <div className="text-right mt-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400"
        >
          {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
          {saving ? "Đang lưu..." : "Lưu cấu hình"}
        </button>
      </div>
    </div>
  );
};

export default AdminViewTimeWorkingCenter;