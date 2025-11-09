import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar';
import LearnerRoadmapPage from '../../components/Student/LearnerRoadmapPage';
import LearnerRoadmapResults from '../../components/Student/LearnerRoadmapResults';
import LearnerPaymentStatusPage from '../../components/Student/LearnerPaymentStatusPage';
import LearnerCustomSchedulePage from '../../components/Student/LearnerCustomSchedulePage';

const LearnerLayout = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="pt-16">
                <Routes>
                    <Route path="roadmap" element={<LearnerRoadmapPage />} />
                    <Route path="roadmap-results" element={<LearnerRoadmapResults />} />
                    <Route path="payment-status" element={<LearnerPaymentStatusPage />} />
                    <Route path="custom-schedule" element={<LearnerCustomSchedulePage />} />
                    <Route index element={<Navigate to="roadmap" replace />} />
                </Routes>
            </main>
        </div>
    );
};

export default LearnerLayout;