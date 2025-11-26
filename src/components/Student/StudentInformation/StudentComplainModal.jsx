import React, { useState, useEffect } from 'react';
import { X, User, Send, Loader2 } from 'lucide-react';
import api from '../../../utils/api';

const StudentComplainModal = ({ isOpen, onClose, onSuccess }) => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [fetchingUser, setFetchingUser] = useState(false);


    useEffect(() => {
        if (isOpen) {
            setContent('');
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
            } else {
                console.error("Không tìm thấy profile trong response", userData);
            }
        } catch (error) {
            console.error("Lỗi lấy thông tin user:", error);
        } finally {
            setFetchingUser(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        setLoading(true);
        try {

            await api.user.sendComplain({ content: content });
            alert("Gửi phản ánh thành công!");
            onSuccess();
            onClose();
        } catch (error) {
            alert("Có lỗi xảy ra, vui lòng thử lại.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">


                <div className="bg-purple-600 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-white text-lg font-bold flex items-center gap-2">
                        <Send className="w-5 h-5" /> Tạo phản ánh mới
                    </h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">

                    <div className="mb-6 bg-purple-50 p-4 rounded-lg border border-purple-100">
                        <h3 className="text-sm font-semibold text-purple-800 mb-3 flex items-center gap-2">
                            <User className="w-4 h-4" /> Thông tin người gửi
                        </h3>

                        {fetchingUser ? (
                            <div className="flex items-center text-gray-500 text-sm">
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang tải thông tin...
                            </div>
                        ) : userInfo ? (
                            <div className="flex items-start gap-4">
                                <img
                                    src={
                                     
                                        userInfo.photo ||
                                       
                                        (userInfo.fullname ? `https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo.fullname)}&background=random` : null) ||
                                        
                                        "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                                    }
                                    onError={(e) => {
                                       
                                        e.target.onerror = null;
                                        e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                                    }}
                                    alt="Avatar"
                                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                />
                                <div>
                                    <p className="font-bold text-gray-800">{userInfo.fullname}</p>
                                    <p className="text-sm text-gray-600">{userInfo.email}</p>
                                    <p className="text-sm text-gray-600">{userInfo.phoneNumber}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-red-500">Không tải được thông tin.</p>
                        )}
                    </div>


                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nội dung phản ánh <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Vui lòng mô tả chi tiết vấn đề bạn gặp phải..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none min-h-[120px] resize-none"
                            required
                        />
                    </div>


                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !content.trim()}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {loading ? "Đang gửi..." : "Gửi phản ánh"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default StudentComplainModal;