import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16 px-3 md:px-6">
      <div className="container mx-auto max-w-7xl">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="logo/logo3.svg" 
                alt="TutorCenter Logo" 
                className="w-16 h-16 object-contain"
              />
              <div>
                <h3 className="font-bold text-2xl">TutorCenter</h3>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-6 max-w-md">
              Hệ thống học tiếng Anh uy tín hàng đầu Việt Nam. Chúng tôi cam kết mang đến chất lượng giảng dạy tốt nhất, giúp bạn đạt mọi mục tiêu chinh phục tiếng Anh.
            </p>
            <div className="flex items-center space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-700 hover:bg-purple-600 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110">
                <span className="text-lg">📘</span>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-700 hover:bg-purple-600 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110">
                <span className="text-lg">📸</span>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-700 hover:bg-purple-600 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110">
                <span className="text-lg">▶️</span>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-700 hover:bg-purple-600 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110">
                <span className="text-lg">💼</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-white">Liên kết nhanh</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-300 hover:text-purple-400 transition-colors text-sm flex items-center space-x-2">
                  <span>→</span>
                  <span>Về chúng tôi</span>
                </a>
              </li>
              <li>
                <a href="#courses" className="text-gray-300 hover:text-purple-400 transition-colors text-sm flex items-center space-x-2">
                  <span>→</span>
                  <span>Khóa học</span>
                </a>
              </li>
              <li>
                <a href="#instructors" className="text-gray-300 hover:text-purple-400 transition-colors text-sm flex items-center space-x-2">
                  <span>→</span>
                  <span>Giảng viên</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-purple-400 transition-colors text-sm flex items-center space-x-2">
                  <span>→</span>
                  <span>Tin tức</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-purple-400 transition-colors text-sm flex items-center space-x-2">
                  <span>→</span>
                  <span>Liên hệ</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-white">Liên hệ</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-3 text-gray-300">
                <span className="text-purple-400 mt-0.5">📍</span>
                <span>Thạch Hòa, Thạch Thất, Hà Nội</span>
              </li>
              <li className="flex items-start space-x-3 text-gray-300">
                <span className="text-purple-400 mt-0.5">📞</span>
                <a href="tel:0329428493" className="hover:text-purple-400 transition-colors">
                  0329 428 493
                </a>
              </li>
              <li className="flex items-start space-x-3 text-gray-300">
                <span className="text-purple-400 mt-0.5">✉️</span>
                <a href="mailto:Trungthe171142@fpt.edu.vn" className="hover:text-purple-400 transition-colors">
                  Trungthe171142@fpt.edu.vn
                </a>
              </li>
              <li className="flex items-start space-x-3 text-gray-300">
                <span className="text-purple-400 mt-0.5">⏰</span>
                <span>T2 - CN: 8:00 - 21:00</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © 2025 TutorCenter. All Rights Reserved. Made with 💜 in Vietnam
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                Chính sách bảo mật
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                Điều khoản sử dụng
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;