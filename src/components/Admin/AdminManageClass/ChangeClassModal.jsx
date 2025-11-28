import React, { useState, useEffect } from "react";
import { 
    X, Search, Calendar, Clock, ArrowRight, CheckCircle2, Loader2, AlertCircle 
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import api from "../../../utils/api"; 

const ChangeClassModal = ({ isOpen, onClose, student, currentClass, onSuccess }) => {
    const [availableClasses, setAvailableClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState(null);

    const calculateSessionsPassed = (classItem) => {
        if (!classItem.startAt || !classItem.weeklySchedules || classItem.weeklySchedules.length === 0) return 0;
        
        const start = new Date(classItem.startAt);
        const now = new Date();
        
        
        if (now < start) return 0;

       
        const learningDays = classItem.weeklySchedules.map(s => s.dayOfWeek);
        
        let count = 0;
        let current = new Date(start);

       
        while (current <= now) {
            if (learningDays.includes(current.getDay())) {
                count++;
            }
            current.setDate(current.getDate() + 1);
        }
        return count;
    };

    useEffect(() => {
        if (isOpen && currentClass) {
            const fetchClasses = async () => {
                setLoading(true);
                try {
                    
                    const res = await api.admin.class.listClasses({ limit: 100, status: 'approved' });
                    const allClasses = res.data.data.classes || [];

                   
                    const filtered = allClasses.filter(c => 
                        c.course?._id === currentClass.course?._id && 
                        c._id !== currentClass._id &&
                        c.status === 'approved'
                    );
                    
                    const classesWithSessions = filtered.map(c => ({
                        ...c,
                        sessionsPassed: calculateSessionsPassed(c)
                    }));

                    setAvailableClasses(classesWithSessions);
                } catch (err) {
                    console.error(err);
                    setError("Không thể tải danh sách lớp học.");
                } finally {
                    setLoading(false);
                }
            };
            fetchClasses();
            setSelectedClass(null); 
            setError(null);
        }
    }, [isOpen, currentClass]);

    //  Chuyển lớp
    const handleSubmit = async () => {
        if (!selectedClass || !student) return;

        if (!window.confirm(`Xác nhận chuyển học viên ${student.name} sang lớp ${selectedClass.name}?`)) return;

        setSubmitting(true);
        setError(null);

        try {
            await api.admin.class.removeStudentFromClass(currentClass._id, { studentId: student._id });

            await api.admin.class.addStudentToClass(selectedClass._id, { studentId: student._id });

            alert("Chuyển lớp thành công!");
            onSuccess(); 
            onClose();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Có lỗi xảy ra khi chuyển lớp. Vui lòng kiểm tra lại sĩ số lớp mới.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

   
    const displayClasses = availableClasses.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.classCode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                
                {/* Header */}
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Chuyển Lớp Học Viên</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Học viên: <span className="font-semibold text-purple-600">{student?.name}</span> • 
                            Khóa hiện tại: <span className="font-semibold">{currentClass?.course?.name}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

               
                <div className="p-5 pb-0">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                            type="text"
                            placeholder="Tìm kiếm lớp theo tên hoặc mã lớp..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

              
                <div className="flex-1 overflow-y-auto p-5">
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" /> {error}
                        </div>
                    ) : displayClasses.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            Không tìm thấy lớp nào tương đương hoặc phù hợp.
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {displayClasses.map((cls) => {
                                const isFull = cls.student?.length >= cls.maxStudent;
                                const isSelected = selectedClass?._id === cls._id;

                                return (
                                    <div 
                                        key={cls._id}
                                        onClick={() => !isFull && setSelectedClass(cls)}
                                        className={`p-4 rounded-lg border-2 transition-all cursor-pointer flex justify-between items-center
                                            ${isSelected 
                                                ? 'border-purple-600 bg-purple-50' 
                                                : isFull 
                                                    ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                                                    : 'border-gray-200 hover:border-purple-300 hover:bg-white'
                                            }
                                        `}
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-bold text-gray-800">{cls.name}</h4>
                                                {isFull && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">FULL</span>}
                                            </div>
                                            
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <span className="flex items-center">
                                                    <Calendar className="w-4 h-4 mr-1" /> 
                                                    Bắt đầu: {format(new Date(cls.startAt), 'dd/MM/yyyy')}
                                                </span>
                                                <span className="flex items-center text-purple-600 font-medium">
                                                    <Clock className="w-4 h-4 mr-1" />
                                                    Đã học: {cls.sessionsPassed} buổi
                                                </span>
                                                <span>
                                                    Sĩ số: {cls.student?.length || 0}/{cls.maxStudent}
                                                </span>
                                            </div>
                                            
                                         
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {cls.weeklySchedules.map((s, idx) => (
                                                    <span key={idx} className="text-[10px] bg-gray-100 border border-gray-200 px-2 py-0.5 rounded text-gray-600">
                                                        {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][s.dayOfWeek]}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="ml-4">
                                            {isSelected ? (
                                                <CheckCircle2 className="w-6 h-6 text-purple-600" />
                                            ) : (
                                                <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
                    <button 
                        onClick={onClose}
                        className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition"
                        disabled={submitting}
                    >
                        Hủy bỏ
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={!selectedClass || submitting}
                        className={`px-5 py-2.5 rounded-lg text-white font-medium flex items-center gap-2 shadow-sm
                            ${!selectedClass || submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}
                        `}
                    >
                        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        Xác nhận chuyển lớp
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChangeClassModal;