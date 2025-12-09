import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../utils/api";
import NewScheduleModal from "./components/NewScheduleModal";
import JobHistoryTable from "./components/JobHistoryTable";
import { Plus, PieChart, AlertTriangle, XCircle, Loader2 } from "lucide-react";
import moment from "moment";
import ScheduleResourceOverview from "./components/ScheduleResourceOverview";

function AdminScheduleDashboard() {
  const [jobs, setJobs] = useState([]);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [stats, setStats] = useState({
    teachers: [],
    rooms: [],
    courses: [],
    config: null,
    pendingStudents: [],
  });

  const navigate = useNavigate();

  // Hàm fetchData được bọc useCallback để có thể truyền xuống dưới làm callback
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setIsLoadingStats(true);
    try {
      const startDate = moment().subtract(6, 'months').format('YYYY-MM-DD');
      const endDate = moment().add(6, 'months').format('YYYY-MM-DD');

      const [
        statusRes,
        jobsRes,
        teacherRes,
        roomRes,
        courseRes,
        configRes,
        studentRes
      ] = await Promise.allSettled([
        api.admin.schedule.getStatus(),
        api.admin.schedule.getAllJobs(),
        api.admin.getTeachers({ active: true, limit: 200 }),
        api.admin.getRooms({ status: 'active', limit: 200 }),
        api.admin.getCourse({ limit: 200 }),
        api.admin.center.getConfig(),
        api.admin.enrollment.getStudentDemand({ startDate, endDate })
      ]);

      if (statusRes.status === 'fulfilled') {
        setIsScheduling(statusRes.value.data.data.isScheduling);
      }
      if (jobsRes.status === 'fulfilled') {
        setJobs(jobsRes.value.data.data);
      }

      let allPending = [];
      if (studentRes.status === 'fulfilled') {
        const data = studentRes.value.data.data;
        const newLeads = data.newLeads?.students || [];
        const waiting = data.waitingStudents?.students || [];
        allPending = [...newLeads, ...waiting];
      }

      setStats({
        teachers: teacherRes.status === 'fulfilled' ? teacherRes.value.data.data.teachers : [],
        rooms: roomRes.status === 'fulfilled' ? roomRes.value.data.data.rooms : [],
        courses: courseRes.status === 'fulfilled' ? courseRes.value.data.data.courses : [],
        config: configRes.status === 'fulfilled' ? configRes.value.data.data.config : null,
        pendingStudents: allPending
      });

      setError(null);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu dashboard:", err);
      setError("Lỗi máy chủ khi tải dữ liệu.");
    } finally {
      setIsLoading(false);
      setIsLoadingStats(false);
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
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
           Xếp Lịch
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
            {isLoading
              ? "Đang tải..."
              : isScheduling
                ? "Hệ thống đang bận"
                : "Tạo Lịch Mới"}
          </button>
        </div>
      </div>

      {/* Warning if scheduling is running */}
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

      {/* Error message */}
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

      {/* Resource Overview Tabs */}
      <ScheduleResourceOverview
        stats={stats}
        isLoadingStats={isLoadingStats}
      />

      
      <JobHistoryTable 
        jobs={jobs} 
        isLoading={isLoading} 
        onDeleteSuccess={fetchData} 
      />

      {/* New Schedule Modal */}
      <NewScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onJobCreated={handleJobCreated}
      />
    </div>
  );
}

export default AdminScheduleDashboard;