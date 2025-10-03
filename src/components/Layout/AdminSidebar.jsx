import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard, Users, UserCircle, GraduationCap, Users2, UserCog,
    School, ListChecks, CalendarDays, ClipboardList,
    BookOpen, BookOpenCheck, BookCopy, FileText,
    Building2, DoorOpen, Building, Wrench,
    Wallet, Receipt, Coins, BadgeDollarSign, PieChart,
    BarChart3, BarChart2, TrendingUp, ChevronRight, CopyPlus, 
} from "lucide-react";

const SidebarItem = ({ icon: Icon, title, items, currentPath }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Tự động mở menu cha nếu currentPath nằm trong items
    useEffect(() => {
        if (items && items.some((item) => currentPath.startsWith(item.path))) {
            setIsOpen(true);
        }
    }, [currentPath, items]);

    return (
        <div className="mb-2">
            {/* Nút cha */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200 ${isOpen ? "bg-gray-100" : ""
                    }`}
            >
                <div className="flex items-center space-x-3">
                    <div
                        className={`p-2 rounded-lg ${isOpen ? "bg-purple-100" : "bg-gray-100"
                            }`}
                    >
                        <Icon
                            className={`w-5 h-5 ${isOpen ? "text-purple-600" : "text-gray-600"
                                }`}
                        />
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

            {/* Sub menu */}
            {isOpen && items && (
                <div className="ml-14 mt-2 space-y-1">
                    {items.map((item, index) => {
                        const isActive = currentPath === item.path; // so sánh đường dẫn hiện tại
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

const AdminSidebar = () => {
    const location = useLocation();
    const currentPath = location.pathname; // đường dẫn hiện tại

    const menuItems = [
        {
            icon: LayoutDashboard,
            title: "Dashboard",
            items: [
                { name: "Tổng quan hệ thống", path: "/admin/overview", icon: LayoutDashboard }
            ]
        },
        {
            icon: Users,
            title: "Quản lý người dùng",
            items: [
                { name: "Học viên", path: "/admin/users/students", icon: UserCircle },
                { name: "Giáo viên", path: "/admin/users/teachers", icon: GraduationCap },
                { name: "Phụ huynh", path: "/admin/users/parents", icon: Users2 },
                { name: "Xếp lớp học viên", path: "/admin/users/enrollments", icon: UserCog }
            ]
        },
        {
            icon: School,
            title: "Quản lý lớp học",
            items: [
                { name: "Danh sách lớp", path: "/admin/classes", icon: ListChecks },
                { name: "Tạo lớp học", path: "/admin/create/class", icon: CopyPlus },
                { name: "Thời khóa biểu", path: "/admin/classes/schedule", icon: CalendarDays },
                { name: "Điểm danh", path: "/admin/classes/attendance", icon: ClipboardList }
            ]
        },
        {
            icon: BookOpen,
            title: "Quản lý khóa học",
            items: [
                { name: "Danh sách khóa học", path: "/admin/courses", icon: BookOpenCheck },
                { name: "Chương trình giảng dạy", path: "/admin/courses/curriculum", icon: BookCopy },
                { name: "Tài liệu học tập", path: "/admin/courses/materials", icon: FileText }
            ]
        },
        {
            icon: Building2,
            title: "Quản lý trung tâm",
            items: [
                { name: "Phòng học", path: "/admin/facility/rooms", icon: DoorOpen },
                { name: "Cơ sở vật chất", path: "/admin/facility/infrastructure", icon: Building },
                { name: "Thiết bị", path: "/admin/facility/equipment", icon: Wrench }
            ]
        },
        {
            icon: Wallet,
            title: "Quản lý tài chính",
            items: [
                { name: "Thu/Chi", path: "/admin/finance/transactions", icon: Receipt },
                { name: "Học phí", path: "/admin/finance/tuition", icon: Coins },
                { name: "Lương", path: "/admin/finance/salary", icon: BadgeDollarSign },
                { name: "Báo cáo doanh thu", path: "/admin/finance/revenue", icon: PieChart }
            ]
        },
        {
            icon: BarChart3,
            title: "Báo cáo & Thống kê",
            items: [
                { name: "Báo cáo học viên", path: "/admin/reports/students", icon: BarChart2 },
                { name: "Báo cáo tài chính", path: "/admin/reports/finance", icon: BarChart3 },
                { name: "Hiệu quả giảng dạy", path: "/admin/reports/teaching", icon: TrendingUp }
            ]
        }
    ];

    return (
        <div className="w-72 h-full bg-white border-r border-gray-200 flex flex-col">
            <div className="flex-1 overflow-y-auto scrollbar-thin">
                <div className="p-4 space-y-2">
                    {menuItems.map((item, index) => (
                        <SidebarItem
                            key={index}
                            icon={item.icon}
                            title={item.title}
                            items={item.items}
                            currentPath={currentPath}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminSidebar;
