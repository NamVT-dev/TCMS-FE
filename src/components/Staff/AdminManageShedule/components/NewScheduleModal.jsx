import React, { useState } from "react";
import api from "../../../../utils/api";
import { X, Loader2, Calendar as CalendarIcon } from "lucide-react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { vi } from 'date-fns/locale';
import { format } from 'date-fns';

registerLocale('vi', vi);

function NewScheduleModal({ isOpen, onClose, onJobCreated }) {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [classStartAnchor, setClassStartAnchor] = useState(null); 
  const [threshold, setThreshold] = useState(0.7);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !classStartAnchor) {
      setError("Vui lòng điền đầy đủ 3 trường ngày.");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const res = await api.admin.schedule.runScheduler({
        intakeStartDate: format(startDate, 'yyyy-MM-dd'),
        intakeEndDate: format(endDate, 'yyyy-MM-dd'),
        classStartAnchor: format(classStartAnchor, 'yyyy-MM-dd'),
        threshold: Number(threshold),
      });
      onJobCreated(res.data.data.jobId);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể chạy thuật toán");
      setIsSubmitting(false); 
    }
  };

  const inputClass = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm";

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.6)]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg p-6 bg-white rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Tạo Lịch Xếp Mới</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 rounded-full hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <p className="text-sm text-gray-600">
            Chọn khoảng thời gian lấy học sinh và ngày khai giảng dự kiến.
          </p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Lấy học sinh từ ngày <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                dateFormat="dd/MM/yyyy"
                locale="vi"
                maxDate={new Date()}
                className={inputClass}
                wrapperClassName="w-full"
                placeholderText="Chọn ngày bắt đầu"
                required
                onKeyDown={(e) => e.preventDefault()}
              />
              <CalendarIcon className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Lấy học sinh đến ngày <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                dateFormat="dd/MM/yyyy"
                locale="vi"
                maxDate={new Date()}
                minDate={startDate}
                className={inputClass}
                wrapperClassName="w-full"
                placeholderText="Chọn ngày kết thúc"
                required
                disabled={!startDate}
                onKeyDown={(e) => e.preventDefault()}
              />
              <CalendarIcon className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Ngày Khai Giảng (Dự kiến) <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <DatePicker
                selected={classStartAnchor}
                onChange={(date) => setClassStartAnchor(date)}
                dateFormat="dd/MM/yyyy"
                locale="vi"
                minDate={new Date()}
                className={inputClass}
                wrapperClassName="w-full"
                placeholderText="Chọn ngày khai giảng"
                required
                onKeyDown={(e) => e.preventDefault()}
              />
              <CalendarIcon className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label htmlFor="threshold" className="block text-sm font-medium text-gray-700">
              Ngưỡng thành công (VD: 0.7 = 70%) <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="number"
              id="threshold"
              step="0.05" min="0" max="1"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          
          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end pt-4 space-x-3 border-t border-gray-200">
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