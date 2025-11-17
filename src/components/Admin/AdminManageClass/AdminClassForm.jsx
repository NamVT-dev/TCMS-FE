// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate, Link, useParams } from 'react-router-dom';
// import api from '../../../utils/api';
// import { Loader2, Save, ArrowLeft, Plus, X, Calendar } from 'lucide-react';
// import moment from 'moment-timezone'; // Đảm bảo bạn đã cài: npm install moment-timezone

// const inputClass = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm";
// const TIMEZONE = "Asia/Ho_Chi_Minh";

// // --- BỘ LOGIC TÍNH TOÁN LỊCH HỌC (Đã Sửa) ---
// const calculateScheduleDates = (startDateStr, weeklySlots, totalSessions) => {
//   if (!startDateStr || !weeklySlots.length || !totalSessions) {
//     return { dates: [], endDate: null };
//   }
//   const anchorDate = moment.tz(startDateStr, TIMEZONE).startOf('day');
//   const slots = [...weeklySlots].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
//   const slotsPerWeek = slots.length;
//   const sessions = [];
//   let currentSession = 0;

//   for (let weekOffset = 0; currentSession < totalSessions; weekOffset++) {
//     for (const slot of slots) {
//       if (currentSession >= totalSessions) break;
//       let sessionMoment = anchorDate.clone().day(slot.dayOfWeek);
//       if (weekOffset === 0 && sessionMoment.isBefore(anchorDate, 'day')) {
//         sessionMoment.add(1, 'week');
//       }
//       if (weekOffset > 0) {
//         sessionMoment.add(weekOffset, 'weeks');
//       }
//       sessions.push({
//         sessionNo: currentSession + 1,
//         date: sessionMoment.toDate(),
//         slot: slot 
//       });
//       currentSession++;
//     }
//   }
//   const lastSession = sessions[sessions.length - 1];
//   const endDate = lastSession ? lastSession.date : null;
//   return { dates: sessions, endDate: endDate };
// };

// const formatMinutes = (mins) => {
//   if (typeof mins !== "number" || isNaN(mins)) return "00:00";
//   return moment.utc(mins * 60 * 1000).format("HH:mm");
// };
// // --- KẾT THÚC BỘ LOGIC ---


// const AdminClassForm = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const isEditMode = Boolean(id);

//   const [formData, setFormData] = useState({
//     name: '',
//     course: '',
//     minStudent: 8,
//     maxStudent: 15,
//     preferredTeacher: '',
//     startAt: '',
//     endAt: '',
//   });
  
//   const [weeklySchedules, setWeeklySchedules] = useState([]);
  
//   const [courses, setCourses] = useState([]);
//   const [teachers, setTeachers] = useState([]);
//   const [rooms, setRooms] = useState([]);
//   const [centerShifts, setCenterShifts] = useState([]);
  
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState(null);
  
//   const [calculatedSessions, setCalculatedSessions] = useState([]);

//   // ⬇️ BẮT ĐẦU SỬA LỖI VÒNG LẶP
//   // 1. Tải dữ liệu dropdown (Courses, Teachers, Rooms, Shifts)
//   useEffect(() => {
//     const loadPrerequisites = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const [courseRes, teacherRes, roomRes, configRes] = await Promise.all([
//           api.admin.getCourse({ limit: 1000 }),
//           api.admin.getTeachers({ limit: 1000, status: 'true' }),
//           api.admin.getRooms({ status: 'active', limit: 1000 }),
//           api.admin.center.getConfig(),
//         ]);
        
//         setCourses(courseRes.data.data.courses || []);
//         setTeachers(teacherRes.data.data.teachers || []);
//         setRooms(roomRes.data.data.rooms || []);
//         setCenterShifts(configRes.data.data.config.shifts || []);
        
//       } catch (err) {
//         setError("Không thể tải dữ liệu (Courses, Teachers, Rooms, Config).");
//         setLoading(false);
//       }
//       // Tắt loading sẽ được xử lý bởi useEffect tiếp theo
//     };
    
//     loadPrerequisites();
//   }, []); // ⬅️ Chỉ chạy 1 LẦN

//   // 2. Tải dữ liệu Lớp học (Edit Mode) HOẶC set slot mặc định (Create Mode)
//   useEffect(() => {
//     // Chỉ chạy khi centerShifts đã được tải về
//     if (centerShifts.length > 0) { 
//       if (isEditMode) {
//         // --- Chế độ Sửa ---
//         const loadClassData = async () => {
//           try {
//             const res = await api.admin.class.getClassDetail(id);
//             const cls = res.data.data.class;
            
