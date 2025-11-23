
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Trash2, 
  AlertOctagon, 
  Loader2, 
  ChevronDown, 
  ChevronUp, 
  Copy 
} from "lucide-react";
import api from "../../../../../utils/api";
import LiveLogViewer from "../common/LiveLogViewer";

function JobErrorView({ job }) {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showTechnicalError, setShowTechnicalError] = useState(true);
  
  const errorLog = job.logs.find(log => log.isError) || job.logs[job.logs.length - 1];
  const errorMessage = errorLog?.message || "Lỗi không xác định";

  const handleDelete = async () => {
    if (window.confirm("Bạn chắc chắn muốn xóa lịch này chứ?")) {
      setIsDeleting(true);
      try {
        await api.admin.schedule.deleteJob(job._id);
        navigate("/admin/scheduler/dashboard", { replace: true });
      } catch (error) {
        console.error("Lỗi xóa:", error);
        alert("Không thể xóa. Vui lòng thử lại.");
        setIsDeleting(false);
      }
    }
  };

  const copyErrorToClipboard = () => {
    navigator.clipboard.writeText(errorMessage);
    alert("Đã sao chép nội dung lỗi!");
  };

  return (
    <div className="max-w-5xl mx-auto mt-8 space-y-8 pb-12 font-inter text-gray-600">
      
      

      {/* 2. Main Status Card (Thiết kế phẳng, ít áp lực) */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-8 flex flex-col md:flex-row gap-6">
           {/* Icon nhẹ nhàng hơn */}
           <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
                    <AlertOctagon className="h-6 w-6 text-orange-500" />
                </div>
           </div>
           
           <div className="flex-1 space-y-3">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">
                        Xếp lịch chưa hoàn tất
                    </h2>
                    <p className="text-gray-500 mt-1 text-sm">
                        Quá trình tự động bị gián đoạn do một vấn đề kỹ thuật. Bạn có thể xem chi tiết bên dưới hoặc xóa tác vụ này để thử lại.
                    </p>
                </div>

                {/* Technical Error Collapsible */}
                <div className="pt-2">
                    <button 
                        onClick={() => setShowTechnicalError(!showTechnicalError)}
                        className="flex items-center text-sm text-purple-600 font-medium hover:text-purple-700 focus:outline-none"
                    >
                        {showTechnicalError ? "Ẩn chi tiết kỹ thuật" : "Xem chi tiết lỗi kỹ thuật"}
                        {showTechnicalError ? <ChevronUp className="ml-1 w-4 h-4" /> : <ChevronDown className="ml-1 w-4 h-4" />}
                    </button>

                    {showTechnicalError && (
                        <div className="mt-3 relative group">
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs font-mono text-slate-700 break-all leading-relaxed">
                                {errorMessage}
                            </div>
                            <button 
                                onClick={copyErrorToClipboard}
                                className="absolute top-2 right-2 p-1.5 bg-white border border-gray-200 rounded hover:bg-gray-50 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                title="Sao chép lỗi"
                            >
                                <Copy className="w-3 h-3" />
                            </button>
                        </div>
                    )}
                </div>
           </div>

           {/* Action Button */}
           <div className="flex-shrink-0 pt-2">
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all disabled:opacity-50 shadow-sm"
                >
                    {isDeleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                    {isDeleting ? "Đang xử lý..." : "Xóa tác vụ này"}
                </button>
           </div>
        </div>
      </div>

      {/* 3. Live Log Viewer (Giữ nguyên giao diện sáng đã cập nhật) */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider pl-1">
            Nhật ký hệ thống
        </h3>
        <LiveLogViewer logs={job.logs} />
      </div>

    </div>
  );
}

export default JobErrorView;