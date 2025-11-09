import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../utils/api';

// Định nghĩa thời gian trễ trước khi đóng dropdown (miligiây)
const CLOSE_DELAY = 100;

const Navbar = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [openMenu, setOpenMenu] = useState(null); // 'course' | 'commitment' | null
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [coursesByCategory, setCoursesByCategory] = useState({});

    const courseRef = useRef(null);
    const commitmentRef = useRef(null);
    const userDropdownRef = useRef(null);
    const closeTimeout = useRef(null); // <-- REF MỚI: Quản lý Timeout đóng menu

    const isLoggedIn = !!user;
    const userName = user?.profile?.fullname || user?.email || 'Người dùng';
    const userAvatar = user?.profile?.photo;
    const userRole = user?.role;

    // 🎨 Định nghĩa màu sắc theo Role 🎨
    const colorMap = {
        teacher: {
            from: 'from-sky-600', to: 'to-sky-800', border: 'border-sky-500', text: 'text-sky-700',
            hoverBg: 'hover:bg-sky-50', bg: 'bg-sky-100', icon: 'text-sky-600',
            buttonBg: 'bg-sky-600 hover:bg-sky-700', buttonBorder: 'border-sky-600 hover:bg-sky-50', buttonText: 'text-sky-700',
        },
        admin: {
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

    // Load courses
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await api.user.getCourses();
                const courses = res.data.data.courses || [];
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

    // Đóng menu & dropdown user khi click ra ngoài
    useEffect(() => {
        const handleOutsideClick = (e) => {
            // Logic đóng menu Khóa học/Cam kết
            if (openMenu) {
                if (courseRef.current && courseRef.current.contains(e.target)) {
                    return;
                }
                if (commitmentRef.current && commitmentRef.current.contains(e.target)) {
                    return;
                }
                setOpenMenu(null);
            }

            // Logic đóng dropdown User
            if (dropdownOpen) {
                if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
                    setDropdownOpen(false);
                }
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [openMenu, dropdownOpen]);


    const commitments = [
        { title: 'Cam kết chất lượng', description: 'Đảm bảo 100% chất lượng giảng dạy với đội ngũ giáo viên giàu kinh nghiệm' },
        { title: 'Cam kết đầu ra', description: 'Học viên đạt điểm số cam kết hoặc được học lại miễn phí' },
        { title: 'Cam kết lộ trình', description: 'Lộ trình học tập cá nhân hóa phù hợp với từng học viên' },
        { title: 'Cam kết hỗ trợ', description: 'Hỗ trợ học viên 24/7 trong suốt quá trình học tập' },
    ];

    // Hover mở menu: Luôn hủy lệnh đóng đang chờ
    const handleMouseEnter = (menu) => {
        if (closeTimeout.current) {
            clearTimeout(closeTimeout.current); // Hủy lệnh đóng
            closeTimeout.current = null;
        }
        setOpenMenu(menu);
    };

    // Hover đóng menu: Đặt lệnh đóng sau 100ms
    const handleMouseLeave = () => {
        if (closeTimeout.current) {
            clearTimeout(closeTimeout.current);
        }
        closeTimeout.current = setTimeout(() => {
            setOpenMenu(null);
        }, CLOSE_DELAY);
    };

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo & Menu chính */}
                    <div className="flex items-center space-x-8">
                        {/* Logo */}
                        <Link to="/" className="flex items-center space-x-2">
                            <div
                                className={`w-10 h-10 bg-gradient-to-br ${colors.from} ${colors.to} rounded-full flex items-center justify-center`}
                            >
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <span
                                className={`text-xl font-bold bg-gradient-to-r ${colors.from} ${colors.to} bg-clip-text text-transparent`}
                            >
                                TutorCenter
                            </span>
                        </Link>

                        {/* Menu */}
                        <div className="hidden md:flex items-center space-x-6">
                            {/* Khóa học */}
                            <div
                                ref={courseRef}
                                className="relative"
                                onMouseEnter={() => handleMouseEnter('course')} // <-- Hủy đóng, mở menu
                                onMouseLeave={handleMouseLeave} // <-- Đặt lệnh đóng có trễ
                            >
                                <button className="flex items-center space-x-1 text-gray-700 hover:text-current font-medium py-2">
                                    <span className={`hover:${colors.text} transition-colors`}>Khóa học</span>
                                    <ChevronDown
                                        className={`w-4 h-4 transition-transform ${colors.text} ${openMenu === 'course' ? 'rotate-180' : ''
                                            }`}
                                    />
                                </button>

                                {openMenu === 'course' && (
                                    <div
                                        className="absolute left-0 top-full mt-2 w-[800px] bg-white border border-gray-200 rounded-xl shadow-2xl p-6 animate-fadeIn z-40"
                                    // KHÔNG CẦN onMouseEnter/onMouseLeave ở đây nữa
                                    >
                                        <h2 className="text-lg font-bold text-gray-800 mb-4">
                                            Danh mục & Khóa học
                                        </h2>
                                        <div className="grid grid-cols-3 gap-6">
                                            {Object.entries(coursesByCategory).map(([cat, list]) => (
                                                <div key={cat}>
                                                    <h3 className={`font-semibold ${colors.text} mb-2`}>
                                                        {cat}
                                                    </h3>
                                                    <ul className="space-y-1">
                                                        {list.map((course) => (
                                                            <li
                                                                key={course._id}
                                                                className="cursor-pointer text-gray-600 hover:text-current hover:bg-gray-50 block px-2 py-1 rounded transition-colors"
                                                                onClick={() => {
                                                                    navigate(`/courses/${course._id}`);
                                                                    setOpenMenu(null);
                                                                }}
                                                            >
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

                            {/* Cam kết đầu ra */}
                            <div
                                ref={commitmentRef}
                                className="relative"
                                onMouseEnter={() => handleMouseEnter('commitment')} // <-- Hủy đóng, mở menu
                                onMouseLeave={handleMouseLeave} // <-- Đặt lệnh đóng có trễ
                            >
                                <button className="flex items-center space-x-1 text-gray-700 hover:text-current font-medium py-2">
                                    <span className={`hover:${colors.text} transition-colors`}>Cam kết đầu ra</span>
                                    <ChevronDown
                                        className={`w-4 h-4 transition-transform ${colors.text} ${openMenu === 'commitment' ? 'rotate-180' : ''
                                            }`}
                                    />
                                </button>

                                {openMenu === 'commitment' && (
                                    <div
                                        className="absolute left-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 animate-fadeIn z-40"
                                    // KHÔNG CẦN onMouseEnter/onMouseLeave ở đây nữa
                                    >
                                        <div className="space-y-3">
                                            {commitments.map((c, i) => (
                                                <div
                                                    key={i}
                                                    className={`p-3 ${colors.hoverBg} rounded-lg cursor-pointer transition-colors`}
                                                    onClick={() => setOpenMenu(null)}
                                                >
                                                    <h4 className={`font-semibold ${colors.text} mb-1`}>
                                                        {c.title}
                                                    </h4>
                                                    <p className="text-sm text-gray-600">{c.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            {userRole === 'member' && (
                                <>
                                    <button
                                        onClick={() => navigate('/my-courses')}
                                        className={`text-gray-700 hover:${colors.text} font-medium py-2 transition-colors`}
                                    >
                                        Khóa học của tôi
                                    </button>

                                    <button
                                        onClick={() => navigate('/learner/roadmap')}
                                        className={`text-gray-700 hover:${colors.text} font-medium py-2 transition-colors`}
                                    >
                                        Lộ trình học tập
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* User Section / Auth Buttons */}
                    <div className="flex items-center space-x-4 relative" ref={userDropdownRef}>
                        {isLoggedIn ? (
                            <div className="flex items-center space-x-3">
                                <span className="text-gray-700 font-medium hidden lg:block">
                                    Xin chào,{' '}
                                    <span className={`${colors.text} font-semibold`}>
                                        {userName}
                                    </span>
                                </span>
                                <div className="relative">
                                    <button
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        className="flex items-center focus:outline-none"
                                    >
                                        {userAvatar ? (
                                            <img
                                                src={userAvatar}
                                                alt="User avatar"
                                                className={`w-10 h-10 rounded-full border-2 ${colors.border} object-cover`}
                                            />
                                        ) : (
                                            <div
                                                className={`w-10 h-10 ${colors.bg} rounded-full flex items-center justify-center border-2 ${colors.border}`}
                                            >
                                                <User className={`w-5 h-5 ${colors.icon}`} />
                                            </div>
                                        )}
                                    </button>
                                    {dropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                            <button
                                                onClick={() => {
                                                    setDropdownOpen(false);
                                                    navigate('/student/profile');
                                                }}
                                                className={`block w-full text-left px-4 py-2 text-gray-700 ${colors.hoverBg}`}
                                            >
                                                Trang cá nhân
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setDropdownOpen(false);
                                                    logout();
                                                }}
                                                className={`block w-full text-left px-4 py-2 text-gray-700 ${colors.hoverBg}`}
                                            >
                                                Đăng xuất
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            // Nút Đăng nhập/Đăng ký sử dụng màu mặc định (admin/purple)
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => navigate('/login')}
                                    className={`px-5 py-2 text-white font-semibold bg-gradient-to-r ${colors.from} ${colors.to} rounded-full transition-all duration-200 shadow-md hover:scale-105`}
                                >
                                    Đăng nhập
                                </button>
                                <button
                                    onClick={() => navigate('/register')}
                                    className={`px-5 py-2 ${colors.buttonText} font-semibold bg-white border-2 ${colors.buttonBorder} hover:${colors.hoverBg} rounded-full transition-all duration-200 shadow-md hover:scale-105`}
                                >
                                    Đăng ký
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Hiệu ứng mượt mở dropdown */}
            <style>
                {`
                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                            transform: translateY(-6px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    .animate-fadeIn {
                        animation: fadeIn 0.2s ease-out;
                    }
                `}
            </style>
        </nav>
    );
};

export default Navbar;