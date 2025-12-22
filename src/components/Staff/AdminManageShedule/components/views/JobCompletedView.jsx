import React, { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ArrowLeft, Calendar, ListX, TestTube2, AlertTriangle, PieChart } from "lucide-react";

import WeeklyTimetableView from "../draft/WeeklyTimetableView";
import FailedClassesTable from "../draft/FailedClassesTable";
import InputAnalysisView from "../draft/InputAnalysisView";
import FriendlyLogView from "../common/FriendlyLogView";
import WarningsTable from "../draft/WarningsTable";

function JobCompletedView({ job }) {
  const [activeTab, setActiveTab] = useState("summary");
  
  const report = job.resultReport || {};
  const lastLog = job.logs[job.logs.length - 1] || {};
  
  const totalClasses = (report.successfulCount || 0) + (report.failedCount || 0);
  const successRate = totalClasses > 0 ? (report.successfulCount / totalClasses) : 1;

  const tabs = [
    { id: "summary", name: "Tổng Quan", icon: CheckCircle2 },
    { id: "draft", name: "Lịch Học Trực Quan", icon: Calendar },
    { id: "failed", name: "Lớp Thất Bại", icon: ListX, count: report.failedCount || 0 },
    { id: "input", name: "Phân Tích Đầu Vào", icon: TestTube2 },
    { id: "warnings", name: "Cảnh Báo", icon: AlertTriangle, count: report.warnings?.length || 0 },
    { id: "logs", name: "Logs Chi Tiết", icon: PieChart },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-8 rounded-t-lg">
        <div className="flex flex-col items-center text-center">
        
          <h2 className="text-4xl font-extrabold mb-2">
            Hoàn Tất!
          </h2>
          <p className="text-xl opacity-90">
            {lastLog.message || "Đã chốt và tạo lịch thành công!"}
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard title="Tổng Lớp Ảo" value={totalClasses} />
          <StatCard 
            title="Xếp Thành Công" 
            value={report.successfulCount || 0}
            className="text-green-600"
          />
          <StatCard 
            title="Tỷ Lệ Thành Công" 
            value={`${(successRate * 100).toFixed(1)}%`}
            className={successRate >= 0.9 ? "text-purple-600" : successRate >= 0.7 ? "text-amber-600" : "text-red-600"} 
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <Link
            to="/staff/scheduler/dashboard"
            className="flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Về Dashboard
          </Link>
          <Link
            to="/staff/classes" 
            className="flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Xem Danh Sách Lớp
          </Link>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    activeTab === tab.id
                      ? "border-purple-500 text-purple-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
                {tab.count > 0 && (
                  <span className={`ml-2 py-0.5 px-2 rounded-full text-xs font-medium ${
                    activeTab === tab.id ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"
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
          {activeTab === "summary" && (
            <SummaryView report={report} job={job} />
          )}
          {activeTab === "draft" && <WeeklyTimetableView draftSchedule={job.draftSchedule} />}
          {activeTab === "failed" && <FailedClassesTable failedClasses={report.failedClasses} />}
          {activeTab === "input" && <InputAnalysisView inputAnalysis={job.inputAnalysis} />}
          {activeTab === "warnings" && <WarningsTable warnings={report.warnings} />}
          {activeTab === "logs" && <FriendlyLogView logs={job.logs} />}
        </div>
      </div>
    </div>
  );
}

const SummaryView = ({ report, job }) => {
  const totalClasses = (report.successfulCount || 0) + (report.failedCount || 0);
  const successRate = totalClasses > 0 ? (report.successfulCount / totalClasses) : 1;
  
  return (
    <div className="space-y-6">
      {/* Success Message */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-bold text-green-900 mb-2">
              Chốt lịch thành công!
            </h3>
            <p className="text-green-800">
              Đã tạo <strong>{report.successfulCount || 0}</strong> lớp học thật trong hệ thống.
              {report.failedCount > 0 && (
                <> Có <strong>{report.failedCount}</strong> lớp không thể xếp lịch.</>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Thông Tin Chi Tiết</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-gray-600">Tổng số lớp ảo:</span>
            <span className="font-bold text-gray-900 text-lg">{totalClasses}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-gray-600">Lớp xếp thành công:</span>
            <span className="font-bold text-green-600 text-lg">{report.successfulCount || 0}</span>
          </div>
          {report.failedCount > 0 && (
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-600">Lớp xếp thất bại:</span>
              <span className="font-bold text-red-600 text-lg">{report.failedCount}</span>
            </div>
          )}
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-gray-600">Số cảnh báo:</span>
            <span className="font-bold text-amber-600 text-lg">{report.warnings?.length || 0}</span>
          </div>
          <div className="flex justify-between items-center py-3 pt-4">
            <span className="text-gray-700 font-semibold text-lg">Tỷ lệ thành công:</span>
            <span className={`font-bold text-2xl ${
              successRate >= 0.9 ? 'text-green-600' : successRate >= 0.7 ? 'text-amber-600' : 'text-red-600'
            }`}>
              {(successRate * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Job Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Thông Tin Job</h3>
        <div className="space-y-2 text-sm">
          
          <div className="flex justify-between">
            <span className="text-gray-600">Ngày tạo:</span>
            <span className="text-gray-900">
              {new Date(job.createdAt).toLocaleString('vi-VN')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Hoàn thành lúc:</span>
            <span className="text-gray-900">
              {new Date(job.updatedAt).toLocaleString('vi-VN')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Ngưỡng thành công:</span>
            <span className="text-gray-900">{(job.successThreshold * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Warnings if any */}
      {report.warnings && report.warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-bold text-amber-900 mb-2">
                Có {report.warnings.length} cảnh báo
              </h3>
              <p className="text-amber-800 text-sm">
                Vui lòng xem tab "Cảnh Báo" để biết thêm chi tiết.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, className = "text-gray-900" }) => (
  <div className="bg-gray-50 p-4 rounded-lg shadow-inner border border-gray-200">
    <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
    <p className={`text-4xl font-bold ${className}`}>{value}</p>
  </div>
);

export default JobCompletedView;