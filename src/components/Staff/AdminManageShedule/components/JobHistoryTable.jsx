import React, { useState } from "react";
import { Link } from "react-router-dom";
import ScheduleStatusTag from "./common/ScheduleStatusTag";
import { Loader2, List, Trash2, Eye, X, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import api from "../../../../utils/api";

// Toast Notification Component
function Toast({ message, type = "success", onClose }) {
  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />
  };

  const styles = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800"
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

// Confirmation Dialog Component (Đã khôi phục)
function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, isDeleting }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm transition-opacity duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-200 scale-100">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-600" />
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
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center disabled:opacity-50"
          >
            {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isDeleting ? "Đang xóa..." : "Xóa vĩnh viễn"}
          </button>
        </div>
      </div>
    </div>
  );
}

function JobHistoryTable({ jobs, isLoading, onDeleteSuccess }) {
  const [toast, setToast] = useState(null);
  // State quản lý dialog xóa
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, jobId: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const formatPercent = (rate) => {
    if (rate === null || rate === undefined) return "N/A";
    return `${(rate * 100).toFixed(0)}%`;
  };

  const getSuccessRate = (job) => {
    if (!job.resultReport) return "N/A";
    const { successfulCount = 0, failedCount = 0 } = job.resultReport;
    const total = successfulCount + failedCount;
    if (total === 0 && successfulCount === 0) return "0%";
    if (total === 0 && successfulCount > 0) return "100%";
    return formatPercent(successfulCount / total);
  };

  // --- Logic Xóa ---
  const handleDeleteClick = (jobId) => {
    setConfirmDialog({ isOpen: true, jobId });
  };

  const handleDeleteConfirm = async () => {
    const jobId = confirmDialog.jobId;
    if (!jobId) return;

    setIsDeleting(true);
    try {
      await api.admin.schedule.deleteJob(jobId);

      showToast("Xóa lịch chạy thành công!", "success");
      setConfirmDialog({ isOpen: false, jobId: null });

      // Gọi callback để refresh lại danh sách ở component cha
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (error) {
      console.error("Lỗi khi xóa job:", error);
      showToast(error.response?.data?.message || "Lỗi khi xóa job. Vui lòng thử lại.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setConfirmDialog({ isOpen: false, jobId: null });
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
        isOpen={confirmDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Xóa lịch sử chạy?"
        message="Hành động này sẽ xóa toàn bộ dữ liệu báo cáo và kết quả của lần chạy này. Bạn không thể hoàn tác."
        isDeleting={isDeleting}
      />

      <div className="mt-8 bg-white shadow-lg rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 p-6 border-b border-gray-200">
          Lịch sử các lần chạy
        </h3>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày chạy
                </th>

                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tỷ lệ thành công (nháp)
                </th>
                <th scope="col" className="relative px-6 py-3 text-right">
                  <span className="sr-only">Hành động</span>
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading && (
                <tr>
                  <td colSpan="5" className="p-6 text-center">
                    <Loader2 className="w-6 h-6 mx-auto animate-spin text-purple-600" />
                    <p className="mt-2 text-sm text-gray-500">Đang tải lịch sử...</p>
                  </td>
                </tr>
              )}

              {!isLoading && jobs.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-6 text-center">
                    <List className="w-12 h-12 mx-auto text-gray-400" />
                    <p className="mt-2 text-sm font-medium text-gray-900">Chưa có lịch sử</p>
                    <p className="text-sm text-gray-500">Hãy tạo một bảng xếp lịch mới.</p>
                  </td>
                </tr>
              )}

              {!isLoading && jobs.map((job) => (
                <tr key={job._id} className="hover:bg-gray-50 group transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <ScheduleStatusTag status={job.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {new Date(job.createdAt).toLocaleString("vi-VN")}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {job.status === "draft" || job.status === "completed"
                      ? getSuccessRate(job)
                      : "..."}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-3">
                      <Link
                        to={`/staff/scheduler/jobs/${job._id}`}
                        className="text-purple-600 hover:text-purple-800 flex items-center px-2 py-1 rounded hover:bg-purple-50 transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4 mr-1" /> Xem
                      </Link>

                      {/* Nút Xóa đã được khôi phục */}
                      <button
                        onClick={() => handleDeleteClick(job._id)}
                        className="text-red-500 hover:text-red-700 flex items-center px-2 py-1 rounded hover:bg-red-50 transition-colors"
                        title="Xóa bản ghi"
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default JobHistoryTable;