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
  
  // Loading tổng cho trang
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  
  // Loading riêng cho phần filter học viên
  const [isStudentLoading, setIsStudentLoading] = useState(false);

  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State quản lý Filter Date: Mặc định 1 tuần trước đến hiện tại
  const [studentFilter, setStudentFilter] = useState({
    startDate: moment().subtract(7, 'days').format('YYYY-MM-DD'),
    endDate: moment().format('YYYY-MM-DD')
  });

  // Khởi tạo stats với đúng cấu trúc API trả về
  const [stats, setStats] = useState({
    teachers: [],
    rooms: [],
    courses: [],
    config: null,
    newLeads: { count: 0, students: [] },       // Sửa: Tách riêng
    waitingStudents: { count: 0, students: [] } // Sửa: Tách riêng
  });

  const navigate = useNavigate();

  // Hàm riêng để fetch dữ liệu học viên
  const fetchStudentDemand = async (start, end) => {
    setIsStudentLoading(true);
    try {
      // Gọi API với params date
      const studentRes = await api.admin.enrollment.getStudentDemand({ 
        startDate: start, 
        endDate: end 
      });

      // Mặc định là object rỗng có cấu trúc chuẩn
      let newLeadsData = { count: 0, students: [] };
      let waitingStudentsData = { count: 0, students: [] };

      // Gán dữ liệu nếu API trả về thành công
      if (studentRes.data && studentRes.data.data) {
        const data = studentRes.data.data;
        if (data.newLeads) newLeadsData = data.newLeads;
        if (data.waitingStudents) waitingStudentsData = data.waitingStudents;
      }

      // Cập nhật vào stats, giữ nguyên các key khác
      setStats(prev => ({
        ...prev,
        newLeads: newLeadsData,
        waitingStudents: waitingStudentsData
      }));

    } catch (err) {
      console.error("Lỗi khi tải dữ liệu học viên:", err);
    } finally {
      setIsStudentLoading(false);
    }
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setIsLoadingStats(true);
    try {
      // 1. Load các dữ liệu tĩnh (Giáo viên, Phòng, Khóa học, Cấu hình, Jobs)
      const [
        statusRes,
        jobsRes,
        teacherRes,
        roomRes,
        courseRes,
        configRes,
      ] = await Promise.allSettled([
        api.admin.schedule.getStatus(),
        api.admin.schedule.getAllJobs(),
        api.admin.getTeachers({status: 'active', limit: 200 }),
        api.admin.getRooms({ status: 'active', limit: 200 }),
        api.admin.getCourse({ limit: 200 }),
        api.admin.center.getConfig(),
      ]);

      if (statusRes.status === 'fulfilled') {
        setIsScheduling(statusRes.value.data.data.isScheduling);
      }
      if (jobsRes.status === 'fulfilled') {
        setJobs(jobsRes.value.data.data);
      }

      // 2. Set dữ liệu tĩnh vào state
      // Lưu ý: Khởi tạo newLeads và waitingStudents rỗng để tránh lỗi trước khi fetchStudentDemand chạy xong
      const newStats = {
        teachers: teacherRes.status === 'fulfilled' ? teacherRes.value.data.data.teachers : [],
        rooms: roomRes.status === 'fulfilled' ? roomRes.value.data.data.rooms : [],
        courses: courseRes.status === 'fulfilled' ? courseRes.value.data.data.courses : [],
        config: configRes.status === 'fulfilled' ? configRes.value.data.data.config : null,
        newLeads: { count: 0, students: [] },
        waitingStudents: { count: 0, students: [] }
      };
      setStats(newStats);

      // 3. Gọi API lấy học viên theo filter mặc định
      await fetchStudentDemand(studentFilter.startDate, studentFilter.endDate);

      setError(null);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu dashboard:", err);
      setError("Lỗi máy chủ khi tải dữ liệu.");
    } finally {
      setIsLoading(false);
      setIsLoadingStats(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy 1 lần khi mount

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handler khi người dùng bấm nút Filter ở component con
  const handleFilterStudents = (start, end) => {
    setStudentFilter({ startDate: start, endDate: end });
    fetchStudentDemand(start, end);
  };

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
        
        // Truyền props filter xuống con
        studentFilter={studentFilter}
        onFilterStudents={handleFilterStudents}
        isStudentLoading={isStudentLoading}
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