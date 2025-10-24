import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isLoggedIn = !!user;

  // Lấy thông tin tên & avatar từ user.profile
  const userName = user?.profile?.fullname || user?.email || 'Người dùng';
  const userAvatar = user?.profile?.photo;

  // 🎨 Map màu theo role (có fallback mặc định là purple)
  const colorMap = {
    teacher: {
      from: 'from-indigo-600',
      to: 'to-indigo-800',
      hoverFrom: 'hover:from-indigo-700',
      hoverTo: 'hover:to-indigo-900',
      border: 'border-indigo-500',
      text: 'text-indigo-700',
      hoverBg: 'hover:bg-indigo-50',
      bg: 'bg-indigo-100',
      icon: 'text-indigo-600',
    },
    admin: {
      from: 'from-purple-600',
      to: 'to-purple-800',
      hoverFrom: 'hover:from-purple-700',
      hoverTo: 'hover:to-purple-900',
      border: 'border-purple-500',
      text: 'text-purple-700',
      hoverBg: 'hover:bg-purple-50',
      bg: 'bg-purple-100',
      icon: 'text-purple-600',
    },
  };

  // Nếu chưa đăng nhập hoặc không có role → mặc định purple
  const colors = colorMap[user?.role] || colorMap.admin;

  return (
    <nav className="bg-white shadow-md">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
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
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4 relative">
            {isLoggedIn ? (
              <div className="flex items-center space-x-3">
                {/* Dòng chào */}
                <span className="text-gray-700 font-medium">
                  Xin chào,{' '}
                  <span className={`${colors.text} font-semibold`}>
                    {userName}
                  </span>
                </span>

                {/* Avatar + dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center focus:outline-none"
                  >
                    {userAvatar ? (
                      <img
                        src={userAvatar}
                        alt="User avatar"
                        className={`w-12 h-12 rounded-full border-2 ${colors.border} object-cover`}
                      />
                    ) : (
                      <div
                        className={`w-12 h-12 ${colors.bg} rounded-full flex items-center justify-center border-2 ${colors.border}`}
                      >
                        <User className={`w-6 h-6 ${colors.icon}`} />
                      </div>
                    )}
                  </button>

                  {/* Dropdown */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          navigate('/profile');
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
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate('/login')}
                  className={`w-32 px-4 py-2 text-white font-semibold bg-gradient-to-r 
                    ${colors.from} ${colors.to} ${colors.hoverFrom} ${colors.hoverTo} 
                    rounded-lg transition-all duration-200 ease-in-out shadow-md 
                    hover:shadow-lg active:transform active:translate-y-0.5`}
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className={`w-32 px-4 py-2 text-white font-semibold bg-gradient-to-r 
                    ${colors.from} ${colors.to} ${colors.hoverFrom} ${colors.hoverTo} 
                    rounded-lg transition-all duration-200 ease-in-out shadow-md 
                    hover:shadow-lg active:transform active:translate-y-0.5`}
                >
                  Đăng ký
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
