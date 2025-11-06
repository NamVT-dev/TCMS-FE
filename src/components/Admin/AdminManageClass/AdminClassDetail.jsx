// src/components/Admin/AdminManageClass/AdminClassDetail.jsx

import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../../utils/api";

import { Loader2, ArrowLeft, BookOpen, User, Home, Calendar, Clock } from "lucide-react";

import ClassScheduleCalendar from "./ClassScheduleCalendar";

// Component con cho Thẻ Thông Tin Chung
const InfoCard = ({ icon: Icon, title, children }) => (
    <div className="bg-white shadow rounded-lg p-5">
        <div className="flex items-center mb-3">
            <Icon className="w-6 h-6 text-purple-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="text-gray-700 space-y-2">{children}</div>
    </div>
);

// Component con cho Lịch Học Hàng Tuần
const WeeklyScheduleCard = ({ schedules }) => {

    // Hàm helper để đổi phút -> "HH:mm"
    const formatMinutes = (minutes) => {
        if (minutes === undefined || minutes === null) return '';
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    return (
        <div className="bg-white shadow rounded-lg p-5">
            <div className="flex items-center mb-4">
                <Calendar className="w-6 h-6 text-purple-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-800">Lịch Học Hàng Tuần</h3>
            </div>
            <div className="space-y-4">
                {schedules.map((slot, index) => {
                    // Tạo chuỗi thời gian "08:00 - 09:50"
                    const timeText = `${formatMinutes(slot.startMinute)} - ${formatMinutes(slot.endMinute)}`;

                    return (
                        <div key={index} className="p-3 bg-purple-50 rounded-md border border-purple-200">
                            <p className="font-semibold text-purple-800">
                                {['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'][slot.dayOfWeek]}
                            </p>
                            <div className="text-sm text-gray-700 mt-1 space-y-1">
                                {/* ⬇️ SỬA DÒNG NÀY */}
                                <p><Clock className="w-4 h-4 inline mr-2" /> {timeText}</p>
                                {/* ⬆️ KẾT THÚC SỬA */}
                                <p><User className="w-4 h-4 inline mr-2" /> {slot.teacher?.profile?.fullname || 'N/A'}</p>
                                <p><Home className="w-4 h-4 inline mr-2" /> {slot.room?.name || 'N/A'}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
// ⬆️ KẾT THÚC SỬA COMPONENT NÀY


// Component Cha (Giữ nguyên)
const AdminClassDetail = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [classData, setClassData] = useState(null);
    const [sessions, setSessions] = useState([]);

    useEffect(() => {
        const fetchClassDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                const params = {
                    withSessions: true,
                    sessionLimit: 100,
                };
                const res = await api.admin.class.getClassDetail(id, params);
                setClassData(res.data.data.class);
                setSessions(res.data.data.sessions);
            } catch (err) {
                setError(err.response?.data?.message || "Lỗi khi tải chi tiết lớp học");
            } finally {
                setLoading(false);
            }
        };

        fetchClassDetail();
    }, [id]);

    if (loading) {
        return (
            <div className="p-6 flex justify-center items-center min-h-[300px]">
                <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
            </div>
        );
    }

    if (error) {
        return <div className="p-6 text-center text-red-600">{error}</div>;
    }

    if (!classData) {
        return <div className="p-6 text-center text-gray-500">Không tìm thấy dữ liệu lớp.</div>;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <Link
                    to="/admin/classes"
                    className="flex items-center text-purple-600 hover:text-purple-800 font-medium mb-2"
                >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Quay lại Danh sách lớp
                </Link>
                <h1 className="text-3xl font-bold text-gray-800 mb-1">
                    {classData.name}
                </h1>

            </div>

            Tóm lại:
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cột trái: Thông tin */}
                <div className="lg:col-span-1 space-y-6">
                    <InfoCard icon={BookOpen} title="Thông Tin Khóa Học">
                        <p><strong>Khóa học:</strong> {classData.course?.name || "N/A"}</p>
                        <p><strong>Trạng thái:</strong> {classData.status}</p>
                        <p><strong>Sĩ số:</strong> {classData.minStudent} - {classData.maxStudent} HS</p>
                    </InfoCard>

                    <WeeklyScheduleCard schedules={classData.weeklySchedules} />
                </div>


                <div className="lg:col-span-2">

                    <ClassScheduleCalendar sessions={sessions} classInfo={classData} />
                </div>
            </div>
        </div>
    );
};

export default AdminClassDetail;