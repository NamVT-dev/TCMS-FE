import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const TeacherViewSchedule = () => {
  // Mock dữ liệu
  const events = [
    {
      title: "TOEIC A1",
      start: "2025-10-06T18:00:00",
      end: "2025-10-06T22:00:00",
      extendedProps: {
        className: "TOEIC A1",
        course: "TOEIC A1",
        room: "Phòng 203",
      },
      backgroundColor: "#38bdf8",
    },
    {
      title: "IELTS B2",
      start: "2025-10-08T14:00:00",
      end: "2025-10-08T17:00:00",
      extendedProps: {
        className: "IELTS B2",
        course: "IELTS B2",
        room: "Phòng 101",
      },
      backgroundColor: "#34d399",
    },
    {
      title: "TOEIC B1",
      start: "2025-10-11T08:00:00",
      end: "2025-10-11T11:00:00",
      extendedProps: {
        className: "TOEIC B1",
        course: "TOEIC B1",
        room: "Phòng 405",
      },
      backgroundColor: "#fbbf24",
    },
  ];

  // Hàm format giờ
  const formatTime = (date) =>
    date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-8">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-10xl mx-auto">
        {/* Title */}
        <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
          Thời khóa biểu giảng dạy
        </h1>

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          locale="vi"
          allDaySlot={false}
          slotMinTime="08:00:00"
          slotMaxTime="22:00:00"
          events={events}
          height="auto"
          slotLabelFormat={{
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }}
          buttonText={{
            today: "Today",
            month: "Month",
            week: "Week",
            day: "Day",
          }}
          eventContent={(arg) => {
            const start = new Date(arg.event.start);
            const end = new Date(arg.event.end);

            return (
              <div className="p-1 text-[11px] leading-tight text-white">
                <div className="font-bold text-sm">
                  Lớp:{" "}
                  {arg.event.extendedProps?.className ||
                    arg.event.title.split(" - ")[0]}
                </div>
                <div>Khóa: {arg.event.extendedProps?.course || "Không rõ"}</div>
                <div>Phòng: {arg.event.extendedProps?.room || "Không rõ"}</div>
                <div>
                  Thời gian: {formatTime(start)} - {formatTime(end)}
                </div>
              </div>
            );
          }}
        />
      </div>

      {/* Custom styles */}
      <style>
        {`
          /* Tiêu đề tuần/tháng */
          .fc-toolbar-title {
            font-weight: 700 !important;
            font-size: 1.2rem !important;
            color: #111827;
          }

          /* Style cho các nút toolbar */
          .fc-button {
              background-color: #38bdf8 !important;
              border: none !important;
              color: white !important;
              border-radius: 6px !important;
              padding: 6px 12px !important;
              font-weight: 500;
              transition: background-color 0.2s ease;
              text-transform: capitalize; 
          }

          .fc-button:hover {
            background-color: #0ea5e9 !important;
          }

          .fc-button-active {
            background-color: #0284c7 !important;
          }

          /* Giờ hiển thị 08:00 thay vì 8 giờ */
          .fc-timegrid-slot-label {
            font-weight: 500;
            color: #374151;
          }
        `}
      </style>
    </div>
  );
};

export default TeacherViewSchedule;
