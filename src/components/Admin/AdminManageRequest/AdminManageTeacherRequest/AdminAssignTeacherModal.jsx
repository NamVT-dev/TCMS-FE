import React, { useState, useEffect } from 'react';
import { X, Search, UserCheck, Loader2, Phone, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../../../utils/api';

// Toast Component
const Toast = ({ message, type = "success", onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3500);
        return () => clearTimeout(timer);
    }, [onClose]);

    const styles = {
        success: { bg: "bg-green-500", Icon: CheckCircle },
        error: { bg: "bg-red-500", Icon: AlertCircle },
        warning: { bg: "bg-amber-500", Icon: AlertCircle },
    };

    const { bg, Icon } = styles[type] || styles.success;

    return (
        <div className={`fixed top-4 right-4 ${bg} text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 z-[1100] animate-slide-in min-w-[320px] max-w-md`}>
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium flex-1">{message}</span>
            <button onClick={onClose} className="ml-2 hover:bg-white/20 rounded p-1 transition">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

// Confirmation Dialog Component
const ConfirmDialog = ({ isOpen, onClose, onConfirm, teacherName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-scale-in">
                <div className="p-6">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-purple-100 mx-auto mb-4">
                        <UserCheck className="w-7 h-7 text-purple-600" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-800 text-center mb-3">
                        Xác nhận phân công
                    </h3>
                    
                    <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 mb-4">
                        <p className="text-sm text-gray-700 text-center">
                            Bạn sắp chỉ định giáo viên
                        </p>
                        <p className="text-lg font-bold text-purple-700 text-center mt-1">
                            {teacherName}
                        </p>
                        <p className="text-sm text-gray-700 text-center mt-1">
                            dạy thay và <span className="font-semibold text-green-600">DUYỆT</span> yêu cầu này.
                        </p>
                    </div>

                    <p className="text-center text-gray-600 text-sm mb-6">
                        Hành động này sẽ cập nhật lịch dạy và thông báo đến giáo viên.
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
                        className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition shadow-sm"
                    >
                        Xác nhận
                    </button>
                </div>
            </div>
        </div>
    );
};

const AdminAssignTeacherModal = ({ isOpen, onClose, request, onSuccess }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [processing, setProcessing] = useState(false);

    // Toast & Confirm states
    const [toast, setToast] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        if (isOpen && request) {
            const fetchSuggestions = async () => {
                setLoading(true);
                try {
                    const res = await api.substitute.getSuggestions(request.session._id);
                    setSuggestions(res.data.data.suggestions || []);
                } catch (error) {
                    console.error("Lỗi tải gợi ý:", error);
                    setToast({ message: "Không thể tải danh sách giáo viên gợi ý", type: "error" });
                } finally {
                    setLoading(false);
                }
            };
            fetchSuggestions();
        } else {
            setSuggestions([]);
            setSelectedTeacher(null);
        }
    }, [isOpen, request]);

    useEffect(() => {
        if (!isOpen) {
            setToast(null);
            setShowConfirm(false);
        }
    }, [isOpen]);

    const handleAssignClick = () => {
        if (!selectedTeacher) {
            setToast({ message: "Vui lòng chọn một giáo viên.", type: "warning" });
            return;
        }
        setShowConfirm(true);
    };

    const handleAssignAndApprove = async () => {
        setShowConfirm(false);
        setProcessing(true);

        try {
            await api.substitute.process(request._id, {
                action: 'approve',
                adminResponse: 'Admin đã tìm được người dạy thay.',
                assignTeacherId: selectedTeacher._id
            });
            
            setToast({ message: "Phân công giáo viên thành công!", type: "success" });
            
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1500);

        } catch (error) {
            setToast({ 
                message: error.response?.data?.message || "Lỗi khi phân công giáo viên.", 
                type: "error" 
            });
        } finally {
            setProcessing(false);
        }
    };

    if (!isOpen || !request) return null;

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
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-slide-in { animation: slide-in 0.3s ease-out; }
                .animate-scale-in { animation: scale-in 0.2s ease-out; }
                .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
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
                onConfirm={handleAssignAndApprove}
                teacherName={selectedTeacher?.fullname}
            />

            <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                    
                    {/* Header */}
                    <div className="bg-purple-700 p-4 flex justify-between items-center text-white flex-shrink-0">
                        <div>
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Search className="w-5 h-5" />
                                Tìm & Phân công Giáo viên
                            </h3>
                            <p className="text-xs text-purple-200 opacity-90 mt-1">
                                Lớp: {request.session?.class?.name} | {new Date(request.session?.startAt).toLocaleDateString('vi-VN')}
                            </p>
                        </div>
                        <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full"><X className="w-6 h-6" /></button>
                    </div>

                    {/* Body */}
                    <div className="p-6 overflow-y-auto bg-gray-50 flex-1">
                        {loading ? (
                            <div className="py-10 text-center text-gray-500">
                                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-purple-600" />
                                Đang tìm giáo viên phù hợp...
                            </div>
                        ) : suggestions.length === 0 ? (
                            <div className="py-10 text-center bg-white rounded-lg border border-dashed border-gray-300">
                                <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
                                <p className="text-gray-600 font-medium">Không tìm thấy giáo viên nào rảnh khung giờ này.</p>
                                <p className="text-xs text-gray-400">Vui lòng kiểm tra lại lịch trình hoặc liên hệ thủ công.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-sm text-gray-600 mb-2 font-medium">Đề xuất {suggestions.length} giáo viên phù hợp :<span className="text-red-500 ml-1">*</span></p>
                                {suggestions.map((teacher) => (
                                    <div 
                                        key={teacher._id}
                                        onClick={() => setSelectedTeacher(teacher)}
                                        className={`p-4 rounded-lg border cursor-pointer transition-all flex items-center justify-between group
                                            ${selectedTeacher?._id === teacher._id 
                                                ? 'bg-purple-50 border-purple-500 ring-1 ring-purple-500 shadow-sm' 
                                                : 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-md'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                                                ${selectedTeacher?._id === teacher._id ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500'}
                                            `}>
                                                {teacher.fullname.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800">{teacher.fullname}</h4>
                                                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {teacher.email}</span>
                                                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {teacher.phoneNumber || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center group-hover:border-purple-400">
                                            {selectedTeacher?._id === teacher._id && <div className="w-3 h-3 bg-purple-600 rounded-full" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-white border-t flex justify-between items-center flex-shrink-0">
                        <div className="text-sm text-gray-500">
                            {selectedTeacher 
                                ? <span>Đang chọn: <strong className="text-purple-700">{selectedTeacher.fullname}</strong></span>
                                : "Vui lòng chọn một giáo viên"}
                        </div>
                        <div className="flex gap-3">
                            <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">Hủy</button>
                            <button 
                                onClick={handleAssignClick}
                                disabled={!selectedTeacher || processing}
                                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                                Phân công & Duyệt
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminAssignTeacherModal;