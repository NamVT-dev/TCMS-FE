import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    Users, UserCircle, GraduationCap, UserCog,
    School, ListChecks, MessageSquarePlus, LayoutList, ArrowRightLeft,
    DoorOpen, Clock1, MessageSquareShare, ChevronRight, ChevronLeft,
    UserStar, Building2, User
} from "lucide-react";

const SidebarItem = ({ icon: Icon, title, items, currentPath, isCollapsed }) => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (items && items.some((item) => currentPath.startsWith(item.path))) {
            setIsOpen(true);
        }
    }, [currentPath, items]);

    if (isCollapsed) {
        return (
            <div className="mb-2">
                <div className="group relative">
                    <div
                        className="px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200 cursor-pointer"
                        title={title}
                    >
                        <div className="flex justify-center">
                            <div className="p-2 rounded-lg bg-gray-100">
                                <Icon className="w-5 h-5 text-gray-600" />
                            </div>
                        </div>
                    </div>
                    <div className="hidden group-hover:block absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded whitespace-nowrap z-50">
                        {title}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-2">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200 ${isOpen ? "bg-gray-100" : ""
                    }`}
            >
                <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${isOpen ? "bg-purple-100" : "bg-gray-100"}`}>
                        <Icon className={`w-5 h-5 ${isOpen ? "text-purple-600" : "text-gray-600"}`} />
                    </div>
                    <span className={`font-medium ${isOpen ? "text-purple-600" : ""}`}>
                        {title}
                    </span>
                </div>
                <ChevronRight
                    className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-90 text-purple-600" : "text-gray-400"
                        }`}
                />
            </button>

            {isOpen && items && (
                <div className="ml-14 mt-2 space-y-1">
                    {items.map((item, index) => {
                        const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
                        return (
                            <Link
                                key={index}
                                to={item.path}
                                className={`flex items-center space-x-2 px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${isActive
                                    ? "bg-purple-100 text-purple-600 font-medium"
                                    : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                                    }`}
                            >
                                {item.icon && <item.icon className="w-4 h-4" />}
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const StaffSidebar = ({ isCollapsed, onToggle }) => {
    const location = useLocation();
    const currentPath = location.pathname;

    // Cấu hình menu dành riêng cho Staff dựa trên hình ảnh thư mục
    const menuItems = [
        {
            icon: User,
            title: "Cá nhân",
            items: [
                { name: "Thông tin cá nhân", path: "/staff/profile", icon: User },
            ]
        },
        {
            icon: Users,
            title: "Quản lý người dùng",
            items: [
                { name: "Học viên", path: "/staff/users/students", icon: UserCircle },
                { name: "Giáo viên", path: "/staff/users/teachers", icon: GraduationCap },
                { name: "Xếp lớp học viên", path: "/staff/users/enrollments", icon: UserCog }
            ]
        },
        {
            icon: School,
            title: "Quản lý lớp học",
            items: [
                { name: "Danh sách lớp", path: "/staff/classes", icon: ListChecks },
                { name: "Yêu cầu dạy thay", path: "/staff/requests/substitute", icon: ArrowRightLeft },
                { name: "Thống kê nhu cầu", path: "/staff/requests/dashboard", icon: MessageSquarePlus },
                { name: "Danh sách yêu cầu", path: "/staff/requests/list", icon: LayoutList }
            ]
        },
        {
            icon: Building2,
            title: "Quản lý trung tâm",
            items: [
                { name: "Phòng học", path: "/staff/facility/rooms", icon: DoorOpen },
                { name: "Góp ý khiếu nại", path: "/staff/facility/complain", icon: MessageSquareShare },
            ]
        },
        
    ];

    return (
        <div className={`${isCollapsed ? 'w-20' : 'w-72'
            } h-full bg-white border-r border-gray-200 flex flex-col transition-all duration-300`}>
            <button
                onClick={onToggle}
                className="absolute -right-3 top-6 bg-white border border-gray-200 rounded-full p-1.5 hover:bg-gray-50 z-50"
            >
                {isCollapsed ? (
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                ) : (
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                )}
            </button>

            <div className="p-4 border-b border-gray-200">
                {isCollapsed ? (
                    <div className="flex justify-center">
                        <UserStar className="w-8 h-8 text-purple-600" />
                    </div>
                ) : (
                    <div className="flex items-center space-x-3 bg-purple-50 p-3 rounded-lg">
                        <UserStar className="w-8 h-8 text-purple-600" />
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800">
                                Nhân Viên
                            </h2>
                            <p className="text-sm text-gray-500">
                                Làm việc hiệu quả!
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin">
                <div className="p-4 space-y-2">
                    {menuItems.map((item, index) => (
                        <SidebarItem
                            key={index}
                            icon={item.icon}
                            title={item.title}
                            items={item.items}
                            currentPath={currentPath}
                            isCollapsed={isCollapsed}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StaffSidebar;