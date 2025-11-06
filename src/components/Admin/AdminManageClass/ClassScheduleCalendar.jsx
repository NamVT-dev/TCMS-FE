// src/components/Admin/AdminManageClass/ClassScheduleCalendar.jsx
// ⬆️ HÃY THAY THẾ TOÀN BỘ FILE NÀY

import React, { useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import momentPlugin from "@fullcalendar/moment";
import momentTimezonePlugin from "@fullcalendar/moment-timezone"; // Plugin Múi giờ
import viLocale from "@fullcalendar/core/locales/vi";
import { User, Home, Clock } from "lucide-react";

/**
 * 🎨 Giao diện tùy chỉnh cho mỗi Event (Buổi học)
 */
const renderEventContent = (eventInfo) => {
    const { teacher, room } = eventInfo.event.extendedProps;
    const start = eventInfo.event.start;
    const end = eventInfo.event.end;

    const formatTime = (date) => {
        if (!date) return '';
        return new Intl.DateTimeFormat('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Bangkok'
        }).format(date);
    };

    const timeText = `${formatTime(start)} - ${formatTime(end)}`;

    // Chế độ xem "Tháng"
    if (eventInfo.view.type === 'dayGridMonth') {
        return (
            <div className="p-1 overflow-hidden text-xs bg-purple-600 text-white rounded-sm border-l-2 border-purple-800">
                <b>{formatTime(start)}</b> - {teacher}
            </div>
        );
    }

    // Chế độ xem "Tuần" / "Ngày"
    return (
        <div className="p-1.5 text-white h-full overflow-hidden flex flex-col">
            <div className="flex items-center text-xs font-bold mb-0.5">
                <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                <span>{timeText}</span>
            </div>
            <div className="flex items-center text-xs mb-0.5">
                <User className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">{teacher}</span>
            </div>
            <div className="flex items-center text-xs">
                <Home className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">{room}</span>
            </div>
        </div>
    );
};


function ClassScheduleCalendar({ sessions, classInfo }) {

    const events = useMemo(() => {
        return sessions.map(session => ({
            id: session._id,
            title: classInfo.name,
            start: session.startAt,
            end: session.endAt,
            extendedProps: {
                teacher: session.teacher?.profile?.fullname || 'N/A',
                room: session.room?.name || 'N/A',
                sessionNo: session.sessionNo,
            },
            className: 'fc-event-purple', // Class tùy chỉnh cho event
        }));
    }, [sessions, classInfo.name]);

    return (
        // ⬇️ BẮT ĐẦU NÂNG CẤP UI
        <div className="bg-white p-4 rounded-lg shadow-lg text-sm">
            {/* Thêm thẻ <style> để override CSS của FullCalendar */}
            <style>{`
        /* 1. Toolbar chung (nền, nút) */
        .fc .fc-header-toolbar {
          margin-bottom: 1rem !important;
          font-family: inherit !important; /* Dùng font của trang */
        }

        /* 2. Nút (Thường) */
        .fc .fc-button {
          background-color: #ffffff !important;
          border: 1px solid #e5e7eb !important; /* border-gray-200 */
          color: #374151 !important; /* text-gray-700 */
          box-shadow: none !important;
          padding: 0.5rem 0.75rem !important;
          text-transform: capitalize !important;
          font-weight: 500 !important;
          border-radius: 0.375rem !important; /* rounded-md */
        }
        .fc .fc-button:hover {
          background-color: #f9fafb !important; /* bg-gray-50 */
        }

        /* 3. Nút Active (Tháng, Tuần, Ngày - khi được chọn) */
        .fc .fc-button-primary:not(:disabled).fc-button-active,
        .fc .fc-button-primary:not(:disabled):active {
          background-color: #7c3aed !important; /* bg-purple-600 */
          border-color: #7c3aed !important;
          color: #ffffff !important;
        }

        /* 4. Nút "Hôm nay" */
        .fc .fc-today-button {
          background-color: #ede9fe !important; /* bg-purple-100 */
          border-color: #ddd6fe !important; /* border-purple-200 */
          color: #7c3aed !important; /* text-purple-600 */
          font-weight: 600 !important;
        }
        .fc .fc-today-button:disabled {
          background-color: #f3f4f6 !important;
          color: #9ca3af !important;
          border-color: #e5e7eb !important;
        }

        /* 5. Tiêu đề (vd: "tháng 11 năm 2025") */
        .fc .fc-toolbar-title {
          font-size: 1.25rem !important; /* text-xl */
          font-weight: 700 !important;
          color: #111827 !important; /* text-gray-900 */
        }

        /* 6. Header của Lịch (Th 2, Th 3...) */
        .fc .fc-col-header-cell {
          background-color: #f9fafb !important; /* bg-gray-50 */
          border-color: #e5e7eb !important;
        }
        .fc .fc-col-header-cell-cushion {
          color: #4b5563 !important; /* text-gray-600 */
          font-weight: 600 !important;
          padding: 0.75rem 0.25rem !important;
        }
        
        /* 7. Đường kẻ, ô */
        .fc-theme-standard .fc-timegrid-slots td,
        .fc-theme-standard .fc-timegrid-cols td,
        .fc-theme-standard th, 
        .fc-theme-standard td {
          border-color: #e5e7eb !important; /* border-gray-200 */
        }

        /* 8. Cột "Hôm nay" (thay màu vàng bằng màu tím nhạt) */
        .fc .fc-day-today {
          background-color: #f5f3ff !important; /* bg-purple-50 */
        }

        /* 9. Giờ (07 giờ, 08 giờ) */
        .fc .fc-timegrid-slot-label-cushion {
          color: #6b7280 !important; /* text-gray-500 */
          font-size: 0.75rem !important;
        }
        
        /* 10. Event (màu tím) */
        .fc-event-purple {
          background-color: #7c3aed !important;
          border-color: #6d28d9 !important;
          color: #ffffff !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
      `}</style>

            <FullCalendar
                plugins={[
                    dayGridPlugin,
                    timeGridPlugin,
                    listPlugin,
                    momentPlugin,
                    momentTimezonePlugin
                ]}
                initialView="timeGridWeek"
                headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
                }}
                events={events}
                locales={[viLocale]}
                locale="vi"
                timeZone="Asia/Bangkok"
                eventContent={renderEventContent}
                allDaySlot={false}
                height="auto"
                slotMinTime="07:00:00"
                slotMaxTime="22:00:00"
                eventMinHeight={60}
            />
        </div>
        
    );
}

export default ClassScheduleCalendar;