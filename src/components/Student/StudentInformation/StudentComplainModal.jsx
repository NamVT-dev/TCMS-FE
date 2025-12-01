import React, { useState, useEffect } from 'react';
import { X, User, Send, Loader2, FileText, AlertCircle, CheckCircle2, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify'; 
import api from '../../../utils/api';

const ISSUE_TYPES = [
    { value: '', label: '-- Chọn vấn đề bạn đang gặp phải --' },
    { value: 'ACADEMIC', label: 'Vấn đề Chuyên môn / Bài giảng' },
    { value: 'TEACHER', label: 'Thái độ / Tác phong Giáo viên' },
    { value: 'FACILITY', label: 'Cơ sở vật chất / Phòng học' },
    { value: 'SYSTEM', label: 'Lỗi hệ thống / Điểm danh / Tài khoản' },
    { value: 'OTHER', label: 'Góp ý khác' }
];


const StudentComplainModal = ({ isOpen, onClose, onSuccess }) => {
    const [issueType, setIssueType] = useState('');
    const [priority, setPriority] = useState('NORMAL');
    const [detail, setDetail] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [fetchingUser, setFetchingUser] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Reset form
            setIssueType('');
            setPriority('NORMAL');
            setDetail('');
            fetchUserInfo();
        }
    }, [isOpen]);

    const fetchUserInfo = async () => {
        setFetchingUser(true);
        try {
            const res = await api.user.getMe();
            const userData = res.data?.data?.data || res.data?.data;

            if (userData && userData.profile) {
                setUserInfo({
                    ...userData.profile,
                    email: userData.email || ""
                });
            }
        } catch (error) {
            console.error("Lỗi lấy thông tin user:", error);
            toast.error("Không thể tải thông tin người dùng");
        } finally {
            setFetchingUser(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate cơ bản
        if (!issueType) {
            toast.warning("Vui lòng chọn chủ đề để khiếu nại!");
            return;
        }
        if (!detail.trim()) {
            toast.warning("Vui lòng nhập nội dung chi tiết!");
            return;
        }

        setLoading(true);
        try {
            const selectedIssueLabel = ISSUE_TYPES.find(i => i.value === issueType)?.label;
           

            const finalContent = `[${selectedIssueLabel}] -- \nNội dung chi tiết:\n${detail}`;

            await api.user.sendComplain({ content: finalContent });
            
            toast.success("Gửi khiếu nại thành công! Chúng tôi sẽ phản hồi sớm.");
            onSuccess();
            onClose();
        } catch (error) {
            toast.error("Gửi thất bại, vui lòng thử lại sau.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">

                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-white text-xl font-bold flex items-center gap-2">
                            <Send className="w-5 h-5" /> Gửi Khiếu Nại & Góp Ý
                        </h2>
                        <p className="text-purple-100 text-xs mt-1">Ý kiến của bạn giúp chúng tôi cải thiện chất lượng dịch vụ.</p>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition bg-white/10 hover:bg-white/20 p-2 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <form id="complainForm" onSubmit={handleSubmit} className="space-y-6">

                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                             <div className="relative">
                                {fetchingUser ? (
                                    <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
                                ) : (
                                    <img
                                        src={userInfo?.photo || `https://ui-avatars.com/api/?name=${userInfo?.fullname || 'User'}`}
                                        alt="Avatar"
                                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                        onError={(e) => e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                                    />
                                )}
                                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-white">
                                    <CheckCircle2 className="w-3 h-3 text-white" />
                                </div>
                             </div>
                             
                             <div className="flex-1">
                                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                    {userInfo?.fullname || "Đang tải..."}
                                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] rounded-full uppercase font-bold tracking-wide">Học viên</span>
                                </h3>
                                <div className="flex flex-col sm:flex-row sm:gap-4 text-xs text-gray-500 mt-1">
                                    <span>📧 {userInfo?.email}</span>
                                    <span>📞 {userInfo?.phoneNumber}</span>
                                </div>
                             </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Vấn đề bạn đang gặp phải? <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        value={issueType}
                                        onChange={(e) => setIssueType(e.target.value)}
                                        className="w-full pl-4 pr-10 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none appearance-none transition shadow-sm"
                                        required
                                    >
                                        {ISSUE_TYPES.map(type => (
                                            <option key={type.value} value={type.value} disabled={!type.value}>{type.label}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                                </div>
                            </div>

                           

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex justify-between">
                                    <span>Chi tiết khiếu nại <span className="text-red-500">*</span></span>
                                    <span className="text-xs text-gray-400 font-normal">{detail.length}/500 ký tự</span>
                                </label>
                                <div className="relative">
                                    <textarea
                                        value={detail}
                                        onChange={(e) => setDetail(e.target.value)}
                                        placeholder="Vui lòng mô tả chi tiết sự việc, thời gian, địa điểm (nếu có)..."
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none min-h-[150px] resize-none shadow-sm text-gray-700"
                                        maxLength={500}
                                        required
                                    />
                                    <FileText className="absolute right-3 bottom-3 text-gray-300 w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-blue-50 text-blue-800 rounded-md text-sm">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <p>Chúng tôi cam kết bảo mật thông tin của bạn. Khiếu nại sẽ được bộ phận CSKH tiếp nhận và xử lý trong vòng <strong>24h làm việc</strong>.</p>
                        </div>

                    </form>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition shadow-sm"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        type="submit"
                        form="complainForm" 
                        disabled={loading || !detail.trim() || !issueType}
                        className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {loading ? "Đang gửi..." : "Gửi khiếu nại"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default StudentComplainModal;