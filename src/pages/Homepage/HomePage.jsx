import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import Navbar from '../../components/Layout/Navbar';
import HeroSection from './HeroSection';
import InstructorSection from './InstructorSection';
import CourseSection from './CourseSection';
import Footer from './Footer';

const HomePage = ({ onOpenModal }) => { // ← Thêm prop onOpenModal
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Theo dõi vị trí scroll để hiện/ẩn nút
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

  // Hàm scroll về đầu trang
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection onOpenModal={onOpenModal} /> 
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