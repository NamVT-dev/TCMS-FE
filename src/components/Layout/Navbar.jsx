import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, User, ChevronDown, Bell } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../utils/api'; // Import api đã cập nhật
import NotificationModal from './NotificationModal';

const CLOSE_DELAY = 100;

const Navbar = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // UI States
    const [openMenu, setOpenMenu] = useState(null); 
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notiDropdownOpen, setNotiDropdownOpen] = useState(false); 
    
    // Data States
    const [coursesByCategory, setCoursesByCategory] = useState({});
    const [notifications, setNotifications] = useState([]); 
    const [unreadCount, setUnreadCount] = useState(0); 
    const [selectedNotification, setSelectedNotification] = useState(null); // Modal chi tiết

    // Refs
    const courseRef = useRef(null);
    const commitmentRef = useRef(null);
    const userDropdownRef = useRef(null);
    const notiDropdownRef = useRef(null); 
    const closeTimeout = useRef(null); 

    // User Info
    const isLoggedIn = !!user;
    const userName = user?.profile?.fullname || user?.email || 'Người dùng';
    const userAvatar = user?.profile?.photo;
    const userRole = user?.role;

    const colorMap = {
        admin: {
            from: 'from-purple-600', to: 'to-purple-800', border: 'border-purple-500', text: 'text-purple-700',
            hoverBg: 'hover:bg-purple-50', bg: 'bg-purple-100', icon: 'text-purple-600',
            buttonBg: 'bg-purple-600 hover:bg-purple-700', buttonBorder: 'border-purple-600 hover:bg-purple-50', buttonText: 'text-purple-700',
        },
        teacher: {
            from: 'from-purple-600', to: 'to-purple-800', border: 'border-purple-500', text: 'text-purple-700',
            hoverBg: 'hover:bg-purple-50', bg: 'bg-purple-100', icon: 'text-purple-600',
            buttonBg: 'bg-purple-600 hover:bg-purple-700', buttonBorder: 'border-purple-600 hover:bg-purple-50', buttonText: 'text-purple-700',
        },
        staff: {
            from: 'from-purple-600', to: 'to-purple-800', border: 'border-purple-500', text: 'text-purple-700',
            hoverBg: 'hover:bg-purple-50', bg: 'bg-purple-100', icon: 'text-purple-600',
            buttonBg: 'bg-purple-600 hover:bg-purple-700', buttonBorder: 'border-purple-600 hover:bg-purple-50', buttonText: 'text-purple-700',
        },
        member: {
            from: 'from-purple-600', to: 'to-purple-800', border: 'border-purple-500', text: 'text-purple-700',
            hoverBg: 'hover:bg-purple-50', bg: 'bg-purple-100', icon: 'text-purple-600',
            buttonBg: 'bg-purple-600 hover:bg-purple-700', buttonBorder: 'border-purple-600 hover:bg-purple-50', buttonText: 'text-purple-700',
        }
    };

    const colors = colorMap[userRole] || colorMap.admin;

    // 1. Load Courses
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await api.user.getCourses({ page: 1, limit: 999999 });
                const courses = res.data.data.courses;
                const grouped = courses.reduce((acc, course) => {
                    const cat = course.category.name || 'Khác';
                    if (!acc[cat]) acc[cat] = [];
                    acc[cat].push(course);
                    return acc;
                }, {});
                setCoursesByCategory(grouped);
            } catch (err) {
                console.error('Lỗi khi load khóa học:', err);
            }
        };
        fetchCourses();
    }, []);

    // 2. Load Notifications
    useEffect(() => {
        if (isLoggedIn) {
            const fetchNotifications = async () => {
                try {
                    const res = await api.notification.getAll();
                    const notis = res.data.data || [];
                    const sortedNotis = notis.sort((a, b) => new Date(b.createAt) - new Date(a.createAt));
                    
                    setNotifications(sortedNotis);
                    setUnreadCount(sortedNotis.filter(n => !n.isRead).length);
                } catch (err) {
                    console.error('Lỗi load thông báo:', err);
                }
            };
            fetchNotifications();
            
            const interval = setInterval(fetchNotifications, 60000);
            return () => clearInterval(interval);
        }
    }, [isLoggedIn]);

    // 3. Handle Click Outside
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (openMenu && courseRef.current && !courseRef.current.contains(e.target) && commitmentRef.current && !commitmentRef.current.contains(e.target)) {
                setOpenMenu(null);
            }
            if (dropdownOpen && userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
            if (notiDropdownOpen && notiDropdownRef.current && !notiDropdownRef.current.contains(e.target)) {
                setNotiDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [openMenu, dropdownOpen, notiDropdownOpen]);

    const commitments = [
        { title: 'Cam kết chất lượng', description: 'Đảm bảo 100% chất lượng giảng dạy.' },
        { title: 'Cam kết đầu ra', description: 'Học viên đạt điểm số cam kết.' },
        { title: 'Cam kết lộ trình', description: 'Lộ trình cá nhân hóa.' },
        { title: 'Cam kết hỗ trợ', description: 'Hỗ trợ 24/7.' },
    ];

    const handleMouseEnter = (menu) => {
        if (closeTimeout.current) {
            clearTimeout(closeTimeout.current);
            closeTimeout.current = null;
        }
        setOpenMenu(menu);
    };

    const handleMouseLeave = () => {
        if (closeTimeout.current) clearTimeout(closeTimeout.current);
        closeTimeout.current = setTimeout(() => setOpenMenu(null), CLOSE_DELAY);
    };

    // 4. Handle Notification Click (Update Logic)
    const handleNotificationClick = async (noti) => {
        // B1: Mở modal ngay lập tức (Optimistic UI)
        setSelectedNotification(noti); 
        setNotiDropdownOpen(false);

        try {
            // B2: Gọi API lấy chi tiết để đảm bảo nội dung đầy đủ nhất
            const res = await api.notification.get(noti._id);
            if(res.data && res.data.data) {
                // Cập nhật lại modal với dữ liệu chi tiết từ server
                setSelectedNotification(res.data.data);
            }

            // B3: Nếu chưa đọc, gọi API đánh dấu đã đọc và cập nhật UI
            if (!noti.isRead) {
                const updatedList = notifications.map(n => 
                    n._id === noti._id ? { ...n, isRead: true } : n
                );
                setNotifications(updatedList);
                setUnreadCount(prev => Math.max(0, prev - 1));

                await api.notification.markRead(noti._id);
            }
        } catch (err) {
            console.error("Lỗi khi xử lý thông báo:", err);
        }
    };

    return (
        <>
            <nav className="bg-white shadow-md sticky top-0 z-50 font-sans">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo & Menu */}
                        <div className="flex items-center space-x-8">
                            <Link to="/" className="flex items-center space-x-2">
                                <div className={`w-10 h-10 bg-gradient-to-br ${colors.from} ${colors.to} rounded-full flex items-center justify-center`}>
                                    <BookOpen className="w-6 h-6 text-white" />
                                </div>
                                <span className={`text-xl font-bold bg-gradient-to-r ${colors.from} ${colors.to} bg-clip-text text-transparent`}>
                                    TutorCenter
                                </span>
                            </Link>

                            <div className="hidden md:flex items-center space-x-6">
                                <div ref={courseRef} className="relative" onMouseEnter={() => handleMouseEnter('course')} onMouseLeave={handleMouseLeave}>
                                    <button className="flex items-center space-x-1 text-gray-700 hover:text-current font-medium py-2">
                                        <span className={`hover:${colors.text} transition-colors`}>Khóa học</span>
                                        <ChevronDown className={`w-4 h-4 transition-transform ${colors.text} ${openMenu === 'course' ? 'rotate-180' : ''}`} />
                                    </button>
                                    {openMenu === 'course' && (
                                        <div className="absolute left-0 top-full mt-2 w-[800px] bg-white border border-gray-200 rounded-xl shadow-2xl p-6 animate-fadeIn z-40">
                                            <h2 className="text-lg font-bold text-gray-800 mb-4">Danh mục & Khóa học</h2>
                                            <div className="grid grid-cols-3 gap-6">
                                                {Object.entries(coursesByCategory).map(([cat, list]) => (
                                                    <div key={cat}>
                                                        <h3 className={`font-semibold ${colors.text} mb-2`}>{cat}</h3>
                                                        <ul className="space-y-1">
                                                            {list.map((course) => (
                                                                <li key={course._id} className="cursor-pointer text-gray-600 hover:text-current hover:bg-gray-50 block px-2 py-1 rounded transition-colors" onClick={() => { navigate(`/courses/${course._id}`); setOpenMenu(null); }}>
                                                                    {course.name}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div ref={commitmentRef} className="relative" onMouseEnter={() => handleMouseEnter('commitment')} onMouseLeave={handleMouseLeave}>
                                    <button className="flex items-center space-x-1 text-gray-700 hover:text-current font-medium py-2">
                                        <span className={`hover:${colors.text} transition-colors`}>Cam kết đầu ra</span>
                                        <ChevronDown className={`w-4 h-4 transition-transform ${colors.text} ${openMenu === 'commitment' ? 'rotate-180' : ''}`} />
                                    </button>
                                    {openMenu === 'commitment' && (
                                        <div className="absolute left-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 animate-fadeIn z-40">
                                            <div className="space-y-3">
                                                {commitments.map((c, i) => (
                                                    <div key={i} className={`p-3 ${colors.hoverBg} rounded-lg cursor-pointer transition-colors`} onClick={() => setOpenMenu(null)}>
                                                        <h4 className={`font-semibold ${colors.text} mb-1`}>{c.title}</h4>
                                                        <p className="text-sm text-gray-600">{c.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {userRole === 'member' && (
                                    <>
                                        <button onClick={() => navigate('/learner/my-classes')} className={`text-gray-700 hover:${colors.text} font-medium py-2 transition-colors`}>Lớp học của tôi</button>
                                        <button onClick={() => navigate('/learner/roadmap')} className={`text-gray-700 hover:${colors.text} font-medium py-2 transition-colors`}>Lộ trình học tập</button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Right Side: Notification & User */}
                        <div className="flex items-center space-x-4 relative">
                            
                            {/* === NOTIFICATION ICON === */}
                            {isLoggedIn && (
                                <div className="relative" ref={notiDropdownRef}>
                                    <button 
                                        onClick={() => setNotiDropdownOpen(!notiDropdownOpen)}
                                        className={`p-2 rounded-full hover:bg-gray-100 transition-colors relative ${notiDropdownOpen ? 'bg-gray-100 text-purple-600' : 'text-gray-600'}`}
                                    >
                                        <Bell className="w-6 h-6" />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                                        )}
                                    </button>

                                    {/* Dropdown Thông Báo */}
                                    {notiDropdownOpen && (
                                        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-xl shadow-xl z-50 animate-fadeIn overflow-hidden">
                                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                                <h3 className="font-bold text-gray-800">Thông báo</h3>
                                                {unreadCount > 0 && (
                                                    <span className="text-xs text-purple-600 font-semibold bg-purple-100 px-2 py-0.5 rounded-full">
                                                        {unreadCount} mới
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                                                {notifications.length === 0 ? (
                                                    <div className="p-8 text-center text-gray-500">
                                                        <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                                        <p className="text-sm">Chưa có thông báo nào</p>
                                                    </div>
                                                ) : (
                                                    notifications.slice(0, 5).map((noti) => (
                                                        <div 
                                                            key={noti._id}
                                                            onClick={() => handleNotificationClick(noti)}
                                                            className={`p-4 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 flex gap-3 ${
                                                                !noti.isRead ? 'bg-blue-50/30' : 'bg-white'
                                                            }`}
                                                        >
                                                            <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${!noti.isRead ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`text-sm mb-1 truncate ${!noti.isRead ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                                                                    {noti.title}
                                                                </p>
                                                                <p className="text-xs text-gray-500 line-clamp-2">
                                                                    {noti.body}
                                                                </p>
                                                                <p className="text-[10px] text-gray-400 mt-1 text-right">
                                                                    {new Date(noti.createAt).toLocaleDateString('vi-VN')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                            
                                            
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* User Dropdown */}
                            <div ref={userDropdownRef}>
                                {isLoggedIn ? (
                                    <div className="flex items-center space-x-3">
                                        <span className="text-gray-700 font-medium hidden lg:block">
                                            Xin chào, <span className={`${colors.text} font-semibold`}>{userName}</span>
                                        </span>
                                        <div className="relative">
                                            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center focus:outline-none">
                                                {userAvatar ? (
                                                    <img src={userAvatar} alt="User avatar" className={`w-10 h-10 rounded-full border-2 ${colors.border} object-cover`} />
                                                ) : (
                                                    <div className={`w-10 h-10 ${colors.bg} rounded-full flex items-center justify-center border-2 ${colors.border}`}>
                                                        <User className={`w-5 h-5 ${colors.icon}`} />
                                                    </div>
                                                )}
                                            </button>
                                            {dropdownOpen && (
                                                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-fadeIn">
                                                    <button onClick={() => { setDropdownOpen(false); navigate('/student/profile'); }} className={`block w-full text-left px-4 py-2 text-gray-700 ${colors.hoverBg}`}>
                                                        Trang cá nhân
                                                    </button>
                                                    <button onClick={() => { setDropdownOpen(false); logout(); }} className={`block w-full text-left px-4 py-2 text-gray-700 ${colors.hoverBg}`}>
                                                        Đăng xuất
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-3">
                                        <button onClick={() => navigate('/login')} className={`px-5 py-2 text-white font-semibold bg-gradient-to-r ${colors.from} ${colors.to} rounded-full transition-all duration-200 shadow-md hover:scale-105`}>
                                            Đăng nhập
                                        </button>
                                        <button onClick={() => navigate('/register')} className={`px-5 py-2 ${colors.buttonText} font-semibold bg-white border-2 ${colors.buttonBorder} hover:${colors.hoverBg} rounded-full transition-all duration-200 shadow-md hover:scale-105`}>
                                            Đăng ký
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <style>
                    {`
                        @keyframes fadeIn {
                            from { opacity: 0; transform: translateY(-6px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
                    `}
                </style>
            </nav>

            {/* Modal Chi Tiết Thông Báo */}
            <NotificationModal 
                isOpen={!!selectedNotification} 
                onClose={() => setSelectedNotification(null)} 
                notification={selectedNotification} 
            />
        </>
    );
};

export default Navbar;