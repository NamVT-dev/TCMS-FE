import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import api from '../../../utils/api';
import { Loader2, Save, ArrowLeft, Plus, X, Calendar, Clock, Info, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';
import moment from 'moment-timezone';

const inputClass = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm";
const TIMEZONE = "Asia/Ho_Chi_Minh";

const ALL_DAYS = [
    { id: 1, label: "Thứ 2" },
    { id: 2, label: "Thứ 3" },
    { id: 3, label: "Thứ 4" },
    { id: 4, label: "Thứ 5" },
    { id: 5, label: "Thứ 6" },
    { id: 6, label: "Thứ 7" },
    { id: 0, label: "Chủ Nhật" },
];

// Toast Component
const Toast = ({ message, type = "success", onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const styles = {
        success: { bg: "bg-green-500", Icon: CheckCircle2 },
        error: { bg: "bg-red-500", Icon: AlertCircle },
        warning: { bg: "bg-amber-500", Icon: AlertTriangle },
        info: { bg: "bg-blue-500", Icon: Info }
    };

    const { bg, Icon } = styles[type] || styles.info;

    return (
        <div className={`fixed top-4 right-4 ${bg} text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 z-[100] animate-slide-in min-w-[300px] max-w-md`}>
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium flex-1">{message}</span>
            <button onClick={onClose} className="ml-2 hover:bg-white/20 rounded p-1 transition">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

// Confirmation Dialog Component
const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Xác nhận", cancelText = "Hủy bỏ" }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-scale-in">
                <div className="p-6">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mx-auto mb-4">
                        <AlertCircle className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
                        {title}
                    </h3>
                    <p className="text-gray-600 text-center mb-6">
                        {message}
                    </p>
                </div>
                <div className="flex gap-3 p-6 pt-0">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition shadow-sm"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

const calculateScheduleDates = (startDateStr, weeklySlots, totalSessions) => {
    if (!startDateStr || !weeklySlots.length || !totalSessions) return { dates: [], endDate: null };

    const anchorDate = moment.tz(startDateStr, TIMEZONE).startOf('day');
    const slots = [...weeklySlots].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
    const sessions = [];
    let currentSession = 0;

    for (let weekOffset = 0; currentSession < totalSessions && weekOffset < 260; weekOffset++) {
        for (const slot of slots) {
            if (currentSession >= totalSessions) break;

            let sessionMoment = anchorDate.clone().day(slot.dayOfWeek).startOf('day');
            if (weekOffset === 0 && sessionMoment.isBefore(anchorDate, 'day')) {
                sessionMoment.add(1, 'week');
            }
            if (weekOffset > 0) {
                sessionMoment.add(weekOffset, 'weeks');
            }

            sessions.push({
                sessionNo: currentSession + 1,
                date: sessionMoment,
                slot: slot
            });
            currentSession++;
        }
    }
    const lastSession = sessions[sessions.length - 1];
    return { dates: sessions, endDate: lastSession ? lastSession.date.toDate() : null };
};

const formatMinutes = (mins) => {
    if (typeof mins !== "number" || isNaN(mins)) return "00:00";
    return moment.utc(mins * 60 * 1000).format("HH:mm");
};

const AdminClassScheduleForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [classInfo, setClassInfo] = useState(null);
    const [weeklySchedules, setWeeklySchedules] = useState([]);
    const [calculatedSessions, setCalculatedSessions] = useState([]);

    const [teachers, setTeachers] = useState([]);
    const [rooms, setRooms] = useState([]);

    const [centerConfig, setCenterConfig] = useState(null);
    const [centerShifts, setCenterShifts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Toast & Confirm states
    const [toast, setToast] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, onConfirm: null, title: '', message: '' });

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [classRes, teacherRes, roomRes, configRes] = await Promise.all([
                    api.admin.class.getClassDetail(id),
                    api.admin.getTeachers({ limit: 1000, status: 'true' }),
                    api.admin.getRooms({ status: 'active', limit: 1000 }),
                    api.admin.center.getConfig(),
                ]);

                const cls = classRes.data.data.class;
                const config = configRes.data.data.config;

                setClassInfo(cls);
                setTeachers(teacherRes.data.data.teachers || []);
                setRooms(roomRes.data.data.rooms || []);

                setCenterConfig(config);
                setCenterShifts(config.shifts || []);

                if (cls.weeklySchedules && cls.weeklySchedules.length > 0) {
                    setWeeklySchedules(cls.weeklySchedules.map(s => {
                        const shift = config.shifts.find(cs => cs.startMinute === s.startMinute && cs.endMinute === s.endMinute);
                        return {
                            ...s,
                            shiftName: shift ? shift.name : '',
                            room: s.room?._id || s.room,
                            teacher: s.teacher?._id || s.teacher
                        };
                    }));
                } else {
                    const firstActiveDay = config.activeDaysOfWeek && config.activeDaysOfWeek.length > 0
                        ? config.activeDaysOfWeek[0]
                        : 1;

                    const dayShiftRule = config.dayShifts?.find(d => d.dayOfWeek === firstActiveDay);
                    const firstShiftName = dayShiftRule?.shifts?.[0];
                    const firstShift = config.shifts.find(s => s.name === firstShiftName) || config.shifts[0];

                    if (firstShift) {
                        setWeeklySchedules([{
                            dayOfWeek: firstActiveDay,
                            shiftName: firstShift.name,
                            startMinute: firstShift.startMinute,
                            endMinute: firstShift.endMinute,
                            room: '',
                            teacher: cls.preferredTeacher || ''
                        }]);
                    }
                }
            } catch (err) {
                console.error(err);
                setToast({ message: "Lỗi tải dữ liệu lớp học hoặc hệ thống.", type: "error" });
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    useEffect(() => {
        if (classInfo && weeklySchedules.length > 0) {
            const totalSessions = classInfo.course?.session || 0;
            const validSlots = weeklySchedules.filter(s =>
                s.dayOfWeek != null && s.startMinute != null && s.room && s.teacher
            );

            if (validSlots.length > 0 && classInfo.startAt) {
                const { dates } = calculateScheduleDates(classInfo.startAt, validSlots, totalSessions);
                setCalculatedSessions(dates);
            } else {
                setCalculatedSessions([]);
            }
        }
    }, [classInfo, weeklySchedules]);

    const handleScheduleChange = (index, field, value) => {
        const newSchedules = [...weeklySchedules];

        if (field === 'dayOfWeek') {
            const newDay = Number(value);
            newSchedules[index]['dayOfWeek'] = newDay;

            const allowedShiftNames = centerConfig?.dayShifts?.find(ds => ds.dayOfWeek === newDay)?.shifts || [];
            if (!allowedShiftNames.includes(newSchedules[index].shiftName)) {
                newSchedules[index].shiftName = '';
                newSchedules[index].startMinute = null;
                newSchedules[index].endMinute = null;
            }
        }
        else if (field === 'shiftName') {
            const shift = centerShifts.find(s => s.name === value);
            if (shift) {
                newSchedules[index].shiftName = shift.name;
                newSchedules[index].startMinute = shift.startMinute;
                newSchedules[index].endMinute = shift.endMinute;
            }
        } else {
            newSchedules[index][field] = value;
        }
        setWeeklySchedules(newSchedules);
    };

    const addScheduleSlot = () => {
        const firstActiveDay = centerConfig?.activeDaysOfWeek?.[0] ?? 1;
        const dayShiftRule = centerConfig?.dayShifts?.find(d => d.dayOfWeek === firstActiveDay);
        const firstShiftName = dayShiftRule?.shifts?.[0];
        const defaultShift = centerShifts.find(s => s.name === firstShiftName) || centerShifts[0];

        setWeeklySchedules([
            ...weeklySchedules,
            {
                dayOfWeek: firstActiveDay,
                shiftName: defaultShift?.name || '',
                startMinute: defaultShift?.startMinute,
                endMinute: defaultShift?.endMinute,
                room: '',
                teacher: classInfo.preferredTeacher || ''
            }
        ]);
    };

    const removeScheduleSlot = (i) => {
        setWeeklySchedules(weeklySchedules.filter((_, idx) => idx !== i));
    };

    const handleSubmitClick = () => {
        if (calculatedSessions.length === 0) {
            setToast({ message: "Vui lòng điền đầy đủ thông tin lịch học để tạo danh sách.", type: "warning" });
            return;
        }

        setConfirmDialog({
            isOpen: true,
            title: "Xác nhận thiết lập lịch học",
            message: `Bạn sắp tạo ${calculatedSessions.length} buổi học cho lớp ${classInfo?.name}. Bạn có chắc chắn muốn tiếp tục?`,
            onConfirm: handleSubmit
        });
    };

    const handleSubmit = async () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        setSaving(true);

        try {
            let classEndDate = null;
            const lastSession = calculatedSessions[calculatedSessions.length - 1];
            
            if (lastSession) {
                classEndDate = lastSession.date.clone()
                    .add(lastSession.slot.endMinute, 'minutes')
                    .toDate();
            }

            const classPayload = {
                weeklySchedules: weeklySchedules.map(s => ({
                    dayOfWeek: Number(s.dayOfWeek),
                    startMinute: s.startMinute,
                    endMinute: s.endMinute,
                    room: s.room,
                    teacher: s.teacher
                })),
                endAt: classEndDate
            };

            await api.admin.class.updateClass(id, classPayload);

            const sessionsPayload = calculatedSessions.map(s => ({
                class: id,
                course: classInfo.course._id,
                teacher: s.slot.teacher,
                room: s.slot.room,
                startAt: s.date.clone().add(s.slot.startMinute, 'minutes').toDate(),
                endAt: s.date.clone().add(s.slot.endMinute, 'minutes').toDate(),
                timezone: TIMEZONE,
                status: 'scheduled',
                sessionNo: s.sessionNo
            }));

            await api.admin.class.createSessions(sessionsPayload);

            setToast({ message: "Thiết lập lịch học thành công!", type: "success" });
            setTimeout(() => {
                navigate(`/staff/classes/detail/${id}`);
            }, 1500);

        } catch (err) {
            console.error(err);
            setToast({ message: "Lỗi khi lưu lịch học. Vui lòng thử lại.", type: "error" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center"><Loader2 className="w-10 h-10 animate-spin text-purple-600 mx-auto" /></div>;

    return (
        <>
            <style>{`
                @keyframes slide-in {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes scale-in {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-slide-in { animation: slide-in 0.3s ease-out; }
                .animate-scale-in { animation: scale-in 0.2s ease-out; }
            `}</style>

            {toast && (
                <Toast 
                    message={toast.message} 
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                onConfirm={confirmDialog.onConfirm}
                title={confirmDialog.title}
                message={confirmDialog.message}
            />

            <div className="p-6 bg-gray-50 min-h-screen">
                <div className="flex items-center mb-6">
                    <button onClick={() => navigate(-1)} className="mr-4 text-gray-600 hover:text-purple-600"><ArrowLeft /></button>
                    <h1 className="text-2xl font-bold text-gray-800">Thiết lập Lịch học: {classInfo?.name}</h1>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="mb-4 p-3 bg-purple-50 text-purple-700 rounded text-sm flex items-start">
                        <Info className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                            <p>Khóa học: <strong>{classInfo?.course?.name}</strong> ({classInfo?.course?.session} buổi).</p>
                            <p>Ngày khai giảng: {moment(classInfo?.startAt).format('DD/MM/YYYY')}</p>
                            <p>GV Chủ nhiệm: <strong>{teachers.find(t => t._id === classInfo?.preferredTeacher)?.profile?.fullname || 'Chưa gán'}</strong></p>
                        </div>
                    </div>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b">Cấu hình Lịch tuần</h2>
                        <div className="space-y-3">
                            {weeklySchedules.map((slot, idx) => {
                                const allowedShiftNames = centerConfig?.dayShifts?.find(d => d.dayOfWeek === Number(slot.dayOfWeek))?.shifts || [];
                                const availableShifts = centerShifts.filter(s => allowedShiftNames.includes(s.name));

                                return (
                                    <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 border rounded-md items-end bg-gray-50">
                                        <div>
                                            <label className="text-xs text-gray-500">Thứ</label>
                                            <select value={slot.dayOfWeek} onChange={e => handleScheduleChange(idx, 'dayOfWeek', e.target.value)} className={inputClass}>
                                                {ALL_DAYS.filter(d => centerConfig?.activeDaysOfWeek?.includes(d.id)).map(day => (
                                                    <option key={day.id} value={day.id}>{day.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-xs text-gray-500">Ca học</label>
                                            <select value={slot.shiftName} onChange={e => handleScheduleChange(idx, 'shiftName', e.target.value)} className={inputClass} required>
                                                <option value="">-- Chọn ca --</option>
                                                {availableShifts.length > 0 ? (
                                                    availableShifts.map(s => (
                                                        <option key={s.name} value={s.name}>{s.name} ({formatMinutes(s.startMinute)})</option>
                                                    ))
                                                ) : (
                                                    <option disabled>Ngày này không có ca</option>
                                                )}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-xs text-gray-500">Giáo viên</label>
                                            <select value={slot.teacher} onChange={e => handleScheduleChange(idx, 'teacher', e.target.value)} className={inputClass} required>
                                                <option value="">-- Chọn GV --</option>
                                                {teachers.map(t => <option key={t._id} value={t._id}>{t.profile?.fullname || t.username}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500">Phòng</label>
                                            <select value={slot.room} onChange={e => handleScheduleChange(idx, 'room', e.target.value)} className={inputClass} required>
                                                <option value="">-- Chọn phòng --</option>
                                                {rooms.map(r => <option key={r._id} value={r._id}>{r.name} ({r.capacity})</option>)}
                                            </select>
                                        </div>
                                        <button onClick={() => removeScheduleSlot(idx)} className="p-2 text-red-500 hover:bg-red-100 rounded w-fit"><X /></button>
                                    </div>
                                );
                            })}
                            <button onClick={addScheduleSlot} className="flex items-center text-sm font-medium text-purple-600 hover:text-purple-800 mt-2"><Plus className="w-4 h-4 mr-1" /> Thêm buổi</button>
                        </div>
                    </section>

                    {calculatedSessions.length > 0 && (
                        <section className="mt-6">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b">Xem trước ({calculatedSessions.length} buổi)</h2>
                            <div className="max-h-64 overflow-y-auto border rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Buổi</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Ngày</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Chi tiết</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {calculatedSessions.map((sess) => (
                                            <tr key={sess.sessionNo}>
                                                <td className="px-4 py-2 text-sm">{sess.sessionNo}</td>
                                                <td className="px-4 py-2 text-sm font-medium">{moment(sess.date).format('DD/MM/YYYY')}</td>
                                                <td className="px-4 py-2 text-sm text-gray-500">
                                                    Ca {centerShifts.find(s => s.startMinute === sess.slot.startMinute)?.name} - {rooms.find(r => r._id === sess.slot.room)?.name}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    <div className="mt-8 flex justify-end">
                        <button onClick={handleSubmitClick} disabled={saving} className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400 flex items-center">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Lưu Lịch Học
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminClassScheduleForm;