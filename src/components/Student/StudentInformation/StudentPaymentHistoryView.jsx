import React, { useState, useEffect, useCallback } from "react";
// import api from "../../../utils/api";
import { Tag, Tooltip } from 'antd';
import { Search, Eye } from "lucide-react";
import PaymentHistoryDetailModal from "./PaymentHistoryDetailModal";

const StudentPaymentHistoryView = () => {
    const [paymentHistorys, setPaymentHistorys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    //const [searchTerm, setSearchTerm] = useState("");
    const [detailMode, setDetailMode] = useState("view");
    const [openDetail, setOpenDetail] = useState(false);
    const [paymentId, setPaymentId] = useState(null);

    // Phân trang
    const PAGE_SIZE = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        total: 0,
        results: 0,
    });

    const listPaymentHistorys = [
        {
            id: 1,
            name: "Khóa học IELTS 7.5",
            amount: "1000000",
            status: "active",
            studentCode: "ST001",
        },
        {
            id: 2,
            name: "Ielts từ mất gốc - 3.5  đến Ielts 6.5",
            amount: "1000000",
            status: "inactive",
            studentCode: "ST001",
        }
    ];

    // const fetchPaymentHistorys = useCallback(async () => {
    //     setLoading(true);
    //     setError(null);
    //     try {
    //         const params = { page: currentPage, limit: PAGE_SIZE, search: searchTerm };
    //         const response = await api.admin.getRooms(params);

    //         const data = response.data;
    //         const total = data.total ?? 0;
    //         const results = data.results;

    //         setPaymentHistorys(response.data.data.rooms);
    //         setPagination({
    //             page: data.page ?? currentPage,
    //             totalPages: Math.ceil(total / PAGE_SIZE),
    //             total,
    //             results,
    //         });
    //     } catch (err) {
    //         console.error(err);
    //         setError("Không thể tải dữ liệu lịch sử thanh toán.");
    //     } finally {
    //         setLoading(false);
    //     }
    // }, [currentPage, searchTerm]);

    const fetchPaymentHistorys = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const total = listPaymentHistorys.length;
            const results = listPaymentHistorys.slice(
                (currentPage - 1) * PAGE_SIZE,
                currentPage * PAGE_SIZE
            );

            setPaymentHistorys(results);
            setPagination({
                page: currentPage,
                totalPages: Math.ceil(total / PAGE_SIZE),
                total,
                results: results.length,
            });
        } catch (err) {
            console.error(err);
            setError("Không thể tải dữ liệu lịch sử thanh toán.");
        } finally {
            setLoading(false);
        }
    }, [currentPage]);


    useEffect(() => {
        const debounce = setTimeout(() => fetchPaymentHistorys(), 500);
        return () => clearTimeout(debounce);
    }, [fetchPaymentHistorys]);

    const handleView = (id) => {
        setPaymentId(id);
        setDetailMode("edit");
        setOpenDetail(true);
    };

    if (loading) return <div className="p-6 text-center">Đang tải dữ liệu...</div>;
    if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Danh sách lịch sử thanh toán</h1>
                <p className="text-gray-600">Lịch sử thanh toán</p>
            </div>

            {/* Search + Create Button */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Xử lý chưa xong..."
                            // value={searchTerm}
                            // onChange={(e) => {
                            //     setSearchTerm(e.target.value);
                            //     setCurrentPage(1);
                            // }}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">STT</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Tên sản phẩm</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Thành tiền</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Thao tác</th>

                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {paymentHistorys.length > 0 ? (
                                paymentHistorys.map((paymentHistory, index) => (
                                    <tr key={paymentHistory._id} className="hover:bg-gray-50 transition-colors duration-150">
                                        <td className="px-6 py-4 font-medium text-gray-800">
                                            {(currentPage - 1) * PAGE_SIZE + index + 1}
                                        </td>
                                        <td className="px-6 py-4">{paymentHistory.name}</td>
                                        <td className="px-6 py-4">{paymentHistory.amount}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 text-xs font-medium rounded-full">
                                                <Tag
                                                    color={paymentHistory.status === "active" ? "#00B1FF" : "#D79F45"}
                                                >
                                                    {paymentHistory.status === "active" ? "Hoàn Thành" : "Chưa Hoàn Thành"}
                                                </Tag>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Tooltip placement="topLeft" title={"Xem chi tiết thanh toán"} >
                                                <button onClick={() => handleView(paymentHistory._id)} title="xem chi tiết">
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                            </Tooltip>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">Không có dữ liệu lịch sử thanh toán</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination bar */}
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                    <div className="text-sm text-gray-700">
                        Hiển thị <span className="font-medium">{pagination.results}</span>{" "}
                        trong tổng số <span className="font-medium">{pagination.total}</span> thanh toán
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
                            onClick={() =>
                                setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
                            }
                            disabled={currentPage === pagination.totalPages}
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Sau
                        </button>
                    </div>
                </div>
            </div>

            <PaymentHistoryDetailModal
                open={openDetail}
                paymentId={paymentId}
                categories={paymentHistorys}
                mode={detailMode}
                onClose={() => setOpenDetail(false)}
                onUpdated={fetchPaymentHistorys}
            />

        </div>
    );

}
export default StudentPaymentHistoryView;