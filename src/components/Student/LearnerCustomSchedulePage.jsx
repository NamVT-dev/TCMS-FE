// src/components/Student/LearnerCustomSchedulePage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { Loader2, Send, ArrowLeft, Calendar, Clock, CheckCircle } from 'lucide-react';

// Hàm helper để đọc query params từ URL
function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const DAY_NAMES = [
  { id: 0, label: "CN" },
  { id: 1, label: "T2" },
  { id: 2, label: "T3" },
  { id: 3, label: "T4" },
  { id: 4, label: "T5" },
  { id: 5, label: "T6" },
  { id: 6, label: "T7" },
];


const SHIFTS = [
  { name: "S1", time: "08:00 - 09:50" },
  { name: "S2", time: "10:00 - 11:50" },
  { name: "S3", time: "13:00 - 14:50" },
  { name: "S4", time: "15:00 - 16:50" },
  { name: "S5", time: "18:00 - 19:50" },
  { name: "S6", time: "20:00 - 21:50" },
];
// ⬆️ KẾT THÚC THÊM MỚI

const LearnerCustomSchedulePage = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);



  const studentId = query.get('student');
  const categoryId = query.get('category');

  const [note, setNote] = useState('');
  const [constraints, setConstraints] = useState({
    days: [],
    shifts: [],
  });


  useEffect(() => {
    if (!studentId || !categoryId) {
      setError("Thiếu thông tin học viên hoặc môn học. Vui lòng quay lại Bước 1.");
    }
  }, [studentId, categoryId]);


  const toggleConstraint = (type, value) => {
    setConstraints(prev => {
      const current = prev[type];
      const newConstraint = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [type]: newConstraint };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const payload = {
      student: studentId,
      category: categoryId,
      preferredDays: constraints.days,
      preferredShifts: constraints.shifts,
      note: note,
    };

    try {
      await api.learner.createCustomSchedule(payload);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi gửi yêu cầu.");
    } finally {
      setSaving(false);
    }
  };

  // ⬇️ XÓA: Phần 'loadingConfig'

  return (
    <div className="bg-gray-50">
      <div className="bg-purple-700 text-white">
        <div className="max-w-5xl mx-auto p-8 md:p-12">
          <Link
            to={`/learner/roadmap-results?student=${studentId}&category=${categoryId}`}
            className="flex items-center text-purple-200 hover:text-white font-medium mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Quay lại trang Lớp học
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Yêu Cầu Lịch Tùy Chỉnh</h1>
          <p className="text-lg md:text-xl text-purple-200">
            Nếu không tìm thấy lớp, hãy cho chúng tôi biết lịch rảnh của bạn.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 -mt-10">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-xl border border-gray-200 space-y-8">

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded" role="alert">
              <p className="font-bold">Đã xảy ra lỗi</p>
              <p>{error}</p>
            </div>
          )}

          {success ? (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-6 rounded-lg text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Gửi Yêu Cầu Thành Công!</h2>
              <p className="mt-2">
                Chúng tôi đã nhận được yêu cầu của bạn và sẽ liên hệ lại sớm nhất có thể.
              </p>
            </div>
          ) : (
            <>
              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-3 border-b-2 border-purple-100">
                  Lịch rảnh mong muốn
                </h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-3">Chọn ngày có thể học (Lặp lại hàng tuần)</label>
                    <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                      {DAY_NAMES.map((day) => (
                        <button
                          type="button"
                          key={day.id}
                          onClick={() => toggleConstraint('days', day.id)}
                          className={`py-3 px-2 rounded-lg border-2 text-center font-medium transition-all ${constraints.days.includes(day.id)
                              ? "bg-purple-600 text-white border-purple-600 shadow-lg scale-105"
                              : "bg-white text-gray-700 hover:bg-purple-50 border-gray-200"
                            }`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>


                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-3">Chọn ca có thể học (Lặp lại hàng tuần)</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

                      {SHIFTS.map(shift => (
                        <button
                          type="button"
                          key={shift.name}
                          onClick={() => toggleConstraint('shifts', shift.name)}
                          className={`p-3 rounded-lg border-2 text-left font-medium transition-all ${constraints.shifts.includes(shift.name)
                              ? "bg-purple-600 text-white border-purple-600 shadow-lg"
                              : "bg-white text-gray-700 hover:bg-purple-50 border-gray-200"
                            }`}
                        >
                          <span className="block font-bold text-base">{shift.name}</span>
                          <span className={`text-sm ${constraints.shifts.includes(shift.name) ? 'text-purple-200' : 'text-gray-500'}`}>
                            {shift.time}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-3 border-b-2 border-purple-100">
                  Ghi chú thêm
                </h2>
                <div>
                  <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
                    Bạn có yêu cầu đặc biệt nào khác không? (ví dụ: giáo viên,...)
                  </label>
                  <textarea
                    id="note"
                    rows={4}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Nhập ghi chú của bạn ở đây..."
                  />
                </div>
              </section>

              <div className="text-right pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={saving || !studentId || !categoryId}
                  className="inline-flex items-center px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition shadow-lg hover:shadow-purple-300 disabled:bg-gray-400"
                >
                  {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Send className="w-5 h-5 mr-2" />}
                  {saving ? "Đang gửi..." : "Gửi Yêu Cầu"}
                </button>
              </div>
            </>
          )}

        </form>
      </div>
    </div>
  );
};

export default LearnerCustomSchedulePage;