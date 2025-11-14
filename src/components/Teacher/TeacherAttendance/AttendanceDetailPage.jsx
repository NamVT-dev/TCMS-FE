import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import api from '../../../utils/api';
import Loading from '../../UI/Loading';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'react-toastify';

const AttendanceDetailPage = () => {
    const { attendanceId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const initialData = location.state?.attendanceData;
    const [attendanceList, setAttendanceList] = useState([]);
    const [sessionInfo, setSessionInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!initialData) {
            navigate('/teacher/attendance');
            return;
        }

        const processAttendanceData = async () => {
            try {
                const studentIds = initialData.attendance.map(item =>
                    typeof item.student === 'object' ? item.student._id : item.student
                );

                const studentsMap = studentIds.reduce((map, id) => {
                    map[id] = {
                        _id: id,
                        name: `Học viên ${id.slice(-6)}`,
                        studentCode: `SV${id.slice(-4).toUpperCase()}`,
                    };
                    return map;
                }, {});

                const enrichedList = initialData.attendance.map(item => {
                    const studentId =
                        typeof item.student === 'object' ? item.student._id : item.student;
                    return {
                        student: studentsMap[studentId] || {
                            _id: studentId,
                            name: 'Không xác định',
                        },
                        status: item.status || 'absent',
                        note: item.note || '',
                    };
                });

                setAttendanceList(enrichedList);
                setSessionInfo(initialData.session);
            } catch (e) {
                console.error('Error processing attendance:', e);
                setError('Không thể tải thông tin học viên.');
            } finally {
                setIsLoading(false);
            }
        };

        processAttendanceData();
    }, [initialData, navigate]);

    const handleToggleStatus = studentId => {
        setAttendanceList(prevList =>
            prevList.map(item =>
                item.student._id === studentId
                    ? { ...item, status: item.status === 'present' ? 'absent' : 'present' }
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
        setError(null);

        try {
            const payload = {
                attendance: attendanceList.map(item => ({
                    student: item.student._id,
                    status: item.status,
                    note: item.note || '',
                })),
            };

            await api.teacher.attendance.takeAttendance(attendanceId, payload.attendance);
            console.log('Payload to send:', payload);

            setTimeout(() => {
                alert('✅ Điểm danh thành công!');
            }, 800);
        } catch (err) {
            console.error('Error saving attendance:', err);
            setError(err.response?.data?.message || 'Không thể lưu điểm danh.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen text-gray-500">
                Đang tải dữ liệu điểm danh...
            </div>
        );
    }

    if (!attendanceList.length) {
        return (
            <div className="container mx-auto p-6 max-w-4xl text-center text-gray-500">
                Không có dữ liệu điểm danh.
            </div>
        );
    }

    const presentCount = attendanceList.filter(item => item.status === 'present').length;
    const absentCount = attendanceList.filter(item => item.status === 'absent').length;

    return (
        <div className="container mx-auto p-4 md:p-6 max-w-4xl">
            {isSaving && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <Loading message="Đang lưu điểm danh..." />
                </div>
            )}


            <button
                onClick={() => navigate(-1)}
                className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Quay lại
            </button>

            <div className="bg-white rounded-lg shadow-md border">
                <div className="p-4 border-b font-semibold text-lg text-purple-700">
                    Điểm danh buổi học
                </div>

                <div className="p-4">
                    <div className="space-y-2">
                        {attendanceList.map((item, index) => (
                            <div
                                key={item.student._id}
                                className="border rounded-lg hover:bg-gray-50 transition-colors p-3"
                            >
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                    {/* Bên trái: Thông tin học viên */}
                                    <div className="flex items-center flex-1">
                                        <span className="w-8 h-8 flex items-center justify-center bg-purple-100 text-purple-700 rounded-full font-bold text-sm mr-3 flex-shrink-0">
                                            {index + 1}
                                        </span>
                                        <div>
                                            <p className="font-medium text-gray-800">{item.student.name}</p>
                                            {item.student.studentCode && (
                                                <p className="text-xs text-gray-500">{item.student.studentCode}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Bên phải: Ghi chú + nút trạng thái */}
                                    <div className="flex items-center justify-end gap-2 w-full md:w-1/2">
                                        <input
                                            type="text"
                                            placeholder="Ghi chú..."
                                            value={item.note}
                                            onChange={(e) => handleNoteChange(item.student._id, e.target.value)}
                                            className={`w-[400px] md:w-56 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${item.status === 'present'
                                                ? 'focus:ring-green-400 bg-green-50'
                                                : 'focus:ring-red-400 bg-red-50'
                                                }`}
                                        />

                                        <button
                                            onClick={() => handleToggleStatus(item.student._id)}
                                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex-shrink-0 ${item.status === 'present'
                                                ? 'bg-green-600 text-white hover:bg-green-700'
                                                : 'bg-red-500 text-white hover:bg-red-600'
                                                }`}
                                        >
                                            {item.status === 'present' ? '✓ Có mặt' : '✕ Vắng'}
                                        </button>
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                        <span className="font-semibold text-green-600">{presentCount}</span> có mặt,
                        <span className="font-semibold text-red-600 ml-1">{absentCount}</span> vắng
                    </p>
                    <button
                        onClick={handleSaveAttendance}
                        disabled={isSaving}
                        className="inline-flex items-center px-5 py-2.5 bg-purple-600 text-white font-semibold rounded-lg shadow hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Lưu Điểm danh
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AttendanceDetailPage;
