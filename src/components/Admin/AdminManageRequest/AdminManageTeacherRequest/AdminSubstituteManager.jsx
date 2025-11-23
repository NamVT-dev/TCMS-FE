import React, { useState, useEffect } from 'react';
import { Check, X, Search, UserCheck, Loader2, Filter, AlertTriangle, User } from 'lucide-react';
import api from '../../../../utils/api';
import AdminAssignTeacherModal from './AdminAssignTeacherModal';

const STATUS_MAP = {
    pending_admin: { label: "Chờ xử lý", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    pending_teacher: { label: "Chờ GV trả lời", color: "bg-blue-100 text-blue-800 border-blue-200" },
    approved: { label: "Đã duyệt", color: "bg-green-100 text-green-800 border-green-200" },
    rejected: { label: "Đã từ chối", color: "bg-red-100 text-red-800 border-red-200" },
    cancelled: { label: "Đã hủy", color: "bg-gray-100 text-gray-800 border-gray-200" },
};

const AdminSubstituteManager = () => {
    const [requests, setRequests] = useState([]);
    const [filterStatus, setFilterStatus] = useState('pending_admin');
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    
    
    const [assignModalData, setAssignModalData] = useState(null); 

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await api.substitute.getAll({ status: filterStatus }); 
            setRequests(res.data.data.requests || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [filterStatus]);

    // --- XỬ LÝ DUYỆT / TỪ CHỐI (Khi đã có người dạy thay) ---
    const handleDirectProcess = async (id, action) => {
        const reason = action === 'reject' ? prompt("Nhập lý do từ chối:") : "";
        if (action === 'reject' && !reason) return;

        if (!window.confirm(`Bạn chắc chắn muốn ${action === 'approve' ? 'DUYỆT' : 'TỪ CHỐI'} yêu cầu này?`)) return;

        setProcessingId(id);
        try {
            await api.substitute.process(id, { 
                action, 
                adminResponse: reason 
            });
            alert("Xử lý thành công!");
            fetchRequests();
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi xử lý");
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-inter">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Quản lý Yêu cầu Dạy thay</h1>
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
                                    <th className="px-6 py-4">Yêu cầu</th>
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
                                                            {/* Nút xử lý tùy theo loại request */}
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
                                                                    onClick={() => handleDirectProcess(req._id, 'approve')}
                                                                    disabled={processingId === req._id}
                                                                    className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-xs font-bold flex items-center gap-1 shadow-sm disabled:opacity-50"
                                                                >
                                                                    <Check className="w-3 h-3" />
                                                                    Duyệt
                                                                </button>
                                                            )}

                                                            <button
                                                                onClick={() => handleDirectProcess(req._id, 'reject')}
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
    );
};

export default AdminSubstituteManager;