import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../../../utils/api";
import { 
    Mail, Phone, Calendar, User as UserIcon, ArrowLeft, 
    Loader2, Shield 
} from "lucide-react";
import showToast from "../../../../utils/showToast";

// --- Helper Component: Info Row ---
const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100 last:border-0">
        <div className="w-40 flex items-center text-gray-500 text-sm font-medium mb-1 sm:mb-0">
            <Icon className="w-4 h-4 mr-2 text-purple-500" />
            {label}
        </div>
        <div className="flex-1 text-gray-800 font-medium">
            <span>{value || '---'}</span>
        </div>
    </div>
);

const AdminViewStaffDetail = () => {
    const { id } = useParams();
    
    const [staff, setStaff] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load data
    const fetchStaff = async () => {
        setLoading(true);
        try {
            const res = await api.admin.getStaffDetail(id);
            const data = res.data.data.data;
            setStaff(data);
        } catch (err) {
            console.error(err);
            showToast.error("Lỗi tải thông tin nhân viên");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, [id]);

    if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-12 h-12 animate-spin text-purple-600" /></div>;

    if (!staff) return <div className="h-screen flex items-center justify-center text-gray-500">Không tìm thấy nhân viên</div>;

    const { profile, email, active, createdAt } = staff;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 font-sans">
            <div className="max-w-5xl mx-auto">
                {/* Header Navigation */}
                <div className="flex justify-between items-center mb-6">
                    <Link to="/admin/users/staff" className="flex items-center text-gray-600 hover:text-purple-700 font-medium transition-colors">
                        <ArrowLeft className="w-5 h-5 mr-2" /> Quay lại danh sách
                    </Link>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    
                    {/* Banner & Avatar */}
                    <div className="h-48 bg-gradient-to-r from-purple-600 to-indigo-600 relative">
                        <div className="absolute inset-0 bg-black/10"></div>
                    </div>
                    
                    <div className="px-8 pb-8 relative">
                        <div className="flex flex-col sm:flex-row items-end -mt-16 mb-6 relative">
                            {/* Avatar Area */}
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                                    <img 
                                        src={profile.photo || `https://ui-avatars.com/api/?name=${profile.fullname || staff.username}&background=random`} 
                                        alt="Avatar" 
                                        className="w-full h-full object-cover" 
                                    />
                                </div>
                            </div>

                            {/* Name Area */}
                            <div className="sm:ml-6 mt-4 sm:mt-0 flex-1">
                                <h1 className="text-3xl font-bold text-gray-900">{profile.fullname}</h1>
                                <div className="flex items-center gap-4 mt-2 text-gray-600">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                        {active ? "Hoạt động" : "Tạm ngưng"}
                                    </span>
                                    <span className="text-sm flex items-center"><Mail className="w-4 h-4 mr-1.5" /> {email}</span>
                                    <span className="text-sm flex items-center"><Shield className="w-4 h-4 mr-1.5" /> Nhân viên</span>
                                </div>
                            </div>
                        </div>

                        {/* Detail Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                            {/* Column 1: Personal Info */}
                            <div className="lg:col-span-2">
                                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">Thông tin cá nhân</h3>
                                    <div className="space-y-1">
                                        <InfoRow 
                                            icon={UserIcon} label="Giới tính" 
                                            value={profile.gender === 'male' ? 'Nam' : profile.gender === 'female' ? 'Nữ' : 'Khác'} 
                                        />
                                        <InfoRow 
                                            icon={Calendar} label="Ngày sinh" 
                                            value={profile.dob ? new Date(profile.dob).toLocaleDateString('vi-VN') : ''}
                                        />
                                        <InfoRow 
                                            icon={Phone} label="Số điện thoại" 
                                            value={profile.phoneNumber} 
                                        />
                                        <InfoRow 
                                            icon={Mail} label="Email" value={email} 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Column 2: Account Info */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm h-full">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">Thông tin tài khoản</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase mb-1">Vai trò</p>
                                            <div className="flex items-center p-3 bg-purple-50 rounded-lg border border-purple-100">
                                                <Shield className="w-5 h-5 text-purple-600 mr-3" />
                                                <span className="font-semibold text-purple-800">Staff (Nhân viên)</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase mb-1">Ngày tham gia</p>
                                            <p className="text-gray-800 font-medium">
                                                {new Date(createdAt || Date.now()).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminViewStaffDetail;