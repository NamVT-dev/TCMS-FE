import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import api from '../../../utils/api';
import { Loader2, Save, ArrowLeft, Plus, X, Calendar } from 'lucide-react';
import moment from 'moment-timezone';

const inputClass = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm";
const TIMEZONE = "Asia/Ho_Chi_Minh";

// --- LOGIC TÍNH TOÁN ---
const calculateScheduleDates = (startDateStr, weeklySlots, totalSessions) => {
    if (!startDateStr || !weeklySlots.length || !totalSessions) {
        return { dates: [], endDate: null };
    }
    const anchorDate = moment.tz(startDateStr, TIMEZONE).startOf('day');
    const slots = [...weeklySlots].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
    const sessions = [];
    let currentSession = 0;

    // Giới hạn 260 tuần (~5 năm) để tránh loop vô tận nếu lỗi
    for (let weekOffset = 0; currentSession < totalSessions && weekOffset < 260; weekOffset++) {
        for (const slot of slots) {
            if (currentSession >= totalSessions) break;

            let sessionMoment = anchorDate.clone().day(slot.dayOfWeek).startOf('day');

            // Nếu tuần đầu tiên mà ngày tính ra < ngày bắt đầu -> Nhảy sang tuần sau
            if (weekOffset === 0 && sessionMoment.isBefore(anchorDate, 'day')) {
                sessionMoment.add(1, 'week');
            }
            if (weekOffset > 0) {
                sessionMoment.add(weekOffset, 'weeks');
            }

            sessions.push({
                sessionNo: currentSession + 1,
                date: sessionMoment, // Moment object
                slot: slot
            });
            currentSession++;
        }
    }
    const lastSession = sessions[sessions.length - 1];
    const endDate = lastSession ? lastSession.date.toDate() : null;
    return { dates: sessions, endDate: endDate };
};

const formatMinutes = (mins) => {
    if (typeof mins !== "number" || isNaN(mins)) return "00:00";
    return moment.utc(mins * 60 * 1000).format("HH:mm");
};

const AdminClassForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        name: '',
        course: '',
        minStudent: 8,
        maxStudent: 15,
        preferredTeacher: '',
        startAt: '',
        endAt: '',
    });

    const [weeklySchedules, setWeeklySchedules] = useState([]);
    const [calculatedSessions, setCalculatedSessions] = useState([]);

    // Data Dropdowns
    const [courses, setCourses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [centerShifts, setCenterShifts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // 1. LOAD DỮ LIỆU BAN ĐẦU (Chỉ chạy 1 lần)
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [courseRes, teacherRes, roomRes, configRes] = await Promise.all([
                    api.admin.getCourse({ limit: 1000 }),
                    api.admin.getTeachers({ limit: 1000, status: 'true' }),
                    api.admin.getRooms({ status: 'active', limit: 1000 }),
                    api.admin.center.getConfig(),
                ]);

                setCourses(courseRes.data.data.courses || []);
                setTeachers(teacherRes.data.data.teachers || []);
                setRooms(roomRes.data.data.rooms || []);
                const shifts = configRes.data.data.config.shifts || [];
                setCenterShifts(shifts);

                // Nếu là Edit Mode -> Load chi tiết lớp
                if (isEditMode) {
                    const classRes = await api.admin.class.getClassDetail(id);
                    const cls = classRes.data.data.class;

                    setFormData({
                        name: cls.name,
                        course: cls.course?._id || cls.course,
                        minStudent: cls.minStudent,
                        maxStudent: cls.maxStudent,
                        preferredTeacher: cls.preferredTeacher || '',
                        startAt: cls.startAt ? moment(cls.startAt).format('YYYY-MM-DD') : '',
                        endAt: cls.endAt ? moment(cls.endAt).format('YYYY-MM-DD') : '',
                    });

                    // Map lại lịch tuần (tìm shiftName dựa trên startMinute)
                    setWeeklySchedules(cls.weeklySchedules.map(s => {
                        const shift = shifts.find(cs => cs.startMinute === s.startMinute);
                        return {
                            ...s,
                            shiftName: shift ? shift.name : '',
                            room: s.room?._id || s.room,
                            teacher: s.teacher?._id || s.teacher
                        };
                    }));
                } else {
                    // Nếu là Create Mode -> Thêm 1 dòng trống
                    if (shifts.length > 0) {
                        const defShift = shifts[0];
                        setWeeklySchedules([{
                            dayOfWeek: 1,
                            shiftName: defShift.name,
                            startMinute: defShift.startMinute,
                            endMinute: defShift.endMinute,
                            room: '',
                            teacher: ''
                        }]);
                    }
                }

            } catch (err) {
                console.error(err);
                setError("Không thể tải dữ liệu hệ thống.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id, isEditMode]);

    // 2. TÍNH TOÁN SESSION (Chạy khi form thay đổi)
    useEffect(() => {
        const selectedCourse = courses.find(c => c._id === formData.course);
        const totalSessions = selectedCourse?.session || 0;

        // Điều kiện để tính: Có ngày bắt đầu, có khóa học, có lịch tuần đầy đủ
        const validSlots = weeklySchedules.filter(s =>
            s.shiftName && s.room && s.teacher // Phải chọn đủ Ca, Phòng, GV
        );

        if (formData.startAt && totalSessions > 0 && validSlots.length > 0) {
            const { dates, endDate } = calculateScheduleDates(formData.startAt, validSlots, totalSessions);
            setCalculatedSessions(dates);
            if (endDate) {
                setFormData(prev => ({ ...prev, endAt: moment(endDate).format('YYYY-MM-DD') }));
            }
        } else {
            setCalculatedSessions([]);
        }
    }, [formData.startAt, formData.course, weeklySchedules, courses]);


    // --- HANDLERS ---
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleScheduleChange = (index, field, value) => {
        const newSchedules = [...weeklySchedules];
        if (field === 'shiftName') {
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
        const defShift = centerShifts[0] || { name: 'S1', startMinute: 480, endMinute: 590 };
        setWeeklySchedules([...weeklySchedules, {
            dayOfWeek: 1,
            shiftName: defShift.name,
            startMinute: defShift.startMinute,
            endMinute: defShift.endMinute,
            room: '',
            teacher: formData.preferredTeacher || ''
        }]);
    };

    const removeScheduleSlot = (index) => {
        setWeeklySchedules(weeklySchedules.filter((_, i) => i !== index));
    };

    // --- SUBMIT ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        // Chuẩn bị payload Class
        const classPayload = {
            ...formData,
            preferredTeacher: formData.preferredTeacher || undefined,
            weeklySchedules: weeklySchedules.map(s => ({
                dayOfWeek: Number(s.dayOfWeek),
                startMinute: s.startMinute,
                endMinute: s.endMinute,
                room: s.room,
                teacher: s.teacher
            }))
        };

        try {
            if (isEditMode) {
                // Update Class
                await api.admin.class.updateClass(id, classPayload);
                alert("Cập nhật lớp học thành công!");
            } else {
                // Create Class
                const res = await api.admin.class.createClass(classPayload);
                const newClassId = res.data.data.data._id;

                // Create Sessions (nếu có lịch dự kiến)
                if (calculatedSessions.length > 0) {
                    const sessionsPayload = calculatedSessions.map(s => ({
                        class: newClassId,
                        course: formData.course,
                        teacher: s.slot.teacher,
                        room: s.slot.room,
                        // Convert moment -> Date
                        startAt: s.date.clone().add(s.slot.startMinute, 'minutes').toDate(),
                        endAt: s.date.clone().add(s.slot.endMinute, 'minutes').toDate(),
                        timezone: TIMEZONE,
                        status: 'scheduled',
                        sessionNo: s.sessionNo
                    }));

                    await api.admin.class.createSessions(sessionsPayload);
                }
                alert("Tạo lớp học và lịch học thành công!");
            }
            navigate("/admin/classes");
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Lỗi khi lưu lớp học.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center"><Loader2 className="w-10 h-10 animate-spin text-purple-600 mx-auto" /></div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex items-center mb-6">
                <Link to="/admin/classes" className="mr-4 text-gray-600 hover:text-purple-600"><ArrowLeft /></Link>
                <h1 className="text-3xl font-bold text-gray-800">
                    {isEditMode ? "Cập nhật Lớp học" : "Tạo Lớp Học Mới"}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-5xl">
                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

                {/* 1. Thông tin cơ bản */}
                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">1. Thông tin cơ bản</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tên Lớp</label>
                            <input name="name" value={formData.name} onChange={handleChange} className={inputClass} required placeholder="VD: TOEIC Sáng T2-T4" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Khóa học</label>
                            <select name="course" value={formData.course} onChange={handleChange} className={inputClass} required disabled={isEditMode}>
                                <option value="">-- Chọn khóa học --</option>
                                {courses.map(c => <option key={c._id} value={c._id}>{c.name} ({c.session} buổi)</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Ngày Khai Giảng</label>
                            <input type="date" name="startAt" value={formData.startAt} onChange={handleChange} className={inputClass} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Ngày Kết Thúc (Dự kiến)</label>
                            <input type="date" value={formData.endAt} readOnly disabled className={`${inputClass} bg-gray-100 cursor-not-allowed`} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Sĩ số (Min - Max)</label>
                            <div className="flex space-x-2">
                                <input type="number" name="minStudent" value={formData.minStudent} onChange={handleChange} className={inputClass} placeholder="Min" />
                                <input type="number" name="maxStudent" value={formData.maxStudent} onChange={handleChange} className={inputClass} placeholder="Max" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">GV Chủ nhiệm (Opt)</label>
                            <select name="preferredTeacher" value={formData.preferredTeacher} onChange={handleChange} className={inputClass}>
                                <option value="">-- Không chọn --</option>
                                {teachers.map(t => <option key={t._id} value={t._id}>{t.profile?.fullname || t.username}</option>)}
                            </select>
                        </div>
                    </div>
                </section>

                {/* 2. Lịch học hàng tuần */}
                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">2. Lịch học trong tuần</h2>
                    <div className="space-y-3">
                        {weeklySchedules.map((slot, idx) => (
                            <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 border rounded-md items-end bg-gray-50">
                                <div>
                                    <label className="text-xs text-gray-500">Thứ</label>
                                    <select value={slot.dayOfWeek} onChange={e => handleScheduleChange(idx, 'dayOfWeek', e.target.value)} className={inputClass}>
                                        <option value="1">Thứ 2</option>
                                        <option value="2">Thứ 3</option>
                                        <option value="3">Thứ 4</option>
                                        <option value="4">Thứ 5</option>
                                        <option value="5">Thứ 6</option>
                                        <option value="6">Thứ 7</option>
                                        <option value="0">Chủ Nhật</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Ca học</label>
                                    <select value={slot.shiftName} onChange={e => handleScheduleChange(idx, 'shiftName', e.target.value)} className={inputClass} required>
                                        <option value="">-- Chọn ca --</option>
                                        {centerShifts.map(s => (
                                            <option key={s.name} value={s.name}>{s.name} ({formatMinutes(s.startMinute)})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Giáo viên</label>
                                    <select value={slot.teacher} onChange={e => handleScheduleChange(idx, 'teacher', e.target.value)} className={inputClass} required>
                                        <option value="">-- Chọn GV --</option>
                                        {teachers.map(t => <option key={t._id} value={t._id}>{t.profile?.fullname}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Phòng</label>
                                    <select value={slot.room} onChange={e => handleScheduleChange(idx, 'room', e.target.value)} className={inputClass} required>
                                        <option value="">-- Chọn phòng --</option>
                                        {rooms.map(r => <option key={r._id} value={r._id}>{r.name} ({r.capacity})</option>)}
                                    </select>
                                </div>
                                <button type="button" onClick={() => removeScheduleSlot(idx)} className="p-2 text-red-500 hover:bg-red-100 rounded w-fit"><X /></button>
                            </div>
                        ))}
                        <button type="button" onClick={addScheduleSlot} className="flex items-center text-sm font-medium text-purple-600 hover:text-purple-800 mt-2">
                            <Plus className="w-4 h-4 mr-1" /> Thêm buổi học
                        </button>
                    </div>
                </section>

                {/* 3. Preview Lịch */}
                {calculatedSessions.length > 0 && (
                    <section className="mt-6">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">3. Xem trước lịch học ({calculatedSessions.length} buổi)</h2>
                        <div className="max-h-60 overflow-y-auto border rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-medium text-gray-500">Buổi</th>
                                        <th className="px-4 py-2 text-left font-medium text-gray-500">Ngày</th>
                                        <th className="px-4 py-2 text-left font-medium text-gray-500">Chi tiết</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {calculatedSessions.map((sess) => (
                                        <tr key={sess.sessionNo}>
                                            <td className="px-4 py-2 text-purple-700 font-bold">{sess.sessionNo}</td>
                                            <td className="px-4 py-2 font-medium">{sess.date.format('DD/MM/YYYY')}</td>
                                            <td className="px-4 py-2 text-gray-500">
                                                {centerShifts.find(s => s.startMinute === sess.slot.startMinute)?.name} - {rooms.find(r => r._id === sess.slot.room)?.name}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                <div className="mt-8 flex justify-end gap-3">
                    <Link to="/admin/classes" className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50">Hủy</Link>
                    <button type="submit" disabled={saving} className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400 flex items-center">
                        {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        {isEditMode ? 'Cập nhật' : 'Lưu Lớp học'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminClassForm;