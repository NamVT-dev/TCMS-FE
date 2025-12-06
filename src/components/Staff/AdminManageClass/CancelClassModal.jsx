import React, { useState } from "react";
import { 
    X, AlertTriangle, Users, Calendar, Loader2, Ban 
} from "lucide-react";

const CancelClassModal = ({ isOpen, onClose, classData, onConfirm }) => {
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen || !classData) return null;

    // Kiểm tra điều kiện an toàn
    const studentCount = classData.student?.length || 0;
    const reservedCount = classData.reservedCount || 0;
    const hasStudents = studentCount > 0 || reservedCount > 0;
    const sessionCount = classData.weeklySchedules?.length || 0;

    const handleConfirm = async () => {
        setSubmitting(true);
        await onConfirm(); // Gọi hàm xử lý từ cha
        setSubmitting(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden transform scale-100 transition-all">
                
                {/* Header: Màu đỏ cảnh báo */}
                <div className="bg-red-50 p-4 border-b border-red-100 flex items-start gap-3">
                    <div className="p-2 bg-red-100 rounded-full shrink-0">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-red-700">Xác nhận Hủy Lớp Học</h3>
                        <p className="text-sm text-red-600/80 mt-1">
                            Hành động này không thể hoàn tác.
                        </p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-600 transition p-1"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body: Thông tin lớp */}
                <div className="p-6 space-y-4">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Lớp học</p>
                        <p className="text-base font-semibold text-gray-800">{classData.name}</p>
                        <p className="text-sm text-gray-600 font-mono mt-1">{classData.classCode}</p>
                    </div>

                    {/* Cảnh báo ảnh hưởng */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Dữ liệu bị ảnh hưởng:</p>
                        
                        <div className={`flex items-center justify-between p-3 rounded border ${hasStudents ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                            <div className="flex items-center gap-2">
                                <Users className={`w-4 h-4 ${hasStudents ? 'text-red-500' : 'text-green-500'}`} />
                                <span className="text-sm text-gray-700">Học viên trong lớp</span>
                            </div>
                            <span className={`font-bold text-sm ${hasStudents ? 'text-red-600' : 'text-green-600'}`}>
                                {studentCount + reservedCount}
                            </span>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded border bg-gray-50 border-gray-200">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-700">Lịch học cố định</span>
                            </div>
                            <span className="font-bold text-sm text-gray-600">{sessionCount} buổi/tuần</span>
                        </div>
                    </div>

                    {/* Thông báo chặn nếu còn học viên */}
                    {hasStudents && (
                        <div className="p-3 bg-orange-50 text-orange-700 text-xs rounded-lg border border-orange-200 flex gap-2 items-start">
                            <Ban className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>
                                Không thể hủy lớp khi vẫn còn <strong>{studentCount + reservedCount} học viên</strong> (Đã vào lớp hoặc Đang giữ chỗ). 
                                Vui lòng chuyển học viên sang lớp khác hoặc xóa họ khỏi lớp trước khi hủy.
                            </span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-100 transition"
                        disabled={submitting}
                    >
                        Quay lại
                    </button>
                    <button 
                        onClick={handleConfirm}
                        disabled={hasStudents || submitting}
                        className={`px-4 py-2 rounded-lg text-white text-sm font-bold flex items-center gap-2 shadow-sm transition
                            ${hasStudents || submitting 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-red-600 hover:bg-red-700'
                            }
                        `}
                    >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                        Xác nhận Hủy Lớp
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CancelClassModal;