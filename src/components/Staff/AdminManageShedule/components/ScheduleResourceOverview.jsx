import React, { useState, useMemo, useEffect } from 'react';
import {
    Loader2, Users, DoorOpen, BookOpen, Clock,
    ChevronDown, ChevronUp, User, BarChart3,
    Filter, Calendar as CalendarIcon
} from 'lucide-react';

const formatMinutes = (mins) => {
    if (typeof mins !== "number" || isNaN(mins)) return "00:00";
    const h = String(Math.floor(mins / 60)).padStart(2, "0");
    const m = String(mins % 60).padStart(2, "0");
    return `${h}:${m}`;
};

const ScheduleResourceOverview = ({
    stats,
    isLoadingStats,
    // Props nhận từ cha
    studentFilter,
    onFilterStudents,
    isStudentLoading
}) => {
    const [activeTab, setActiveTab] = useState('teachers');
    const [isCollapsed, setIsCollapsed] = useState(true);

    // State cục bộ để người dùng nhập liệu trước khi bấm nút Lọc
    const [localFilter, setLocalFilter] = useState({
        startDate: '',
        endDate: ''
    });

    
    // Lấy ngày hiện tại theo giờ địa phương (Việt Nam)
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const maxDate = `${yyyy}-${mm}-${dd}`;
    // -----------------------------------------------------

    // Sync state cục bộ với props khi mới load
    useEffect(() => {
        if (studentFilter) {
            setLocalFilter({
                startDate: studentFilter.startDate,
                endDate: studentFilter.endDate
            });
        }
    }, [studentFilter]);

    const { teachers, rooms, courses, config, pendingStudents } = stats;

    const studentStats = useMemo(() => {
        const newLeads = pendingStudents.filter(s => s.testScore !== undefined);
        const waiting = pendingStudents.filter(s => !s.testScore);

        const countByCategory = (list) => {
            return list.reduce((acc, s) => {
                const catName = s.category?.[0]?.name || 'Khác';
                acc[catName] = (acc[catName] || 0) + 1;
                return acc;
            }, {});
        };

        return {
            totalNew: newLeads.length,
            totalWaiting: waiting.length,
            newByCategory: countByCategory(newLeads),
            waitingByCategory: countByCategory(waiting)
        };
    }, [pendingStudents]);

    const tabs = [
        { id: 'teachers', name: 'Giáo viên Sẵn sàng', icon: Users, count: teachers.length },
        { id: 'rooms', name: 'Phòng học Sẵn sàng', icon: DoorOpen, count: rooms.length },
        { id: 'courses', name: 'Tổng Khóa học', icon: BookOpen, count: courses.length },
        { id: 'students', name: 'Hàng đợi Học viên', icon: User, count: pendingStudents.length },
        { id: 'config', name: 'Lịch Trung tâm', icon: Clock, count: null },
    ];

    const handleApplyFilter = () => {
        if (onFilterStudents) {
            onFilterStudents(localFilter.startDate, localFilter.endDate);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 transition-all duration-300">
            {/* Header Collapse Toggle */}
            <div className="flex justify-between items-center px-6 py-3 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Tổng quan nguồn lực</h2>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="flex items-center text-gray-500 hover:text-purple-600 transition-colors"
                >
                    {isCollapsed ? (
                        <><ChevronDown className="w-5 h-5 mr-1" /><span className="text-sm">Mở rộng</span></>
                    ) : (
                        <><ChevronUp className="w-5 h-5 mr-1" /><span className="text-sm">Thu gọn</span></>
                    )}
                </button>
            </div>

            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isCollapsed ? "max-h-0 opacity-0" : "max-h-[1200px] opacity-100"}`}>

                {/* Navigation Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-6 px-6 overflow-x-auto" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                                    ${activeTab === tab.id
                                        ? "border-purple-500 text-purple-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }`}
                            >
                                <tab.icon className={`w-5 h-5 mr-2 ${activeTab === tab.id ? "text-purple-500" : "text-gray-400"}`} />
                                {tab.name}
                                {tab.count !== null && !isLoadingStats && (
                                    <span className={`ml-2 py-0.5 px-2 rounded-full text-xs font-medium ${activeTab === tab.id
                                        ? "bg-purple-100 text-purple-600"
                                        : "bg-gray-100 text-gray-600"
                                        }`}
                                    >
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Nội dung tab */}
                <div className="p-6">

                    {/* FILTER SECTION: Chỉ hiện khi ở tab Students */}
                    {activeTab === 'students' && (
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100 flex flex-col md:flex-row md:items-end gap-4 animate-fadeIn">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Từ ngày</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="date"
                                        max={maxDate} /* --- SỬA ĐỔI: Chặn ngày tương lai --- */
                                        value={localFilter.startDate}
                                        onChange={(e) => setLocalFilter({ ...localFilter, startDate: e.target.value })}
                                        className="pl-9 block w-full md:w-40 rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm border py-2"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Đến ngày</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="date"
                                        max={maxDate} /* --- SỬA ĐỔI: Chặn ngày tương lai --- */
                                        value={localFilter.endDate}
                                        onChange={(e) => setLocalFilter({ ...localFilter, endDate: e.target.value })}
                                        className="pl-9 block w-full md:w-40 rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm border py-2"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleApplyFilter}
                                disabled={isStudentLoading}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-300 transition-colors"
                            >
                                {isStudentLoading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Filter className="w-4 h-4 mr-2" />
                                )}
                                {isStudentLoading ? 'Đang tải...' : 'Lọc danh sách'}
                            </button>
                        </div>
                    )}

                    {/* MAIN CONTENT */}
                    {isLoadingStats ? (
                        <div className="flex justify-center items-center h-32">
                            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                            <p className="ml-3 text-gray-600">Đang tải nguồn lực...</p>
                        </div>
                    ) : (
                        <>
                            {activeTab === "teachers" && (
                                teachers.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {teachers.map((t) => (
                                            <div key={t._id} className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-purple-200 hover:shadow-md transition-shadow">
                                                <img className="h-10 w-10 rounded-full object-cover flex-shrink-0" src={t.profile.photo} alt="" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-purple-900 truncate">{t.profile?.fullname || t.username}</p>
                                                    <p className="text-sm text-purple-500 truncate">{t.email}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : <div className="text-center py-8 bg-purple-50 rounded-lg"><p className="text-sm text-purple-500">Không có giáo viên nào đang 'active'.</p></div>
                            )}

                            {activeTab === "rooms" && (
                                rooms.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {rooms.map((r) => (
                                            <div key={r._id} className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-purple-200 hover:shadow-md transition-shadow">
                                                <div className="flex-shrink-0 bg-blue-50 p-2 rounded-lg"><DoorOpen className="w-5 h-5 text-purple-600" /></div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-purple-900 truncate">{r.name}</p>
                                                    <p className="text-sm text-purple-500 truncate">Sức chứa: {r.capacity}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : <div className="text-center py-8 bg-purple-50 rounded-lg"><p className="text-sm text-purple-500">Không có phòng học nào đang 'active'.</p></div>
                            )}

                            {activeTab === "courses" && (
                                <div className="space-y-6">
                                    {(() => {
                                        const groupedByCategory = {};
                                        courses.forEach(course => {
                                            const categoryId = course.category?._id || 'uncategorized';
                                            if (!groupedByCategory[categoryId]) groupedByCategory[categoryId] = { name: course.category?.name || 'Chưa phân loại', courses: [] };
                                            groupedByCategory[categoryId].courses.push(course);
                                        });
                                        return Object.entries(groupedByCategory).map(([categoryId, group]) => (
                                            <div key={categoryId}>
                                                <div className="flex items-center space-x-2 mb-3">
                                                    <BookOpen className="w-5 h-5 text-purple-600" />
                                                    <h3 className="text-sm font-semibold text-purple-700 uppercase tracking-wide">{group.name} ({group.courses.length})</h3>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                                    {group.courses.map((course) => (
                                                        <div key={course._id} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-purple-200 hover:shadow-md transition-shadow">
                                                            <div className="flex-shrink-0 bg-indigo-50 p-2 rounded-lg"><BookOpen className="w-4 h-4 text-purple-600" /></div>
                                                            <div className="flex-1 min-w-0"><p className="text-sm font-medium text-purple-900 truncate">{course.name}</p></div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ));
                                    })()}
                                    {courses.length === 0 && <div className="text-center py-8 bg-purple-50 rounded-lg"><p className="text-sm text-purple-500">Không có khóa học nào.</p></div>}
                                </div>
                            )}

                            {activeTab === 'students' && (
                                isStudentLoading ? (
                                    <div className="flex flex-col justify-center items-center h-48 bg-white/50">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                        <span className="mt-2 text-sm text-blue-600 font-medium">Đang cập nhật danh sách...</span>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                                        {/* New Students Stats */}
                                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <p className="text-sm font-medium text-blue-600">Học viên Mới </p>
                                                    <h3 className="text-2xl font-bold text-blue-800">{studentStats.totalNew}</h3>
                                                </div>
                                                <div className="p-2 bg-white rounded-full shadow-sm">
                                                    <User className="w-5 h-5 text-blue-500" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                {Object.entries(studentStats.newByCategory).length > 0 ? (
                                                    Object.entries(studentStats.newByCategory).map(([cat, count]) => (
                                                        <div key={cat} className="flex justify-between text-sm">
                                                            <span className="text-blue-700">{cat}</span>
                                                            <span className="font-semibold text-blue-900">{count}</span>
                                                        </div>
                                                    ))
                                                ) : <p className="text-xs text-blue-400 italic">Chưa có dữ liệu</p>}
                                            </div>
                                        </div>

                                        {/* Waiting Students Stats */}
                                        <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <p className="text-sm font-medium text-purple-600">Học viên Chờ lớp </p>
                                                    <h3 className="text-2xl font-bold text-purple-800">{studentStats.totalWaiting}</h3>
                                                </div>
                                                <div className="p-2 bg-white rounded-full shadow-sm">
                                                    <BarChart3 className="w-5 h-5 text-purple-500" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                {Object.entries(studentStats.waitingByCategory).length > 0 ? (
                                                    Object.entries(studentStats.waitingByCategory).map(([cat, count]) => (
                                                        <div key={cat} className="flex justify-between text-sm">
                                                            <span className="text-purple-700">{cat}</span>
                                                            <span className="font-semibold text-purple-900">{count}</span>
                                                        </div>
                                                    ))
                                                ) : <p className="text-xs text-purple-400 italic">Chưa có dữ liệu</p>}
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}

                            {activeTab === "config" && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                                            <Users className="w-4 h-4 mr-2 text-purple-600" /> Lịch hoạt động trong tuần
                                        </h3>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Thứ</th>
                                                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                                                            Ca hoạt động
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 bg-white">
                                                    {config?.dayShifts.map((d) => {
                                                        const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
                                                        const dayName = dayNames[d.dayOfWeek];
                                                        return (
                                                            <tr key={d.dayOfWeek}>
                                                                <td className="px-4 py-2 font-medium text-gray-900">{dayName}</td>
                                                                <td className="px-4 py-2 text-gray-700">
                                                                    {d.shifts.map((shiftName) => {
                                                                        const shift = config.shifts.find((s) => s.name === shiftName);
                                                                        return (
                                                                            <span
                                                                                key={shiftName}
                                                                                className="inline-flex items-center mr-2 mb-2 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-sm"
                                                                            >
                                                                                {shiftName}
                                                                                {shift && (
                                                                                    <span className="ml-1 text-xs text-gray-500">
                                                                                        ({formatMinutes(shift.startMinute)} - {formatMinutes(shift.endMinute)})
                                                                                    </span>
                                                                                )}
                                                                            </span>
                                                                        );
                                                                    })}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ScheduleResourceOverview;