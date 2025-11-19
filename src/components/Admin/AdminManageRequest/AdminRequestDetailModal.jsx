import React, { useState, useEffect } from "react";
import api from "../../../utils/api";
import { X, Save, Loader2, User, BookOpen, Calendar, Edit, Ban } from "lucide-react";
import moment from "moment";

const AdminRequestDetailModal = ({ isOpen, onClose, requestId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState(null);
  
  // State quản lý chế độ xem/sửa
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [status, setStatus] = useState("open");
  const [adminNote, setAdminNote] = useState("");

  // Reset state khi mở modal mới
  useEffect(() => {
    if (isOpen && requestId) {
      setIsEditing(false); // Mặc định là chế độ xem (disable input)
      fetchDetail();
    }
  }, [isOpen, requestId]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await api.admin.request.getOne(requestId);
      
      // --- FIX LỖI 1: Xử lý cấu trúc dữ liệu trả về ---
      // Factory getOne thường trả về dạng { status: "success", data: { data: doc } }
      // hoặc { status: "success", data: { doc: doc } }
      // Code cũ gọi res.data.data bị thiếu cấp, hoặc backend trả về tên field khác.
      const responseRoot = res.data;
      
      // Logic tìm doc an toàn: thử truy cập vào các key phổ biến
      let doc = null;
      if (responseRoot.data) {
        // Kiểm tra xem data có lồng thêm lớp data/doc/request không
        doc = responseRoot.data.data || responseRoot.data.doc || responseRoot.data.request || responseRoot.data;
      }

      if (doc) {
        setData(doc);
        setStatus(doc.status || "open");
        setAdminNote(doc.adminNote || "");
      } else {
        console.error("Không tìm thấy dữ liệu document", res);
      }

    } catch (error) {
      console.error("Lỗi tải chi tiết", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.admin.request.update(requestId, { status, adminNote });
      
      // --- FIX LỖI 3: Cập nhật UI sau khi Save ---
      setIsEditing(false); // Tắt chế độ sửa
      alert("Cập nhật thành công!");
      onSuccess(); // Reload list bên ngoài
      
      // Fetch lại để đảm bảo dữ liệu hiển thị là mới nhất
      fetchDetail();
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi khi cập nhật");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Hủy bỏ thay đổi: reset về giá trị ban đầu và tắt edit mode
    if (data) {
      setStatus(data.status);
      setAdminNote(data.adminNote || "");
    }
    setIsEditing(false);
  };

  if (!isOpen) return null;

  return (
    // --- FIX LỖI 2: Background mờ nhẹ (backdrop-blur) ---
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-all duration-300">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Chi tiết Yêu cầu <span className="text-gray-500 text-base font-normal">#{requestId?.slice(-6)}</span>
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors p-1 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-10 flex justify-center items-center h-64">
              <Loader2 className="animate-spin w-10 h-10 text-purple-600" />
            </div>
          ) : (
            data && (
              <div className="p-6 space-y-6">
                {/* Thông tin học viên */}
                <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <div className="p-3 bg-white rounded-full shadow-sm">
                    <User className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{data.student?.name || "Không có tên"}</h3>
                    <p className="text-gray-600">{data.student?.email}</p>
                    <p className="text-xs text-gray-400 mt-1 flex items-center">
                      Ngày tạo: {moment(data.createdAt).format("DD/MM/YYYY HH:mm")}
                    </p>
                  </div>
                </div>

                {/* Nội dung yêu cầu (Read-only) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-500 mb-2">
                      <BookOpen className="w-4 h-4 mr-2" /> Đối tượng quan tâm
                    </label>
                    <div className="text-gray-800 font-medium border p-3 rounded-lg bg-gray-50 shadow-sm h-full">
                      {data.course ? (
                        <div>
                          <span className="block text-xs text-blue-600 uppercase font-bold mb-1">Khóa học</span>
                          {data.course.name} <span className="text-gray-500 font-normal">({data.course.level})</span>
                        </div>
                      ) : (
                        <div>
                          <span className="block text-xs text-green-600 uppercase font-bold mb-1">Danh mục</span>
                          {data.category?.name || "Chưa xác định"}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-500 mb-2">
                      <Calendar className="w-4 h-4 mr-2" /> Lịch mong muốn
                    </label>
                    <div className="text-gray-800 text-sm border p-3 rounded-lg bg-gray-50 shadow-sm space-y-1 h-full">
                      <p><span className="font-semibold text-gray-600">Thứ:</span> {data.preferredDays?.length ? data.preferredDays.join(", ") : "Chưa chọn"}</p>
                      <p><span className="font-semibold text-gray-600">Ca:</span> {data.preferredShifts?.length ? data.preferredShifts.join(", ") : "Chưa chọn"}</p>
                    </div>
                  </div>
                </div>

                {/* Ghi chú của học viên */}
                {data.studentNote && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Ghi chú từ học viên</label>
                    <div className="p-3 bg-yellow-50 rounded-lg text-gray-700 italic text-sm border border-yellow-100">
                      "{data.studentNote}"
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-100 my-4"></div>

                {/* --- FIX LỖI 3: Phần xử lý của Admin (View vs Edit) --- */}
                <div className={`space-y-4 p-4 rounded-lg transition-colors duration-300 ${isEditing ? 'bg-blue-50 border border-blue-100' : ''}`}>
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 flex items-center">
                      Xử lý yêu cầu
                      {isEditing && <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full animate-pulse">Đang sửa</span>}
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        disabled={!isEditing} // Disable khi không edit
                        className={`w-full border rounded p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all
                          ${!isEditing ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed' : 'bg-white border-gray-300'}
                        `}
                      >
                        <option value="open">Chờ xử lý (Open)</option>
                        <option value="processed">Đã xử lý (Processed)</option>
                        <option value="closed">Đóng (Closed)</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú nội bộ (Admin Note)</label>
                      <textarea
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        disabled={!isEditing} // Disable khi không edit
                        rows={3}
                        placeholder={isEditing ? "Nhập ghi chú xử lý..." : "Chưa có ghi chú"}
                        className={`w-full border rounded p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all
                          ${!isEditing ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed' : 'bg-white border-gray-300'}
                        `}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* Footer Buttons */}
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 rounded-b-lg">
          {!isEditing ? (
            // Chế độ Xem: Hiển thị nút Đóng và Cập nhật
            <>
              <button 
                onClick={onClose} 
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded transition-colors font-medium"
              >
                Đóng
              </button>
              <button
                onClick={() => setIsEditing(true)}
                disabled={loading || !data}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center shadow-sm transition-all transform active:scale-95"
              >
                <Edit className="w-4 h-4 mr-2" /> Cập nhật
              </button>
            </>
          ) : (
            // Chế độ Sửa: Hiển thị nút Hủy và Lưu
            <>
              <button 
                onClick={handleCancelEdit} 
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded border border-transparent hover:border-red-100 transition-colors flex items-center"
              >
                <Ban className="w-4 h-4 mr-1" /> Hủy bỏ
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center shadow-sm transition-all transform active:scale-95"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Lưu thay đổi
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRequestDetailModal; 