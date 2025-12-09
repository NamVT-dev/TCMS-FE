import React, { useState, useEffect } from "react";
import api from "../../../../../utils/api";
import { Check, Loader2, PieChart, AlertTriangle, ListX, TestTube2, Calendar, X, CheckCircle, AlertCircle } from "lucide-react";

import WeeklyTimetableView from "../draft/WeeklyTimetableView";
import FailedClassesTable from "../draft/FailedClassesTable";
import InputAnalysisView from "../draft/InputAnalysisView";
import FriendlyLogView from "../common/FriendlyLogView";
import WarningsTable from "../draft/WarningsTable";

// Toast Component
const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: { bg: "bg-green-500", Icon: CheckCircle },
    error: { bg: "bg-red-500", Icon: AlertCircle },
    warning: { bg: "bg-amber-500", Icon: AlertTriangle },
  };

  const { bg, Icon } = styles[type] || styles.success;

  return (
    <div className={`fixed top-4 right-4 ${bg} text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 z-[100] animate-slide-in min-w-[320px] max-w-md`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="font-medium flex-1">{message}</span>
      <button onClick={onClose} className="ml-2 hover:bg-white/20 rounded p-1 transition">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Confirmation Dialog Component
const ConfirmFinalizeDialog = ({ isOpen, onClose, onConfirm, stats }) => {
  if (!isOpen) return null;

  const hasWarnings = stats.warnings > 0;
  const hasFailures = stats.failed > 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg animate-scale-in">
        <div className="p-6">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mx-auto mb-4">
            <Check className="w-8 h-8 text-purple-600" />
          </div>
          
          <h3 className="text-2xl font-bold text-gray-800 text-center mb-3">
            Xác nhận chốt lịch
          </h3>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tổng lớp ảo:</span>
              <span className="font-bold text-gray-900 text-lg">{stats.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Xếp thành công:</span>
              <span className="font-bold text-green-600 text-lg">{stats.success}</span>
            </div>
            {stats.failed > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Thất bại:</span>
                <span className="font-bold text-red-600 text-lg">{stats.failed}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="text-gray-600 font-semibold">Tỷ lệ thành công:</span>
              <span className={`font-bold text-xl ${stats.rate >= 90 ? 'text-green-600' : stats.rate >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                {stats.rate}%
              </span>
            </div>
          </div>

          {(hasWarnings || hasFailures) && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  {hasFailures && (
                    <p className="mb-2">
                      <strong>Lưu ý:</strong> Có {stats.failed} lớp không thể xếp lịch. Các lớp này sẽ không được tạo.
                    </p>
                  )}
                  {hasWarnings && (
                    <p>
                      <strong>Cảnh báo:</strong> Có {stats.warnings} cảnh báo cần xem xét.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <p className="text-center text-gray-600 text-sm mb-6">
            Hành động này sẽ tạo <strong className="text-purple-600">{stats.success} lớp học thật</strong> trong hệ thống. 
            <br />Bạn có chắc chắn muốn tiếp tục?
          </p>
        </div>
        
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition shadow-sm"
          >
            Xác nhận chốt
          </button>
        </div>
      </div>
    </div>
  );
};

function JobDraftReviewView({ job, onRefetch }) {
  const [activeTab, setActiveTab] = useState("draft");
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [error, setError] = useState(null);
  
  // Toast & Dialog states
  const [toast, setToast] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const report = job.resultReport || {};
  
  const totalClasses = (report.successfulCount || 0) + (report.failedCount || 0);
  const successRate = totalClasses > 0 ? (report.successfulCount / totalClasses) : 1;
  const isBelowThreshold = successRate < job.successThreshold;

  const stats = {
    total: totalClasses,
    success: report.successfulCount || 0,
    failed: report.failedCount || 0,
    rate: (successRate * 100).toFixed(1),
    warnings: report.warnings?.length || 0
  };

  const tabs = [
    { id: "draft", name: "Lịch Học Trực Quan", icon: Calendar },
    { id: "failed", name: "Lớp Thất Bại", icon: ListX, count: report.failedCount || 0 },
    { id: "input", name: "Phân Tích Đầu Vào", icon: TestTube2 },
    { id: "warnings", name: "Cảnh Báo", icon: AlertTriangle, count: report.warnings?.length || 0 },
    { id: "logs", name: "Logs Chi Tiết", icon: PieChart },
  ];

  const handleFinalizeClick = () => {
    setShowConfirm(true);
  };

  const handleFinalize = async () => {
    setShowConfirm(false);
    setIsFinalizing(true);
    setError(null);

    try {
      await api.admin.schedule.finalizeJob(job._id);
      
      setToast({ 
        message: `Chốt lịch thành công! Đã tạo ${stats.success} lớp học.`, 
        type: "success" 
      });
      
      setTimeout(() => {
        onRefetch();
      }, 1500);

    } catch (err) {
      const errorMsg = err.response?.data?.message || "Lỗi khi chốt lịch. Vui lòng thử lại.";
      setError(errorMsg);
      setToast({ message: errorMsg, type: "error" });
      setIsFinalizing(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
        .animate-scale-in { animation: scale-in 0.2s ease-out; }
      `}</style>

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <ConfirmFinalizeDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleFinalize}
        stats={stats}
      />

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              Bản Nháp Xếp Lịch
            </h2>
            <p className="text-lg text-gray-600 mt-1">
              Đã chạy xong. Vui lòng xem lại và chốt lịch.
            </p>
          </div>
          <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-end sm:space-x-3 ">
            <button
              onClick={handleFinalizeClick}
              disabled={isFinalizing}
              className={`flex items-center justify-center font-bold py-3 px-6 rounded-lg text-white transition-colors duration-200 h-[42px] w-full sm:w-auto
              ${
                isFinalizing 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {isFinalizing ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <Check className="h-6 w-6" />
              )}
              <span className="ml-2">{isFinalizing ? "Đang chốt..." : "Chốt Lịch"}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard title="Tổng Lớp Ảo" value={totalClasses} />
          <StatCard title="Xếp Thành Công" value={report.successfulCount || 0} />
          <StatCard 
            title="Tỷ Lệ Thành Công" 
            value={`${(successRate * 100).toFixed(1)}%`}
            className={isBelowThreshold ? "text-red-500" : "text-green-500"} 
          />
        </div>
       
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

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
                    activeTab === tab.id ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-600"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
        <div className="pt-6">
          {activeTab === "draft" && <WeeklyTimetableView draftSchedule={job.draftSchedule} />}
          {activeTab === "failed" && <FailedClassesTable failedClasses={report.failedClasses} />}
          {activeTab === "input" && <InputAnalysisView inputAnalysis={job.inputAnalysis} />}
          {activeTab === "warnings" && (
            <WarningsTable warnings={report.warnings} />
          )}
          {activeTab === "logs" && <FriendlyLogView logs={job.logs} />}
        </div>
      </div>
    </>
  );
}

const StatCard = ({ title, value, className = "text-gray-900" }) => (
  <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
    <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
    <p className={`text-4xl font-bold ${className}`}>{value}</p>
  </div>
);

export default JobDraftReviewView;