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
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        total: 0,
        results: 0,
    });

    const [openDetail, setOpenDetail] = useState(false);
    const [detailMode, setDetailMode] = useState("view");
    const [learnnerID, setlearnnerID] = useState(null);

    const fetchLearnerProfiles = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = { page: currentPage, limit: PAGE_SIZE };
            const response = await api.user.getLearnerProfile(params);

            const data = response?.data?.data ?? [];

            setLearnerProfiles(data);

            const total = data.total ?? 0;
            const results = data.results ?? 1;

            setLearnerProfiles(data ?? []);
            setPagination({
                page: data.page ?? currentPage,
                totalPages: Math.ceil(total / PAGE_SIZE),
                total,
                results,
            });
        } catch (err) {
            console.error(err);
            setError("Không thể tải dữ liệu thông tin khóa học.");
        } finally {
            setLoading(false);
        }
    }, [currentPage]);

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
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "16px",
                }}
            >
                {LearnerProfiles.length > 0 ? (
                    LearnerProfiles.map((LearnerProfiles) => (
                        <Card
                            key={LearnerProfiles._id}
                            style={{
                                borderRadius: 12,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            }}
                            actions={[
                                <div key="view" style={{ display: "flex", justifyContent: "center" }}>
                                    <Eye onClick={() => handleView(LearnerProfiles._id)} />
                                </div>,
                                <div key="edit" style={{ display: "flex", justifyContent: "center" }}>
                                    <Edit onClick={() => handleEdit(LearnerProfiles._id)} />
                                </div>
                            ]}
                        >
                            {/* <img
                                src={LearnerProfiles.imageCover}
                                alt={LearnerProfiles.imageCover}
                                style={{
                                    width: "100%",
                                    height: 160,
                                    objectFit: "cover",
                                    borderBottom: "1px solid #f0f0f0",
                                }}
                            /> */}
                            <Card.Meta
                                title={<Title style={{ textAlign: "center", marginTop: 8, marginBottom: 0 }} level={3}>{LearnerProfiles.name}</Title>}
                                description={
                                    <div
                                        style={{
                                            textAlign: "center",
                                            marginTop: 8
                                        }}>
                                        <Text strong className="text-purple-700"> {LearnerProfiles.testScore || ""} {LearnerProfiles.category[0].name || ""}
                                        </Text>
                                    </div>
                                }
                            />
                        </Card>
                    ))
                ) : (
                    <div className="text-center text-gray-500 w-full py-10">
                        Không có dữ liệu thông tin học viên.
                    </div>
                )}
            </div>


            {/* Pagination */}
            <div className="mt-8 flex items-center justify-between">
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
            </div>

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