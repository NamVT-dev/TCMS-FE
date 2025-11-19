import React, { useState, useEffect } from 'react';
import api from '../../../../utils/api';
import { Loader2, Save, X, Upload, User, CheckSquare, Phone, Mail, Calendar, Lock } from 'lucide-react';

const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-white";
const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

const AdminTeacherModal = ({ isOpen, onClose, onSuccess, teacherId }) => {
    const isEditMode = Boolean(teacherId);
    
    // Initial States
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        dob: '',
        phoneNumber: '',
        gender: 'male',
    });
    const [skills, setSkills] = useState([]);
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState('');
    const [allCategories, setAllCategories] = useState([]);
    
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            const init = async () => {
                setFetching(true);
                try {
                    // 1. Load Categories
                    const catRes = await api.user.getCourseCategories();
                    const categories = catRes.data?.data?.data || [];
                    setAllCategories(categories);

                    // 2. Load Teacher Data (if Edit)
                    if (isEditMode) {
                        const res = await api.admin.getTeacherDetail(teacherId);
                        const teacher = res.data.data.teacher;
                        
                        setFormData({
                            email: teacher.email,
                            name: teacher.profile.fullname,
                            dob: teacher.profile.dob ? teacher.profile.dob.slice(0, 10) : '',
                            phoneNumber: teacher.profile.phoneNumber || '',
                            gender: teacher.profile.gender || 'male',
                        });
                        setPhotoPreview(teacher.profile.photo || '');
                        
                        if (teacher.skills?.length > 0) {
                            setSkills(teacher.skills.map(s => ({
                                category: s.category?._id || s.category,
                                levels: (s.levels || []).join(', '),
                                anyLevel: s.anyLevel || false,
                                includeLowerLevels: s.includeLowerLevels ?? true,
                            })));
                        } else {
                            setSkills([]);
                        }
                    } else {
                        // Reset for Create
                        setFormData({ email: '', name: '', dob: '', phoneNumber: '', gender: 'male' });
                        setPhotoPreview('');
                        setSkills([]);
                        setPhotoFile(null);
                    }
                } catch (err) {
                    console.error("Error loading data:", err);
                } finally {
                    setFetching(false);
                }
            };
            init();
        }
    }, [isOpen, teacherId, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    // --- SKILL LOGIC ---
    const toggleCategorySkill = (categoryId) => {
        setSkills(prev => {
            const exists = prev.find(s => s.category === categoryId);
            if (exists) return prev.filter(s => s.category !== categoryId);
            return [...prev, { category: categoryId, levels: '', anyLevel: false, includeLowerLevels: true }];
        });
    };

    const updateCategorySkill = (categoryId, field, value) => {
        setSkills(prev => prev.map(s => s.category === categoryId ? { ...s, [field]: value } : s));
    };

    // --- SUBMIT ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEditMode) {
                const fd = new FormData();
                fd.append('profile[fullname]', formData.name);
                fd.append('profile[phoneNumber]', formData.phoneNumber);
                fd.append('profile[dob]', formData.dob);
                fd.append('profile[gender]', formData.gender);
                if (photoFile) fd.append('profile[photo]', photoFile);

                skills.forEach((skill, idx) => {
                    fd.append(`skills[${idx}][category]`, skill.category);
                    fd.append(`skills[${idx}][anyLevel]`, skill.anyLevel);
                    fd.append(`skills[${idx}][includeLowerLevels]`, skill.includeLowerLevels);
                    const levelsArr = skill.levels.split(',').map(l => l.trim()).filter(Boolean);
                    if (levelsArr.length > 0) {
                        levelsArr.forEach((l, i) => fd.append(`skills[${idx}][levels][${i}]`, l));
                    } else {
                        fd.append(`skills[${idx}][levels]`, '');
                    }
                });
                await api.admin.updateTeacher(teacherId, fd);
            } else {
                await api.admin.createTeacher(formData);
            }
            onSuccess();
            onClose();
        } catch (err) {
            alert(err.response?.data?.message || "Có lỗi xảy ra!");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-all duration-300">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{isEditMode ? 'Cập nhật hồ sơ giáo viên' : 'Thêm giáo viên mới'}</h2>
                        <p className="text-sm text-gray-500 mt-0.5">{isEditMode ? 'Chỉnh sửa thông tin cá nhân và kỹ năng' : 'Tạo tài khoản và thiết lập thông tin cơ bản'}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {fetching ? (
                        <div className="h-64 flex items-center justify-center">
                            <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
                        </div>
                    ) : (
                        <form id="teacher-form" onSubmit={handleSubmit} className="space-y-8">
                            {/* SECTION 1: BASIC INFO */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                                {/* Avatar Column */}
                                <div className="md:col-span-3 flex flex-col items-center space-y-4">
                                    <div className="relative group">
                                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-50 shadow-inner bg-gray-100">
                                            {photoPreview ? (
                                                <img src={photoPreview} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <User size={48} />
                                                </div>
                                            )}
                                        </div>
                                        {isEditMode && (
                                            <label className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full shadow-md cursor-pointer hover:bg-purple-700 transition-colors">
                                                <Upload className="w-4 h-4" />
                                                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                                            </label>
                                        )}
                                    </div>
                                    <div className="text-center">
                                        <h3 className="font-semibold text-gray-800">{formData.name || "Tên giáo viên"}</h3>
                                        <p className="text-xs text-gray-500">{isEditMode ? "Giáo viên chính thức" : "Tài khoản mới"}</p>
                                    </div>
                                </div>

                                {/* Info Inputs */}
                                <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="sm:col-span-2">
                                        <label className={labelClass}>Họ và tên</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input type="text" name="name" value={formData.name} onChange={handleChange} className={`${inputClass} pl-10`} placeholder="VD: Nguyễn Văn A" required />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className={labelClass}>Email đăng nhập</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input type="email" name="email" value={formData.email} onChange={handleChange} className={`${inputClass} pl-10 ${isEditMode ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`} placeholder="example@email.com" required disabled={isEditMode} />
                                        </div>
                                        {isEditMode && <p className="text-[10px] text-gray-400 mt-1 flex items-center"><Lock className="w-3 h-3 mr-1"/> Không thể thay đổi email</p>}
                                    </div>

                                    <div>
                                        <label className={labelClass}>Số điện thoại</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className={`${inputClass} pl-10`} placeholder="09xx..." />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelClass}>Ngày sinh</label>
                                        <input type="date" name="dob" value={formData.dob} onChange={handleChange} className={inputClass} />
                                    </div>

                                    <div>
                                        <label className={labelClass}>Giới tính</label>
                                        <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass}>
                                            <option value="male">Nam</option>
                                            <option value="female">Nữ</option>
                                            <option value="other">Khác</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 2: SKILLS (Chỉ hiện khi Edit mode để đơn giản hoá luồng tạo mới hoặc tùy yêu cầu) */}
                            {isEditMode && (
                                <div className="border-t border-gray-100 pt-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                        Kỹ năng & Chuyên môn
                                        <span className="ml-3 text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">Chọn môn học giáo viên có thể dạy</span>
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
                                        {allCategories.map((cat) => {
                                            const active = skills.find(s => s.category === cat._id);
                                            return (
                                                <div key={cat._id} className={`border rounded-lg p-3 transition-all ${active ? 'border-purple-500 bg-purple-50/30 shadow-sm' : 'border-gray-200 hover:border-purple-200'}`}>
                                                    <div className="flex items-center cursor-pointer" onClick={() => toggleCategorySkill(cat._id)}>
                                                        <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${active ? 'bg-purple-600 border-purple-600' : 'bg-white border-gray-300'}`}>
                                                            {active && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                                                        </div>
                                                        <span className={`font-medium ${active ? 'text-purple-900' : 'text-gray-700'}`}>{cat.name}</span>
                                                    </div>
                                                    
                                                    {active && (
                                                        <div className="mt-3 pl-8 space-y-3 animate-in slide-in-from-top-1 duration-200">
                                                            <div>
                                                                <input 
                                                                    type="text" 
                                                                    value={active.levels} 
                                                                    onChange={(e) => updateCategorySkill(cat._id, 'levels', e.target.value)}
                                                                    placeholder="Levels: Beginner, Advanced..." 
                                                                    className="w-full text-sm px-2 py-1.5 border border-gray-300 rounded focus:border-purple-500 outline-none"
                                                                />
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <label className="flex items-center text-xs text-gray-600 cursor-pointer">
                                                                    <input type="checkbox" checked={active.anyLevel} onChange={(e) => updateCategorySkill(cat._id, 'anyLevel', e.target.checked)} className="mr-1.5 accent-purple-600" />
                                                                    Tất cả level
                                                                </label>
                                                                <label className="flex items-center text-xs text-gray-600 cursor-pointer">
                                                                    <input type="checkbox" checked={active.includeLowerLevels} onChange={(e) => updateCategorySkill(cat._id, 'includeLowerLevels', e.target.checked)} className="mr-1.5 accent-purple-600" />
                                                                    Bao gồm level thấp
                                                                </label>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </form>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-white hover:shadow-sm transition-all"
                    >
                        Hủy bỏ
                    </button>
                    <button 
                        onClick={() => document.getElementById('teacher-form').requestSubmit()} 
                        disabled={loading || fetching}
                        className="px-6 py-2.5 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                        {isEditMode ? 'Lưu thay đổi' : 'Tạo tài khoản'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminTeacherModal;