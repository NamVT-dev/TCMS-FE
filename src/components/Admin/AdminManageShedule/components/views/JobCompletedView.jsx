// src/components/Admin/AdminManageShedule/components/views/JobCompletedView.jsx

import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ArrowLeft } from "lucide-react";

function JobCompletedView({ job }) {
  const report = job.resultReport || {};
  const lastLog = job.logs[job.logs.length - 1] || {};

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white p-10 rounded-lg shadow-lg border-t-8 border-green-500">
      <CheckCircle2 className="h-24 w-24 text-green-500" />
      <h2 className="text-4xl font-extrabold text-gray-800 mt-6">
        Hoàn Tất!
      </h2>
      <p className="text-xl text-gray-600 mt-2">
        {lastLog.message || "Đã chốt và tạo lịch thành công!"}
      </p>
      
      <div className="mt-8 flex space-x-4">
        <Link
          to="/admin/scheduler/dashboard"
          className="flex items-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Về Dashboard
        </Link>
        <Link
          to="/admin/classes" // ⬅️ Điều hướng đến trang danh sách lớp
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          Xem Danh Sách Lớp
        </Link>
      </div>
    </div>
  );
}

export default JobCompletedView;