import React, { useState, useEffect, useCallback } from "react";
import api from "../../../utils/api";
import { Modal, Card, Avatar, Flex, Typography, Switch } from "antd";
import { Search, Trash2, Eye, Edit } from "lucide-react";
import LearnerProfileDetailModal from "./LearnerProfileDetailModal";

const { Title, Text } = Typography;

const LearnerProfileView = () => {

    const [LearnerProfiles, setLearnerProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const PAGE_SIZE = 8;
    // const [currentPage, setCurrentPage] = useState(1);
    // const [pagination, setPagination] = useState({
    //     page: 1,
    //     totalPages: 1,
    //     total: 0,
    //     results: 0,
    // });

    const [openDetail, setOpenDetail] = useState(false);
    const [detailMode, setDetailMode] = useState("view");
    const [learnnerID, setlearnnerID] = useState(null);

    const fetchLearnerProfiles = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                // page: currentPage, 
                limit: PAGE_SIZE
            };
            const response = await api.user.getLearnerProfile(params);

            const data = response?.data?.data ?? [];

            setLearnerProfiles(data);

            // const total = data.total ?? 0;
            // const results = data.results ?? 1;

            setLearnerProfiles(data ?? []);
            // setPagination({
            //     page: data.page ?? currentPage,
            //     totalPages: Math.ceil(total / PAGE_SIZE),
            //     total,
            //     results,
            // });
        } catch (err) {
            console.error(err);
            setError("Không thể tải dữ liệu thông tin khóa học.");
        } finally {
            setLoading(false);
        }
    }, [
        // currentPage
    ]);

    useEffect(() => {
        fetchLearnerProfiles();
    }, [fetchLearnerProfiles]);

    const handleView = (id) => {
        setlearnnerID(id);
        setDetailMode("view");
        setOpenDetail(true);
    };

    const handleEdit = (id) => {
        setlearnnerID(id);
        setDetailMode("edit");
        setOpenDetail(true);
    };

    if (loading) return <div className="p-6 text-center">Đang tải dữ liệu...</div>;
    if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Thông tin học viên</h1>
                <p className="text-gray-600">Danh sách học viên đã đăng ký</p>
            </div>

            {/* Cards layout */}
            <div className="w-full bg-white rounded-xl shadow-md p-6">
                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-left text-gray-700">
                                <th className="p-4 font-semibold">Học viên</th>
                                <th className="p-4 font-semibold">Điểm thi</th>
                                <th className="p-4 font-semibold">Chứng chỉ</th>
                                <th className="p-4 font-semibold text-center">Thao tác</th>
                            </tr>
                        </thead>

                        <tbody>
                            {LearnerProfiles.map((item) => (
                                <tr
                                    key={item._id}
                                    className="border-b hover:bg-gray-50 transition-all"
                                >
                                    {/* Avatar + Name */}
                                    <td className="p-4 flex items-center gap-4">
                                        <img
                                            src={item.photo}
                                            alt=""
                                            className="w-14 h-14 rounded-full object-cover border"
                                        />
                                        <span className="text-gray-800 font-medium text-[15px]">
                                            {item.name}
                                        </span>
                                    </td>

                                    {/* Score */}
                                    <td className="p-4">
                                        <span className="text-purple-600 font-semibold">
                                            {item.testScore}
                                        </span>
                                    </td>

                                    {/* Certificate Badge */}
                                    <td className="p-4">
                                        <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium">
                                            {item.category?.[0]?.name}
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center gap-6">
                                            <button
                                                onClick={() => handleView(item._id)}
                                                className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                                            >
                                                <Eye size={20} />
                                            </button>

                                            <button
                                                onClick={() => handleEdit(item._id)}
                                                className="text-green-600 hover:text-green-800 transition-colors duration-200"
                                            >
                                                <Edit size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Pagination */}
            {/* <div className="mt-8 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                    Hiển thị <span className="font-medium">{pagination.results}</span> /
                    <span className="font-medium">{pagination.total}</span> khóa học
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Trước
                    </button>
                    <span className="px-3 py-1 text-sm">
                        Trang {pagination.page} / {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                        disabled={currentPage === pagination.totalPages}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Sau
                    </button>
                </div>
            </div> */}

            {/* Modals */}
            <LearnerProfileDetailModal
                open={openDetail}
                learnnerID={learnnerID}
                mode={detailMode}
                onClose={() => setOpenDetail(false)}
                onUpdated={fetchLearnerProfiles}
            />
        </div>
    );
}

export default LearnerProfileView;