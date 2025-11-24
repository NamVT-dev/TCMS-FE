import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { Loader2, Target, Calendar, User, CheckCircle, BookOpen, Award, TrendingUp } from 'lucide-react';
// Giả sử file utils này nằm ở đường dẫn này, bạn chỉnh lại cho đúng nhé
import { LEVEL_RANGES, getLevelFromScore } from '../../utils/scoreToLevel'; 

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

const inputClass = "mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-200 disabled:text-gray-500 cursor-pointer disabled:cursor-not-allowed";

const LearnerRoadmapPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // Data Lists
    const [myStudents, setMyStudents] = useState([]);
    const [allCategories, setAllCategories] = useState([]);

    // Form States
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(''); // ID category
    const [selectedCategoryName, setSelectedCategoryName] = useState(''); // Tên (IELTS/TOEIC) để tính toán
    const [targetScore, setTargetScore] = useState('');
    const [deadline, setDeadline] = useState('');

    // Current Status States (Để hiển thị)
    const [currentScore, setCurrentScore] = useState(0);
    const [currentLevel, setCurrentLevel] = useState('');

    // 1. Load danh sách ban đầu (Students + Categories)
    const loadInitialData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [studentRes, catRes] = await Promise.all([
                api.learner.getAllMyStudents(),
                api.user.getCourseCategories(),
            ]);

            const students = studentRes.data.data || [];
            const categories = catRes.data.data.data || catRes.data.data.categories || []; // Handle cấu trúc API linh hoạt

            setMyStudents(students);
            setAllCategories(categories);

            // Nếu chỉ có 1 học viên, tự chọn luôn
            if (students.length === 1) {
                setSelectedStudent(students[0]._id);
            }

        } catch (err) {
            setError("Không thể tải dữ liệu ban đầu.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    // 2. Khi chọn Student -> Fetch Detail để lấy điểm và category chính xác
    useEffect(() => {
        const fetchStudentDetail = async () => {
            if (!selectedStudent) {
                // Reset states nếu bỏ chọn
                setSelectedCategory('');
                setSelectedCategoryName('');
                setCurrentScore(0);
                setCurrentLevel('');
                return;
            }

            try {
                // Gọi API chi tiết như bạn yêu cầu
                const res = await api.user.getLearnerById(selectedStudent);
                const data = res.data.data;

                // 2.1. Set Category (Disable ô chọn course)
                if (data.category && data.category.length > 0) {
                    const cat = data.category[0];
                    setSelectedCategory(cat._id);
                    setSelectedCategoryName(cat.name);
                    
                    // 2.2. Set Current Score & Level
                    const score = data.testScore || 0;
                    setCurrentScore(score);
                    
                    // Tính Level từ Score bằng hàm helper
                    const calculatedLevel = getLevelFromScore(cat.name, score);
                    setCurrentLevel(calculatedLevel || 'Starter');
                }

            } catch (err) {
                console.error("Lỗi lấy chi tiết học viên:", err);
                // Fallback: thử lấy từ list myStudents nếu API detail lỗi
                const studentFromList = myStudents.find(s => s._id === selectedStudent);
                if(studentFromList?.category?.[0]) {
                    setSelectedCategory(studentFromList.category[0]._id);
                }
            }
        };

        fetchStudentDetail();
    }, [selectedStudent, myStudents]);


    // 3. Tính toán Options cho Target Dropdown
    // Logic: Chỉ hiện range của category hiện tại & Disable level <= level hiện tại
    const targetOptions = useMemo(() => {
        if (!selectedCategoryName) return [];

        // Xác định Range IELTS hay TOEIC
        const type = selectedCategoryName.toUpperCase().includes('TOEIC') ? 'TOEIC' : 'IELTS';
        const ranges = LEVEL_RANGES[type] || [];

        // Index của level hiện tại trong mảng LEVEL_ORDER
        const currentLevelIndex = LEVEL_ORDER.indexOf(currentLevel);

        return LEVEL_ORDER.map((lvl, index) => {
            // Tìm thông tin range (min-max) của level này
            const rangeInfo = ranges.find(r => r.level === lvl);
            const rangeLabel = rangeInfo ? ` (${rangeInfo.min} - ${rangeInfo.max})` : '';
            
            // Disable nếu level này <= level hiện tại
            const isDisabled = index <= currentLevelIndex;

            return {
                value: lvl,
                label: `${lvl}${rangeLabel}`,
                isDisabled: isDisabled
            };
        });
    }, [selectedCategoryName, currentLevel]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedStudent || !selectedCategory || !targetScore || !deadline) {
            alert("Vui lòng điền đầy đủ thông tin.");
            return;
        }

        setSaving(true);
        setError(null);
        
        const payload = {
            category: selectedCategory, // Gửi ID category (đã tự chọn)
            targetScore: targetScore,
            deadline: deadline,
        };

        try {
            await api.learner.updateLearningGoal(selectedStudent, payload);
            // Redirect
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
        <div className="bg-gray-50 min-h-screen pb-10">
            {/* Header Banner */}
            <div className="bg-purple-700 text-white">
                <div className="max-w-5xl mx-auto p-8 md:p-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-3">Xây Dựng Lộ Trình</h1>
                    <p className="text-lg md:text-xl text-purple-200">
                        Hệ thống sẽ tự động phân tích trình độ hiện tại và đề xuất lớp học phù hợp nhất.
                    </p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto p-6 -mt-10">
                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-xl border border-gray-200 space-y-8">

                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded flex items-center" role="alert">
                            <div className="mr-2">⚠️</div>
                            <div>{error}</div>
                        </div>
                    )}

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-3 border-b-2 border-purple-100 flex items-center">
                            <User className="w-6 h-6 mr-2 text-purple-600" />
                            1. Hồ sơ học tập
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Chọn Học Viên */}
                            <div>
                                <label htmlFor="student" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                    Chọn hồ sơ học viên
                                </label>
                                <select 
                                    id="student" 
                                    value={selectedStudent} 
                                    onChange={(e) => setSelectedStudent(e.target.value)} 
                                    className={inputClass} 
                                    required
                                >
                                    <option value="">-- Chọn hồ sơ --</option>
                                    {myStudents.map(s => (
                                        <option key={s._id} value={s._id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Chọn Môn Học (DISABLED) */}
                            <div>
                                <label htmlFor="category" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                    <BookOpen className="w-4 h-4 mr-2 text-purple-600" />
                                    Chương trình học (Tự động)
                                </label>
                                <select 
                                    id="category" 
                                    value={selectedCategory} 
                                    // onChange bị bỏ qua vì disabled
                                    className={inputClass} 
                                    disabled={true} // Yêu cầu số 2: Disable
                                >
                                    <option value="">-- Đang xác định --</option>
                                    {allCategories.map(c => (
                                        <option key={c._id} value={c._id}>{c.name}</option>
                                    ))}
                                </select>
                                {selectedStudent && !selectedCategory && (
                                    <p className="text-xs text-red-500 mt-1">* Học viên này chưa được xếp loại chương trình nào.</p>
                                )}
                            </div>
                        </div>

                        {/* Hiển thị Trình Độ Hiện Tại (Requirement 1) */}
                        {selectedStudent && selectedCategory && (
                            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start space-x-4 animate-fade-in">
                                <div className="p-2 bg-blue-100 rounded-full">
                                    <Award className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wide">Trình độ hiện tại</h3>
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <span className="text-2xl font-bold text-gray-800">{currentScore}</span>
                                        <span className="text-sm text-gray-600 font-medium">
                                            ({selectedCategoryName})
                                        </span>
                                    </div>
                                    <div className="text-blue-700 font-medium text-sm mt-1 flex items-center">
                                        Level tương đương: <span className="ml-1 px-2 py-0.5 bg-white border border-blue-200 rounded text-blue-800 font-bold">{currentLevel}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-3 border-b-2 border-purple-100 flex items-center">
                            <TrendingUp className="w-6 h-6 mr-2 text-purple-600" />
                            2. Đặt mục tiêu
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Chọn Level Mục Tiêu (Yêu cầu 3) */}
                            <div>
                                <label htmlFor="targetScore" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                    <Target className="w-4 h-4 mr-2 text-purple-600" />
                                    Mục tiêu (Level mong muốn)
                                </label>
                                <select 
                                    id="targetScore" 
                                    value={targetScore} 
                                    onChange={(e) => setTargetScore(e.target.value)} 
                                    className={inputClass} 
                                    required
                                    disabled={!selectedCategoryName} // Chỉ cho chọn khi đã có thông tin level hiện tại
                                >
                                    <option value="">-- Chọn level mục tiêu --</option>
                                    {targetOptions.map((opt, index) => (
                                        <option 
                                            key={index} 
                                            value={opt.value} 
                                            disabled={opt.isDisabled} // Disable level thấp hơn
                                            className={opt.isDisabled ? "text-gray-400 bg-gray-100" : "font-medium"}
                                        >
                                            {opt.label} {opt.isDisabled ? "(Đã đạt)" : ""}
                                        </option>
                                    ))}
                                </select>
                                {targetScore && (
                                    <p className="text-xs text-green-600 mt-1 font-medium">
                                        * Mục tiêu hợp lệ: Cao hơn trình độ hiện tại.
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="deadline" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                    <Calendar className="w-4 h-4 mr-2 text-purple-600" />
                                    Thời hạn (Deadline)
                                </label>
                                <input
                                    type="date" id="deadline"
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                    className={inputClass}
                                    // Set min date là ngày mai
                                    min={new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                                    required
                                />
                            </div>
                        </div>
                    </section>

                    
                    <div className="text-right pt-6 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={saving || loading}
                            className="inline-flex items-center px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition shadow-lg hover:shadow-purple-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
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