import React, { useState, useEffect } from 'react';
import { 
    X, User, Calendar, Clock, MapPin, FileText, 
    CheckCircle, XCircle, AlertTriangle, Loader2, ShieldCheck 
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

const SubstituteDetailModal = ({ isOpen, onClose, requestId }) => {
    const { user } = useAuth();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

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
                    alert("Không thể tải thông tin yêu cầu này.");
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
    // Teacher B phản hồi
    const handleTeacherRespond = async (response) => {
        if (!window.confirm(response === 'accept' ? "Bạn đồng ý dạy thay lớp này?" : "Bạn muốn từ chối?")) return;
        setProcessing(true);
        try {
            await api.substitute.respond(requestId, { 
                response, 
                message: response === 'accept' ? "Tôi đồng ý." : "Tôi bận." 
            });
            alert("Đã gửi phản hồi thành công!");
            onClose();
        } catch (err) {
            alert(err.response?.data?.message || "Lỗi xử lý");
        } finally { setProcessing(false); }
    };

    // Admin xử lý
    const handleAdminProcess = async (action) => {
        const reason = action === 'reject' ? prompt("Nhập lý do từ chối:") : "";
        if (action === 'reject' && !reason) return;

        if (!window.confirm(`Xác nhận ${action === 'approve' ? 'DUYỆT' : 'TỪ CHỐI'}?`)) return;
        
        setProcessing(true);
        try {
            await api.substitute.process(requestId, { 
                action, 
                adminResponse: reason,
                assignTeacherId: request.newTeacher 
            });
            alert("Xử lý thành công!");
            onClose();
        } catch (err) {
            alert(err.response?.data?.message || "Lỗi xử lý");
        } finally { setProcessing(false); }
    };

    const handleCancel = async () => {
        if (!window.confirm("Bạn muốn hủy yêu cầu này?")) return;
        setProcessing(true);
        try {
            await api.substitute.cancel(requestId);
            alert("Đã hủy yêu cầu.");
            onClose();
        } catch (err) {
            alert(err.response?.data?.message || "Lỗi hủy");
        } finally { setProcessing(false); }
    };

    if (!isOpen) return null;

    if (loading) return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-xl shadow-xl"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>
        </div>
    );

    if (!request) return null;

    const statusStyle = STATUS_STYLES[request.status] || STATUS_STYLES.cancelled;
    const isMyRequest = request.teacher?._id === user?._id;
    const isInvitedTeacher = request.newTeacher === user?._id; 
    const isAdmin = user?.role === 'admin' || user?.role === 'staff';

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-5 flex justify-between items-center text-white flex-shrink-0">
                    <div>
                        <h3 className="text-lg font-bold">Chi tiết Yêu cầu Dạy thay</h3>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors"><X className="w-6 h-6" /></button>
                </div>

                {/* Body Scrollable */}
                <div className="p-6 overflow-y-auto">
                    
                    {/* Status Badge */}
                    <div className={`flex items-center gap-2 p-3 rounded-lg border mb-6 ${statusStyle.bg} ${statusStyle.border}`}>
                        <AlertTriangle className={`w-5 h-5 ${statusStyle.color}`} />
                        <span className={`font-bold ${statusStyle.color}`}>{statusStyle.text}</span>
                    </div>

                    {/* Thông tin Lớp học */}
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

                    {/* Lý do */}
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

                {/* Footer Actions - Logic hiển thị nút */}
                <div className="p-5 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 flex-shrink-0">
                    
                    {/* 1. Case: Teacher B (Người được mời) - Chỉ hiện khi pending_teacher */}
                    {isInvitedTeacher && request.status === 'pending_teacher' && (
                        <>
                            <button 
                                onClick={() => handleTeacherRespond('decline')}
                                disabled={processing}
                                className="px-4 py-2 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium disabled:opacity-50"
                            >
                                Từ chối
                            </button>
                            <button 
                                onClick={() => handleTeacherRespond('accept')}
                                disabled={processing}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2 disabled:opacity-50"
                            >
                                {processing && <Loader2 className="w-4 h-4 animate-spin" />}
                                Chấp nhận
                            </button>
                        </>
                    )}

                    {/* 2. Case: Admin - Chỉ hiện khi pending_admin */}
                    {isAdmin && request.status === 'pending_admin' && (
                        <>
                            <button 
                                onClick={() => handleAdminProcess('reject')}
                                disabled={processing}
                                className="px-4 py-2 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium disabled:opacity-50"
                            >
                                Từ chối
                            </button>
                            <button 
                                onClick={() => handleAdminProcess('approve')}
                                disabled={processing}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium flex items-center gap-2 disabled:opacity-50"
                            >
                                <ShieldCheck className="w-4 h-4" />
                                Phê duyệt
                            </button>
                        </>
                    )}

                    {/* 3. Case: Teacher A (Chủ đơn) - Hủy khi chưa ai xử lý */}
                    {isMyRequest && (request.status === 'pending_teacher' || request.status === 'pending_admin') && (
                        <button 
                            onClick={handleCancel}
                            disabled={processing}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium disabled:opacity-50"
                        >
                            Hủy yêu cầu
                        </button>
                    )}

                    {/* Nút đóng mặc định */}
                    {request.status !== 'pending_teacher' && request.status !== 'pending_admin' && (
                        <button onClick={onClose} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium">
                            Đóng
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubstituteDetailModal;
