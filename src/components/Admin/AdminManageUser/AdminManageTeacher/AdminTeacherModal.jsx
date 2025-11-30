import React, { useState, useEffect } from 'react';
import api from '../../../../utils/api';
import { Loader2, Save, X, Upload, User, CheckSquare, Phone, Mail, Lock, Check, HelpCircle, Info, ArrowDown, AlertCircle, CheckCircle } from 'lucide-react';

const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-white";
const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

const LEVEL_OPTIONS = [
    "Starter", 
    "Beginner", 
    "Elementary", 
    "Pre-Intermediate", 
    "Intermediate", 
    "Upper-Intermediate", 
    "Advanced", 
    "Expert"
];

const SCORE_RANGES = {
    IELTS: {
        "Starter": "0.0 - 3.0",
        "Beginner": "3.0 - 4.0",
        "Elementary": "4.0 - 4.5",
        "Pre-Intermediate": "4.5 - 5.0",
        "Intermediate": "5.0 - 5.5",
        "Upper-Intermediate": "6.0 - 6.5",
        "Advanced": "7.0 - 7.5",
        "Expert": "8.0 - 9.0",
    },
    TOEIC: {
        "Starter": "0 - 250",
        "Beginner": "255 - 400",
        "Elementary": "405 - 500",
        "Pre-Intermediate": "505 - 600",
        "Intermediate": "605 - 780",
        "Upper-Intermediate": "785 - 900",
        "Advanced": "905 - 950",
        "Expert": "955 - 990",
    }
};

