import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, CheckCircle2, XCircle, X, User } from 'lucide-react';
import api from '../../../utils/api';
import Loading from '../../UI/Loading';

function Toast({ message, type = "success", onClose }) {
    const icons = {
        success: <CheckCircle2 className="w-5 h-5" />,
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

const Avatar = ({ src, name, className = "w-10 h-10" }) => {
    const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : '?';
    
    return (
        <div className={`relative inline-flex items-center justify-center rounded-full bg-purple-200 text-purple-700 font-semibold ${className} overflow-hidden flex-shrink-0`}>
            {src && src !== "" ? (
                <img className="object-cover w-full h-full" src={src} alt={name} onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.querySelector('span').style.display = 'flex'; }} />
            ) : (
                <span className="text-sm">{initials}</span>
            )}
            <span className="absolute inset-0 flex items-center justify-center text-sm" style={{ display: src && src !== "" ? 'none' : 'flex' }}>{initials}</span>
        </div>
    );
};



const AttendanceDetailPage = () => {
    const { attendanceId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const initialData = location.state?.attendanceData;

    const [attendanceList, setAttendanceList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    };


    useEffect(() => {
        if (!initialData) {
            navigate('/teacher/attendance');
            return;
        }

        const processData = () => {
            try {
                const processedList = initialData.attendance.map(item => {
                    const studentInfo =
                        typeof item.student === "object" && item.student !== null
                            ? item.student
                            : { _id: item.student, name: "Chưa có tên" };

                    const studentName = studentInfo.name || studentInfo.profile?.fullname || "Học viên";
                    const studentCode = studentInfo.studentCode || "";
                    const studentPhoto = studentInfo.photo || ""; 

                    return {
                        student: {
                            _id: studentInfo._id,
                            name: studentName,
                            studentCode: studentCode,
                            photo: studentPhoto 
                        },
                        status: item.status || "absent",
                        note: item.note || "",
                        _id: item._id
                    };
                });

                setAttendanceList(processedList);
                setIsLoading(false);

            } catch (e) {
                console.error("Lỗi xử lý dữ liệu:", e);
                showToast("Có lỗi khi hiển thị danh sách học viên.", "error");
                setIsLoading(false);
            }
        };

        processData();
    }, [initialData, navigate]);

    const handleChangeStatus = (studentId, value) => {
        setAttendanceList(prev =>
            prev.map(item =>
                item.student._id === studentId
                    ? { ...item, status: value }
                    : item
            )
        );
    };

    const handleNoteChange = (studentId, note) => {
        setAttendanceList(prevList =>
            prevList.map(item =>
                item.student._id === studentId ? { ...item, note } : item
            )
        );
    };

    const handleSaveAttendance = async () => {
        setIsSaving(true);

        try {
            const payload = attendanceList.map(item => ({
                student: item.student._id,
                status: item.status,
                note: item.note || ''
            }));

            await api.teacher.attendance.takeAttendance(attendanceId, payload);

            showToast("Điểm danh thành công!", "success");
            setIsSaving(false);

        } catch (err) {
            console.error("Lỗi khi lưu:", err);
            showToast(err.response?.data?.message || "Không thể lưu điểm danh.", "error");
            setIsSaving(false);
        }
    };
    


    if (isLoading) {
        return <Loading fullscreen={true} message="Đang tải danh sách..." />;
    }

    if (!attendanceList.length) {
        return (
            <div className="container mx-auto p-6 text-center">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 inline-block shadow-sm">
                    <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                    <h2 className="text-xl font-semibold text-gray-800 mb-1">Không có dữ liệu học viên</h2>
                    <p className="text-gray-600 mb-4">
                        Lớp học này hiện chưa có học viên nào được thêm vào.
                    </p>
                    <button
                        onClick={() => navigate('/teacher/attendance')}
                        className="px-4 py-2 bg-white border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50"
                    >
                        Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }

    const presentCount = attendanceList.filter(item => item.status === "present").length;
    const absentCount = attendanceList.filter(item => item.status === "absent").length;

    return (
        <>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="container mx-auto p-4 md:p-6 max-w-8xl">
                {isSaving && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                        <Loading variant="card" message="Đang lưu dữ liệu..." />
                    </div>
                )}

                <button
                    onClick={() => navigate('/teacher/attendance')}
                    className="flex items-center text-gray-600 hover:text-purple-600 font-medium mb-4 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Quay lại danh sách
                </button>

                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h1 className="text-2xl font-bold text-gray-800">
                            Điểm danh học viên
                        </h1>

                        <div className="flex space-x-3 text-sm font-medium">
                            <div className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg flex items-center shadow-sm">
                                <CheckCircle2 className="w-4 h-4 mr-1.5" /> {presentCount} Có mặt
                            </div>
                            <div className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg flex items-center shadow-sm">
                                <XCircle className="w-4 h-4 mr-1.5" /> {absentCount} Vắng mặt
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
            <tr>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    Stt
                </th>
                
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Ảnh
                </th>
                
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-3/12">
                    Tên học viên
                </th>
                
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-4/12">
                    Ghi chú
                </th>
                
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-3/12">
                    Điểm danh
                </th>
            </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
            {attendanceList.map((item, index) => (
                <tr 
                    key={item.student._id} 
                    className={item.status === "absent" ? "bg-red-50/30 transition-colors" : "hover:bg-gray-50 transition-colors"}
                >
                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium text-gray-600">
                        {index + 1}
                    </td>
                    
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="flex justify-center">
                            <Avatar 
                                src={item.student.photo} 
                                name={item.student.name} 
                                className="w-10 h-10 shadow-sm border-2 border-white"
                            />
                        </div>
                    </td>
                    
                    <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex flex-col justify-center">
                            <p className="font-semibold text-gray-800 text-sm">{item.student.name}</p>
                            {item.student.studentCode && (
                                <p className="text-xs text-gray-500 font-mono mt-0.5">{item.student.studentCode}</p>
                            )}
                        </div>
                    </td>
                    
                    <td className="px-4 py-3">
                        <input
                            type="text"
                            placeholder="Ghi chú..."
                            value={item.note}
                            onChange={(e) => handleNoteChange(item.student._id, e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500 placeholder-gray-400"
                        />
                    </td>
                    
                    <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-4 bg-gray-50/70 p-2 rounded-lg border border-gray-200 inline-flex">
                            <label className="flex items-center gap-1.5 cursor-pointer hover:bg-green-50 px-2 py-1 rounded transition-colors">
                                <input
                                    type="radio"
                                    name={`status-${item.student._id}`}
                                    value="present"
                                    checked={item.status === "present"}
                                    onChange={() => handleChangeStatus(item.student._id, "present")}
                                    className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                                />
                                <span className={`text-sm font-medium ${item.status === "present" ? "text-green-700" : "text-gray-600"}`}>Có</span>
                            </label>

                            <div className="w-px h-4 bg-gray-300 mx-1"></div>

                            <label className="flex items-center gap-1.5 cursor-pointer hover:bg-red-50 px-2 py-1 rounded transition-colors">
                                <input
                                    type="radio"
                                    name={`status-${item.student._id}`}
                                    value="absent"
                                    checked={item.status === "absent"}
                                    onChange={() => handleChangeStatus(item.student._id, "absent")}
                                    className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
                                />
                                <span className={`text-sm font-medium ${item.status === "absent" ? "text-red-700" : "text-gray-600"}`}>Vắng</span>
                            </label>
                        </div>
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
</div>

                    <div className="p-4 bg-gray-50 border-t border-gray-200 sticky bottom-0 z-10 flex justify-end shadow-inner">
                        <button
                            onClick={handleSaveAttendance}
                            disabled={isSaving}
                            className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                        >
                            <Save className="w-5 h-5 mr-2" />
                            {isSaving ? "Đang lưu..." : "Lưu kết quả điểm danh"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AttendanceDetailPage;