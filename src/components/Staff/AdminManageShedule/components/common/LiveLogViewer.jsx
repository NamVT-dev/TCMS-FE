
import React, { useEffect, useRef } from "react";
import { Clock, AlertCircle, CheckCircle2, Info, Terminal, Activity } from "lucide-react";

function LiveLogViewer({ logs }) {
  const logContainerRef = useRef(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogStyle = (log) => {
    if (log.isError) return {
      icon: <AlertCircle className="w-5 h-5 text-red-500" />,
      bg: "bg-red-50",
      border: "border-red-100",
      text: "text-red-700",
      badge: "bg-white text-red-600 border border-red-200"
    };
    if (log.stage === "COMPLETED" || log.stage === "SUCCESS" || log.stage === "DRAFT_READY") return {
      icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
      bg: "bg-green-50",
      border: "border-green-100",
      text: "text-green-700",
      badge: "bg-white text-green-600 border border-green-200"
    };
    return {
      icon: <Info className="w-5 h-5 text-blue-500" />,
      bg: "bg-white",
      border: "border-gray-100",
      text: "text-gray-700",
      badge: "bg-blue-50 text-blue-600 border border-blue-100"
    };
  };

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden font-sans">
      <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white rounded-md shadow-sm border border-gray-200">
             <Activity className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800">Chi tiết </h3>
            <p className="text-xs text-gray-500">Theo dõi tiến trình thời gian thực</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-white rounded-full border border-gray-200 text-xs font-medium text-gray-600 shadow-sm">
          {logs.length} bản ghi
        </div>
      </div>

      <div 
        ref={logContainerRef}
        className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50/50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
      >
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <Terminal className="w-8 h-8 opacity-30 text-gray-500" />
            </div>
            <p className="text-sm font-medium">Đang chờ dữ liệu từ máy chủ...</p>
          </div>
        ) : (
          logs.map((log, index) => {
            const style = getLogStyle(log);
            const timeString = new Date(log.timestamp).toLocaleTimeString("vi-VN");
            
            return (
              <div 
                key={index} 
                className={`group flex gap-4 p-4 rounded-xl border ${style.bg} ${style.border} transition-all duration-200 hover:shadow-md`}
              >
                <div className="flex flex-col items-center gap-2 pt-1 min-w-[40px]">
                   <div className="bg-white rounded-full p-1 shadow-sm ring-1 ring-gray-100">
                        {style.icon}
                   </div>
                   {index < logs.length - 1 && (
                       <div className="w-px h-full bg-gray-200 my-1 group-hover:bg-gray-300 transition-colors"></div>
                   )}
                </div>

                <div className="flex-1 min-w-0 pt-0.5">
                   <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                      {log.stage && (
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm ${style.badge}`}>
                          {log.stage}
                        </span>
                      )}
                      
                  
                      <span className="flex items-center text-xs font-medium text-gray-400 font-mono bg-white px-2 py-0.5 rounded border border-gray-100">
                        <Clock className="w-3 h-3 mr-1.5" />
                        {timeString}
                      </span>
                   </div>
                   
                   <p className={`text-sm font-medium leading-relaxed break-words ${style.text}`}>
                     {log.message}
                   </p>
                </div>
              </div>
            );
          })
        )}
        <div className="h-4" /> 
      </div>
    </div>
  );
}

export default LiveLogViewer;