// src/components/Admin/AdminManageShedule/components/views/JobInProgressView.jsx

import React from "react";
import FriendlyLogView from "../common/FriendlyLogView"; 
import { Loader2 } from "lucide-react";

function JobInProgressView({ job }) {
  const lastLog = job.logs[job.logs.length - 1] || {};

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg animate-pulse-fast">
      <div className="flex items-center space-x-4 mb-6">
        <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            Hệ thống đang chạy...
          </h2>
          <p className="text-lg text-gray-600 mt-1">
            Giai đoạn: <span className="font-semibold text-purple-700">{lastLog.stage || "INIT"}</span>
          </p>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-gray-700 italic mb-2">
          {lastLog.message || "Đang khởi tạo..."}
        </p>
        <FriendlyLogView logs={job.logs} />
      </div>
    </div>
  );
}

export default JobInProgressView;