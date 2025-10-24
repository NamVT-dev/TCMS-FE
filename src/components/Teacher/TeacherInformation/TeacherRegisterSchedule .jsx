import React, { useEffect, useState } from "react";
import api from "../../../utils/api";

const DAY_NAMES = [
  { id: 0, label: "CN" },
  { id: 1, label: "T2" },
  { id: 2, label: "T3" },
  { id: 3, label: "T4" },
  { id: 4, label: "T5" },
  { id: 5, label: "T6" },
  { id: 6, label: "T7" },
];

const SHIFT_LABELS = {
  morning: "Buổi sáng",
  afternoon: "Buổi chiều",
  evening: "Buổi tối",
};

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

export default function TeacherRegisterSchedule() {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(null);

  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [slots, setSlots] = useState([]);
  const [centerConfig, setCenterConfig] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [meRes, catRes, cfgRes] = await Promise.allSettled([
          api.user.getMe(),
          api.teacher.getTeachCategories(),
          api.teacher.getShiftConfig(),
        ]);

        if (meRes.status === "fulfilled") {
          const teacher = meRes.value?.data?.data?.data || {};
          setSelectedCategories(teacher.teachCategories || []);
          setSlots(normalizeSlots(teacher.availability || []));
        }

        if (catRes.status === "fulfilled") {
          setCategories(catRes.value?.data?.data?.categories || []);
        }

        if (cfgRes.status === "fulfilled") {
          setCenterConfig(cfgRes.value?.data?.data?.config || null);
        }
      } catch (err) {
        console.error(err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Toggle môn giảng dạy
  const toggleCategory = (cat) =>
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );

  // Thêm / xóa ngày
  const toggleDay = (dayId) => {
    if (!editing) return;
    setSlots((prev) => {
      const exists = prev.some((s) => s.dayOfWeek === dayId);
      if (exists) return prev.filter((s) => s.dayOfWeek !== dayId);

      // Lấy shift mặc định từ centerConfig cho ngày này
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

  // Toggle ca trong ngày
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
      await api.teacher.registerCategories(selectedCategories);
      await api.teacher.registerShift({ slots: buildShiftPayloadSlots() });
      const meRes = await api.user.getMe();
      const teacher = meRes?.data?.data?.data || {};
      setSelectedCategories(teacher.teachCategories || []);
      setSlots(normalizeSlots(teacher.availability || []));
      setEditing(false);
      alert("Đã lưu thay đổi.");
    } catch (err) {
      console.error("Lưu thất bại:", err);
      alert("Lưu thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      const meRes = await api.user.getMe();
      const teacher = meRes?.data?.data?.data || {};
      setSelectedCategories(teacher.teachCategories || []);
      setSlots(normalizeSlots(teacher.availability || []));
      setEditing(false);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi hủy. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
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

  if (loading) return <div className="p-8 text-center text-gray-600">Đang tải...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          {editing ? "Cập nhật lịch giảng dạy" : "Lịch giảng dạy"}
        </h2>

        {/* --- Môn giảng dạy --- */}
        <section className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Môn giảng dạy</h3>
          {!editing ? (
            selectedCategories?.length ? (
              <div className="flex flex-wrap gap-2">
                {selectedCategories.map((c) => (
                  <span
                    key={c}
                    className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm"
                  >
                    {c}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Chưa đăng ký môn nào</p>
            )
          ) : (
            <div className="flex flex-wrap gap-3">
              {categories.map((c) => (
                <label
                  key={c}
                  className="flex items-center gap-2 px-3 py-1 border rounded hover:bg-sky-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(c)}
                    onChange={() => toggleCategory(c)}
                    className="accent-sky-600"
                  />
                  <span className="text-sm">{c}</span>
                </label>
              ))}
            </div>
          )}
        </section>

        {/* --- Chọn ngày --- */}
        <section className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Chọn ngày trong tuần</h3>
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
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg cursor-pointer border ${
                    isActive
                      ? "bg-sky-600 text-white border-sky-600"
                      : "bg-white text-gray-700 border-gray-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => toggleDay(d.id)}
                    disabled={!editing}
                    className="accent-sky-600"
                  />
                  <span className="text-sm">{d.label}</span>
                </label>
              );
            })}
          </div>
        </section>

        {/* --- Thiết lập theo ngày --- */}
        <section className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Thiết lập theo ngày đã chọn</h3>
          {slots.length === 0 && <p className="text-gray-500">Chưa có ngày nào được chọn.</p>}

          <div className="space-y-4">
            {slots
              .slice()
              .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
              .map((slot) => {
                const dayLabel = DAY_NAMES.find((d) => d.id === slot.dayOfWeek)?.label;
                // shift khả dụng theo config
                const availableShifts =
                  centerConfig?.dayShifts?.find((d) => d.dayOfWeek === slot.dayOfWeek)?.shifts ||
                  [];

                return (
                  <div key={slot.dayOfWeek} className="bg-gray-50 border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-md font-medium text-gray-800">{dayLabel}</div>
                      <div className="text-sm text-gray-500">Ngày hiệu lực</div>
                    </div>

                    {/* shifts */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {availableShifts.length === 0 ? (
                        <p className="text-gray-500 text-sm">Không có ca nào cho ngày này.</p>
                      ) : (
                        availableShifts.map((sk) => {
                          const checked = slot.shifts.includes(sk);
                          return (
                            <label
                              key={sk}
                              className={`px-3 py-1 rounded-lg border cursor-pointer ${
                                checked
                                  ? "bg-sky-600 text-white border-sky-600"
                                  : "bg-white text-gray-700 border-gray-200"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleShift(slot.dayOfWeek, sk)}
                                disabled={!editing}
                                className="hidden"
                              />
                              <span className="text-sm">{SHIFT_LABELS[sk] || sk}</span>
                            </label>
                          );
                        })
                      )}
                    </div>

                    {/* effective */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Bắt đầu (start)</div>
                        <input
                          value={slot.effective?.start || ""}
                          onChange={(e) =>
                            setEffective(slot.dayOfWeek, "start", e.target.value)
                          }
                          type="date"
                          disabled={!editing}
                          className="w-full border rounded px-3 py-2"
                        />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Kết thúc (end)</div>
                        <input
                          value={slot.effective?.end || ""}
                          onChange={(e) =>
                            setEffective(slot.dayOfWeek, "end", e.target.value)
                          }
                          type="date"
                          disabled={!editing}
                          className="w-full border rounded px-3 py-2"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>

        {/* --- Lịch hiện tại --- */}
        <section className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Lịch hiện tại (đang có hiệu lực)</h3>
          {currentVisibleSlots.length === 0 ? (
            <p className="text-gray-500">Hiện không có lịch nào trong khoảng hiệu lực.</p>
          ) : (
            <div className="grid gap-3">
              {currentVisibleSlots.map((s) => {
                const dayLabel = DAY_NAMES.find((d) => d.id === s.dayOfWeek)?.label;
                return (
                  <div key={s.dayOfWeek} className="flex items-center justify-between border rounded px-4 py-2 bg-white">
                    <div>
                      <div className="text-sm font-medium text-gray-800">{dayLabel}</div>
                      <div className="text-sm text-gray-600">
                        {s.shifts.length
                          ? s.shifts.map((k) => SHIFT_LABELS[k] || k).join(", ")
                          : "Không có ca"}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {s.effective?.start || s.effective?.end
                        ? `${s.effective?.start || "?"} → ${s.effective?.end || "?"}`
                        : "Không giới hạn"}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* --- Buttons --- */}
        <div className="flex justify-end gap-3">
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700"
            >
              Cập nhật
            </button>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700"
              >
                Lưu thay đổi
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
