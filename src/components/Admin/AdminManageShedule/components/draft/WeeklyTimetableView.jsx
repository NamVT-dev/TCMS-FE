// src/components/Admin/AdminManageShedule/components/draft/WeeklyTimetableView.jsx

import React, { useMemo } from "react";
import { User, Home, BookOpen, AlertTriangle } from "lucide-react";

// 1. Component "Card" cho mỗi buổi học
const ScheduleCard = ({ assignment }) => {
  const { 
    courseName, 
    teacher, 
    room, 
    violatesAvailability 
  } = assignment;

  // Lấy tên giáo viên và phòng (đã được populate)
  const teacherName = teacher?.profile?.fullname || "Chưa gán";
  const roomName = room?.name || "Chưa gán";

  return (
    <div
      className={`
        p-3 rounded-lg shadow-md mb-2 
        bg-white border-l-4
        ${violatesAvailability 
          ? 'border-red-500 hover:shadow-red-100' 
          : 'border-purple-500 hover:shadow-purple-100'
        }
      `}
      title={violatesAvailability ? "Cảnh báo: Lịch này bị ép (GV không rảnh)" : ""}
    >
      {/* Cảnh báo ép lịch */}
      {violatesAvailability && (
        <div className="flex items-center text-red-600 mb-1">
          <AlertTriangle className="h-4 w-4 mr-1.5 flex-shrink-0" />
          <span className="text-xs font-bold">Ép Lịch</span>
        </div>
      )}

      {/* Tên khóa học */}
      <div className="flex items-start text-purple-800 mb-1.5">
        <BookOpen className="h-4 w-4 mr-1.5 mt-0.5 flex-shrink-0" />
        <span className="font-bold text-sm leading-tight">{courseName}</span>
      </div>
      
      {/* Giáo viên */}
      <div className="flex items-center text-gray-700 mb-1">
        <User className="h-4 w-4 mr-1.5 flex-shrink-0" />
        <span className="text-xs">{teacherName}</span>
      </div>
      
      {/* Phòng */}
      <div className="flex items-center text-gray-700">
        <Home className="h-4 w-4 mr-1.5 flex-shrink-0" />
        <span className="text-xs">{roomName}</span>
      </div>
    </div>
  );
};

// 2. Component Lịch Tuần chính
function WeeklyTimetableView({ draftSchedule }) {
  // --- Xử lý dữ liệu ---
  const { days, shiftNames, gridData } = useMemo(() => {
    if (!draftSchedule || draftSchedule.length === 0) {
      return { days: [], shiftNames: [], gridData: new Map() };
    }

    // [Thứ 2, ... , Chủ Nhật]
    const days = [
      { id: 1, name: "Thứ Hai" },
      { id: 2, name: "Thứ Ba" },
      { id: 3, name: "Thứ Tư" },
      { id: 4, name: "Thứ Năm" },
      { id: 5, name: "Thứ Sáu" },
      { id: 6, name: "Thứ Bảy" },
      { id: 0, name: "Chủ Nhật" }, // Sun = 0 (theo Moment.js .day())
    ];

    // Gộp tất cả các buổi học từ các lớp lại
    const allAssignments = draftSchedule.flat();

    // Tự động tìm tất cả các ca học
    const uniqueShifts = [...new Set(allAssignments.map(a => a.shiftName))];
    
    // Tạm thời sắp xếp theo tên ca, bạn có thể custom sort nếu cần
    const shiftNames = uniqueShifts.sort(); 

    // Build một Map để tra cứu nhanh: "D{day}_{shiftName}" -> [assignment1, ...]
    const gridData = new Map();
    for (const assignment of allAssignments) {
      const key = `D${assignment.day}_${assignment.shiftName}`;
      if (!gridData.has(key)) {
        gridData.set(key, []);
      }
      gridData.get(key).push(assignment);
    }

    return { days, shiftNames, gridData };
  }, [draftSchedule]);
  // --- Kết thúc xử lý dữ liệu ---


  if (shiftNames.length === 0) {
    return (
      <div className="p-10 text-center bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-700">Chưa có lịch nháp</h3>
        <p className="text-gray-500">Thuật toán không xếp được lớp nào, hoặc không có nhu cầu.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto scrollbar-thin">
      <div className="min-w-[1200px]"> {/* Đảm bảo bảng không bị vỡ */}
        {/* Lưới Lịch */}
        <div className="grid grid-cols-8 gap-px bg-gray-200 border border-gray-200">
          
          {/* Hàng Header (Ca / Ngày) */}
          <div className="bg-purple-800 text-white p-3 font-semibold text-sm sticky left-0 z-10">
            Ca học
          </div>
          {days.map((day) => (
            <div key={day.id} className="bg-purple-800 text-white p-3 font-semibold text-sm text-center">
              {day.name}
            </div>
          ))}

          {/* Các hàng dữ liệu (Ca) */}
          {shiftNames.map((shiftName) => (
            <React.Fragment key={shiftName}>
              {/* Cột tên Ca */}
              <div className="bg-purple-100 text-purple-900 p-3 font-semibold text-sm sticky left-0 z-10">
                {shiftName}
              </div>
              
              {/* Các ô lịch trong tuần */}
              {days.map((day) => {
                const key = `D${day.id}_${shiftName}`;
                const assignmentsForCell = gridData.get(key) || [];
                
                return (
                  <div 
                    key={key} 
                    className="bg-white p-2 min-h-[100px] align-top"
                  >
                    {/* Render các card buổi học */}
                    {assignmentsForCell.length > 0 && (
                      <div className="space-y-2">
                        {assignmentsForCell.map((assignment) => (
                          <ScheduleCard 
                            key={assignment.virtualClassId + assignment.day} 
                            assignment={assignment} 
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WeeklyTimetableView;