// Toast Notification Component
function Toast({ message, type = "success", onClose }) {
    const icons = {
        success: <CheckCircle className="w-5 h-5" />,
        error: <AlertCircle className="w-5 h-5" />,
        warning: <AlertCircle className="w-5 h-5" />
    };

    const styles = {
        success: "bg-green-50 border-green-200 text-green-800",
        error: "bg-red-50 border-red-200 text-red-800",
        warning: "bg-yellow-50 border-yellow-200 text-yellow-800"
    };

    return (
        <div className={`fixed top-4 right-4 z-[60] flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${styles[type]} transform transition-all duration-300 ease-out`}>
            <div className="flex-shrink-0">
                {icons[type]}
            </div>
            <p className="text-sm font-medium">{message}</p>
            <button
                onClick={onClose}
                className="flex-shrink-0 ml-2 hover:opacity-70 transition-opacity"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

const AdminTeacherModal = ({ isOpen, onClose, onSuccess, teacherId }) => {
    const isEditMode = Boolean(teacherId);
    
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
    const [toast, setToast] = useState(null);

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    };

    useEffect(() => {
        if (isOpen) {
            const init = async () => {
                setFetching(true);
                try {
                    const catRes = await api.user.getCourseCategories();
                    setAllCategories(catRes.data?.data?.data || []);

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
                                levels: Array.isArray(s.levels) ? s.levels : [], 
                                anyLevel: s.anyLevel || false,
                                includeLowerLevels: s.includeLowerLevels ?? true,
                            })));
                        } else {
                            setSkills([]);
                        }
                    } else {
                        setFormData({ email: '', name: '', dob: '', phoneNumber: '', gender: 'male' });
                        setPhotoPreview('');
                        setSkills([]);
                        setPhotoFile(null);
                    }
                } catch (err) {
                    console.error("Error loading data:", err);
                    showToast("Lỗi khi tải dữ liệu. Vui lòng thử lại.", "error");
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

    const toggleCategorySkill = (categoryId) => {
        setSkills(prev => {
            const exists = prev.find(s => s.category === categoryId);
            if (exists) {
                return prev.filter(s => s.category !== categoryId);
            } else {
                return [...prev, { 
                    category: categoryId, 
                    levels: [], 
                    anyLevel: false, 
                    includeLowerLevels: true 
                }];
            }
        });
    };

    const getSkillMode = (skill) => {
        if (skill.anyLevel) return 'all';
        return 'lower'; 
    };

    const handleModeChange = (categoryId, mode) => {
        setSkills(prev => prev.map(s => {
            if (s.category !== categoryId) return s;
            
            let updates = { anyLevel: false, includeLowerLevels: true };
            
            if (mode === 'all') {
                updates.anyLevel = true;
                updates.includeLowerLevels = false;
            }
            
            return { ...s, ...updates };
        }));
    };

    const toggleLevel = (categoryId, level) => {
        setSkills(prev => prev.map(s => {
            if (s.category !== categoryId) return s;
            
            let currentLevels = [...s.levels];
            
            if (currentLevels.includes(level)) {
                return { ...s, levels: [] };
            } else {
                return { ...s, levels: [level] };
            }
        }));
    };

    const getScoreHint = (catName, level) => {
        if (!catName) return null;
        const upperName = catName.toUpperCase();
        if (upperName.includes("IELTS")) return SCORE_RANGES.IELTS[level];
        if (upperName.includes("TOEIC")) return SCORE_RANGES.TOEIC[level];
        return null;
    };

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
                    
                    if (skill.levels && skill.levels.length > 0) {
                        skill.levels.forEach((lvl, lvlIdx) => {
                            fd.append(`skills[${idx}][levels][${lvlIdx}]`, lvl);
                        });
                    } else {
                        fd.append(`skills[${idx}][levels]`, ""); 
                    }
                });
                
                await api.admin.updateTeacher(teacherId, fd);
                showToast("Cập nhật giáo viên thành công!", "success");
            } else {
                await api.admin.createTeacher(formData);
                showToast("Tạo giáo viên mới thành công!", "success");
            }
            
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1000);
        } catch (err) {
            showToast(err.response?.data?.message || "Có lỗi xảy ra!", "error");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 transition-all duration-300">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden transform transition-all duration-200 scale-100">
                    
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">{isEditMode ? 'Cập nhật hồ sơ giáo viên' : 'Thêm giáo viên mới'}</h2>
                            <p className="text-sm text-gray-500 mt-0.5">{isEditMode ? 'Chỉnh sửa thông tin và kỹ năng' : 'Tạo tài khoản mới'}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                        {fetching ? (
                            <div className="h-64 flex items-center justify-center">
                                <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
                            </div>
                        ) : (
                            <form id="teacher-form" onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
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
                                        </div>
                                    </div>

                                    <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div className="sm:col-span-2">
                                            <label className={labelClass}>Họ và tên<span className="text-red-500">*</span> </label>
                                            <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} required placeholder="VD: Nguyễn Văn A" />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Email <span className="text-red-500">*</span> </label>
                                            <input type="email" name="email" value={formData.email} onChange={handleChange} className={`${inputClass} ${isEditMode ? 'bg-gray-100 text-gray-500' : ''}`} required disabled={isEditMode} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Số điện thoại <span className="text-red-500">*</span> </label>
                                            <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className={inputClass} placeholder="09xx..." />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Ngày sinh <span className="text-red-500">*</span> </label>
                                            <input type="date" name="dob" value={formData.dob} onChange={handleChange} className={inputClass} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Giới tính <span className="text-red-500">*</span> </label>
                                            <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass}>
                                                <option value="male">Nam</option>
                                                <option value="female">Nữ</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {isEditMode && (
                                    <div className="border-t border-gray-100 pt-6">
                                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                            Kỹ năng & Chuyên môn <span className="text-red-500">*</span>
                                            <span className="ml-3 text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded border border-gray-200 flex items-center">
                                                <HelpCircle className="w-3 h-3 mr-1" /> Chọn môn học và năng lực giảng dạy
                                            </span>
                                        </h3>
                                        
                                        <div className="grid grid-cols-1 gap-4">
                                            {allCategories.map((cat) => {
                                                const activeSkill = skills.find(s => s.category === cat._id);
                                                const isChecked = !!activeSkill;
                                                const mode = activeSkill ? getSkillMode(activeSkill) : 'lower'; 

                                                return (
                                                    <div key={cat._id} className={`border rounded-lg transition-all ${isChecked ? 'border-purple-500 bg-purple-50/10 shadow-sm' : 'border-gray-200 hover:border-purple-200'}`}>
                                                        
                                                        <div 
                                                            className="flex items-center p-3 cursor-pointer bg-white/50 rounded-t-lg hover:bg-gray-50 transition-colors" 
                                                            onClick={() => toggleCategorySkill(cat._id)}
                                                        >
                                                            <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${isChecked ? 'bg-purple-600 border-purple-600' : 'bg-white border-gray-300'}`}>
                                                                {isChecked && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                                                            </div>
                                                            <span className={`font-bold text-base ${isChecked ? 'text-purple-900' : 'text-gray-700'}`}>{cat.name}</span>
                                                        </div>
                                                        
                                                        {isChecked && (
                                                            <div className="p-4 pt-0 pl-11 border-t border-gray-100/50 transition-all duration-200">
                                                                
                                                                <div className="flex flex-wrap gap-6 mb-4 mt-3">
                                                                    <label className="flex items-center text-sm text-gray-700 cursor-pointer hover:text-purple-700">
                                                                        <input 
                                                                            type="radio" 
                                                                            name={`mode_${cat._id}`}
                                                                            checked={mode === 'lower'} 
                                                                            onChange={() => handleModeChange(cat._id, 'lower')}
                                                                            className="mr-2 w-4 h-4 accent-purple-600" 
                                                                        />
                                                                        Từ level này trở xuống (Chọn 1)
                                                                    </label>
                                                                    <label className="flex items-center text-sm text-gray-700 cursor-pointer hover:text-purple-700">
                                                                        <input 
                                                                            type="radio" 
                                                                            name={`mode_${cat._id}`}
                                                                            checked={mode === 'all'} 
                                                                            onChange={() => handleModeChange(cat._id, 'all')}
                                                                            className="mr-2 w-4 h-4 accent-purple-600" 
                                                                        />
                                                                        Dạy tất cả level
                                                                    </label>
                                                                </div>

                                                                {mode === 'lower' && (
                                                                    <div>
                                                                        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide flex items-center">
                                                                            Chọn Level cao nhất: <ArrowDown className="w-3 h-3 ml-1"/>
                                                                        </p>
                                                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                                                            {LEVEL_OPTIONS.map((level) => {
                                                                                const isSelected = activeSkill.levels.includes(level);
                                                                                const hint = getScoreHint(cat.name, level);
                                                                                const isDimmed = activeSkill.levels.length > 0 && !isSelected;

                                                                                return (
                                                                                    <button
                                                                                        key={level}
                                                                                        type="button"
                                                                                        onClick={() => toggleLevel(cat._id, level)}
                                                                                        className={`group relative px-3 py-2 rounded-md text-sm font-medium transition-all border text-left flex flex-col
                                                                                            ${isSelected 
                                                                                                ? 'bg-purple-600 text-white border-purple-600 shadow-md z-10 ring-2 ring-purple-200 ring-offset-1' 
                                                                                                : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                                                                                            }
                                                                                            ${isDimmed ? 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0' : ''}
                                                                                        `}
                                                                                    >
                                                                                        <div className="flex items-center justify-between w-full">
                                                                                            <span>{level}</span>
                                                                                            {isSelected && <Check className="w-3.5 h-3.5" />}
                                                                                        </div>
                                                                                        {hint && (
                                                                                            <span className={`text-[10px] mt-0.5 font-normal opacity-90 ${isSelected ? 'text-purple-100' : 'text-gray-400'}`}>
                                                                                                Điểm: {hint}
                                                                                            </span>
                                                                                        )}
                                                                                    </button>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                )}
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

                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            disabled={loading}
                            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-white hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
        </>
    );
};

export default AdminTeacherModal;