import React, { useState, useEffect } from "react";
import api from "../../../../utils/api";
import { X, Save, Loader2, User, BookOpen, Calendar, Edit, Ban, CheckCircle, AlertCircle } from "lucide-react";
import moment from "moment";

const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: { bg: "bg-green-500", Icon: CheckCircle },
    error: { bg: "bg-red-500", Icon: AlertCircle },
  };

  const { bg, Icon } = styles[type] || styles.success;

  return (
    <div className={`fixed top-4 right-4 ${bg} text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 z-[100] animate-slide-in min-w-[320px] max-w-md`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="font-medium flex-1">{message}</span>
      <button onClick={onClose} className="ml-2 hover:bg-white/20 rounded p-1 transition">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-scale-in">
        <div className="p-6">
          

          <h3 className="text-xl font-bold text-gray-800 text-center mb-3">
            {title}
          </h3>

          <p className="text-gray-600 text-center mb-6">
            {message}
          </p>
        </div>

        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition shadow-sm"
          >
            Xác nhận
          </button>
        </div>

      </div>
    </div>
  );
};

const AdminRequestDetailModal = ({ isOpen, onClose, requestId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState(null);

  const [isEditing, setIsEditing] = useState(false);

  const [status, setStatus] = useState("open");
  const [adminNote, setAdminNote] = useState("");

  const [toast, setToast] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (isOpen && requestId) {
      setIsEditing(false);
      fetchDetail();
    }
  }, [isOpen, requestId]);

  useEffect(() => {
    if (!isOpen) {
      setToast(null);
      setShowConfirm(false);
    }
  }, [isOpen]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await api.admin.request.getOne(requestId);

      const responseRoot = res.data;

      let doc = null;
      if (responseRoot.data) {
        // Đảm bảo lấy đúng đối tượng data
        doc = responseRoot.data.data || responseRoot.data;
      }

      if (doc) {
        setData(doc);
        setStatus(doc.status || "open");
        setAdminNote(doc.adminNote || "");
      } else {
        setToast({ message: "Không tìm thấy dữ liệu yêu cầu", type: "error" });
      }

    } catch (error) {
      console.error("Lỗi tải chi tiết", error);
      setToast({ message: "Lỗi khi tải chi tiết yêu cầu", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClick = () => {
    const statusText = {
      open: "Chờ xử lý",
      processed: "Đã xử lý",
      closed: "Đóng"
    }[status] || status;

    setShowConfirm(true);
  };

  const handleSave = async () => {
    setShowConfirm(false);
    setSaving(true);

    try {
      await api.admin.request.update(requestId, { status, adminNote });

      setToast({ message: "Cập nhật yêu cầu thành công!", type: "success" });

      setTimeout(() => {
        onSuccess();
        fetchDetail();
        setIsEditing(false);
      }, 1500);

    } catch (error) {
      setToast({
        message: error.response?.data?.message || "Lỗi khi cập nhật yêu cầu",
        type: "error"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (data) {
      setStatus(data.status);
      setAdminNote(data.adminNote || "");
    }
    setIsEditing(false);
  };

  // Helper chuyển đổi số sang ngày (0 -> CN, 1 -> T2...)
  const formatDays = (days) => {
    if (!days || days.length === 0) return "Chưa chọn";
    const map = { 0: "CN", 1: "T2", 2: "T3", 3: "T4", 4: "T5", 5: "T6", 6: "T7" };
    return days.map(d => map[d]).join(", ");
  };

  if (!isOpen) return null;

  const statusText = {
    open: "Chờ xử lý",
    processed: "Đã xử lý",
    closed: "Đóng"
  }[status] || status;

  return (
    <>
      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
        .animate-scale-in { animation: scale-in 0.2s ease-out; }
      `}</style>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleSave}
        title="Xác nhận cập nhật"
        message={`Bạn đang cập nhật trạng thái thành "${statusText}". Xác nhận lưu thay đổi?`}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-all duration-300">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col animate-in fade-in zoom-in duration-200">

          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-bold text-gray-800">
              Chi tiết Yêu cầu <span className="text-gray-500 text-base font-normal">#{requestId?.slice(-6)}</span>
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors p-1 hover:bg-gray-100 rounded-full">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-10 flex justify-center items-center h-64">
                <Loader2 className="animate-spin w-10 h-10 text-purple-600" />
              </div>
            ) : (
              data && (
                <div className="p-6 space-y-6">

                  <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
                    
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{data.student?.name || "Không có tên"}</h3>
                     
                      <p className="text-xs text-gray-400 mt-1 flex items-center">
                        Ngày tạo: {moment(data.createdAt).format("DD/MM/YYYY HH:mm")}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-500 mb-2">
                        <BookOpen className="w-4 h-4 mr-2" /> Đối tượng quan tâm
                      </label>
                      <div className="text-gray-800 font-medium border p-3 rounded-lg bg-gray-50 shadow-sm h-full">
                        {data.course ? (
                          <div>
                            <span className="block text-xs text-purple-600 uppercase font-bold mb-1">Khóa học</span>
                            <span className="text-lg">{data.course.name}</span>
                            {data.course.level && <span className="text-gray-500 font-normal block text-sm">Level: {data.course.level}</span>}
                          </div>
                        ) : (
                          <div>
                            <span className="block text-xs text-green-600 uppercase font-bold mb-1">Danh mục</span>
                            <span className="text-lg">{data.category?.name || "Chưa xác định"}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-500 mb-2">
                        <Calendar className="w-4 h-4 mr-2" /> Lịch mong muốn
                      </label>
                      <div className="text-gray-800 text-sm border p-3 rounded-lg bg-gray-50 shadow-sm space-y-1 h-full">
                        <p><span className="font-semibold text-gray-600">Thứ:</span> {formatDays(data.preferredDays)}</p>
                        <p><span className="font-semibold text-gray-600">Ca:</span> {data.preferredShifts?.length ? data.preferredShifts.join(", ") : "Chưa chọn"}</p>
                      </div>
                    </div>
                  </div>

                  {data.note && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">Ghi chú từ học viên</label>
                      <div className="p-3 bg-yellow-50 rounded-lg text-gray-700 italic text-sm border border-yellow-100">
                        "{data.note}"
                      </div>
                    </div>
                  )}

                  <div className="border-t border-gray-100 my-4"></div>

                  <div className={`space-y-4 p-4 rounded-lg transition-colors duration-300 ${isEditing ? 'bg-purple-50 border border-purple-100' : ''}`}>
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-gray-800 flex items-center">
                        Xử lý yêu cầu
                        {isEditing && <span className="ml-2 text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full animate-pulse">Đang sửa</span>}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          disabled={!isEditing}
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
                          disabled={!isEditing}
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

          <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 rounded-b-lg">
            {!isEditing ? (
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
              <>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded border border-transparent hover:border-red-100 transition-colors flex items-center"
                >
                  <Ban className="w-4 h-4 mr-1" /> Hủy bỏ
                </button>
                <button
                  onClick={handleSaveClick}
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
    </>
  );
};

export default AdminRequestDetailModal;