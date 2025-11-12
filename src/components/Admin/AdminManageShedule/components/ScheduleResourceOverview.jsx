import React, { useState } from 'react';
import {
    Loader2,
    Users,
    DoorOpen,
    BookOpen,
    Clock,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';


const formatMinutes = (mins) => {
    if (typeof mins !== "number" || isNaN(mins)) return "00:00";
    const h = String(Math.floor(mins / 60)).padStart(2, "0");
    const m = String(mins % 60).padStart(2, "0");
    return `${h}:${m}`;
};


const ListPanel = ({ items, renderItem, emptyText }) => (
    <div className="flow-root">
        <ul className="-my-4 divide-y divide-gray-200">
            {items.length === 0 ? (
                <li className="py-3 text-gray-500">{emptyText}</li>
            ) : (
                items.map(renderItem)
            )}
        </ul>
    </div>
);

// Component chính
const ScheduleResourceOverview = ({ stats, isLoadingStats }) => {
    const [activeTab, setActiveTab] = useState('teachers');
    const [isCollapsed, setIsCollapsed] = useState(true);
    const { teachers, rooms, courses, config } = stats;

    const tabs = [
        { id: 'teachers', name: 'Giáo viên Sẵn sàng', icon: Users, count: teachers.length },
        { id: 'rooms', name: 'Phòng học Sẵn sàng', icon: DoorOpen, count: rooms.length },
        { id: 'courses', name: 'Tổng Khóa học', icon: BookOpen, count: courses.length },
        { id: 'config', name: 'Lịch Trung tâm', icon: Clock, count: null },
    ];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 transition-all duration-300">
           
            <div className="flex justify-between items-center px-6 py-3 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Tổng quan nguồn lực</h2>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="flex items-center text-gray-500 hover:text-purple-600 transition-colors"
                >
                    {isCollapsed ? (
                        <>
                            <ChevronDown className="w-5 h-5 mr-1" />
                            <span className="text-sm">Mở rộng</span>
                        </>
                    ) : (
                        <>
                            <ChevronUp className="w-5 h-5 mr-1" />
                            <span className="text-sm">Thu gọn</span>
                        </>
                    )}
                </button>
            </div>

            
            <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${isCollapsed ? "max-h-0 opacity-0" : "max-h-[1200px] opacity-100"
                    }`}
            >
             
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-6 px-6" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                                        ? "border-purple-500 text-purple-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }
                `}
                            >
                                <tab.icon
                                    className={`w-5 h-5 mr-2 ${activeTab === tab.id ? "text-purple-500" : "text-gray-400"
                                        }`}
                                />
                                {tab.name}
                                {tab.count !== null && !isLoadingStats && (
                                    <span
                                        className={`ml-2 py-0.5 px-2 rounded-full text-xs font-medium ${activeTab === tab.id
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
                    {isLoadingStats ? (
                        <div className="flex justify-center items-center h-32">
                            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                            <p className="ml-3 text-gray-600">Đang tải nguồn lực...</p>
                        </div>
                    ) : (
                        <>
                            {activeTab === "teachers" && (
                                <ListPanel
                                    items={teachers}
                                    emptyText="Không có giáo viên nào đang 'active'."
                                    renderItem={(t) => (
                                        <li key={t._id} className="flex items-center space-x-3 py-3">
                                            <img
                                                className="h-8 w-8 rounded-full object-cover"
                                                src={t.profile.photo}
                                                alt=""
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {t.profile?.fullname || t.username}
                                                </p>
                                                <p className="text-sm text-gray-500 truncate">{t.email}</p>
                                            </div>
                                        </li>
                                    )}
                                />
                            )}

                            {activeTab === "rooms" && (
                                <ListPanel
                                    items={rooms}
                                    emptyText="Không có phòng học nào đang 'active'."
                                    renderItem={(r) => (
                                        <li key={r._id} className="flex items-center space-x-3 py-3">
                                            <DoorOpen className="w-5 h-5 text-gray-400" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {r.name}
                                                </p>
                                                <p className="text-sm text-gray-500 truncate">
                                                    Sức chứa: {r.capacity}
                                                </p>
                                            </div>
                                        </li>
                                    )}
                                />
                            )}

                            {activeTab === "courses" && (
                                <ListPanel
                                    items={courses}
                                    emptyText="Không có khóa học nào."
                                    renderItem={(c) => (
                                        <li key={c._id} className="flex items-center space-x-3 py-3">
                                            <BookOpen className="w-5 h-5 text-gray-400" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {c.name}
                                                </p>
                                                <p className="text-sm text-gray-500 truncate">
                                                    Level: {c.level} | Môn: {c.category?.name || "N/A"}
                                                </p>
                                            </div>
                                        </li>
                                    )}
                                />
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

                             
                                    <div className="text-sm text-gray-600">
                                        <p><strong>Timezone:</strong> {config?.timezone}</p>
                                        <p>
                                            <strong>Ngày hoạt động:</strong>{" "}
                                            {config?.activeDaysOfWeek
                                                ?.map((d) => ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][d])
                                                .join(", ")}
                                        </p>
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
