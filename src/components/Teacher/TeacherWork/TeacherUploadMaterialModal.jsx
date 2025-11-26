
import React, { useState, useEffect } from "react";
import { 
  XMarkIcon, 
  LinkIcon, 
  DocumentTextIcon, 
  CloudArrowUpIcon 
} from "@heroicons/react/24/outline";
import api from "../../../utils/api";

export default function TeacherUploadMaterialModal({
  classId,
  isOpen,
  onClose,
  onUploaded,
}) {
  const [activeTab, setActiveTab] = useState("link"); 
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setContent("");
      setError("");
      setActiveTab("link");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Vui lòng điền đầy đủ tiêu đề và nội dung.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      
      await api.teacher.uploadMaterial(classId, { title, content });

      onUploaded?.(); 
      onClose();      
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Có lỗi xảy ra khi upload.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
     
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-[fadeIn_0.3s_ease-out]">
        
      
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-5 flex justify-between items-center">
          <h2 className="text-white text-lg font-bold flex items-center gap-2">
            <CloudArrowUpIcon className="w-6 h-6" />
            Thêm tài liệu học tập
          </h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1 transition"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

       
        <div className="flex border-b border-gray-100">
          <button
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === "link"
                ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50"
                : "text-gray-500 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("link")}
          >
            <LinkIcon className="w-4 h-4" />
            Link tài liệu
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === "text"
                ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50"
                : "text-gray-500 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("text")}
          >
            <DocumentTextIcon className="w-4 h-4" />
            Ghi chú / Text
          </button>
        </div>

        
        <form onSubmit={handleUpload} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

         
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Tiêu đề tài liệu <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Slide bài giảng buổi 1..."
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none transition"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
            />
          </div>

          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {activeTab === "link" ? "Đường dẫn (URL)" : "Nội dung ghi chú"} <span className="text-red-500">*</span>
            </label>
            
            {activeTab === "link" ? (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  
                </div>
                <input
                  type="text"
                  placeholder="drive.google.com/..."
                  className="w-full border border-gray-300 rounded-xl pl-16 pr-4 py-2.5 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none transition"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={loading}
                />
              </div>
            ) : (
              <textarea
                placeholder="Nhập nội dung ghi chú, dặn dò bài tập..."
                rows={4}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none transition resize-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={loading}
              />
            )}
            <p className="text-xs text-gray-400 mt-1">
              {activeTab === "link" 
                ? "Dán link Google Drive, Youtube hoặc tài liệu online." 
                : "Nội dung dạng văn bản thuần túy."}
            </p>
          </div>

         
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 font-medium transition"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2.5 rounded-xl text-white font-medium shadow-lg transition-all flex items-center gap-2
                ${loading 
                  ? "bg-purple-400 cursor-not-allowed" 
                  : "bg-purple-600 hover:bg-purple-700 hover:shadow-purple-500/30 transform hover:-translate-y-0.5"
                }`}
            >
              {loading && (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading ? "Đang xử lý..." : "Xác nhận tải lên"}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}