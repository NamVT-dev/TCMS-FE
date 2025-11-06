// src/components/Admin/AdminManageShedule/AdminScheduleDashboard.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../utils/api";
import NewScheduleModal from "./components/NewScheduleModal";
import JobHistoryTable from "./components/JobHistoryTable";
import { Plus, PieChart, AlertTriangle, XCircle, Loader2 } from "lucide-react";

function AdminScheduleDashboard() {
  const [jobs, setJobs] = useState([]);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    
    try {
      const [statusRes, jobsRes] = await Promise.all([
        api.admin.schedule.getStatus(),
        api.admin.schedule.getAllJobs(),
      ]);
      setIsScheduling(statusRes.data.data.isScheduling);
      setJobs(jobsRes.data.data);
      setError(null);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu dashboard:", err);
      setError(err.response?.data?.message || "Lỗi máy chủ");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleJobCreated = (newJobId) => {
    setIsModalOpen(false);
    fetchData(); 
    navigate(`/admin/scheduler/jobs/${newJobId}`);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
     
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard Xếp Lịch
        </h1>
        
        <div className="flex-shrink-0 flex items-center space-x-3">
          <button
            onClick={() => navigate("/admin/scheduler/analytics")}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <PieChart className="w-5 h-5 mr-2" />
            Xem Phân Tích
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={isScheduling || isLoading}
            className="inline-flex items-center justify-center px-4 py-2 bg-purple-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Plus className="w-5 h-5 mr-2 -ml-1" />
            )}
            {isLoading ? "Đang tải..." : (isScheduling ? "Hệ thống đang bận" : "Tạo Lịch Mới")}
          </button>
        </div>
      </div>

      
      {isScheduling && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Hệ thống đang bận:</strong> Một tiến trình xếp lịch đang chạy. 
                Nút "Tạo Lịch Mới" sẽ được mở sau khi quá trình hoàn tất.
              </p>
            </div>
          </div>
        </div>
      )}

      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <strong>Lỗi tải dữ liệu:</strong> {error}
              </p>
            </div>
          </div>
        </div>
      )}

      
      <JobHistoryTable 
        jobs={jobs} 
        isLoading={isLoading}
      />

      
      <NewScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onJobCreated={handleJobCreated}
      />
    </div>
  );
}

export default AdminScheduleDashboard;