import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Trash2, 
  AlertOctagon, 
  Loader2, 
  ChevronDown, 
  ChevronUp, 
  Copy,
  X,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import api from "../../../../../utils/api";
import LiveLogViewer from "../common/LiveLogViewer";

function Toast({ message, type = "success", onClose }) {
  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    info: <AlertCircle className="w-5 h-5" />
  };

  const styles = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    info: "bg-blue-50 border-blue-200 text-blue-800"
  };

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${styles[type]} transform transition-all duration-300 ease-out`}>
      <div className="flex-shrink-0">
        {icons[type]}
      </div>
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 ml-2 hover:opacity-70 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// Confirmation Dialog Component
function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, isLoading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm transition-opacity duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-200 scale-100">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {title}
              </h3>
              <p className="text-sm text-gray-600">
                {message}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? "Đang xóa..." : "Xóa"}
          </button>
        </div>
      </div>
    </div>
  );
}

function JobErrorView({ job }) {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showTechnicalError, setShowTechnicalError] = useState(true);
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(false);
  
  const errorLog = job.logs.find(log => log.isError) || job.logs[job.logs.length - 1];
  const errorMessage = errorLog?.message || "Lỗi không xác định";

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleDeleteClick = () => {
    setConfirmDialog(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await api.admin.schedule.deleteJob(job._id);
      setConfirmDialog(false);
      showToast("Xóa tác vụ thành công!", "success");
      setTimeout(() => {
        navigate("/admin/scheduler/dashboard", { replace: true });
      }, 1000);
    } catch (error) {
      console.error("Lỗi xóa:", error);
      showToast(error.response?.data?.message || "Không thể xóa. Vui lòng thử lại.", "error");
      setIsDeleting(false);
      setConfirmDialog(false);
    }
  };

  const handleDeleteCancel = () => {
    setConfirmDialog(false);
  };

  const copyErrorToClipboard = () => {
    navigator.clipboard.writeText(errorMessage);
    showToast("Đã sao chép nội dung lỗi!", "info");
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <ConfirmDialog
        isOpen={confirmDialog}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa tác vụ"
        message="Bạn chắc chắn muốn xóa lịch này chứ? Hành động này không thể hoàn tác."
        isLoading={isDeleting}
      />

      <div className="max-w-5xl mx-auto mt-8 space-y-8 pb-12 font-inter text-gray-600">
        
        {/* Main Status Card */}
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

             <div className="flex-shrink-0 pt-2">
                  <button
                      onClick={handleDeleteClick}
                      disabled={isDeleting}
                      className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                      {isDeleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                      {isDeleting ? "Đang xử lý..." : "Xóa tác vụ này"}
                  </button>
             </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider pl-1">
              Nhật ký hệ thống
          </h3>
          <LiveLogViewer logs={job.logs} />
        </div>

      </div>
    </>
  );
}

export default JobErrorView;