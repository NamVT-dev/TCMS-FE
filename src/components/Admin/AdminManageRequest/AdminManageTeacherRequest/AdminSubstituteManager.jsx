import React, { useState, useEffect } from 'react';
import { Check, X, Search, UserCheck, Loader2, Filter, AlertTriangle, User, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../../../utils/api';
import AdminAssignTeacherModal from './AdminAssignTeacherModal';

const STATUS_MAP = {
    pending_admin: { label: "Chờ xử lý", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    pending_teacher: { label: "Chờ GV trả lời", color: "bg-blue-100 text-blue-800 border-blue-200" },
    approved: { label: "Đã duyệt", color: "bg-green-100 text-green-800 border-green-200" },
    rejected: { label: "Đã từ chối", color: "bg-red-100 text-red-800 border-red-200" },
    cancelled: { label: "Đã hủy", color: "bg-gray-100 text-gray-800 border-gray-200" },
};

// Toast Component
const Toast = ({ message, type = "success", onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3500);
        return () => clearTimeout(timer);
    }, [onClose]);

    const styles = {
        success: { bg: "bg-green-500", Icon: CheckCircle },
        error: { bg: "bg-red-500", Icon: AlertCircle },
        warning: { bg: "bg-amber-500", Icon: AlertTriangle },
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

// Confirmation Dialog for Approve/Reject
const ConfirmDialog = ({ isOpen, onClose, onConfirm, action, requestInfo }) => {
    if (!isOpen) return null;

    const isApprove = action === 'approve';

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-scale-in">
                <div className="p-6">
                    <div className={`flex items-center justify-center w-14 h-14 rounded-full mx-auto mb-4 ${
                        isApprove ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                        {isApprove ? (
                            <Check className="w-7 h-7 text-green-600" />
                        ) : (
                            <X className="w-7 h-7 text-red-600" />
                        )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-800 text-center mb-3">
                        {isApprove ? 'Xác nhận duyệt' : 'Xác nhận từ chối'}
                    </h3>
                    
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Lớp:</span>
                            <span className="font-semibold text-purple-700">{requestInfo?.className}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">GV gửi:</span>
                            <span className="font-semibold text-gray-900">{requestInfo?.teacherName}</span>
                        </div>
                        {requestInfo?.newTeacher && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">GV dạy thay:</span>
                                <span className="font-semibold text-green-700">{requestInfo?.newTeacher}</span>
                            </div>
                        )}
                    </div>

                    <p className="text-center text-gray-600 text-sm mb-6">
                        {isApprove 
                            ? 'Yêu cầu sẽ được duyệt và lịch dạy sẽ được cập nhật.'
                            : 'Yêu cầu sẽ bị từ chối và giáo viên sẽ được thông báo.'}
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
                        className={`flex-1 px-4 py-2.5 font-medium rounded-lg transition shadow-sm ${
                            isApprove 
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                    >
                        Xác nhận
                    </button>
                </div>
            </div>
        </div>
    );
};

// Reject Reason Dialog (replaces prompt)
const RejectReasonDialog = ({ isOpen, onClose, onConfirm }) => {
    const [reason, setReason] = useState('');

    useEffect(() => {
        if (!isOpen) setReason('');
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-scale-in">
                <div className="p-6">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100 mx-auto mb-4">
                        <AlertCircle className="w-7 h-7 text-red-600" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-800 text-center mb-3">
                        Lý do từ chối
                    </h3>
                    
                    <p className="text-center text-gray-600 text-sm mb-4">
                        Vui lòng nhập lý do từ chối yêu cầu này
                    </p>

                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Nhập lý do từ chối (bắt buộc)..."
                        rows={4}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm resize-none"
                        autoFocus
                    />
                </div>
                
                <div className="flex gap-3 p-6 pt-0">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        onClick={() => {
                            if (reason.trim()) {
                                onConfirm(reason);
                            }
                        }}
                        disabled={!reason.trim()}
                        className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Xác nhận từ chối
                    </button>
                </div>
            </div>
        </div>
    );
};

const AdminSubstituteManager = () => {
    const [requests, setRequests] = useState([]);
    const [filterStatus, setFilterStatus] = useState('pending_admin');
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    
    const [assignModalData, setAssignModalData] = useState(null);

    // Toast & Dialog states
    const [toast, setToast] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, action: '', requestId: '', requestInfo: null });
    const [rejectReasonDialog, setRejectReasonDialog] = useState({ isOpen: false, requestId: '' });

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await api.substitute.getAll({ status: filterStatus }); 
            setRequests(res.data.data.requests || []);
        } catch (error) {
            console.error(error);
            setToast({ message: "Lỗi khi tải danh sách yêu cầu", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [filterStatus]);

    const handleApproveClick = (request) => {
        setConfirmDialog({
            isOpen: true,
            action: 'approve',
            requestId: request._id,
            requestInfo: {
                className: request.session?.class?.name,
                teacherName: request.teacher?.profile?.fullname,
                newTeacher: request.newTeacher?.profile?.fullname
            }
        });
    };

    const handleRejectClick = (request) => {
        setRejectReasonDialog({
            isOpen: true,
            requestId: request._id,
            requestInfo: {
                className: request.session?.class?.name,
                teacherName: request.teacher?.profile?.fullname
            }
        });
    };

    const handleRejectWithReason = (reason) => {
        const requestId = rejectReasonDialog.requestId;
        setRejectReasonDialog({ isOpen: false, requestId: '' });
        
        setConfirmDialog({
            isOpen: true,
            action: 'reject',
            requestId: requestId,
            reason: reason,
            requestInfo: rejectReasonDialog.requestInfo
        });
    };

    const handleDirectProcess = async () => {
        const { action, requestId, reason } = confirmDialog;
        setConfirmDialog({ isOpen: false, action: '', requestId: '', requestInfo: null });
        setProcessingId(requestId);

        try {
            await api.substitute.process(requestId, { 
                action, 
                adminResponse: reason || '' 
            });
            
            setToast({ 
                message: action === 'approve' ? "Đã duyệt yêu cầu thành công!" : "Đã từ chối yêu cầu!", 
                type: "success" 
            });
            
            setTimeout(() => {
                fetchRequests();
            }, 1000);
        } catch (error) {
            setToast({ 
                message: error.response?.data?.message || "Lỗi khi xử lý yêu cầu", 
                type: "error" 
            });
        } finally {
            setProcessingId(null);
        }
    };

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
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog({ isOpen: false, action: '', requestId: '', requestInfo: null })}
                onConfirm={handleDirectProcess}
                action={confirmDialog.action}
                requestInfo={confirmDialog.requestInfo}
            />

            <RejectReasonDialog
                isOpen={rejectReasonDialog.isOpen}
                onClose={() => setRejectReasonDialog({ isOpen: false, requestId: '' })}
                onConfirm={handleRejectWithReason}
            />

            <div className="p-6 bg-gray-50 min-h-screen font-inter">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Quản Lý Yêu Cầu Dạy Thay</h1>
                            <p className="text-sm text-gray-500 mt-1">Xử lý các yêu cầu đổi lịch từ giáo viên</p>
                        </div>
                        <button onClick={fetchRequests} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 border border-gray-200">
                            <Loader2 className={`w-5 h-5 text-purple-600 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    {/* Tabs Filter */}
                    <div className="flex space-x-2 mb-6 border-b border-gray-200 bg-white p-2 rounded-t-xl shadow-sm">
                        {[
                            { id: 'pending_admin', label: 'Cần xử lý ngay' },
                            { id: 'pending_teacher', label: 'Đang chờ GV' },
                            { id: 'approved', label: 'Lịch sử duyệt' },
                            { id: '', label: 'Tất cả' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setFilterStatus(tab.id)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                    filterStatus === tab.id 
                                    ? 'bg-purple-100 text-purple-700 font-bold' 
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4">Người gửi</th>
                                        <th className="px-6 py-4">Thông tin lớp</th>
                                        <th className="px-6 py-4">Người dạy thay</th>
                                        <th className="px-6 py-4">Lý do</th>
                                        <th className="px-6 py-4">Trạng thái</th>
                                        <th className="px-6 py-4 text-right">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr><td colSpan="6" className="text-center py-12 text-gray-500"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />Đang tải dữ liệu...</td></tr>
                                    ) : requests.length === 0 ? (
                                        <tr><td colSpan="6" className="text-center py-12 text-gray-500">Không có yêu cầu nào trong mục này.</td></tr>
                                    ) : (
                                        requests.map((req) => {
                                            const hasNewTeacher = !!req.newTeacher; 
                                            const isUrgent = !hasNewTeacher && req.status === 'pending_admin'; 

                                            return (
                                                <tr key={req._id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-gray-900">{req.teacher?.profile?.fullname}</div>
                                                        <div className="text-xs text-gray-400">{req.teacher?.email}</div>
                                                    </td>
                                                    
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-purple-700">{req.session?.class?.name}</div>
                                                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                            <span className="bg-gray-100 px-1 rounded border border-gray-200">
                                                                {new Date(req.session?.startAt).toLocaleDateString('vi-VN')}
                                                            </span>
                                                            <span className="font-medium text-gray-700">
                                                                {new Date(req.session?.startAt).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-gray-400 mt-0.5">Phòng: {req.session?.room?.name}</div>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        {hasNewTeacher ? (
                                                            <div className="flex items-center gap-2 text-green-700 bg-green-50 px-2 py-1 rounded-md border border-green-100 w-fit">
                                                                <UserCheck className="w-4 h-4" />
                                                                <span className="text-xs font-bold">{req.newTeacher.profile?.fullname}</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2 text-orange-700 bg-orange-50 px-2 py-1 rounded-md border border-orange-100 w-fit">
                                                                <AlertTriangle className="w-4 h-4" />
                                                                <span className="text-xs font-bold">Cần tìm người dạy</span>
                                                            </div>
                                                        )}
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <div className="max-w-xs truncate text-gray-600 italic" title={req.reason}>"{req.reason}"</div>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_MAP[req.status]?.color || 'bg-gray-100'}`}>
                                                            {STATUS_MAP[req.status]?.label || req.status}
                                                        </span>
                                                    </td>

                                                    <td className="px-6 py-4 text-right">
                                                        {req.status === 'pending_admin' && (
                                                            <div className="flex justify-end gap-2">
                                                                {isUrgent ? (
                                                                    <button
                                                                        onClick={() => setAssignModalData(req)}
                                                                        className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs font-bold flex items-center gap-1 shadow-sm"
                                                                    >
                                                                        <Search className="w-3 h-3" />
                                                                        Tìm người dạy
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => handleApproveClick(req)}
                                                                        disabled={processingId === req._id}
                                                                        className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-xs font-bold flex items-center gap-1 shadow-sm disabled:opacity-50"
                                                                    >
                                                                        <Check className="w-3 h-3" />
                                                                        Duyệt
                                                                    </button>
                                                                )}

                                                                <button
                                                                    onClick={() => handleRejectClick(req)}
                                                                    disabled={processingId === req._id}
                                                                    className="p-1.5 bg-white border border-red-200 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                                                                    title="Từ chối"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <AdminAssignTeacherModal 
                    isOpen={!!assignModalData}
                    onClose={() => setAssignModalData(null)}
                    request={assignModalData}
                    onSuccess={fetchRequests}
                />
            </div>
        </>
    );
};

export default AdminSubstituteManager;