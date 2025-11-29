import React, { useState, useEffect } from 'react';
import { 
    X, User, Calendar, Clock, MapPin, FileText, 
    CheckCircle, XCircle, AlertTriangle, Loader2, ShieldCheck, AlertCircle 
} from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../hooks/useAuth'; 

const STATUS_STYLES = {
    pending_teacher: { text: 'Chờ GV trả lời', bg: 'bg-blue-50', color: 'text-blue-700', border: 'border-blue-200' },
    pending_admin: { text: 'Chờ Admin duyệt', bg: 'bg-yellow-50', color: 'text-yellow-700', border: 'border-yellow-200' },
    approved: { text: 'Đã duyệt', bg: 'bg-green-50', color: 'text-green-700', border: 'border-green-200' },
    rejected: { text: 'Đã từ chối', bg: 'bg-red-50', color: 'text-red-700', border: 'border-red-200' },
    cancelled: { text: 'Đã hủy', bg: 'bg-gray-50', color: 'text-gray-700', border: 'border-gray-200' },
};

function Toast({ message, type = "success", onClose }) {
    const icons = {
        success: <CheckCircle className="w-5 h-5" />,
        error: <AlertCircle className="w-5 h-5" />,
        info: <AlertCircle className="w-5 h-5" />
    };

    const styles = {
        success: "bg-green-50 border-green-200 text-green-800",
        error: "bg-red-50 border-red-200 text-red-800",
        info: "bg-blue-50 border-blue-200 text-blue-800"
    };

    return (
        <div className={`fixed top-4 right-4 z-[1100] flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${styles[type]} transform transition-all duration-300 ease-out`}>
            <div className="flex-shrink-0">
                {icons[type]}
            </div>
            <p className="text-sm font-medium">{message}</p>
            <button
                onClick={onClose}
                className="flex-shrink-0 ml-2 hover:opacity-70 transition-opacity"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText, confirmColor = "purple", isLoading, showInput = false, inputPlaceholder = "" }) {
    const [inputValue, setInputValue] = useState("");

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm(inputValue);
        setInputValue("");
    };

    const colorClasses = {
        purple: "bg-purple-600 hover:bg-purple-700",
        green: "bg-green-600 hover:bg-green-700",
        red: "bg-red-600 hover:bg-red-700"
    };

    const iconColors = {
        purple: "bg-purple-100 text-purple-600",
        green: "bg-green-100 text-green-600",
        red: "bg-red-100 text-red-600"
    };

    return (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm transition-opacity duration-200">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-200 scale-100">
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${iconColors[confirmColor]}`}>
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-3">
                                {message}
                            </p>
                            {showInput && (
                                <textarea
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder={inputPlaceholder}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                                    rows="3"
                                />
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading || (showInput && !inputValue.trim())}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${colorClasses[confirmColor]}`}
                    >
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isLoading ? "Đang xử lý..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

