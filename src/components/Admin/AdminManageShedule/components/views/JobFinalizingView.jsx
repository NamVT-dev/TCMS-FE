// src/components/Admin/AdminManageShedule/components/views/JobFinalizingView.jsx

import React from "react";
import { Loader2, Database } from "lucide-react";

function JobFinalizingView() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white p-10 rounded-lg shadow-lg">
      <Loader2 className="h-20 w-20 animate-spin text-purple-600" />
      <h2 className="text-4xl font-extrabold text-gray-800 mt-8">
        Đang chốt lịch...
      </h2>
      <p className="text-xl text-gray-600 mt-2">
        Hệ thống đang tạo Lớp học và Buổi học thật. Vui lòng không tắt trình duyệt!
      </p>
    </div>
  );
}

export default JobFinalizingView;