//             setFormData({
//               name: cls.name,
//               course: cls.course?._id || cls.course,
//               minStudent: cls.minStudent,
//               maxStudent: cls.maxStudent,
//               preferredTeacher: cls.preferredTeacher || '',
//               startAt: cls.startAt ? moment(cls.startAt).format('YYYY-MM-DD') : '',
//               endAt: cls.endAt ? moment(cls.endAt).format('YYYY-MM-DD') : '',
//             });
            
//             setWeeklySchedules(cls.weeklySchedules.map(s => {
//               const shift = centerShifts.find(cs => cs.startMinute === s.startMinute && cs.endMinute === s.endMinute);
//               return {
//                 ...s,
//                 shiftName: shift ? shift.name : '',
//                 room: s.room?._id || s.room,
//                 teacher: s.teacher?._id || s.teacher
//               };
//             }));
//           } catch (err) {
//             setError("Không thể tải dữ liệu lớp học.");
//           } finally {
//             setLoading(false); // Tắt loading
//           }
//         };
//         loadClassData();
//       } else {
//         // --- Chế độ Tạo mới ---
//         const defaultShift = centerShifts[0];
//         setWeeklySchedules([
//           { 
//             dayOfWeek: 1, 
//             shiftName: defaultShift.name,
//             startMinute: defaultShift.startMinute, 
//             endMinute: defaultShift.endMinute, 
//             room: '', 
//             teacher: '' 
//           }
//         ]);
//         setLoading(false); // Tắt loading
//       }
//     }
//   }, [id, isEditMode, centerShifts]); // ⬅️ Phụ thuộc vào centerShifts
//   // ⬆️ KẾT THÚC SỬA LỖI VÒNG LẶP

//   // 3. Logic tự động tính toán (Đã sửa lỗi)
//   useEffect(() => {
//     const selectedCourse = courses.find(c => c._id === formData.course);
//     const totalSessions = selectedCourse?.session || 0;
    
//     // FIX 6: Kiểm tra totalSessions > 0
//     if (!totalSessions || totalSessions <= 0) {
//       setCalculatedSessions([]);
//       if (formData.course) { // Chỉ báo lỗi nếu đã chọn course
//         setError("Khóa học này chưa có 'session' (số buổi). Không thể tính lịch.");
//       }
//       return;
//     } else {
//       setError(null);
//     }

//     if (formData.startAt && weeklySchedules.length > 0) {
//       // FIX 4: Kiểm tra startMinute != null (vì 0 là giá trị hợp lệ)
//       const validSlots = weeklySchedules.filter(s => 
//         s.dayOfWeek != null && 
//         s.startMinute != null && 
//         s.room && 
//         s.teacher
//       );
      
//       if (validSlots.length > 0) {
//         const { dates, endDate } = calculateScheduleDates(
//           formData.startAt,
//           validSlots,
//           totalSessions
//         );
//         setCalculatedSessions(dates);
//         if(endDate) {
//           setFormData(prev => ({ ...prev, endAt: moment(endDate).format('YYYY-MM-DD') }));
//         }
//       } else {
//         setCalculatedSessions([]);
//       }
//     } else {
//       setCalculatedSessions([]);
//     }
//   }, [formData.startAt, formData.course, weeklySchedules, courses]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };
  
//   // FIX 1: Cập nhật state bằng 'shiftName'
//   const handleScheduleChange = (index, field, value) => {
//     const newSchedules = [...weeklySchedules];
    
//     if (field === 'shiftName') {
//       const selectedShift = centerShifts.find(s => s.name === value);
//       if (selectedShift) {
//         newSchedules[index]['shiftName'] = selectedShift.name;
//         newSchedules[index]['startMinute'] = selectedShift.startMinute;
//         newSchedules[index]['endMinute'] = selectedShift.endMinute;
//       } else {
//         newSchedules[index]['shiftName'] = '';
//         newSchedules[index]['startMinute'] = null;
//         newSchedules[index]['endMinute'] = null;
//       }
//     } else {
//       newSchedules[index][field] = value;
//     }
//     setWeeklySchedules(newSchedules);
//   };

