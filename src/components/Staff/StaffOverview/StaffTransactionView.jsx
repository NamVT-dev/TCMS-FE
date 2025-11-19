import React, { useState, useEffect, useCallback } from 'react';
import { Search, Eye, Loader2 } from 'lucide-react';
import { useDebounce } from '../../../hooks/useDebounce';
import api from '../../../utils/api';
import StaffTransactionDetailModal from './StaffTransactionDetailModal';

// Component Pagination
const Pagination = ({ page, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pages = [...Array(totalPages).keys()].map(i => i + 1);

    return (
        <div className="flex space-x-2">
            <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
                Trước
            </button>

            {pages.map(p => (
                <button
                    key={p}
                    onClick={() => onPageChange(p)}
                    className={`px-3 py-1 rounded-md text-sm ${
                        p === page 
                            ? 'bg-purple-600 text-white' 
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    {p}
                </button>
            ))}

            <button
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
                Sau
            </button>
        </div>
    );
};

const StaffTransactionView = () => {

    // DATA STATES
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // FILTER STATES
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // PAGINATION
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const limit = 10;

    // DETAIL MODAL
    const [openDetail, setOpenDetail] = useState(false);
    const [transactionId, setTransactionId] = useState(null);

    const handleView = (id) => {
        setTransactionId(id);
        setOpenDetail(true);
    };

    // FETCH DATA
    const fetchTransaction = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const params = {
                page,
                limit,
                search: debouncedSearch || undefined,
                status: selectedStatus || undefined,
            };

            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const res = await api.staff.getTransactions(params);
            const data = res.data;

            setTransactions(data.data.data);
            setPage(data.page);
            setTotalPages(data.totalPages);
            setTotalResults(data.total);

        } catch (err) {
            console.error(err);
            setError("Không thể tải dữ liệu giao dịch.");
        } finally {
            setLoading(false);
        }

    }, [page, debouncedSearch, selectedStatus, startDate, endDate]);

    useEffect(() => {
        fetchTransaction();
    }, [fetchTransaction]);


    const getStatusBadge = (status) =>
        status === "succeeded"
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800";

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Danh sách giao dịch</h1>
                <p className="text-gray-600">Quản lý thông tin giao dịch hệ thống</p>
            </div>

            {/* FILTER BOX */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Nhập mã giao dịch"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    {/* Select Status */}
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="">Chọn trạng thái</option>
                        <option value="succeeded">Thành công</option>
                        <option value="failed">Không thành công</option>
                    </select>

                    {/* Date Range */}
                    <div className="flex gap-2">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />

                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                </div>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase">STT</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Email</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Mã giao dịch</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Nội dung</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Số tiền</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Trạng thái</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold uppercase">Thao tác</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center p-6">
                                        <Loader2 className="w-8 h-8 mx-auto animate-spin text-purple-600" />
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="7" className="text-center p-6 text-red-500">{error}</td>
                                </tr>
                            ) : transactions.length > 0 ? (
                                transactions.map((transaction, index) => (
                                    <tr key={transaction._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">{(page - 1) * limit + index + 1}</td>
                                        <td className="px-6 py-4">{transaction.user?.email}</td>
                                        <td className="px-6 py-4">{transaction.invoiceId}</td>
                                        <td className="px-6 py-4">{transaction.description}</td>
                                        <td className="px-6 py-4">
                                            {Number(transaction.amount).toLocaleString("vi-VN")} {transaction.currency}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(transaction.status)}`}>
                                                {transaction.status === "succeeded" ? "Thành công" : "Không thành công"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Eye size={20} onClick={() => handleView(transaction._id)} className="cursor-pointer" />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center p-6">Không có giao dịch nào</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                {!loading && totalResults > 0 && (
                    <div className="px-6 py-4 border-t flex justify-between">
                        <p className="text-sm">
                            Hiển thị <b>{(page - 1) * limit + 1}</b> – <b>{Math.min(page * limit, totalResults)}</b> / <b>{totalResults}</b>
                        </p>
                        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                    </div>
                )}
            </div>

            {/* MODAL DETAIL */}
            <StaffTransactionDetailModal
                open={openDetail}
                transactionId={transactionId}
                onClose={() => setOpenDetail(false)}
            />

        </div>
    );
};

export default StaffTransactionView;
