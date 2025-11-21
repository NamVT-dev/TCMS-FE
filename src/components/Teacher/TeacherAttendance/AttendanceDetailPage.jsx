import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import api from '../../../utils/api';
import Loading from '../../UI/Loading';

const AttendanceDetailPage = () => {
    const { attendanceId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    // Nhận dữ liệu từ trang trước gửi sang
    const initialData = location.state?.attendanceData;

    const [attendanceList, setAttendanceList] = useState([]);
    const [sessionInfo, setSessionInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Nếu không có dữ liệu (do F5 hoặc truy cập trực tiếp), quay về danh sách
        if (!initialData) {
            navigate('/teacher/attendance');
            return;
        }

        // Log dữ liệu nhận được để debug
        console.log("Initial Data nhận được:", initialData);

        const processData = () => {
            try {
                // Backend đã populate đầy đủ thông tin student, không cần map ID thủ công nữa
                const processedList = initialData.attendance.map(item => {
                    // Kiểm tra kỹ xem student là object hay string để xử lý an toàn
                    const studentInfo = typeof item.student === 'object' && item.student !== null 
                        ? item.student 
                        : { _id: item.student, name: 'Chưa có tên' };

                    return {
                        student: {
                            _id: studentInfo._id,
                            name: studentInfo.name || studentInfo.profile?.fullname || 'Học viên',
                            studentCode: studentInfo.studentCode || ''
                        },
                        status: item.status || 'absent',
                        note: item.note || '',
                        // Giữ lại _id của sub-document attendance nếu cần
                        _id: item._id 
                    };
                });

                console.log("Danh sách sau khi xử lý:", processedList);
                
                setAttendanceList(processedList);
                setSessionInfo(initialData.session);
                setIsLoading(false);

            } catch (e) {
                console.error('Lỗi xử lý dữ liệu:', e);
                setError("Có lỗi khi hiển thị danh sách học viên.");
                setIsLoading(false);
            }
        };

        processData();
    }, [initialData, navigate]);

    // Hàm đổi trạng thái (Có mặt <-> Vắng mặt)
    const handleToggleStatus = (studentId) => {
        setAttendanceList(prevList =>
            prevList.map(item =>
                item.student._id === studentId
                    ? { ...item, status: item.status === 'present' ? 'absent' : 'present' }
                    : item
            )
        );
    };

    // Hàm cập nhật ghi chú
    const handleNoteChange = (studentId, note) => {
        setAttendanceList(prevList =>
            prevList.map(item =>
                item.student._id === studentId ? { ...item, note } : item
            )
        );
    };

    // Hàm lưu điểm danh
    const handleSaveAttendance = async () => {
        setIsSaving(true);
        setError(null);

        try {
            // Chuẩn bị payload: Chỉ gửi mảng object đơn giản lên BE
            const payload = attendanceList.map(item => ({
                student: item.student._id,
                status: item.status,
                note: item.note || ''
            }));

            console.log('Gửi payload lên server:', payload);

            // Gọi API (api.js sẽ tự wrap vào { attendance: payload })
            await api.teacher.attendance.takeAttendance(attendanceId, payload);

            setTimeout(() => {
                alert("✅ Điểm danh thành công!");
                setIsSaving(false);
            }, 500);

        } catch (err) {
            console.error("Lỗi khi lưu:", err);
            setError(err.response?.data?.message || "Không thể lưu điểm danh.");
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <Loading fullscreen={true} message="Đang tải danh sách..." />;
    }

    // Hiển thị thông báo nếu danh sách rỗng (có thể do lớp chưa có học viên)
    if (!attendanceList.length) {
        return (
            <div className="container mx-auto p-6 text-center">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 inline-block shadow-sm">
                    <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                    <h2 className="text-xl font-semibold text-gray-800 mb-1">Không có dữ liệu học viên</h2>
                    <p className="text-gray-600 mb-4">Lớp học này hiện chưa có học viên nào được thêm vào, hoặc phiếu điểm danh đã được tạo khi lớp còn trống.</p>
                    <button 
                        onClick={() => navigate('/teacher/attendance')} 
                        className="px-4 py-2 bg-white border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 font-medium transition-colors"
                    >
                        Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }

    const presentCount = attendanceList.filter(item => item.status === 'present').length;
    const absentCount = attendanceList.filter(item => item.status === 'absent').length;

    return (
        <div className="container mx-auto p-4 md:p-6 max-w-5xl">
            {/* Loading Overlay khi đang lưu */}
            {isSaving && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
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
                {/* Header Thông tin buổi học */}
                <div className="p-5 border-b bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            {sessionInfo?.class?.name || "Chi tiết Điểm danh"}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                            <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-mono">
                                ID: {sessionInfo?._id?.slice(-6).toUpperCase()}
                            </span>
                            <span>•</span>
                            <span>Phòng: {sessionInfo?.room?.name || 'N/A'}</span>
                        </p>
                    </div>
                    
                    {/* Thống kê nhanh */}
                    <div className="flex space-x-3 text-sm font-medium">
                        <div className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg flex items-center shadow-sm">
                            <CheckCircle2 className="w-4 h-4 mr-1.5" /> {presentCount} Có mặt
                        </div>
                        <div className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg flex items-center shadow-sm">
                            <XCircle className="w-4 h-4 mr-1.5" /> {absentCount} Vắng
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="m-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                        {error}
                    </div>
                )}

                {/* Danh sách học viên */}
                <div className="divide-y divide-gray-100">
                    {attendanceList.map((item, index) => (
                        <div 
                            key={item.student._id} 
                            className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition-colors ${
                                item.status === 'absent' ? 'bg-red-50/30' : ''
                            }`}
                        >
                            {/* Thông tin học viên */}
                            <div className="flex items-center min-w-[250px]">
                                <span className="w-8 h-8 flex items-center justify-center bg-gray-200 text-gray-600 rounded-full font-bold text-xs mr-3 flex-shrink-0 shadow-sm">
                                    {index + 1}
                                </span>
                                <div>
                                    <p className="font-semibold text-gray-800 text-base">{item.student.name}</p>
                                    {item.student.studentCode && (
                                        <p className="text-xs text-gray-500 font-mono">{item.student.studentCode}</p>
                                    )}
                                </div>
                            </div>

                            {/* Khu vực thao tác: Input Note + Button nằm cùng hàng */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:justify-end">
                                {/* Ô nhập ghi chú: Luôn hiển thị */}
                                <input
                                    type="text"
                                    placeholder="Ghi chú..."
                                    value={item.note}
                                    onChange={(e) => handleNoteChange(item.student._id, e.target.value)}
                                    className="flex-1 md:max-w-xs px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all bg-white shadow-sm"
                                />

                                {/* Nút trạng thái */}
                                <button
                                    onClick={() => handleToggleStatus(item.student._id)}
                                    className={`
                                        flex-shrink-0 px-4 py-2 rounded-lg font-medium text-sm transition-all border shadow-sm flex items-center justify-center min-w-[120px]
                                        ${item.status === 'present'
                                            ? 'bg-green-600 text-white border-green-600 hover:bg-green-700 active:scale-95'
                                            : 'bg-white text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 active:scale-95'
                                        }
                                    `}
                                >
                                    {item.status === 'present' ? (
                                        <>
                                            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Có mặt
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="w-4 h-4 mr-1.5" /> Vắng mặt
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-gray-50 border-t border-gray-200 sticky bottom-0 z-10 flex justify-end shadow-inner">
                    <button
                        onClick={handleSaveAttendance}
                        disabled={isSaving}
                        className="inline-flex items-center px-6 py-2.5 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-95"
                    >
                        <Save className="w-5 h-5 mr-2" />
                        {isSaving ? 'Đang lưu...' : 'Lưu kết quả'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AttendanceDetailPage;