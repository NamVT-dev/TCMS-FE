import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar';
import HeroSection from './HeroSection';
import CourseSection from './CourseSection';
import InstructorSection from './InstructorSection';
import Footer from './Footer';
import { useAuth } from '../../hooks/useAuth'; 
import ChatWidget from './ChatWidget';

const HomePage = ({ onOpenModal }) => {
    const { user } = useAuth();
    const isLoggedIn = !!user; 
    const navigate = useNavigate();
    
    // UI States
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [showLoginMessage, setShowLoginMessage] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);

    // Xử lý scroll to top button
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
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

    // Xử lý mở modal kiểm tra đầu vào
    const handleCheckAndOpenModal = () => {
        if (isLoggedIn) {
            onOpenModal(); 
            setShowLoginMessage(false);
        } else {
            setShowLoginMessage(true);
            // Tự động ẩn thông báo sau 5 giây
            setTimeout(() => setShowLoginMessage(false), 5000);
        }
    };

    // Xử lý mở chatbot
    const handleOpenChat = () => {
        setChatOpen(true);
    };

    return (
        <div className="min-h-screen bg-white relative"> 
            <Navbar />
            
            <HeroSection 
                onOpenModal={handleCheckAndOpenModal} 
                showLoginMessage={showLoginMessage}
                isLoggedIn={isLoggedIn}
                onOpenChat={handleOpenChat}
            /> 
            
            <CourseSection />
            <InstructorSection />
            <Footer />

            {/* Chat Widget */}
            <ChatWidget isOpen={chatOpen} setIsOpen={setChatOpen} />

            {/* Scroll to Top Button */}
            {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-8 left-8 z-50 p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 group"
                    aria-label="Scroll to top"
                >
                    <ChevronUp className="w-6 h-6 group-hover:animate-bounce" />
                </button>
            )}
        </div>
    );
};

export default HomePage;