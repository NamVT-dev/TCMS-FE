import React from 'react';
import Navbar from '../../components/Layout/Navbar';
import HeroSection from './HeroSection';
import InstructorSection from './InstructorSection';
import CourseSection from './CourseSection';
import Footer from './Footer';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <CourseSection />
      <InstructorSection />
      <Footer />
    </div>
  );
};

export default HomePage;