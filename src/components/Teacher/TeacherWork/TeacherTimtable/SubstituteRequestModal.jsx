import React, { useState, useEffect } from 'react';
import { Loader2, UserSearch, Send, X, AlertCircle, UserCheck } from 'lucide-react';
import api from '../../../../utils/api'; 

const SubstituteRequestModal = ({ isOpen, onClose, session, onSuccess }) => {
    const [mode, setMode] = useState('admin'); 
    const [reason, setReason] = useState('');
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form khi mở modal mới
    useEffect(() => {
        if (isOpen) {
            setMode('admin');
            setReason('');
            setSelectedTeacher('');
            setSuggestions([]);
        }
    }, [isOpen, session]);

    // Fetch gợi ý giáo viên khi chuyển sang mode 'specific'
    useEffect(() => {
        if (isOpen && mode === 'specific' && session?._id) {
            const fetchSuggestions = async () => {
                setIsLoadingSuggestions(true);
                try {
                    const res = await api.substitute.getSuggestions(session._id);
                    setSuggestions(res.data.data.suggestions || []);
                } catch (error) {
                    console.error("Lỗi tải danh sách giáo viên:", error);
                } finally {
                    setIsLoadingSuggestions(false);
                }
            };
            fetchSuggestions();
        }
    }, [mode, isOpen, session]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reason.trim()) return alert("Vui lòng nhập lý do");
        if (mode === 'specific' && !selectedTeacher) return alert("Vui lòng chọn giáo viên");

        setIsSubmitting(true);
        try {
            const payload = {
                sessionId: session._id,
                reason: reason,
                newTeacherId: mode === 'specific' ? selectedTeacher : null
            };

            await api.substitute.create(payload);
            alert("Gửi yêu cầu thành công!");
            if (onSuccess) onSuccess(); 
            onClose();
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi khi gửi yêu cầu");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !session) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 text-white flex justify-between items-center">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <UserCheck className="w-5 h-5" />
                        Xin dạy thay / Đổi lịch
                    </h3>
                    <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Info Session */}
                    <div className="bg-purple-50 p-4 rounded-lg text-sm text-purple-900 border border-purple-100">
                        <div className="flex justify-between mb-1">
                            <span className="font-semibold">Lớp:</span>
                            <span>{session.class?.name}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                            <span className="font-semibold">Thời gian:</span>
                            <span>{new Date(session.startAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold">Phòng:</span>
                            <span>{session.room?.name}</span>
                        </div>
                    </div>

                    {/* Chọn chế độ */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Bạn muốn gửi yêu cầu đến ai?</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setMode('admin')}
                                className={`p-3 rounded-lg border text-sm font-medium transition-all flex flex-col items-center justify-center gap-2 ${
                                    mode === 'admin' 
                                    ? 'bg-purple-100 border-purple-500 text-purple-700 ring-1 ring-purple-500' 
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <span>Yêu cầu Admin tìm giúp</span>
                                <span className="text-[10px] font-normal opacity-70">(Gửi cho yêu cầu đến Staff/Admin)</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode('specific')}
                                className={`p-3 rounded-lg border text-sm font-medium transition-all flex flex-col items-center justify-center gap-2 ${
                                    mode === 'specific' 
                                    ? 'bg-purple-100 border-purple-500 text-purple-700 ring-1 ring-purple-500' 
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <span>Yêu cầu Giáo viên cụ thể</span>
                                <span className="text-[10px] font-normal opacity-70">(Chọn từ danh sách giáo viên phù hợp)</span>
                            </button>
                        </div>
                    </div>

                    {/* Dropdown chọn giáo viên (Chỉ hiện khi mode = specific) */}
                    {mode === 'specific' && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Chọn giáo viên thay thế</label>
                            {isLoadingSuggestions ? (
                                <div className="flex items-center text-sm text-gray-500 py-2 bg-gray-50 px-3 rounded border border-gray-200">
                                    <Loader2 className="w-4 h-4 animate-spin mr-2 text-purple-600" /> Đang tìm giáo viên phù hợp...
                                </div>
                            ) : suggestions.length > 0 ? (
                                <div className="relative">
                                    <UserSearch className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                                    <select
                                        value={selectedTeacher}
                                        onChange={(e) => setSelectedTeacher(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-white"
                                    >
                                        <option value=""> Chọn giáo viên </option>
                                        {suggestions.map(t => (
                                            <option key={t._id} value={t._id}>
                                                {t.fullname} - {t.email}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-green-600 mt-1 flex items-center">
                                        <UserCheck className="w-3 h-3 mr-1" />
                                        Hệ thống chỉ hiển thị các giáo viên có lịch làm phù hợp và đủ trình độ dạy lớp này.
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-start border border-red-100">
                                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <strong>Không tìm thấy ai!</strong><br/>
                                        Không có giáo viên nào rảnh hoặc đủ trình độ cho ca này. Vui lòng chuyển sang chế độ "Nhờ Admin tìm giúp".
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Lý do */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lý do <span className="text-red-500">*</span></label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows="3"
                            placeholder="VD: Tôi bị ốm đột xuất, xe hỏng..."
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm"
                            required
                        ></textarea>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end pt-2 gap-3 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || (mode === 'specific' && !selectedTeacher)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed flex items-center font-medium transition-all shadow-sm hover:shadow"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                            Gửi yêu cầu
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SubstituteRequestModal;