//   const addScheduleSlot = () => {
//     const defaultShift = centerShifts[0] || { name: 'S1', startMinute: 480, endMinute: 590 };
//     setWeeklySchedules([
//       ...weeklySchedules,
//       { 
//         dayOfWeek: 1, 
//         shiftName: defaultShift.name, 
//         startMinute: defaultShift.startMinute, 
//         endMinute: defaultShift.endMinute, 
//         room: '', 
//         teacher: formData.preferredTeacher || '' 
//       }
//     ]);
//   };

//   const removeScheduleSlot = (index) => {
//     setWeeklySchedules(weeklySchedules.filter((_, i) => i !== index));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSaving(true);
//     setError(null);

//     const payload = {
//       ...formData,
//       preferredTeacher: formData.preferredTeacher || undefined, 
//       weeklySchedules: weeklySchedules.map(s => ({
//         dayOfWeek: Number(s.dayOfWeek),
//         startMinute: Number(s.startMinute),
//         endMinute: Number(s.endMinute),
//         room: s.room,
//         teacher: s.teacher,
//       })),
//     };
    
//     try {
//       if (isEditMode) {
//         await api.admin.class.updateClass(id, payload);
//       } else {
//         await api.admin.class.createClass(payload);
//       }
//       alert(`Đã ${isEditMode ? 'cập nhật' : 'tạo mới'} lớp học thành công!`);
//       navigate("/admin/classes");
//     } catch (err) {
//       console.error("LỖI KHI SUBMIT:", err.response || err); // ⬅️ FIX 2
//       setError(err.response?.data?.message || "Lỗi khi lưu lớp học.");
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return <div className="p-6 text-center"><Loader2 className="w-12 h-12 animate-spin text-purple-600" /></div>;
//   }
  
//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <Link
//         to="/admin/classes"
//         className="flex items-center text-purple-600 hover:text-purple-800 font-medium mb-4"
//       >
//         <ArrowLeft className="h-5 w-5 mr-2" />
//         Quay lại Danh sách
//       </Link>
      
//       <h1 className="text-3xl font-bold text-gray-800 mb-6">
//         {isEditMode ? 'Cập nhật Lớp học' : 'Tạo Lớp Học Mới'}
//       </h1>

//       <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-4xl">
//         {error && (
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
//             {error}
//           </div>
//         )}
        
//         <section className="mb-6">
//           <h2 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b">1. Thông tin cơ bản</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <label htmlFor="name" className="block text-sm font-medium text-gray-700">Tên Lớp học</label>
//               <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className={inputClass} required placeholder="VD: Lớp TOEIC Sáng T2/T4" />
//             </div>
//             <div>
//               <label htmlFor="course" className="block text-sm font-medium text-gray-700">Thuộc Khóa học</label>
//               <select name="course" id="course" value={formData.course} onChange={handleChange} className={inputClass} required>
//                 <option value="">-- Chọn khóa học --</option>
//                 {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
//               </select>
//             </div>
//             <div>
//               <label htmlFor="minStudent" className="block text-sm font-medium text-gray-700">Sĩ số Tối thiểu</label>
//               <input type="number" name="minStudent" id="minStudent" value={formData.minStudent} onChange={handleChange} className={inputClass} />
//             </div>
//             <div>
//               <label htmlFor="maxStudent" className="block text-sm font-medium text-gray-700">Sĩ số Tối đa</label>
//               <input type="number" name="maxStudent" id="maxStudent" value={formData.maxStudent} onChange={handleChange} className={inputClass} />
//             </div>
//              <div>
//               <label htmlFor="startAt" className="block text-sm font-medium text-gray-700">Ngày Khai giảng</label>
//               <input type="date" name="startAt" id="startAt" value={formData.startAt} onChange={handleChange} className={inputClass} required />
//             </div>
//              <div>
//               <label htmlFor="endAt" className="block text-sm font-medium text-gray-700">Ngày Kết thúc (Tự động)</label>
//               <input type="date" name="endAt" id="endAt" value={formData.endAt} readOnly disabled className={`${inputClass} bg-gray-100`} />
//             </div>
//              <div className="md:col-span-2">
//               <label htmlFor="preferredTeacher" className="block text-sm font-medium text-gray-700">Giáo viên Ưu tiên (Nếu có)</label>
//               <select name="preferredTeacher" id="preferredTeacher" value={formData.preferredTeacher} onChange={handleChange} className={inputClass}>
//                 <option value="">-- Không ưu tiên --</option>
//                 {teachers.map(t => <option key={t._id} value={t._id}>{t.profile?.fullname || t.username}</option>)}
//               </select>
//             </div>
//           </div>
//         </section>

