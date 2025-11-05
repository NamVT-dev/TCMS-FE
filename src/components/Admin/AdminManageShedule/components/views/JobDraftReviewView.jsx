// src/components/Admin/AdminManageShedule/components/views/JobDraftReviewView.jsx

import React, { useState } from "react";
import api from "../../../../../utils/api";
import { Check, X, Loader2, PieChart, AlertTriangle, ListX, TestTube2, Calendar } from "lucide-react";

// Import các component con cho từng tab (chúng ta sẽ làm sau)
import WeeklyTimetableView from "../draft/WeeklyTimetableView";
import FailedClassesTable from "../draft/FailedClassesTable";
import InputAnalysisView from "../draft/InputAnalysisView";
import FriendlyLogView from "../common/FriendlyLogView";
import WarningsTable from "../draft/WarningsTable";
function JobDraftReviewView({ job, onRefetch }) {
    const [activeTab, setActiveTab] = useState("draft"); // 'draft', 'failed', 'input', 'logs'
    const [isFinalizing, setIsFinalizing] = useState(false);
    const [error, setError] = useState(null);

    const report = job.resultReport || {};
    const totalClasses = (report.successfulCount || 0) + (report.failedCount || 0);
    const successRate = totalClasses > 0 ? (report.successfulCount / totalClasses) : 1;
    const isBelowThreshold = successRate < job.successThreshold;

    const handleFinalize = async () => {
        if (window.confirm("Bạn có chắc chắn muốn chốt (finalize) bản nháp này? Hành động này sẽ tạo lớp học thật.")) {
            setIsFinalizing(true);
            setError(null);
            try {
                await api.admin.schedule.finalizeJob(job._id);
                // Không cần làm gì ở đây, socket 'job_complete' sẽ kích hoạt onRefetch
                // và component cha sẽ tự đổi view
                onRefetch();
            } catch (err) {
                setError(err.response?.data?.message || "Lỗi khi chốt lịch.");
                setIsFinalizing(false);
            }
        }
    };

    const tabs = [
        { id: "draft", name: "Lịch Tuần Trực Quan", icon: Calendar },
        { id: "failed", name: "Lớp Thất Bại", icon: ListX, count: report.failedCount || 0 },
        { id: "input", name: "Phân Tích Đầu Vào", icon: TestTube2 },
        { id: "warnings", name: "Cảnh Báo", icon: AlertTriangle, count: report.warnings?.length || 0 },
        { id: "logs", name: "Logs Chi Tiết", icon: PieChart },
    ];

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            {/* 1. Header: Tiêu đề và Nút Actions */}
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">
                        Bản Nháp Xếp Lịch
                    </h2>
                    <p className="text-lg text-gray-600 mt-1">
                        Đã chạy xong. Vui lòng xem lại và chốt lịch.
                    </p>
                </div>
                <div className="flex-shrink-0 flex items-center space-x-3">
                    <button
                        onClick={handleFinalize}
                        disabled={isFinalizing}
                        className={`flex items-center justify-center font-bold py-3 px-6 rounded-lg text-white transition-colors duration-200 ${isFinalizing
                            ? "bg-gray-400"
                            : "bg-purple-600 hover:bg-purple-700"
                            }`}
                    >
                        {isFinalizing ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                            <Check className="h-6 w-6 mr-2" />
                        )}
                        <span className="ml-2">{isFinalizing ? "Đang chốt..." : "Chốt Lịch Này"}</span>
                    </button>
                    {/* Bạn có thể thêm nút "Hủy" ở đây nếu cần */}
                </div>
            </div>

            {/* 2. Báo cáo Tóm tắt (Stats) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <StatCard title="Tổng Lớp Ảo" value={totalClasses} />
                <StatCard title="Xếp Thành Công" value={report.successfulCount || 0} />
                <StatCard
                    title="Tỷ Lệ Thành Công"
                    value={`${(successRate * 100).toFixed(1)}%`}
                    className={isBelowThreshold ? "text-red-500" : "text-green-500"}
                />
            </div>
            {isBelowThreshold && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertTriangle className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">
                                <strong>Cảnh báo:</strong> Tỷ lệ thành công ({`${(successRate * 100).toFixed(1)}%`}) thấp hơn ngưỡng
                                ({`${(job.successThreshold * 100).toFixed(1)}%`}) bạn đã đặt.
                            </p>
                        </div>
                    </div>
                </div>
            )}
            {error && <p className="text-red-600 mb-4">{error}</p>}

            {/* 3. Giao diện Tabs */}
            <div>
                {/* Tab Navigation */}
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                                        ? "border-purple-500 text-purple-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }
                `}
                            >
                                <tab.icon className="h-5 w-5 mr-2" />
                                {tab.name}
                                {tab.count > 0 && (
                                    <span className={`ml-2 py-0.5 px-2 rounded-full text-xs font-medium ${activeTab === tab.id ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-600"
                                        }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="pt-6">
                    {activeTab === "draft" && <WeeklyTimetableView draftSchedule={job.draftSchedule} />}
                    {activeTab === "failed" && <FailedClassesTable failedClasses={report.failedClasses} />}
                    {activeTab === "input" && <InputAnalysisView inputAnalysis={job.inputAnalysis} />}

                   
                    {activeTab === "warnings" && (
                        <WarningsTable warnings={report.warnings} />
                    )}
                    {/* ⬆️ THAY ĐỔI Ở ĐÂY */}

                    {activeTab === "logs" && <FriendlyLogView logs={job.logs} />}
                </div>
            </div>
        </div>
    );
}

// Component StatCard nội bộ
const StatCard = ({ title, value, className = "text-gray-900" }) => (
    <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
        <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
        <p className={`text-4xl font-bold ${className}`}>{value}</p>
    </div>
);

export default JobDraftReviewView;