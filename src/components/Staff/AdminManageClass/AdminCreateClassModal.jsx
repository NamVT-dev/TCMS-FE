import React, { useState, useEffect, useMemo } from 'react';
import api from '../../../utils/api';
import { Loader2, Save, X, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Loading from '../../../components/UI/Loading';
import { toast } from 'react-toastify'; 

const inputClass = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm";
const readOnlyClass = "mt-1 block w-full px-3 py-2 border border-gray-300 bg-gray-100 text-gray-700 font-medium rounded-md shadow-sm sm:text-sm cursor-not-allowed";

const getTodayString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const AdminCreateClassModal = ({ isOpen, onClose, onSuccess, prefillData }) => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nameSuffix: '',
        course: '',
        minStudent: 8,
        maxStudent: 15,
        preferredTeacher: '',
        startAt: '',
    });

    const [categories, setCategories] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    const [teachers, setTeachers] = useState([]);

    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [nextClassNumber, setNextClassNumber] = useState(1);
    const [countingClass, setCountingClass] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const [catRes, courseRes, teacherRes] = await Promise.all([
                        api.admin.getCategories({ limit: 100 }),
                        api.admin.getCourse({ limit: 1000 }),
                        api.admin.getTeachers({ limit: 1000, status: 'true' }),
                    ]);

                    const fetchedCats = catRes.data.data.data || catRes.data.data.categories || [];
                    const fetchedCourses = courseRes.data.data.courses || [];
                    const fetchedTeachers = teacherRes.data.data.teachers || [];

                    setCategories(fetchedCats);
                    setAllCourses(fetchedCourses);
                    setTeachers(fetchedTeachers);

                    let prefillCatId = '';
                    let prefillCourseId = '';

                    if (prefillData) {
                        if (prefillData.courseId) {
                            const foundCourse = fetchedCourses.find(c => c._id === prefillData.courseId);
                            if (foundCourse) {
                                prefillCourseId = foundCourse._id;
                                prefillCatId = typeof foundCourse.category === 'object'
                                    ? foundCourse.category?._id
                                    : foundCourse.category;
                            }
                        } else if (prefillData.categoryId) {
                            prefillCatId = prefillData.categoryId;
                        }
                    }

                    setSelectedCategory(prefillCatId);
                    setFormData(prev => ({
                        ...prev,
                        course: prefillCourseId,
                        nameSuffix: '',
                        minStudent: 8,
                        maxStudent: 15,
                        startAt: getTodayString(),
                    }));

                } catch (error) {
                    console.error("Lỗi load data:", error);
                    toast.error("Không thể tải dữ liệu khởi tạo.");
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        } else {
            setFormData({
                nameSuffix: '', course: '', minStudent: 8, maxStudent: 15, preferredTeacher: '',
                startAt: getTodayString()
            });
            setSelectedCategory('');
            setNextClassNumber(1);
        }
    }, [isOpen, prefillData]);

    const availableCourses = useMemo(() => {
        if (!selectedCategory) return [];
        return allCourses.filter(c => {
            const cCatId = typeof c.category === 'object' ? c.category?._id : c.category;
            return cCatId === selectedCategory;
        });
    }, [allCourses, selectedCategory]);

    const currentCourseName = useMemo(() => {
        const selected = allCourses.find(c => c._id === formData.course);
        return selected ? selected.name : '';
    }, [allCourses, formData.course]);

    useEffect(() => {
        const calculateNextNumber = async () => {
            if (!formData.course) {
                setNextClassNumber(1);
                return;
            }

            setCountingClass(true);
            try {
                const res = await api.admin.class.listClasses({
                    course: formData.course,
                    limit: 1
                });

                const existingCount = res.data.total || 0;
                setNextClassNumber(existingCount + 1);

            } catch (error) {
                console.error("Lỗi đếm số lớp:", error);
                setNextClassNumber(1);
            } finally {
                setCountingClass(false);
            }
        };

        calculateNextNumber();
    }, [formData.course]);

    const generatedPrefixName = useMemo(() => {
        if (!currentCourseName) return '';
        return `${currentCourseName}-${nextClassNumber}`;
    }, [currentCourseName, nextClassNumber]);


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCategorySelect = (e) => {
        setSelectedCategory(e.target.value);
        setFormData(prev => ({ ...prev, course: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // VALIDATION: Kiểm tra giáo viên
        if (!formData.preferredTeacher) {
            toast.error("Vui lòng chọn Giáo viên phụ trách!");
            return;
        }

        setSaving(true);
        try {
            let finalName = generatedPrefixName;
            if (formData.nameSuffix && formData.nameSuffix.trim() !== '') {
                finalName += ` | ${formData.nameSuffix.trim()}`;
            }

            const payload = {
                ...formData,
                name: finalName,
                preferredTeacher: formData.preferredTeacher, // Đã validate ở trên nên chắc chắn có
                weeklySchedules: [],
            };
            delete payload.nameSuffix;

            const res = await api.admin.class.createClass(payload);
            const newClassId = res.data.data.data._id;

            toast.success(`Tạo lớp "${finalName}" thành công!`);
            
            onSuccess();
            onClose();
            navigate(`/admin/classes/detail/${newClassId}`);
        } catch (err) {
            toast.error(err.response?.data?.message || "Lỗi khi tạo lớp.");
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 p-6 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">
                        {prefillData ? "Tạo Lớp Từ Yêu Cầu" : "Tạo Lớp Học Mới"}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {loading ? (
                    <div className="py-10">
                        <Loading />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Danh mục <span className="text-red-500">*</span></label>
                                <select
                                    value={selectedCategory}
                                    onChange={handleCategorySelect}
                                    className={inputClass}
                                    required
                                >
                                    <option value="">-- Chọn danh mục đào tạo --</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Khóa học <span className="text-red-500">*</span></label>
                                <select
                                    name="course"
                                    value={formData.course}
                                    onChange={handleChange}
                                    className={`${inputClass} ${!selectedCategory ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    required
                                    disabled={!selectedCategory}
                                >
                                    <option value="">
                                        {!selectedCategory ? "-- Vui lòng chọn danh mục trước --" : "-- Chọn khóa học --"}
                                    </option>
                                    {availableCourses.map(c => (
                                        <option key={c._id} value={c._id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên Lớp học (Tự động) + Ghi chú <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-2 relative">
                                    <div className="w-2/3 relative">
                                        <input
                                            type="text"
                                            value={generatedPrefixName}
                                            readOnly
                                            className={readOnlyClass}
                                            placeholder="Tên khóa học sẽ hiện ở đây..."
                                            tabIndex="-1"
                                        />
                                        {countingClass && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="w-1/3">
                                        <input
                                            type="text"
                                            name="nameSuffix"
                                            value={formData.nameSuffix}
                                            onChange={handleChange}
                                            className={inputClass.replace('mt-1', '')}
                                            placeholder="2b/tuần..."
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Tên lớp đầy đủ: <span className="font-bold text-purple-700">
                                        {generatedPrefixName ? `${generatedPrefixName} ${formData.nameSuffix ? '| ' + formData.nameSuffix : ''}` : '...'}
                                    </span>
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Sĩ số tối thiểu <span className="text-red-500">*</span> </label>
                                <input type="number" name="minStudent" value={formData.minStudent} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Sĩ số tối đa<span className="text-red-500">*</span> </label>
                                <input type="number" name="maxStudent" value={formData.maxStudent} onChange={handleChange} className={inputClass} />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Ngày Khai giảng <span className="text-red-500">*</span></label>
                                <input type="date" name="startAt" value={formData.startAt} onChange={handleChange} className={inputClass} required />
                            </div>

                            <div className="md:col-span-2">
                                {/* Thêm dấu sao đỏ bắt buộc */}
                                <label className="block text-sm font-medium text-gray-700">GV Phụ trách<span className="text-red-500">*</span></label>
                                <select 
                                    name="preferredTeacher" 
                                    value={formData.preferredTeacher} 
                                    onChange={handleChange} 
                                    className={inputClass}
                                    required // Thêm thuộc tính required
                                >
                                    <option value="">-- Chọn giáo viên --</option>
                                    {teachers.map(t => (
                                        <option key={t._id} value={t._id}>
                                            {t.profile?.fullname || t.username} - {t.email}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end space-x-3">
                            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50 transition-colors">
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-400 transition-colors shadow-sm"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                Tạo Lớp & Xếp Lịch
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AdminCreateClassModal;