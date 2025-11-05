// src/components/Admin/AdminManageShedule/components/views/JobErrorView.jsx

import React from "react";
import { Link } from "react-router-dom";
import { XCircle, ArrowLeft } from "lucide-react";
import LiveLogViewer from "../common/LiveLogViewer";

function JobErrorView({ job }) {
  const errorLog = job.logs.find(log => log.isError) || job.logs[job.logs.length - 1];

  return (
    <div className="bg-white p-10 rounded-lg shadow-lg border-t-8 border-red-500">
      <div className="flex flex-col items-center text-center">
        <XCircle className="h-24 w-24 text-red-500" />
        <h2 className="text-4xl font-extrabold text-gray-800 mt-6">
          Lỗi Hệ Thống
        </h2>
        <p className="text-xl text-red-600 mt-2">
          {errorLog?.message || "Đã xảy ra lỗi không xác định."}
        </p>
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Chi tiết Log Lỗi:</h3>
        <LiveLogViewer logs={job.logs} />
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          to="/admin/scheduler/dashboard"
          className="flex items-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Về Dashboard
        </Link>
      </div>
    </div>
  );
}

export default JobErrorView;