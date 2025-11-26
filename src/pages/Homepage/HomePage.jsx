import React, { useState, useEffect } from 'react';
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
    
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [showLoginMessage, setShowLoginMessage] = useState(false); 

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

    const handleCheckAndOpenModal = () => {
        if (isLoggedIn) {
            onOpenModal(); 
            setShowLoginMessage(false);
        } else {
            setShowLoginMessage(true); 
        }
    };

    return (
        <div className="min-h-screen bg-white relative"> 
            <Navbar />
            <HeroSection 
                onOpenModal={handleCheckAndOpenModal} 
                showLoginMessage={showLoginMessage}   
            /> 
            <CourseSection />
            <InstructorSection />
            <Footer />

           
            <ChatWidget />

           
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