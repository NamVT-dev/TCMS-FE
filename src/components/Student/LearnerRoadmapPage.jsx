import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { Loader2, Save, Target, Calendar, User, CheckCircle, BookOpen } from 'lucide-react'; // ⬅️ Xóa Clock


const LEVEL_ORDER = [
    "Starter",
    "Beginner",
    "Elementary",
    "Pre-Intermediate",
    "Intermediate",
    "Upper-Intermediate",
    "Advanced",
    "Expert"
];

const inputClass = "mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent";

const LearnerRoadmapPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const [myStudents, setMyStudents] = useState([]);
    const [allCategories, setAllCategories] = useState([]);

    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [targetScore, setTargetScore] = useState('');
    const [deadline, setDeadline] = useState('');

    

    const loadInitialData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [studentRes, catRes] = await Promise.all([
                api.learner.getAllMyStudents(),
                api.user.getCourseCategories(),
            ]);

            const students = studentRes.data.data || [];
            const categories = catRes.data.data.data || [];

            setMyStudents(students);
            setAllCategories(categories);

            if (students.length === 1) {
                const student = students[0];
                setSelectedStudent(student._id);
                if (student.category && student.category.length === 1) {
                    setSelectedCategory(student.category[0]._id);
                }
            }

        } catch (err) {
            setError("Không thể tải dữ liệu. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    useEffect(() => {
        if (selectedStudent) {
            const student = myStudents.find(s => s._id === selectedStudent);
            if (student && student.category && student.category.length === 1) {
                setSelectedCategory(student.category[0]._id);
            } else {
                setSelectedCategory('');
            }
        }
    }, [selectedStudent, myStudents]);

  

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedStudent || !selectedCategory || !targetScore || !deadline) {
            setError("Vui lòng điền đầy đủ thông tin mục tiêu.");
            return;
        }

        setSaving(true);
        setError(null);

        
        const payload = {
            category: selectedCategory,
            targetScore: targetScore,
            deadline: deadline,
            
        };

        try {
            await api.learner.updateLearningGoal(selectedStudent, payload);
            alert("Đã lưu mục tiêu! Đang chuyển đến trang lộ trình...");

            navigate(`/learner/roadmap-results?student=${selectedStudent}&category=${selectedCategory}`);

        } catch (err) {
            setError(err.response?.data?.message || "Lỗi khi lưu mục tiêu.");
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
                <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="bg-gray-50">
        
            <div className="bg-purple-700 text-white">
                <div className="max-w-5xl mx-auto p-8 md:p-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-3">Xây Dựng Lộ Trình</h1>
                    <p className="text-lg md:text-xl text-purple-200">
                        Hãy cho chúng tôi biết mục tiêu của bạn để đề xuất khóa học phù hợp nhất.
                    </p>
                </div>
            </div>

        
            <div className="max-w-5xl mx-auto p-6 -mt-10">
                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-xl border border-gray-200 space-y-8">

                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded" role="alert">
                            <p className="font-bold">Đã xảy ra lỗi</p>
                            <p>{error}</p>
                        </div>
                    )}

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-3 border-b-2 border-purple-100">
                            1. Thông tin của bạn
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="student" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                    <User className="w-4 h-4 mr-2 text-purple-600" />
                                    Chọn hồ sơ học viên
                                </label>
                                <select id="student" value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} className={inputClass} required>
                                    <option value="">-- Chọn hồ sơ --</option>
                                    {myStudents.map(s => (
                                        <option key={s._id} value={s._id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="category" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                    <BookOpen className="w-4 h-4 mr-2 text-purple-600" />
                                    Chọn chương trình học
                                </label>
                                <select id="category" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className={inputClass} required>
                                    <option value="">-- Chọn môn học --</option>
                                    {allCategories.map(c => (
                                        <option key={c._id} value={c._id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-3 border-b-2 border-purple-100">
                            2. Mục tiêu của bạn
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="targetScore" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                    <Target className="w-4 h-4 mr-2 text-purple-600" />
                                    Mục tiêu (Level)
                                </label>
                                <select id="targetScore" value={targetScore} onChange={(e) => setTargetScore(e.target.value)} className={inputClass} required>
                                    <option value="">-- Chọn level mục tiêu --</option>
                                    {LEVEL_ORDER.map(level => (
                                        <option key={level} value={level}>{level}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="deadline" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                    <Calendar className="w-4 h-4 mr-2 text-purple-600" />
                                    Ngày hoàn thành (Deadline)
                                </label>
                                <input
                                    type="date" id="deadline"
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                    className={inputClass}
                                    required
                                />
                            </div>
                        </div>
                    </section>

                    
                    <div className="text-right pt-6 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={saving || loading}
                            className="inline-flex items-center px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition shadow-lg hover:shadow-purple-300 disabled:bg-gray-400"
                        >
                            {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle className="w-5 h-5 mr-2" />}
                            {saving ? "Đang lưu..." : "Lưu & Xem Lộ Trình"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default LearnerRoadmapPage;