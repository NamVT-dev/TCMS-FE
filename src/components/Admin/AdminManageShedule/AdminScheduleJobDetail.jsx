// src/components/Admin/AdminManageShedule/AdminScheduleJobDetail.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../../utils/api";
import { socket } from "../../../utils/socket";
import { ArrowLeft, Loader2 } from "lucide-react";

// Import các "views" con
import JobInProgressView from "./components/views/JobInProgressView";
import JobDraftReviewView from "./components/views/JobDraftReviewView";
import JobFinalizingView from "./components/views/JobFinalizingView";
import JobCompletedView from "./components/views/JobCompletedView";
import JobErrorView from "./components/views/JobErrorView";

function AdminScheduleJobDetail() {
    const { jobId } = useParams();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Hàm tải dữ liệu (dùng lại khi socket báo hoàn thành)
    const fetchJob = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.admin.schedule.getJobDetails(jobId);
            setJob(res.data.data);
            setError(null);
        } catch (err) {
            console.error("Lỗi khi tải job:", err);
            setError(err.response?.data?.message || "Không tìm thấy job.");
        } finally {
            setLoading(false);
        }
    }, [jobId]);

    // 1. Tải dữ liệu lần đầu khi mount
    useEffect(() => {
        fetchJob();
    }, [fetchJob]);

    // 2. Lắng nghe Socket.IO
    useEffect(() => {
        // Kết nối tới socket
        socket.connect();

        // Lắng nghe sự kiện 'job_update' (cập nhật log)
        const handleJobUpdate = (data) => {
            if (data.jobId === jobId) {
                setJob((prevJob) => {
                    if (!prevJob) return null;
                    // Thêm log mới vào danh sách
                    const newLog = {
                        stage: data.stage,
                        message: data.message,
                        timestamp: new Date().toISOString(),
                    };
                    return {
                        ...prevJob,
                        logs: [...prevJob.logs, newLog],
                    };
                });
                if (data.stage === "DRAFT_READY" || data.stage === "ERROR") {
                    fetchJob();
                }
            }
        };

        // Lắng nghe sự kiện 'job_complete' hoặc 'job_error'
        const handleJobFinish = (data) => {
            if (data.jobId === jobId) {
                // Khi job hoàn thành (ra draft) hoặc lỗi, tải lại toàn bộ data
                fetchJob();
            }
        };

        socket.on("job_update", handleJobUpdate);
        socket.on("job_complete", handleJobFinish);
        socket.on("job_error", handleJobFinish);

        // Dọn dẹp khi component unmount
        return () => {
            socket.off("job_update", handleJobUpdate);
            socket.off("job_complete", handleJobFinish);
            socket.off("job_error", handleJobFinish);
            socket.disconnect();
        };
    }, [jobId, fetchJob]);

    // Hàm render view con dựa trên status
    const renderJobView = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center p-10 bg-white rounded-lg shadow">
                    <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
                    <p className="mt-4 text-lg text-gray-600">Đang tải chi tiết Job...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="p-10 bg-white rounded-lg shadow border border-red-200">
                    <h2 className="text-2xl font-semibold text-red-600">Tải thất bại</h2>
                    <p className="text-gray-700 mt-2">{error}</p>
                </div>
            );
        }

        if (!job) {
            return <p>Không có dữ liệu job.</p>;
        }

        switch (job.status) {
            case "pending":
            case "running":
                return <JobInProgressView job={job} />;
            case "draft":
                return <JobDraftReviewView job={job} onRefetch={fetchJob} />;
            case "finalizing":
                return <JobFinalizingView />;
            case "completed":
                return <JobCompletedView job={job} />;
            case "system_error":
                return <JobErrorView job={job} />;
            default:
                return <p>Trạng thái job không xác định: {job.status}</p>;
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <Link
                to="/admin/scheduler/dashboard"
                className="flex items-center text-purple-600 hover:text-purple-800 font-medium mb-4"
            >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Quay lại Dashboard Xếp Lịch
            </Link>

            {renderJobView()}
        </div>
    );
}

export default AdminScheduleJobDetail;