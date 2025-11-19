import React, { useState, useEffect } from "react";
import api from "../../../utils/api";
import { 
  Loader2, Search, Filter, Eye, Trash2, CheckCircle, AlertCircle, XCircle 
} from "lucide-react";
import AdminRequestDetailModal from "./AdminRequestDetailModal";
import moment from "moment";

const AdminRequestList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter & Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState(""); // '' | open | processed | closed
  
  // Modal
  const [selectedId, setSelectedId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [page, statusFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        sort: "-createdAt"
      };
      if (statusFilter) params.status = statusFilter;

      const res = await api.admin.request.getAll(params);
      setRequests(res.data.data.data); // Backend: { data: { data: [...] } }
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error("Fetch requests error", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa yêu cầu này?")) return;
    try {
      await api.admin.request.delete(id);
      fetchRequests();
    } catch (error) {
      alert("Không thể xóa yêu cầu");
    }
  };

  const openDetail = (id) => {
    setSelectedId(id);
    setIsModalOpen(true);
  };

  // Helpers
  const getStatusBadge = (status) => {
    switch (status) {
      case "open": return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium flex items-center w-fit"><AlertCircle className="w-3 h-3 mr-1"/> Chờ xử lý</span>;
      case "processed": return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center w-fit"><CheckCircle className="w-3 h-3 mr-1"/> Đã xử lý</span>;
      case "closed": return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium flex items-center w-fit"><XCircle className="w-3 h-3 mr-1"/> Đóng</span>;
      default: return status;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Quản Lý Yêu Cầu Riêng</h1>
        
        {/* Filter Bar */}
        <div className="flex items-center bg-white p-1 rounded-lg border shadow-sm">
          {["", "open", "processed", "closed"].map((st) => (
            <button
              key={st}
              onClick={() => { setStatusFilter(st); setPage(1); }}
              className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                statusFilter === st 
                  ? "bg-purple-100 text-purple-700" 
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {st === "" ? "Tất cả" : st.charAt(0).toUpperCase() + st.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Học viên</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nhu cầu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lịch mong muốn</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center"><Loader2 className="animate-spin mx-auto text-purple-600"/></td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-gray-500 italic">Không có dữ liệu</td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{req.student?.name || "Unknown"}</div>
                      <div className="text-xs text-gray-500">{req.student?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      {req.course ? (
                        <span className="text-sm text-blue-600 font-medium">{req.course.name}</span>
                      ) : (
                        <span className="text-sm text-green-600 font-medium">{req.category?.name}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-600">
                        <p>Thứ: {req.preferredDays?.join(", ")}</p>
                        <p>Ca: {req.preferredShifts?.join(", ")}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {moment(req.createdAt).format("DD/MM/YYYY")}
                    </td>
                    <td className="px-6 py-4 flex justify-center">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => openDetail(req._id)}
                        className="text-purple-600 hover:text-purple-900 p-1 hover:bg-purple-50 rounded" 
                        title="Xem chi tiết"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(req._id)}
                        className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                        title="Xóa"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t flex items-center justify-between">
           <span className="text-sm text-gray-700">Trang {page} / {totalPages}</span>
           <div className="space-x-2">
             <button 
               disabled={page <= 1} 
               onClick={() => setPage(p => p - 1)}
               className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-100"
             >
               Trước
             </button>
             <button 
               disabled={page >= totalPages} 
               onClick={() => setPage(p => p + 1)}
               className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-100"
             >
               Sau
             </button>
           </div>
        </div>
      </div>

      <AdminRequestDetailModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        requestId={selectedId}
        onSuccess={fetchRequests}
      />
    </div>
  );
};

export default AdminRequestList;