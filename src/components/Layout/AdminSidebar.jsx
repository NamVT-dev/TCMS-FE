import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    LayoutDashboard, Users, UserCircle, GraduationCap, Users2, UserCog, School, ListChecks, CalendarDays, ClipboardList, BookOpen, BookOpenCheck, BookCopy, FileText, Building2, DoorOpen, Building, Wrench, Wallet, Receipt, Coins, BadgeDollarSign, PieChart, BarChart3, BarChart2, TrendingUp, ChevronRight,
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, title, items }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="mb-2">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200 ${isOpen ? 'bg-gray-100' : ''
                    }`}
            >
                <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${isOpen ? 'bg-purple-100' : 'bg-gray-100'}`}>
                        <Icon className={`w-5 h-5 ${isOpen ? 'text-purple-600' : 'text-gray-600'}`} />
                    </div>
                    <span className={`font-medium ${isOpen ? 'text-purple-600' : ''}`}>{title}</span>
                </div>
                <ChevronRight
                    className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-90 text-purple-600' : 'text-gray-400'
                        }`}
                />
            </button>
            {isOpen && items && (
                <div className="ml-14 mt-2 space-y-1">
                    {items.map((item, index) => (
                        <Link
                            key={index}
                            to={item.path}
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                        >
                            {item.icon && <item.icon className="w-4 h-4" />}
                            <span>{item.name}</span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

const AdminSidebar = () => {
    const menuItems = [
        {
            icon: LayoutDashboard,
            title: "Dashboard",
            items: [
                {
                    name: "Tổng quan hệ thống",
                    path: "/admin/dashboard",
                    icon: LayoutDashboard
                }
            ]
        },
        {
            icon: Users,
            title: "Quản lý người dùng",
            items: [
                { name: "Học viên", path: "/admin/users/students", icon: UserCircle },
                { name: "Giáo viên", path: "/admin/users/teachers", icon: GraduationCap },
                { name: "Phụ huynh", path: "/admin/users/parents", icon: Users2 },
                { name: "Nhân viên/Admin", path: "/admin/users/staff", icon: UserCog }
            ]
        },
        {
            icon: School,
            title: "Quản lý lớp học",
            items: [
                { name: "Danh sách lớp", path: "/admin/classes", icon: ListChecks },
                { name: "Phân công giáo viên", path: "/admin/classes/assignments", icon: Users },
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
            {/* Logo - Fixed
            <div className="flex-shrink-0 p-6 border-b border-gray-200">
                <img
                    src="/logo/logo2.png"
                    alt="TutorCenter Logo"
                    className="h-auto w-auto mx-auto"
                />
            </div> */}

            {/* Menu Items - Scrollable */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
                <div className="p-4 space-y-2">
                    {menuItems.map((item, index) => (
                        <SidebarItem
                            key={index}
                            icon={item.icon}
                            title={item.title}
                            items={item.items}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminSidebar;