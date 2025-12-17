import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../../../utils/api';
import { 
    ArrowLeft, Mail, Phone, Calendar, User as UserIcon, 
    BookOpen, Info, Loader2, Edit, MapPin, Clock, CheckCircle, XCircle, Award
} from 'lucide-react';

// --- Helper Components ---
const InfoItem = ({ icon: Icon, label, value, isLink = false }) => (
    <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
        <div className="p-2 bg-white rounded-full shadow-sm mr-3 text-purple-600">
            <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 overflow-hidden">
            <p className="text-xs text-gray-500 font-medium uppercase">{label}</p>
            {isLink ? (
                <a href={value} className="text-sm font-semibold text-purple-700 hover:underline truncate block" title={value}>
                    {value || 'N/A'}
                </a>
            ) : (
                <p className="text-sm font-semibold text-gray-800 truncate" title={value}>
                    {value || 'N/A'}
                </p>
            )}
        </div>
    </div>
);

const SkillBadge = ({ category, levels, anyLevel }) => (
    <div className="mb-3 last:mb-0">
        <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-bold text-gray-700">{category}</span>
            {anyLevel && <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">All Levels</span>}
        </div>
        <div className="flex flex-wrap gap-1.5">
            {!anyLevel && levels.length > 0 ? (
                levels.map(lvl => (
                    <span key={lvl} className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-100 rounded-md text-xs font-medium">
                        {lvl}
                    </span>
                ))
            ) : !anyLevel ? (
                <span className="text-xs text-gray-400 italic">Chưa chọn cấp độ</span>
            ) : null}
        </div>
    </div>
);

const AvailabilityGrid = ({ availability }) => {
    if (!availability || availability.length === 0) {
        return (
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 font-medium">Giáo viên chưa đăng ký lịch rảnh.</p>
            </div>
        );
    }

    const daysMap = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
    const sortedSlots = [...availability].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sortedSlots.map(slot => (
                <div key={slot.dayOfWeek} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                        <span className="font-bold text-gray-800 flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                            {daysMap[slot.dayOfWeek]}
                        </span>
                        <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {slot.shifts.length} ca
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {slot.shifts.length > 0 ? (
                            slot.shifts.map(shiftName => (
                                <span key={shiftName} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-bold border border-purple-200">
                                    {shiftName}
                                </span>
                            ))
                        ) : (
                            <span className="text-gray-400 text-xs italic">Không có ca</span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

const AdminViewTeacherDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [teacher, setTeacher] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTeacher = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const res = await api.admin.getTeacherDetail(id);
                setTeacher(res.data.data.teacher);
            } catch (err) {
                console.error(err);
                setError("Không thể tải chi tiết giáo viên.");
            } finally {
                setLoading(false);
            }
        };
        fetchTeacher();
    }, [id]);

    if (loading) {
        return (
            <div className="p-10 flex flex-col justify-center items-center min-h-screen bg-gray-50">
                <Loader2 className="w-12 h-12 animate-spin text-purple-600 mb-4" />
                <p className="text-gray-500 font-medium">Đang tải hồ sơ giáo viên...</p>
            </div>
        );
    }

    if (error) return <div className="p-10 text-center text-red-600 bg-gray-50 min-h-screen">{error}</div>;
    if (!teacher) return <div className="p-10 text-center text-gray-500 bg-gray-50 min-h-screen">Không tìm thấy giáo viên.</div>;

    const { profile = {}, email, active, level, skills = [], availability, description } = teacher;

    return (
        <div className="bg-gray-50 min-h-screen pb-10">
            {/* 1. Header Navigation */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-6 py-3 flex justify-between items-center shadow-sm">
                <Link to="/admin/users/teachers" className="flex items-center text-gray-600 hover:text-purple-700 font-medium transition-colors">
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Quay lại danh sách
                </Link>
                <button
                    onClick={() => navigate(`/admin/users/teachers/edit/${id}`)}
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-md active:scale-95 font-medium"
                >
                    <Edit className="w-4 h-4 mr-2" />
                    Chỉnh sửa hồ sơ
                </button>
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-6">
                {/* 2. Profile Header Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                    {/* Cover Image */}
                    <div className="h-40 bg-gradient-to-r from-purple-600 to-blue-600 relative">
                        <div className="absolute inset-0 bg-black/10"></div>
                    </div>
                    
                    <div className="px-8 pb-6 relative">
                        <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-12 mb-4">
                            {/* Avatar */}
                            <div className="relative">
                                <img
                                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md bg-white"
                                    src={profile.photo || `https://ui-avatars.com/api/?name=${profile.fullname || teacher.username}&background=random`}
                                    alt={profile.fullname}
                                />
                                <div className={`absolute bottom-2 right-2 w-5 h-5 rounded-full border-2 border-white ${active ? 'bg-green-500' : 'bg-red-500'}`} title={active ? 'Hoạt động' : 'Tạm ngưng'}></div>
                            </div>
                            
                            {/* Name & Basic Info */}
                            <div className="sm:ml-6 mt-4 sm:mt-0 flex-1">
                                <h1 className="text-3xl font-bold text-gray-900">{profile.fullname || teacher.username}</h1>
                                <div className="flex flex-wrap items-center gap-4 mt-2 text-gray-600">
                                    
                                    
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Main Layout Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* LEFT COLUMN: Info & Skills */}
                    <div className="lg:col-span-1 space-y-6">
                        
                        {/* Contact Info */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <Info className="w-5 h-5 mr-2 text-purple-600" />
                                Thông tin liên hệ
                            </h3>
                            <div className="space-y-3">
                                <InfoItem icon={Mail} label="Email" value={email} />
                                <InfoItem icon={Phone} label="Điện thoại" value={profile.phoneNumber} />
                                <InfoItem icon={Calendar} label="Ngày sinh" value={profile.dob ? new Date(profile.dob).toLocaleDateString('vi-VN') : null} />
                                <InfoItem icon={UserIcon} label="Giới tính" value={profile.gender === 'male' ? 'Nam' : profile.gender === 'female' ? 'Nữ' : profile.gender} />
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <Award className="w-5 h-5 mr-2 text-purple-600" />
                                Kỹ năng giảng dạy
                            </h3>
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                {skills.length > 0 ? (
                                    <div className="divide-y divide-gray-200 space-y-4">
                                        {skills.map((skill, i) => (
                                            <SkillBadge 
                                                key={i} 
                                                category={skill.category?.name} 
                                                levels={skill.levels} 
                                                anyLevel={skill.anyLevel} 
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 text-center italic">Chưa đăng ký kỹ năng nào.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Schedule & Bio */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Description */}
                        {description && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                                    <BookOpen className="w-5 h-5 mr-2 text-purple-600" />
                                    Giới thiệu
                                </h3>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400 italic">
                                    "{description}"
                                </p>
                            </div>
                        )}

                        {/* Availability Schedule */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                                    <Clock className="w-5 h-5 mr-2 text-purple-600" />
                                    Lịch rảnh đăng ký
                                </h3>
                                {availability && availability.length > 0 && (
                                    <span className="text-xs font-medium bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center">
                                        <CheckCircle className="w-3 h-3 mr-1" /> Đã đăng ký
                                    </span>
                                )}
                            </div>
                            
                            <AvailabilityGrid availability={availability} />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AdminViewTeacherDetail;