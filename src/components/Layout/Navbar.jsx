import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, User } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  // Temporary state to simulate login status - replace with your auth logic
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({
    name: "John Doe",
    avatar: null // Add avatar URL here if available
  });

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section - Left Side */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                TutorCenter
              </span>
            </Link>
          </div>

          {/* User Section - Right Side */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center space-x-3">
                <span className="text-gray-700">{user.name}</span>
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt="User avatar"
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate('/login')}
                  className="w-32 px-4 py-2 text-white font-semibold bg-gradient-to-r 
                    from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 
                    rounded-lg transition-all duration-200 ease-in-out shadow-md 
                    hover:shadow-lg active:transform active:translate-y-0.5"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="w-32 px-4 py-2 text-white font-semibold bg-gradient-to-r 
                    from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 
                    rounded-lg transition-all duration-200 ease-in-out shadow-md 
                    hover:shadow-lg active:transform active:translate-y-0.5"
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