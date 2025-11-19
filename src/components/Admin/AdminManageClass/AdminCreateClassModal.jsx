import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { Loader2, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const inputClass = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm";

const AdminCreateClassModal = ({ isOpen, onClose, onSuccess, prefillData }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        course: '',
        minStudent: 8,
        maxStudent: 15,
        preferredTeacher: '',
        startAt: '',
        endAt: '',
    });

    const [courses, setCourses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const [courseRes, teacherRes] = await Promise.all([
                        api.admin.getCourse({ limit: 1000 }),
                        api.admin.getTeachers({ limit: 1000, status: 'true' }),
                    ]);
                    
                    let allCourses = courseRes.data.data.courses || [];
                    const allTeachers = teacherRes.data.data.teachers || [];

                    // --- LOGIC PREFILL ---
                    let initialCourseId = '';
                    let initialName = '';
                    let infoMessage = ''; // Thông báo cho người dùng biết đang lọc

                    if (prefillData) {
                        // 1. Nếu yêu cầu theo Category: Lọc danh sách khóa học
                        if (prefillData.categoryId) {
                            const originalCount = allCourses.length;
                            // Giả định object course có field category hoặc category._id
                            allCourses = allCourses.filter(c => 
                                c.category === prefillData.categoryId || 
                                c.category?._id === prefillData.categoryId
                            );
                            
                            if (allCourses.length < originalCount) {
                                infoMessage = `Đã lọc khóa học theo danh mục yêu cầu.`;
                            }
                        }

                        // 2. Nếu yêu cầu theo Course cụ thể: Chọn luôn
                        if (prefillData.courseId) {
                            const found = allCourses.find(c => c._id === prefillData.courseId);
                            if (found) {
                                initialCourseId = found._id;
                                initialName = `Lớp ${found.name} (Theo Yêu cầu)`;
                            }
                        }
                    }

                    setCourses(allCourses);
                    setTeachers(allTeachers);

                    // Set form data
                    setFormData(prev => ({
                        ...prev,
                        course: initialCourseId,
                        name: initialName || prev.name,
                        minStudent: 8, 
                        maxStudent: 15,
                        startAt: '', 
                        endAt: ''
                    }));
                    
                    if (infoMessage) {
                        // Có thể set state message để hiển thị UI nếu muốn
                        console.log(infoMessage); 
                    }

                } catch (error) {
                    console.error("Lỗi load data:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        } else {
            // Reset form khi đóng
            setFormData({
                name: '', course: '', minStudent: 8, maxStudent: 15, preferredTeacher: '', startAt: '', endAt: ''
            });
        }
    }, [isOpen, prefillData]); // Re-run khi isOpen hoặc prefillData thay đổi

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...formData,
                preferredTeacher: formData.preferredTeacher || undefined,
                weeklySchedules: [], 
            };

            const res = await api.admin.class.createClass(payload);
            const newClassId = res.data.data.data._id;

            alert("Tạo lớp học thành công! Đang chuyển đến trang chi tiết để xếp lịch...");
            onSuccess(); 
            onClose(); // Đóng modal (sẽ navigate về /classes)
            
            // Navigate sang trang detail. Lưu ý: onClose ở parent đang navigate về /classes.
            // Nên ta cần setTimeout hoặc xử lý khéo léo. 
            // Tuy nhiên, logic AdminViewClassList onClose={closeCreateModal} sẽ đẩy về /classes.
            // Vì vậy ta nên navigate trực tiếp ở đây đè lên.
            navigate(`/admin/classes/detail/${newClassId}`); 
        } catch (err) {
            alert(err.response?.data?.message || "Lỗi khi tạo lớp.");
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 p-6 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">
                        {prefillData ? "Tạo Lớp Từ Yêu Cầu" : "Tạo Lớp Học Mới"}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Thông báo nếu đang prefill */}
                {prefillData && (
                    <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-md text-sm border border-blue-100 flex items-start">
                        <span className="mr-2">ℹ️</span>
                        <div>
                            Đang tạo lớp dựa trên yêu cầu. 
                            {prefillData.categoryId && " Danh sách khóa học đã được lọc theo danh mục."}
                            {prefillData.courseId && " Khóa học đã được chọn sẵn."}
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-10"><Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" /></div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Tên Lớp học</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} required placeholder="VD: TOEIC Sáng T2/T4" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Thuộc Khóa học</label>
                                <select name="course" value={formData.course} onChange={handleChange} className={inputClass} required>
                                    <option value="">-- Chọn khóa học --</option>
                                    {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                                {courses.length === 0 && <p className="text-xs text-red-500 mt-1">Không tìm thấy khóa học nào (hoặc không có khóa học thuộc danh mục này).</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Sĩ số Min</label>
                                <input type="number" name="minStudent" value={formData.minStudent} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Sĩ số Max</label>
                                <input type="number" name="maxStudent" value={formData.maxStudent} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Ngày Khai giảng</label>
                                <input type="date" name="startAt" value={formData.startAt} onChange={handleChange} className={inputClass} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Ngày Kết thúc (Dự kiến)</label>
                                <input type="date" name="endAt" value={formData.endAt} onChange={handleChange} className={inputClass} />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">GV Chủ nhiệm (Opt)</label>
                                <select name="preferredTeacher" value={formData.preferredTeacher} onChange={handleChange} className={inputClass}>
                                    <option value="">-- Không ưu tiên --</option>
                                    {teachers.map(t => <option key={t._id} value={t._id}>{t.profile?.fullname || t.username}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end space-x-3">
                            <button type="button" onClick={onClose} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50">Hủy</button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                Tạo Lớp
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AdminCreateClassModal;