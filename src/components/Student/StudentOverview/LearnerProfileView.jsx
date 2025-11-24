import React, { useState, useEffect, useCallback } from "react";
import { Search, Eye, Loader2, User, GraduationCap, Trophy, Target, Info } from "lucide-react";
import api from "../../../utils/api";
import { useDebounce } from "../../../hooks/useDebounce";
import LearnerProfileDetailModal from "./LearnerProfileDetailModal";


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

const getScoreHint = (catName, level) => {
    if (!catName || !level) return null;
    const upperName = catName.toUpperCase();
   
    if (upperName.includes("IELTS")) return SCORE_RANGES.IELTS[level];
    
    if (upperName.includes("TOEIC")) return SCORE_RANGES.TOEIC[level];
    return null;
};

const Pagination = ({ page, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    
    return (
        <div className="flex items-center space-x-1 justify-center mt-8">
            <button onClick={() => onPageChange(page - 1)} disabled={page === 1} className="px-3 py-1.5 rounded border text-gray-600 hover:bg-gray-50 disabled:opacity-40 text-sm font-medium transition-colors">Trước</button>
            {pages.map(p => (
                <button key={p} onClick={() => onPageChange(p)} className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-all ${p === page ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-gray-100 border border-transparent hover:border-gray-200'}`}>{p}</button>
            ))}
            <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages} className="px-3 py-1.5 rounded border text-gray-600 hover:bg-gray-50 disabled:opacity-40 text-sm font-medium transition-colors">Sau</button>
        </div>
    );
};

const LearnerProfileView = () => {
    const [learners, setLearners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);
    
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const PAGE_SIZE = 9; 

    
    const [selectedLearnerId, setSelectedLearnerId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchLearners = useCallback(async () => {
        setLoading(true);
        try {
            const params = { 
                limit: PAGE_SIZE, 
                page: page,
                search: debouncedSearch || undefined 
            };
            
            const res = await api.user.getLearnerProfile(params);
            const data = res?.data?.data ?? [];
            
            const list = Array.isArray(data) ? data : (data.data || []);
            
            setLearners(list);
            const total = res.data?.total || list.length; 
            setTotalPages(Math.ceil(total / PAGE_SIZE) || 1);
            setTotalResults(total);
            
        } catch (err) {
            console.error("Lỗi tải danh sách:", err);
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch]);

    useEffect(() => {
        fetchLearners();
    }, [fetchLearners]);

    const handleViewDetail = (id) => {
        setSelectedLearnerId(id);
        setIsModalOpen(true);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-sans">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center">
                        <GraduationCap className="w-8 h-8 mr-3 text-purple-600" />
                        Danh sách Học viên
                    </h1>
                    <p className="text-gray-500 mt-1 ml-11">Quản lý hồ sơ và theo dõi tiến độ học tập.</p>
                </div>
                
                {/* Search Bar
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm học viên..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-purple-100 focus:border-purple-400 transition-all outline-none shadow-sm"
                    />
                </div> */}
            </div>

            {/* Content Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-80 bg-gray-200 rounded-2xl animate-pulse"></div>
                    ))}
                </div>
            ) : learners.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                    <User className="w-16 h-16 text-gray-300 mb-4" />
                    <p className="text-lg text-gray-500 font-medium">Không tìm thấy học viên nào</p>
                </div>
            ) : (
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {learners.map((learner) => {
                        
                        const targetLevel = learner.learningGoal?.targetScore;
                        const categoryName = learner.category?.[0]?.name; 
                        const scoreHint = getScoreHint(categoryName, targetLevel);

                        return (
                            <div 
                                key={learner._id} 
                                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col"
                            >
                               
                                <div className="h-24 bg-gradient-to-r from-purple-500 to-indigo-500 relative">
                                   
                                    <div className="absolute top-3 right-3">
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide shadow-sm backdrop-blur-md border border-white/20 ${learner.enrolled ? 'bg-white/90 text-green-700' : 'bg-black/40 text-white'}`}>
                                            {learner.enrolled ? 'Đã nhập học' : 'Chưa nhập học'}
                                        </span>
                                    </div>
                                </div>

                             
                                <div className="px-5 pb-5 flex-1 flex flex-col relative">
                                  
                                    <div className="-mt-12 mb-3 flex justify-center">
                                        <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-md bg-white overflow-hidden">
                                            <img 
                                                src={learner.photo || `https://ui-avatars.com/api/?name=${learner.name}&background=random&size=128`} 
                                                alt={learner.name} 
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        </div>
                                    </div>

                              
                                    <div className="text-center mb-4">
                                        <h3 className="font-bold text-gray-800 text-lg leading-tight mb-1 truncate" title={learner.name}>
                                            {learner.name}
                                        </h3>
                                        <p className="text-xs text-gray-400 capitalize">
                                            {learner.gender === 'male' ? 'Nam' : learner.gender === 'female' ? 'Nữ' : 'Khác'} 
                                            {learner.dob ? ` • ${new Date().getFullYear() - new Date(learner.dob).getFullYear()} tuổi` : ''}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap justify-center gap-2 mb-5">
                                        {learner.category?.length > 0 ? (
                                            learner.category.map(c => (
                                                <span key={c._id} className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-md text-xs font-semibold border border-blue-100">
                                                    {c.name}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">Chưa phân loại</span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mt-auto">
                                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center flex flex-col justify-center">
                                            <div className="text-[10px] text-gray-400 font-bold uppercase mb-1 flex items-center justify-center gap-1">
                                                <Trophy className="w-3 h-3" /> Trình độ hiện tại
                                            </div>
                                            <div className="text-sm font-bold text-purple-700 truncate">
                                                {learner.testScore || "N/A"}
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center flex flex-col justify-center">
                                            <div className="text-[10px] text-gray-400 font-bold uppercase mb-1 flex items-center justify-center gap-1">
                                                <Target className="w-3 h-3" /> Mục tiêu
                                            </div>
                                            
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-700 truncate" title={targetLevel}>
                                                    {targetLevel || "N/A"}
                                                </span>
                                                {/* Hiển thị điểm quy đổi nếu có */}
                                                {scoreHint && (
                                                    <span className="text-[10px] text-purple-500 font-medium">
                                                        ({scoreHint})
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Action */}
                                <div className="p-3 border-t border-gray-100 bg-gray-50/50">
                                    <button 
                                        onClick={() => handleViewDetail(learner._id)}
                                        className="w-full py-2 bg-white border border-gray-200 text-gray-600 hover:text-purple-600 hover:border-purple-200 hover:bg-purple-50 rounded-xl transition-all font-medium text-sm flex items-center justify-center shadow-sm group-hover:shadow-md"
                                    >
                                        <Eye className="w-4 h-4 mr-2" /> Xem hồ sơ
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            

            {/* Modal */}
            <LearnerProfileDetailModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                learnerId={selectedLearnerId}
                onSuccess={fetchLearners}
            />
        </div>
    );
};

export default LearnerProfileView;