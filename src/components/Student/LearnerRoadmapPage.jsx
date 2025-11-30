import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import {
    Loader2, Target, Calendar, User, CheckCircle,
    BookOpen, Award, TrendingUp, Map, ArrowRight, Flag, Star, X, AlertCircle
} from 'lucide-react';
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
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${styles[type]} transform transition-all duration-300 ease-out`}>
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

const LearnerRoadmapPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    const [myStudents, setMyStudents] = useState([]);

    // Selection States
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedCategoryName, setSelectedCategoryName] = useState('');

    // Form Inputs
    const [targetScore, setTargetScore] = useState('');
    const [deadline, setDeadline] = useState('');

    // Status States
    const [currentScore, setCurrentScore] = useState(0);
    const [currentLevel, setCurrentLevel] = useState('');

    // Roadmap State
    const [existingTarget, setExistingTarget] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    };

    const loadInitialData = useCallback(async () => {
        setLoading(true);
        try {
            const [studentRes] = await Promise.all([
                api.learner.getAllMyStudents(),
            ]);
            const students = studentRes.data.data || [];
            setMyStudents(students);

            if (students.length === 1) {
                setSelectedStudent(students[0]._id);
            }
        } catch (err) {
            showToast("Không thể tải dữ liệu ban đầu.", "error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    // Fetch Student Detail & Check Existing Roadmap
    useEffect(() => {
        const fetchStudentDetail = async () => {
            if (!selectedStudent) {
                resetForm();
                return;
            }

            try {
                const res = await api.user.getLearnerById(selectedStudent);
                const data = res.data.data;

                // 1. Xử lý Category & Current Score (Test Score)
                if (data.category && data.category.length > 0) {
                    const cat = data.category[0];
                    setSelectedCategory(cat._id);
                    setSelectedCategoryName(cat.name);

                    const score = data.testScore || 0;
                    setCurrentScore(score);

                    // Quy đổi điểm test ra Level hiện tại
                    const calculatedLevel = getLevelFromScore(cat.name, score);
                    setCurrentLevel(calculatedLevel || 'Starter');
                }

                // 2. Kiểm tra Roadmap đã tồn tại chưa
                const goal = data.learningGoal;

                if (goal && goal.targetScore) {
                    setExistingTarget({
                        targetScore: goal.targetScore,
                        deadline: goal.deadline
                    });
                    setIsEditing(false);
                } else {
                    setExistingTarget(null);
                    setIsEditing(true);
                }

            } catch (err) {
                console.error("Lỗi lấy chi tiết học viên:", err);
                // Fallback nếu lỗi API nhưng có dữ liệu trong list
                const studentFromList = myStudents.find(s => s._id === selectedStudent);
                if (studentFromList?.category?.[0]) {
                    setSelectedCategory(studentFromList.category[0]._id);
                }
                setExistingTarget(null);
                setIsEditing(true);
            }
        };

        fetchStudentDetail();
    }, [selectedStudent, myStudents]);

    const resetForm = () => {
        setSelectedCategory('');
        setSelectedCategoryName('');
        setCurrentScore(0);
        setCurrentLevel('');
        setTargetScore('');
        setDeadline('');
        setExistingTarget(null);
        setIsEditing(false);
    };

    // Logic tạo danh sách select option cho Target
    const targetOptions = useMemo(() => {
        if (!selectedCategoryName) return [];
        const type = selectedCategoryName.toUpperCase().includes('TOEIC') ? 'TOEIC' : 'IELTS';
        const ranges = LEVEL_RANGES[type] || [];
        const currentLevelIndex = LEVEL_ORDER.indexOf(currentLevel);

        return LEVEL_ORDER.map((lvl, index) => {
            const rangeInfo = ranges.find(r => r.level === lvl);
            const rangeLabel = rangeInfo ? ` (${rangeInfo.min} - ${rangeInfo.max})` : '';
            const isDisabled = index <= currentLevelIndex;

            return {
                value: lvl,
                label: `${lvl}${rangeLabel}`,
                isDisabled: isDisabled
            };
        });
    }, [selectedCategoryName, currentLevel]);

    // Logic tạo các bước cho Roadmap Timeline
    const generateRoadmapSteps = () => {
        if (!currentLevel || (!targetScore && !existingTarget?.targetScore)) return [];

        const targetLvl = existingTarget ? existingTarget.targetScore : targetScore;

        const type = selectedCategoryName?.toUpperCase().includes('TOEIC') ? 'TOEIC' : 'IELTS';
        const ranges = LEVEL_RANGES[type] || [];

        const startIndex = LEVEL_ORDER.indexOf(currentLevel);
        const endIndex = LEVEL_ORDER.indexOf(targetLvl);

        if (startIndex === -1 || endIndex === -1) return [];

        const rawSteps = LEVEL_ORDER.slice(startIndex, endIndex + 1);

        return rawSteps.map(lvl => {
            const rangeData = ranges.find(r => r.level === lvl);
            return {
                name: lvl,
                min: rangeData ? rangeData.min : 0,
                max: rangeData ? rangeData.max : 0
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedStudent || !selectedCategory || !targetScore || !deadline) {
            showToast("Vui lòng điền đầy đủ thông tin.", "warning");
            return;
        }

        setSaving(true);
        const payload = {
            category: selectedCategory,
            targetScore: targetScore,
            deadline: deadline,
        };

        try {
            await api.learner.updateLearningGoal(selectedStudent, payload);
            // Sau khi save thành công, reload lại state để hiện roadmap view
            const res = await api.user.getLearnerById(selectedStudent);
            const goal = res.data.data.learningGoal;
            setExistingTarget({
                targetScore: goal.targetScore,
                deadline: goal.deadline
            });
            setIsEditing(false);
            showToast("Lưu lộ trình thành công!", "success");
        } catch (err) {
            showToast(err.response?.data?.message || "Lỗi khi lưu mục tiêu.", "error");
        } finally {
            setSaving(false);
        }
    };

    const roadmapSteps = generateRoadmapSteps();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
                <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="bg-gray-50 min-h-screen pb-10">
                {/* Header */}
                <div className="bg-purple-700 text-white">
                    <div className="max-w-6xl mx-auto p-8 md:p-12">
                        <h1 className="text-4xl md:text-5xl font-bold mb-3">Lộ Trình Học Tập</h1>
                        <p className="text-lg md:text-xl text-purple-200">
                            Quản lý mục tiêu và theo dõi tiến độ học tập cá nhân hóa.
                        </p>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto p-6 -mt-10">
                    <div className="bg-white p-8 rounded-lg shadow-xl border border-gray-200 space-y-8">

                        {/* --- Section 1: Hồ Sơ --- */}
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-3 border-b-2 border-purple-100 flex items-center">
                                <User className="w-6 h-6 mr-2 text-purple-600" />
                                1. Hồ sơ học tập
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                        Chọn hồ sơ học viên <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={selectedStudent}
                                        onChange={(e) => setSelectedStudent(e.target.value)}
                                        className={inputClass}
                                    >
                                        <option value="">-- Chọn hồ sơ --</option> 
                                        {myStudents.map(s => (
                                            <option key={s._id} value={s._id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                        <BookOpen className="w-4 h-4 mr-2 text-purple-600" />
                                        Chương trình học <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={selectedCategoryName || "Đang tải..."}
                                        disabled
                                        className={`${inputClass} bg-gray-100`}
                                    />
                                </div>
                            </div>

                            {/* Display Current Level */}
                            {selectedStudent && selectedCategory && (
                                <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start space-x-4">
                                    <div className="p-2 bg-blue-100 rounded-full">
                                        <Award className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wide">Trình độ khởi điểm (Test Score)</h3>
                                        <div className="flex items-baseline gap-2 mt-1">
                                            <span className="text-2xl font-bold text-gray-800">{currentScore}</span>
                                            <span className="text-sm text-gray-600 font-medium">({selectedCategoryName})</span>
                                        </div>
                                        <div className="text-blue-700 font-medium text-sm mt-1 flex items-center">
                                            Level tương đương: <span className="ml-1 px-2 py-0.5 bg-white border border-blue-200 rounded text-blue-800 font-bold">{currentLevel}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* --- Section 2: Roadmap Visualization Or Setup Form --- */}
                        <section className="pt-4">
                            <div className="flex justify-between items-center mb-6 pb-3 border-b-2 border-purple-100">
                                <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                                    <Map className="w-6 h-6 mr-2 text-purple-600" />
                                    2. Lộ trình cá nhân
                                </h2>
                                {existingTarget && !isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="text-sm text-purple-600 hover:text-purple-800 underline font-medium"
                                    >
                                        Điều chỉnh mục tiêu
                                    </button>
                                )}
                            </div>

                            {/* VIEW MODE: Hiển thị Timeline Ngang */}
                            {existingTarget && !isEditing ? (
                                <div className="transition-all duration-200">
                                    <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
                                        {/* Info Header */}
                                        <div className="flex flex-col md:flex-row justify-between mb-10 gap-4">
                                            <div>
                                                <p className="text-gray-500 text-sm uppercase font-semibold tracking-wider">Mục tiêu cuối cùng</p> 
                                                <div className="flex items-center gap-2">
                                                    <Target className="w-6 h-6 text-red-500" />
                                                    <p className="text-3xl font-bold text-gray-800">{existingTarget.targetScore}</p>
                                                </div>
                                            </div>
                                            <div className="md:text-right">
                                                <p className="text-gray-500 text-sm uppercase font-semibold tracking-wider">Hạn hoàn thành</p>
                                                <div className="flex items-center gap-2 md:justify-end">
                                                    <Calendar className="w-5 h-5 text-gray-500" />
                                                    <p className="text-xl font-medium text-gray-800">
                                                        {existingTarget.deadline ? new Date(existingTarget.deadline).toLocaleDateString('vi-VN') : 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* HORIZONTAL STEPPER / TIMELINE */}
                                        <div className="relative mt-8 mb-12 px-2 md:px-4">
                                            {/* Thanh nối ngang (Desktop) */}
                                            <div className="hidden md:block absolute top-6 left-0 right-0 h-1 bg-gray-100 rounded-full -z-10">
                                                <div className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-30 w-full"></div>
                                            </div>

                                            <div className="flex flex-col md:flex-row justify-between items-start gap-6 md:gap-2">
                                                {roadmapSteps.map((step, index) => {
                                                    const isStart = index === 0;
                                                    const isEnd = index === roadmapSteps.length - 1;

                                                    return (
                                                        <div key={index} className="flex md:flex-col items-center relative group w-full md:flex-1">

                                                            {/* Circle Icon */}
                                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 shadow-sm z-10 transition-transform hover:scale-110 duration-300 flex-shrink-0 bg-white
                        ${isStart
                                                                    ? 'border-blue-500 text-blue-600'
                                                                    : isEnd
                                                                        ? 'border-purple-600 text-purple-600 shadow-purple-100'
                                                                        : 'border-purple-300 text-purple-400'}
                    `}>
                                                                {isStart ? <Star size={20} fill="currentColor" /> :
                                                                    isEnd ? <Flag size={20} fill="currentColor" /> :
                                                                        <BookOpen size={16} />}
                                                            </div>

                                                            {/* Text Content */}
                                                            <div className="ml-4 md:ml-0 md:mt-3 text-left md:text-center w-full">
                                                                {/* Label Giai đoạn */}
                                                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                                                                    {isStart ? 'Xuất phát' : isEnd ? 'Đích đến' : `Giai đoạn ${index}`}
                                                                </p>

                                                                {/* Tên Level */}
                                                                <h4 className={`text-sm md:text-base font-bold leading-tight ${isEnd ? 'text-purple-700' : 'text-gray-800'}`}>
                                                                    {step.name}
                                                                </h4>

                                                                {/* Range điểm */}
                                                                <div className="text-xs font-semibold text-purple-600 mt-0.5 bg-purple-50 inline-block px-2 py-0.5 rounded-full border border-purple-100">
                                                                    {step.min} - {step.max}
                                                                </div>

                                                                {/* Subtext instruction */}
                                                                {!isStart && !isEnd && (
                                                                    <p className="text-[10px] text-gray-400 mt-1 hidden md:block">
                                                                        Cần hoàn thành
                                                                    </p>
                                                                )}
                                                            </div>

                                                            {/* Mobile Vertical Line connector */}
                                                            {!isEnd && (
                                                                <div className="md:hidden absolute left-6 top-12 bottom-[-24px] w-0.5 bg-gray-200 -z-10"></div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="flex justify-center mt-8">
                                            <button
                                                onClick={() => navigate(`/learner/roadmap-results?student=${selectedStudent}&category=${selectedCategory}`)}
                                                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-bold shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-indigo-700 transition transform hover:-translate-y-1 flex items-center"
                                            >
                                                Xem chi tiết các khóa học
                                                <ArrowRight className="ml-2 w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* EDIT MODE: Form nhập liệu */
                                <form onSubmit={handleSubmit} className="transition-all duration-200">
                                    {!existingTarget && selectedStudent && (
                                        <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded mb-6 flex items-center">
                                            <Map className="w-5 h-5 mr-2" />
                                            <span>Bạn chưa có lộ trình. Hãy đặt mục tiêu để hệ thống vẽ lộ trình cho bạn.</span>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="targetScore" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                                <Target className="w-4 h-4 mr-2 text-purple-600" />
                                                Mục tiêu (Level mong muốn) <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                id="targetScore"
                                                value={targetScore}
                                                onChange={(e) => setTargetScore(e.target.value)}
                                                className={inputClass}
                                                required
                                                disabled={!selectedCategoryName}
                                            >
                                                <option value="">-- Chọn level mục tiêu --</option>
                                                {targetOptions.map((opt, index) => (
                                                    <option key={index} value={opt.value} disabled={opt.isDisabled} className={opt.isDisabled ? "text-gray-400 bg-gray-100" : "font-medium"}>
                                                        {opt.label} {opt.isDisabled ? "(Đã đạt)" : ""}
                                                    </option>
                                                ))}
                                            </select>
                                            {targetScore && (
                                                <p className="text-xs text-green-600 mt-2 font-medium">
                                                    * Hệ thống sẽ tự động gợi ý các lớp từ level {currentLevel} đến {targetScore}.
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="deadline" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                                <Calendar className="w-4 h-4 mr-2 text-purple-600" />
                                                Thời hạn (Deadline) <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="date" id="deadline"
                                                value={deadline}
                                                onChange={(e) => setDeadline(e.target.value)}
                                                className={inputClass}
                                                min={new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="text-right pt-6 mt-4 border-t border-gray-200 flex justify-end gap-3">
                                        {isEditing && existingTarget && (
                                            <button
                                                type="button"
                                                onClick={() => setIsEditing(false)}
                                                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                                            >
                                                Hủy bỏ
                                            </button>
                                        )}
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
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LearnerRoadmapPage;