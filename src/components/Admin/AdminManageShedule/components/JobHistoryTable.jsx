import React from "react";
import { Link } from "react-router-dom";
import ScheduleStatusTag from "./common/ScheduleStatusTag";
import { Loader2, List, Trash2, Eye } from "lucide-react";
import api from "../../../../utils/api"; 

function JobHistoryTable({ jobs, isLoading, onDeleteSuccess }) {
  
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

  const handleDelete = async (jobId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa lịch chạy này không? Hành động này không thể hoàn tác.")) {
      try {
        await api.admin.schedule.deleteJob(jobId);
        
        alert("Xóa thành công!");
        
        if (onDeleteSuccess) {
            onDeleteSuccess();
        }
      } catch (error) {
        console.error("Lỗi khi xóa job:", error);
        alert(error.response?.data?.message || "Lỗi khi xóa job. Vui lòng thử lại.");
      }
    }
  };

  return (
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
                Ngày Intake
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
                  <p className="text-sm text-gray-500">Hãy tạo một job xếp lịch mới.</p>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {new Date(job.intakeStartDate).toLocaleDateString("vi-VN")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {job.status === "draft" || job.status === "completed"
                    ? getSuccessRate(job)
                    : "..."}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-3">
                    <Link 
                      to={`/admin/scheduler/jobs/${job._id}`}
                      className="text-purple-600 hover:text-purple-800 flex items-center px-2 py-1 rounded hover:bg-purple-50 transition-colors"
                      title="Xem chi tiết"
                    >
                      <Eye className="w-4 h-4 mr-1" /> Xem
                    </Link>
                    
                    {/* Nút Xóa */}
                    <button
                        onClick={() => handleDelete(job._id)}
                        className="text-red-500 hover:text-red-700 flex items-center px-2 py-1 rounded hover:bg-red-50 transition-colors opacity-70 group-hover:opacity-100"
                        title="Xóa lịch chạy này"
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
  );
}

export default JobHistoryTable;