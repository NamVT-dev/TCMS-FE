import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { Loader2, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const inputClass = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm";

const AdminCreateClassModal = ({ isOpen, onClose, onSuccess }) => {
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
                    setCourses(courseRes.data.data.courses || []);
                    setTeachers(teacherRes.data.data.teachers || []);
                } catch (error) {
                    console.error("Lỗi load data:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        } else {
            // Reset form
            setFormData({
                name: '', course: '', minStudent: 8, maxStudent: 15, preferredTeacher: '', startAt: '', endAt: ''
            });
        }
    }, [isOpen]);

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
                weeklySchedules: [], // Lớp mới chưa có lịch
            };

            const res = await api.admin.class.createClass(payload);
            const newClassId = res.data.data.data._id;

            alert("Tạo lớp học thành công! Đang chuyển đến trang chi tiết để xếp lịch...");
            onSuccess(); // Refresh list bên ngoài nếu cần
            onClose();
            navigate(`/admin/classes/detail/${newClassId}`); // Chuyển ngay vào chi tiết
        } catch (err) {
            alert(err.response?.data?.message || "Lỗi khi tạo lớp.");
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.5)]">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Tạo Lớp Học Mới</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

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