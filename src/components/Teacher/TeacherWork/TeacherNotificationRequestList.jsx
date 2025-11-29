import React, { useState, useEffect, useMemo } from 'react';
import { 
    GitPullRequestArrow, 
    Calendar, 
    Clock, 
    Loader2, 
    Eye, 
    Bell
} from 'lucide-react';
import api from '../../../utils/api';
import SubstituteDetailModal from '../../Common/SubstituteDetailModal';

const STATUS_MAP = {
    "Lời mời dạy thay": { label: "Cần phản hồi", color: "bg-blue-100 text-blue-700" },
    "Phân công dạy thay (Admin)": { label: "Đã phân công", color: "bg-purple-100 text-purple-700" },
    "Yêu cầu được duyệt": { label: "Đã duyệt", color: "bg-green-100 text-green-700" },
    "Đã chấp nhận (Chờ duyệt)": { label: "Chờ Admin", color: "bg-yellow-100 text-yellow-700" },
    "Bị từ chối dạy thay": { label: "Bị từ chối", color: "bg-red-100 text-red-700" },
    "Yêu cầu bị hủy tự động": { label: "Đã hủy", color: "bg-gray-100 text-gray-600" },
    "Admin từ chối yêu cầu": { label: "Bị từ chối", color: "bg-red-100 text-red-700" },
    "Yêu cầu được duyệt tự động": { label: "Duyệt tự động", color: "bg-green-100 text-green-700" },
    "default": { label: "Cập nhật", color: "bg-gray-200 text-gray-700" } 
};

const TeacherNotificationRequestList = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequestId, setSelectedRequestId] = useState(null);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await api.notification.getAll();
            const allNotis = res.data.data || [];
            
            const filteredRequests = allNotis.filter(n => 
                n.data && n.data.linkModel === 'SubstituteRequest'
            ).sort((a, b) => new Date(b.createAt).getTime() - new Date(a.createAt).getTime()); 

            setNotifications(filteredRequests);
        } catch (error) {
            console.error("Lỗi tải thông báo:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleModalClose = () => {
        setSelectedRequestId(null);
        fetchNotifications(); 
    };

    if (loading) return (
        <div className="p-8 flex justify-center text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
    );
    
    return (
        <div className="p-6 bg-gray-50 min-h-screen font-inter">
            <div className="max-w-6xl mx-auto">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <GitPullRequestArrow className="w-6 h-6 text-purple-600" />
                        Lịch sử & Yêu cầu Dạy thay
                    </h1>
                    <button onClick={fetchNotifications} className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 shadow-sm transition-colors text-gray-700 text-sm">
                        <Loader2 className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* List Content */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {notifications.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bell className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-700">Chưa có hoạt động đổi lịch</h3>
                            <p className="text-gray-500 text-sm mt-1">Các yêu cầu bạn gửi và lời mời nhận được sẽ hiện ở đây.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 font-semibold uppercase text-xs border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4">Sự kiện</th>
                                        <th className="px-6 py-4">Nội dung tóm tắt</th>
                                        <th className="px-6 py-4">Thời gian tạo</th>
                                        <th className="px-6 py-4 text-right">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {notifications.map((noti) => {
                                        // SỬA LỖI: Lấy giá trị từ Map, nếu không có thì dùng 'default'
                                        const statusInfo = STATUS_MAP[noti.title] || STATUS_MAP.default; 
                                        
                                        return (
                                            <tr 
                                                key={noti._id} 
                                                className="hover:bg-purple-50/50 transition-colors cursor-pointer"
                                                onClick={() => setSelectedRequestId(noti.data.linkId)}
                                            >
                                                <td className="px-6 py-4 font-bold text-gray-800 flex items-center gap-2">
                                                    {/* Sửa lại cách lấy class để tránh lỗi split */}
                                                    <div className={`w-3 h-3 rounded-full ${statusInfo.color.split(' ')[0]}`} />
                                                    {noti.title}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 max-w-lg">
                                                    <div className="line-clamp-2">{noti.body.split('\n')[0]}</div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                                    {new Date(noti.createAt).toLocaleString('vi-VN')}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); setSelectedRequestId(noti.data.linkId); }}
                                                        className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-300 text-purple-600 rounded-lg text-xs font-bold hover:bg-purple-50 hover:border-purple-200 transition-all shadow-sm"
                                                    >
                                                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                                                        Chi tiết 
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Reuse Modal Xử Lý */}
            {selectedRequestId && (
                <SubstituteDetailModal 
                    isOpen={!!selectedRequestId}
                    onClose={handleModalClose}
                    requestId={selectedRequestId}
                />
            )}
        </div>
    );
};

export default TeacherNotificationRequestList;