const SubstituteDetailModal = ({ isOpen, onClose, requestId }) => {
    const { user } = useAuth();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [toast, setToast] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        type: null,
        title: "",
        message: "",
        confirmText: "",
        confirmColor: "purple",
        showInput: false,
        inputPlaceholder: ""
    });

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    };

    // 1. Fetch Data
    useEffect(() => {
        if (isOpen && requestId) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const res = await api.substitute.getOne(requestId);
                    setRequest(res.data.data.request);
                } catch (error) {
                    console.error("Lỗi tải chi tiết:", error);
                    showToast("Không thể tải thông tin yêu cầu này.", "error");
                    onClose();
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        } else {
            setRequest(null);
        }
    }, [isOpen, requestId]);

    // 2. Actions
    const handleTeacherRespondClick = (response) => {
        setConfirmDialog({
            isOpen: true,
            type: 'teacher_respond',
            response,
            title: response === 'accept' ? "Xác nhận chấp nhận" : "Xác nhận từ chối",
            message: response === 'accept' 
                ? "Bạn đồng ý dạy thay lớp này?" 
                : "Bạn muốn từ chối yêu cầu dạy thay này?",
            confirmText: response === 'accept' ? "Chấp nhận" : "Từ chối",
            confirmColor: response === 'accept' ? "green" : "red",
            showInput: false
        });
    };

    const handleAdminProcessClick = (action) => {
        setConfirmDialog({
            isOpen: true,
            type: 'admin_process',
            action,
            title: action === 'approve' ? "Xác nhận phê duyệt" : "Xác nhận từ chối",
            message: action === 'approve' 
                ? "Bạn muốn phê duyệt yêu cầu dạy thay này?" 
                : "Vui lòng nhập lý do từ chối:",
            confirmText: action === 'approve' ? "Phê duyệt" : "Từ chối",
            confirmColor: action === 'approve' ? "purple" : "red",
            showInput: action === 'reject',
            inputPlaceholder: "Nhập lý do từ chối..."
        });
    };

    const handleCancelClick = () => {
        setConfirmDialog({
            isOpen: true,
            type: 'cancel',
            title: "Xác nhận hủy yêu cầu",
            message: "Bạn có chắc chắn muốn hủy yêu cầu dạy thay này không?",
            confirmText: "Hủy yêu cầu",
            confirmColor: "red",
            showInput: false
        });
    };

    const handleConfirmAction = async (inputValue = "") => {
        const { type, response, action } = confirmDialog;
        setProcessing(true);
        
        try {
            if (type === 'teacher_respond') {
                await api.substitute.respond(requestId, { 
                    response, 
                    message: response === 'accept' ? "Tôi đồng ý." : "Tôi bận." 
                });
                showToast("Đã gửi phản hồi thành công!", "success");
            } else if (type === 'admin_process') {
                if (action === 'reject' && !inputValue.trim()) {
                    showToast("Vui lòng nhập lý do từ chối", "error");
                    setProcessing(false);
                    return;
                }
                await api.substitute.process(requestId, { 
                    action, 
                    adminResponse: inputValue,
                    assignTeacherId: request.newTeacher 
                });
                showToast(action === 'approve' ? "Đã phê duyệt thành công!" : "Đã từ chối yêu cầu", "success");
            } else if (type === 'cancel') {
                await api.substitute.cancel(requestId);
                showToast("Đã hủy yêu cầu thành công", "success");
            }
            
            setConfirmDialog({ ...confirmDialog, isOpen: false });
            setTimeout(() => {
                onClose();
            }, 1000);
        } catch (err) {
            showToast(err.response?.data?.message || "Lỗi xử lý yêu cầu", "error");
        } finally {
            setProcessing(false);
        }
    };

    const handleCloseDialog = () => {
        if (!processing) {
            setConfirmDialog({ ...confirmDialog, isOpen: false });
        }
    };

    if (!isOpen) return null;

    if (loading) return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-xl shadow-xl"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>
        </div>
    );

    if (!request) return null;

    const statusStyle = STATUS_STYLES[request.status] || STATUS_STYLES.cancelled;
    const isMyRequest = request.teacher?._id === user?._id;
    const isInvitedTeacher = request.newTeacher === user?._id; 
    const isAdmin = user?.role === 'admin' || user?.role === 'staff';

    return (
        <>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={handleCloseDialog}
                onConfirm={handleConfirmAction}
                title={confirmDialog.title}
                message={confirmDialog.message}
                confirmText={confirmDialog.confirmText}
                confirmColor={confirmDialog.confirmColor}
                isLoading={processing}
                showInput={confirmDialog.showInput}
                inputPlaceholder={confirmDialog.inputPlaceholder}
            />

            <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 transition-opacity duration-200">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] transform transition-all duration-200 scale-100">
                    
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-5 flex justify-between items-center text-white flex-shrink-0">
                        <div>
                            <h3 className="text-lg font-bold">Chi tiết Yêu cầu Dạy thay</h3>
                        </div>
                        <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors"><X className="w-6 h-6" /></button>
                    </div>

                    <div className="p-6 overflow-y-auto">
                        
                        <div className={`flex items-center gap-2 p-3 rounded-lg border mb-6 ${statusStyle.bg} ${statusStyle.border}`}>
                            <AlertTriangle className={`w-5 h-5 ${statusStyle.color}`} />
                            <span className={`font-bold ${statusStyle.color}`}>{statusStyle.text}</span>
                        </div>

                        <div className="space-y-4 mb-6">
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Thông tin buổi học</h4>
                            
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <User className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Giáo viên chính</p>
                                    <p className="font-semibold text-gray-800">{request.teacher?.profile?.fullname}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                                    <FileText className="w-4 h-4 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Lớp học</p>
                                    <p className="font-semibold text-gray-800">{request.session?.class?.name}</p>
                                    <p className="text-xs text-gray-500">{request.session?.class?.classCode}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                                        <Calendar className="w-4 h-4 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Thời gian</p>
                                        <p className="font-medium text-gray-800">
                                            {new Date(request.session?.startAt).toLocaleDateString('vi-VN')}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(request.session?.startAt).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})} - 
                                            {new Date(request.session?.endAt).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-4 h-4 text-red-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Phòng</p>
                                        <p className="font-medium text-gray-800">{request.session?.room?.name}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 my-4"></div>

                        <div className="mb-6">
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Chi tiết yêu cầu</h4>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-700 italic">
                                "{request.reason}"
                            </div>
                            {request.newTeacher && (
                                <div className="mt-2 text-xs text-gray-500 flex items-center">
                                    <User className="w-3 h-3 mr-1" />
                                    Mời giáo viên: <span className="font-semibold ml-1">{request.newTeacher === user._id ? "Bạn" : "Giáo viên khác"}</span>
                                </div>
                            )}
                        </div>

                    </div>

                    <div className="p-5 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 flex-shrink-0">
                        
                        {isInvitedTeacher && request.status === 'pending_teacher' && (
                            <>
                                <button 
                                    onClick={() => handleTeacherRespondClick('decline')}
                                    disabled={processing}
                                    className="px-4 py-2 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium disabled:opacity-50 transition-colors"
                                >
                                    Từ chối
                                </button>
                                <button 
                                    onClick={() => handleTeacherRespondClick('accept')}
                                    disabled={processing}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2 disabled:opacity-50 transition-colors"
                                >
                                    Chấp nhận
                                </button>
                            </>
                        )}

                        {isAdmin && request.status === 'pending_admin' && (
                            <>
                                <button 
                                    onClick={() => handleAdminProcessClick('reject')}
                                    disabled={processing}
                                    className="px-4 py-2 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium disabled:opacity-50 transition-colors"
                                >
                                    Từ chối
                                </button>
                                <button 
                                    onClick={() => handleAdminProcessClick('approve')}
                                    disabled={processing}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium flex items-center gap-2 disabled:opacity-50 transition-colors"
                                >
                                    <ShieldCheck className="w-4 h-4" />
                                    Phê duyệt
                                </button>
                            </>
                        )}

                        {isMyRequest && (request.status === 'pending_teacher' || request.status === 'pending_admin') && (
                            <button 
                                onClick={handleCancelClick}
                                disabled={processing}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium disabled:opacity-50 transition-colors"
                            >
                                Hủy yêu cầu
                            </button>
                        )}

                        {request.status !== 'pending_teacher' && request.status !== 'pending_admin' && (
                            <button onClick={onClose} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors">
                                Đóng
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default SubstituteDetailModal;