//         <section>
//           <h2 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b">2. Lịch học hàng tuần</h2>
//           <div className="space-y-4">
//             {weeklySchedules.map((slot, index) => (
//               <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 border rounded-md items-end">
//                 <div>
//                   <label className="block text-xs font-medium text-gray-600 mb-1">Ngày</label>
//                   <select value={slot.dayOfWeek} onChange={(e) => handleScheduleChange(index, 'dayOfWeek', e.target.value)} className={inputClass}>
//                     <option value="1">Thứ 2</option>
//                     <option value="2">Thứ 3</option>
//                     <option value="3">Thứ 4</option>
//                     <option value="4">Thứ 5</option>
//                     <option value="5">Thứ 6</option>
//                     <option value="6">Thứ 7</option>
//                     <option value="0">Chủ Nhật</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-xs font-medium text-gray-600 mb-1">Ca học</label>
//                   <select 
//                     value={slot.shiftName || ''} // ⬅️ FIX 1 & 5
//                     onChange={(e) => handleScheduleChange(index, 'shiftName', e.target.value)} // ⬅️ FIX 1
//                     className={inputClass}
//                     required
//                   >
//                     <option value="">-- Chọn ca --</option>
//                     {centerShifts.map(s => (
//                       <option key={s.name} value={s.name}>
//                         {s.name} ({formatMinutes(s.startMinute)})
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-xs font-medium text-gray-600 mb-1">Giáo viên</label>
//                   <select value={slot.teacher} onChange={(e) => handleScheduleChange(index, 'teacher', e.target.value)} className={inputClass} required>
//                     <option value="">-- Chọn GV --</option>
//                     {teachers.map(t => <option key={t._id} value={t._id}>{t.profile?.fullname || t.username}</option>)}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-xs font-medium text-gray-600 mb-1">Phòng</label>
//                   <select value={slot.room} onChange={(e) => handleScheduleChange(index, 'room', e.target.value)} className={inputClass} required>
//                     <option value="">-- Chọn phòng --</option>
//                     {rooms.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
//                   </select>
//                 </div>
//                 <div>
//                   <button type="button" onClick={() => removeScheduleSlot(index)} className="text-red-500 hover:bg-red-100 rounded p-2 h-10 w-full md:w-auto">
//                     <X className="mx-auto" />
//                   </button>
//                 </div>
//               </div>
//             ))}
//             <button type="button" onClick={addScheduleSlot} className="text-purple-600 text-sm font-medium hover:text-purple-800">
//               + Thêm buổi học
//             </button>
//           </div>
//         </section>

//         {calculatedSessions.length > 0 && (
//           <section className="mt-6">
//             <h2 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b">3. Lịch học Dự kiến ({calculatedSessions.length} buổi)</h2>
//             <div className="max-h-64 overflow-y-auto border rounded-lg">
//               <table className="w-full text-sm text-left text-gray-500">
//                 <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
//                   <tr>
//                     <th scope="col" className="px-4 py-3">Buổi</th>
//                     <th scope="col" className="px-4 py-3">Ngày</th>
//                     <th scope="col" className="px-4 py-3">Ca học</th>
//                     <th scope="col" className="px-4 py-3">Phòng</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y">
//                   {calculatedSessions.map(session => {
//                     const slot = session.slot;
//                     const roomName = rooms.find(r => r._id === slot.room)?.name || 'N/A';
//                     const shiftName = centerShifts.find(s => s.startMinute === slot.startMinute)?.name || 'N/A';

//                     return (
//                       <tr key={session.sessionNo} className="hover:bg-gray-50">
//                         <td className="px-4 py-3 font-medium text-gray-900">{session.sessionNo}</td>
//                         <td className="px-4 py-3">{moment(session.date).tz(TIMEZONE).format('dddd, DD/MM/YYYY')}</td>
//                         <td className="px-4 py-3">{shiftName} ({formatMinutes(slot.startMinute)} - {formatMinutes(slot.endMinute)})</td>
//                         <td className="px-4 py-3">{roomName}</td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           </section>
//         )}

//         <div className="mt-8 pt-6 border-t border-gray-200 text-right">
//           <button
//             type="submit"
//             disabled={saving}
//             className="inline-flex items-center px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400"
//           >
//             {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
//             {saving ? 'Đang lưu...' : 'Lưu Lớp học'}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default AdminClassForm;
import React from 'react'

const AdminClassForm = () => {
  return (
    <div>AdminClassForm</div>
  )
}

export default AdminClassForm