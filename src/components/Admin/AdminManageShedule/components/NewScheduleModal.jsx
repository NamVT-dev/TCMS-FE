// src/components/Admin/AdminManageShedule/components/NewScheduleModal.jsx

import React, { useState } from "react";
import api from "../../../../utils/api";
import { X, Loader2 } from "lucide-react";

function NewScheduleModal({ isOpen, onClose, onJobCreated }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [threshold, setThreshold] = useState(0.7);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setError("Vui lòng chọn ngày bắt đầu và kết thúc.");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const res = await api.admin.schedule.runScheduler({
        intakeStartDate: startDate,
        intakeEndDate: endDate,
        threshold: Number(threshold),
      });
      onJobCreated(res.data.data.jobId);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể chạy thuật toán");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // Overlay
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.6)]"
      onClick={onClose}
    >
      {/* Modal Content */}
      <div
        className="relative w-full max-w-lg p-6 bg-white rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Tạo Lịch Xếp Mới</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 rounded-full hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <p className="text-sm text-gray-600">
            Chọn khoảng thời gian để gom học sinh chờ xếp lớp.
          </p>
          
          {/* Form Inputs */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Ngày bắt đầu (Intake Start Date)
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              required
            />
          </div>
          
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              Ngày kết thúc (Intake End Date)
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="threshold" className="block text-sm font-medium text-gray-700">
              Ngưỡng thành công (VD: 0.7 = 70%)
            </label>
            <input
              type="number"
              id="threshold"
              step="0.05" min="0" max="1"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              required
            />
          </div>
          
          {error && <p className="text-sm text-red-600">{error}</p>}

          {/* Footer / Actions */}
          <div className="flex justify-end pt-4 space-x-3 border-t border-gray-200">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-300"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isSubmitting ? "Đang chạy..." : "Bắt Đầu Xếp Lịch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewScheduleModal;