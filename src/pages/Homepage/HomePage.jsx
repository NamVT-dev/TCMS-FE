import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar';
import HeroSection from './HeroSection';
import CourseSection from './CourseSection';
import InstructorSection from './InstructorSection';
import Footer from './Footer';
// Thêm import hook useAuth thực tế của bạn
import { useAuth } from '../../hooks/useAuth'; 

// XÓA BỎ HOẶC COMMENT PHẦN GIẢ LẬP useAuth Ở ĐÂY

const HomePage = ({ onOpenModal }) => {
    // 💡 SỬ DỤNG HOOK THỰC TẾ
    const { user } = useAuth();
    const isLoggedIn = !!user; // Kiểm tra user có tồn tại không
    
    const navigate = useNavigate();
    
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [showLoginMessage, setShowLoginMessage] = useState(false); 

    // Theo dõi vị trí scroll để hiện/ẩn nút (giữ nguyên)
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    // HÀM XỬ LÝ CHÍNH KHI BẤM NÚT ĐĂNG KÝ TEST
    const handleCheckAndOpenModal = () => {
        if (isLoggedIn) {
            // 1. Đã đăng nhập: Mở modal đăng ký
            onOpenModal(); 
            setShowLoginMessage(false);
        } else {
            // 2. Chưa đăng nhập: Chỉ hiển thị thông báo.
            setShowLoginMessage(true); 
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <HeroSection 
                onOpenModal={handleCheckAndOpenModal} 
                showLoginMessage={showLoginMessage}   
            /> 
            <CourseSection />
            <InstructorSection />
            <Footer />

            {/* Nút Scroll To Top */}
            {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 z-50 p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 group"
                    aria-label="Scroll to top"
                >
                    <ChevronUp className="w-6 h-6 group-hover:animate-bounce" />
                </button>
            )}
        </div>
    );
};

export default HomePage;