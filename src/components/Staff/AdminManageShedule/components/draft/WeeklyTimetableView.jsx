import React, { useMemo } from "react";
import { User, Home, BookOpen, AlertTriangle } from "lucide-react";


const ScheduleCard = ({ assignment }) => {
  const { 
    courseName, 
    teacher, 
    room, 
    violatesAvailability 
  } = assignment;

  
  const teacherName = teacher?.profile?.fullname || "Chưa gán";
  const roomName = room?.name || "Chưa gán";

  return (
    <div
      className={`
        p-3 rounded-lg shadow-md mb-2 
        bg-white border-l-4
        ${violatesAvailability 
          ? 'border-red-500 hover:shadow-red-100' 
          : 'border-green-500 hover:shadow-green-100'
        }
      `}
      title={violatesAvailability ? "Cảnh báo: Lịch này bị không phù hợp (GV không đăng ký)" : ""}
    >
     
      {violatesAvailability && (
        <div className="flex items-center text-red-600 mb-1">
          <AlertTriangle className="h-4 w-4 mr-1.5 flex-shrink-0" />
          <span className="text-xs font-bold">Lịch không phù hợp</span>
        </div>
      )}

     
      <div className="flex items-start text-purple-800 mb-1.5">
        <BookOpen className="h-4 w-4 mr-1.5 mt-0.5 flex-shrink-0" />
        <span className="font-bold text-sm leading-tight">{courseName}</span>
      </div>
      
      
      <div className="flex items-center text-gray-700 mb-1">
        <User className="h-4 w-4 mr-1.5 flex-shrink-0" />
        <span className="text-xs">{teacherName}</span>
      </div>
      
     
      <div className="flex items-center text-gray-700">
        <Home className="h-4 w-4 mr-1.5 flex-shrink-0" />
        <span className="text-xs">{roomName}</span>
      </div>
    </div>
  );
};


function WeeklyTimetableView({ draftSchedule }) {

  const { days, shiftNames, gridData } = useMemo(() => {
    if (!draftSchedule || draftSchedule.length === 0) {
      return { days: [], shiftNames: [], gridData: new Map() };
    }

    
    const days = [
      { id: 1, name: "Thứ Hai" },
      { id: 2, name: "Thứ Ba" },
      { id: 3, name: "Thứ Tư" },
      { id: 4, name: "Thứ Năm" },
      { id: 5, name: "Thứ Sáu" },
      { id: 6, name: "Thứ Bảy" },
      { id: 0, name: "Chủ Nhật" }, 
    ];

    
    

    
    const shiftNames = ["S1", "S2", "S3", "S4", "S5", "S6"];

    const gridData = new Map();

    // 3. Chỉ map dữ liệu nếu có draftSchedule
    if (draftSchedule && draftSchedule.length > 0) {
      const allAssignments = draftSchedule.flat();

      for (const assignment of allAssignments) {
        // Lưu ý: Đảm bảo assignment.shiftName khớp với S1, S2... 
        const key = `D${assignment.day}_${assignment.shiftName}`;
        if (!gridData.has(key)) {
          gridData.set(key, []);
        }
        gridData.get(key).push(assignment);
      }
    }

    return { days, shiftNames, gridData };
  }, [draftSchedule]);
 


  if (shiftNames.length === 0) {
    return (
      <div className="p-10 text-center bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-700">Chưa có lịch nháp</h3>
        <p className="text-gray-500">Thuật toán không xếp được lớp nào, hoặc không có nhu cầu.</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .timetable-grid {
          display: grid;
          grid-template-columns: 80px repeat(7, 1fr);
          gap: 1px;
          background-color: rgb(229, 231, 235);
          border: 1px solid rgb(229, 231, 235);
        }
        
        .shift-column {
          width: 80px;
          min-width: 80px;
          max-width: 80px;
        }
      `}</style>

      <div className="w-full overflow-x-auto scrollbar-thin">
        <div className="min-w-[1200px]"> 
          <div className="timetable-grid">
            
            {/* Header - Ca học */}
            <div className="shift-column bg-purple-800 text-white p-3 font-semibold text-sm sticky left-0 z-10">
              Ca học
            </div>
            
            {/* Header - Days */}
            {days.map((day) => (
              <div key={day.id} className="bg-purple-800 text-white p-3 font-semibold text-sm text-center">
                {day.name}
              </div>
            ))}

            {/* Grid Content */}
            {shiftNames.map((shiftName) => (
              <React.Fragment key={shiftName}>
                {/* Shift Name Column */}
                <div className="shift-column bg-purple-100 text-purple-900 p-3 font-semibold text-sm sticky left-0 z-10">
                  {shiftName}
                </div>
                
                {/* Day Columns */}
                {days.map((day) => {
                  const key = `D${day.id}_${shiftName}`;
                  const assignmentsForCell = gridData.get(key) || [];
                  
                  return (
                    <div 
                      key={key} 
                      className="bg-white p-2 min-h-[100px] align-top"
                    >
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
    </>
  );
}

export default WeeklyTimetableView;