// src/components/Admin/AdminManageShedule/components/common/LiveLogViewer.jsx

import React, { useEffect, useRef } from "react";

function LiveLogViewer({ logs }) {
  const logContainerRef = useRef(null);

  // Tự động cuộn xuống log mới nhất
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div
      ref={logContainerRef}
      className="bg-gray-900 text-white font-mono p-4 rounded-lg h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600"
    >
      {logs.map((log, index) => (
        <div key={index} className="flex space-x-3 text-sm mb-1">
          <span className="text-gray-500">
            {new Date(log.timestamp).toLocaleTimeString("vi-VN")}
          </span>
          <span className={`font-bold ${log.isError ? "text-red-400" : "text-purple-400"}`}>
            [{log.stage}]
          </span>
          <span className={`${log.isError ? "text-red-400" : "text-gray-200"}`}>
            {log.message}
          </span>
        </div>
      ))}
    </div>
  );
}

export default LiveLogViewer;