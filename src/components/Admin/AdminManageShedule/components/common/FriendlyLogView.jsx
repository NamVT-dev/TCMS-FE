
import React, { useEffect, useRef } from "react";
import {
  Info,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  FileText,
} from "lucide-react";

const getLogAppearance = (log) => {
  const stage = log.stage || "";

  if (log.isError) {
    return { icon: XCircle, color: "text-red-500" };
  }

  if (stage.includes("ERROR")) {
    return { icon: XCircle, color: "text-red-500" };
  }
  if (stage.includes("WARN")) {
    return { icon: AlertTriangle, color: "text-yellow-500" };
  }
  if (stage.includes("DONE") || stage.includes("READY") || stage.includes("COMPLETED")) {
    return { icon: CheckCircle2, color: "text-green-500" };
  }
  if (stage.includes("INIT") || stage.includes("START")) {
    return { icon: Info, color: "text-blue-500" };
  }
  if (stage.includes("PROGRESS") || stage.includes("RUNNING")) {
    return { icon: Loader2, color: "text-purple-500", animate: true };
  }

  return { icon: FileText, color: "text-gray-500" };
};

function FriendlyLogView({ logs }) {
  const logContainerRef = useRef(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div
      ref={logContainerRef}
      className="bg-gray-50 border border-gray-200 p-4 rounded-lg h-160 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300"
    >
      <div className="font-sans text-sm">
        {logs.map((log, index) => {
          const { icon: Icon, color, animate } = getLogAppearance(log);
          
          return (
            <div
              key={index}
              className="flex items-start space-x-3 mb-3 pb-3 border-b border-gray-100 last:border-b-0"
            >
              {/* Icon */}
              <div className={`mt-0.5 ${color}`}>
                <Icon className={`h-5 w-5 ${animate ? 'animate-spin' : ''}`} />
              </div>

              {/* Nội dung Log */}
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-800">
                    [{log.stage}]
                  </span>
                  <span className="text-gray-400 text-xs">
                    {new Date(log.timestamp).toLocaleTimeString("vi-VN")}
                  </span>
                </div>
                <p className={`text-gray-700 ${log.isError ? 'text-red-600' : ''}`}>
                  {log.message}
                </p>
              </div>
            </div>
          );
        })}
        {logs.length === 0 && (
          <p className="text-gray-500 text-center py-4">Chưa có log nào...</p>
        )}
      </div>
    </div>
  );
}

export default FriendlyLogView;