import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  CalendarClock,
  CalendarDays,
  ClipboardList,
  ChevronRight,
  FileBarChart2,
  ChevronLeft,
  MenuIcon,
  GraduationCap,
  BookOpen,
  CheckSquare,
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
          {/* Tooltip */}
          <div className="hidden group-hover:block absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded whitespace-nowrap">
            {title}
          </div>
        </div>
        {/* Mini Dropdown */}
        {items && items.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className="hidden group-hover:block ml-2 px-2 py-1 text-sm text-gray-600 hover:text-sky-600"
          >
            {item.icon && <item.icon className="w-4 h-4" />}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200 ${
          isOpen ? "bg-gray-100" : ""
        }`}
      >
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded-lg ${
              isOpen ? "bg-sky-100" : "bg-gray-100"
            }`}
          >
            <Icon
              className={`w-5 h-5 ${
                isOpen ? "text-sky-600" : "text-gray-600"
              }`}
            />
          </div>
          <span className={`font-medium ${isOpen ? "text-sky-600" : ""}`}>
            {title}
          </span>
        </div>
        <ChevronRight
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "rotate-90 text-sky-600" : "text-gray-400"
          }`}
        />
      </button>

      {isOpen && items && (
        <div className="ml-14 mt-2 space-y-1">
          {items.map((item, index) => {
            const isActive = currentPath === item.path;
            return (
              <Link
                key={index}
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${
                  isActive
                    ? "bg-sky-100 text-sky-600 font-medium"
                    : "text-gray-600 hover:text-sky-600 hover:bg-sky-50"
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

const TeacherSidebar = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    {
      icon: LayoutDashboard,
      title: "Tổng quan",
      items: [
        {
          name: "Tổng quan giáo viên",
          path: "/teacher/overview",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      icon: User,
      title: "Cá nhân",
      items: [
        {
          name: "Thông tin cá nhân",
          path: "/teacher/profile",
          icon: User,
        },
        {
          name: "Đăng ký lịch làm việc",
          path: "/teacher/work-schedule",
          icon: CalendarClock,
        },
      ],
    },
    {
      icon: ClipboardList,
      title: "Dạy học",
      items: [
        {
          name: "Điểm danh hôm nay",
          path: "/teacher/attendance", 
          icon: CheckSquare,
        },
        {
          name: "Thời khóa biểu chung",
          path: "/teacher/timetable",
          icon: CalendarDays,
        },
        {
          name: "Lớp học của tôi", 
          path: "/teacher/my-classes",
          icon: BookOpen, 
        },
        {
          name: "Báo cáo điểm",
          path: "/teacher/grade-report",
          icon: FileBarChart2,
        },
      ],
    },
  ];

  return (
    <div 
      className={`${
        isCollapsed ? 'w-20' : 'w-72'
      } h-full bg-white border-r border-gray-200 flex flex-col transition-all duration-300`}
    >
      {/* Toggle Button */}
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

     
      {/* Header Section  */}
      <div className="p-4 border-b border-gray-200">
        {isCollapsed ? (
          <div className="flex justify-center">
            <GraduationCap className="w-8 h-8 text-sky-600" />
          </div>
        ) : (
          <div className="flex items-center space-x-3 bg-sky-50 p-3 rounded-lg">
            <GraduationCap className="w-8 h-8 text-sky-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Chào mừng, Giáo viên
              </h2>
              <p className="text-sm text-gray-500">
                Quản lý công việc của bạn
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Menu Items */}
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

export default TeacherSidebar;