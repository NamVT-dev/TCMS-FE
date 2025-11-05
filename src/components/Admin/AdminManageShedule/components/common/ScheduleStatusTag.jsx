// src/components/Admin/AdminManageShedule/components/common/ScheduleStatusTag.jsx

import React from "react";

const getStatusClasses = (status) => {
  switch (status) {
    case "pending":
    case "running":
      return "bg-blue-100 text-blue-800"; // Đang chạy
    case "draft":
      return "bg-yellow-100 text-yellow-800"; // Cần duyệt
    case "finalizing":
      return "bg-purple-100 text-purple-800"; // Đang chốt
    case "completed":
      return "bg-green-100 text-green-800"; // Hoàn thành
    case "system_error":
      return "bg-red-100 text-red-800"; // Lỗi
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusText = (status) => {
  switch (status) {
    case "pending": return "Đang chờ";
    case "running": return "Đang chạy";
    case "draft": return "Cần duyệt (Draft)";
    case "finalizing": return "Đang chốt";
    case "completed": return "Hoàn thành";
    case "system_error": return "Lỗi hệ thống";
    default: return status;
  }
}

function ScheduleStatusTag({ status }) {
  return (
    <span
      className={`
        inline-flex items-center px-3 py-0.5 rounded-full 
        text-xs font-semibold leading-5
        ${getStatusClasses(status)}
      `}
    >
      {getStatusText(status)}
    </span>
  );
}

export default ScheduleStatusTag;