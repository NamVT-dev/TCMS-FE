import React, { useState } from "react";

const TeacherRegisterSchedule = () => {
    const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];
    const sessions = [
        { key: "morning", label: "Buổi sáng (8h - 11h)" },
        { key: "afternoon", label: "Buổi chiều (14h - 17h)" },
        { key: "evening", label: "Buổi tối (18h - 22h)" },
    ];

    // Dữ liệu mock
    const [schedule, setSchedule] = useState({
        "Thứ 2": { evening: true },
        "Thứ 3": { evening: false },
        "Thứ 4": { evening: false },
        "Thứ 5": { evening: true },
        "Thứ 6": { evening: true },
        "Thứ 7": { morning: true, afternoon: false, evening: true },
        "Chủ nhật": { morning: true },
    });

    const [isEditing, setIsEditing] = useState(false);

    // Toggle khi chỉnh sửa
    const handleToggle = (day, time) => {
        if (!isEditing) return;
        setSchedule((prev) => ({
            ...prev,
            [day]: { ...prev[day], [time]: !prev[day]?.[time] },
        }));
    };

    const handleUpdate = () => setIsEditing(true);

    const handleSave = () => {
        setIsEditing(false);
        const selected = Object.entries(schedule)
            .map(([day, times]) => {
                const selectedSlots = Object.entries(times)
                    .filter(([_, checked]) => checked)
                    .map(([slot]) =>
                        slot === "morning"
                            ? "Sáng"
                            : slot === "afternoon"
                                ? "Chiều"
                                : "Tối"
                    );
                return selectedSlots.length ? `${day} (${selectedSlots.join(", ")})` : null;
            })
            .filter(Boolean);
        alert("🕓 Đã lưu lịch làm:\n" + selected.join("\n"));
    };

    return (
       <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-24 pb-10">
  <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-10xl mx-6">
                {/* Title */}
                <h1 className="text-2xl font-bold text-gray-800 mb-8 text-center">
                    Đăng ký giờ làm
                </h1>

                {/* Bảng */}
                <div className="overflow-x-auto">
                    <table className="w-full border border-gray-300 text-center">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 border">Buổi</th>
                                {days.map((day) => (
                                    <th key={day} className="p-3 border">
                                        {day}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {sessions.map((session) => (
                                <tr key={session.key}>
                                    <td className="font-medium border p-3">{session.label}</td>
                                    {days.map((day) => {
                                        const available =
                                            (["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6"].includes(
                                                day
                                            ) &&
                                                session.key === "evening") ||
                                            (day === "Thứ 7") ||
                                            (day === "CN" && session.key === "morning");

                                        if (!available) {
                                            return (
                                                <td key={`${day}-${session.key}`} className="border p-3 bg-gray-50 text-gray-400">
                                                    —
                                                </td>
                                            );
                                        }

                                        const checked = schedule[day]?.[session.key] || false;

                                        return (
                                            <td
                                                key={`${day}-${session.key}`}
                                                className={`border p-3 transition ${checked && !isEditing ? "bg-sky-100" : ""
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => handleToggle(day, session.key)}
                                                    disabled={!isEditing}
                                                    className={`w-5 h-5 ${isEditing
                                                            ? "cursor-pointer accent-sky-600"
                                                            : checked
                                                                ? "accent-sky-500 opacity-100 cursor-not-allowed"  /* ✅ view + checked = xanh */
                                                                : "accent-gray-300 opacity-70 cursor-not-allowed"  /* ✅ view + chưa check = xám nhạt */
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

                {/* Thông báo */}
                <div className="mt-6 text-gray-700">
                    {Object.entries(schedule).some(([_, times]) =>
                        Object.values(times).some(Boolean)
                    ) ? (
                        <p>
                            🕓 Bạn đăng ký lịch làm vào:{" "}
                            <span className="font-medium text-sky-600">
                                {Object.entries(schedule)
                                    .map(([day, times]) => {
                                        const selectedSlots = Object.entries(times)
                                            .filter(([_, checked]) => checked)
                                            .map(([slot]) =>
                                                slot === "morning"
                                                    ? "Sáng"
                                                    : slot === "afternoon"
                                                        ? "Chiều"
                                                        : "Tối"
                                            );
                                        return selectedSlots.length
                                            ? `${day} (${selectedSlots.join(", ")})`
                                            : null;
                                    })
                                    .filter(Boolean)
                                    .join(", ")}
                            </span>
                        </p>
                    ) : (
                        <p className="text-red-500">⚠️ Bạn chưa đăng ký ngày làm nào.</p>
                    )}
                </div>

                {/* Buttons */}
                <div className="flex justify-end mt-8 gap-4">
                    <button
                        onClick={handleUpdate}
                        disabled={isEditing}
                        className={`px-6 py-2 rounded-lg font-medium transition ${isEditing
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-gray-600 text-white hover:bg-gray-700"
                            }`}
                    >
                        Cập nhật lịch làm
                    </button>

                    {isEditing && (
                        <button
                            onClick={handleSave}
                            className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition font-medium"
                        >
                            Lưu
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherRegisterSchedule;
