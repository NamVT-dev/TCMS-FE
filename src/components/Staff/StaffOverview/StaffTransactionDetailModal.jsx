import React, { useEffect, useState } from "react";
import { Modal, Spin } from "antd";
import {
    Mail,
    Phone,
    Calendar,
    User as UserIcon,
    CreditCard,
    Receipt,
    CheckCircle,
    XCircle,
    DollarSign,
    FileText
} from "lucide-react";
import showToast from "../../../utils/showToast";
import api from "../../../utils/api";

const StaffTransactionDetailModal = ({ open, transactionId, onClose }) => {
    const [transaction, setTransaction] = useState(null);
    const [loading, setLoading] = useState(false);

    // 📌 Format số tiền VND
    const formatMoney = (amount) =>
        Number(amount).toLocaleString("vi-VN") + " VND";

    useEffect(() => {
        if (!open || !transactionId) return;

        (async () => {
            setLoading(true);
            try {
                const res = await api.staff.getTransactionDetail(transactionId);
                const data = res?.data?.data;
                setTransaction(data.data);
            } catch (err) {
                showToast.error(err?.response?.data?.message || "Không thể tải chi tiết giao dịch!");
            } finally {
                setLoading(false);
            }
        })();
    }, [open, transactionId]);

    if (loading || !transaction) {
        return (
            <Modal open={open} onCancel={onClose} footer={null}>
                <div className="py-8 text-center">
                    <Spin size="large" />
                </div>
            </Modal>
        );
    }

    const user = transaction.user || {};
    const profile = user.profile || {};

    console.log("Transaction user: ", user);
    console.log("Transaction profile: ", profile);
    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            width={900}
            title={null}
            className="no-padding-modal"
        >
            {/* HEADER */}
            <div className="rounded-lg overflow-hidden -mt-6">
                <div className="h-40 bg-gradient-to-r from-purple-500 to-blue-500" />

                <div className="flex flex-col items-center -mt-16 mb-4">
                    <img
                        src={profile.photo}
                        alt="avatar"
                        className="w-28 h-28 rounded-full border-4 border-white shadow-md object-cover"
                    />

                    <h2 className="mt-2 text-2xl font-semibold text-gray-900">
                        {profile.fullname}
                    </h2>

                    <p className="text-gray-600 -mt-1">{user.email}</p>

                    <span
                        className={`px-3 py-1 mt-2 text-sm rounded-full font-medium ${user.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}
                    >
                        {user.active ? "Đang hoạt động" : "Tạm ngưng"}
                    </span>
                </div>
            </div>

            {/* USER INFO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="border rounded-lg p-4 flex items-center gap-3">
                    <UserIcon className="text-purple-600 w-5 h-5" />
                    <p>
                        <b>Giới tính:</b> {profile.gender === "male" ? "Nam" : "Nữ"}
                    </p>
                </div>

                <div className="border rounded-lg p-4 flex items-center gap-3">
                    <Calendar className="text-purple-600 w-5 h-5" />
                    <p>
                        <b>Ngày sinh:</b>{" "}
                        {profile.dob ? new Date(profile.dob).toLocaleDateString("vi-VN") : "N/A"}
                    </p>
                </div>

                <div className="border rounded-lg p-4 flex items-center gap-3">
                    <Mail className="text-purple-600 w-5 h-5" />
                    <p>
                        <b>Email:</b> {user.email}
                    </p>
                </div>

                <div className="border rounded-lg p-4 flex items-center gap-3">
                    <Phone className="text-purple-600 w-5 h-5" />
                    <p>
                        <b>Số điện thoại:</b> {profile.phoneNumber || "N/A"}
                    </p>
                </div>
            </div>

            {/* TRANSACTION INFO */}
            <div className="mt-8 border rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin giao dịch</h3>

                <div className="space-y-3">

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                        <Receipt className="w-5 h-5 text-purple-600" />
                        <p><b>Mã giao dịch:</b> {transaction.invoiceId}</p>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                        <FileText className="w-5 h-5 text-purple-600" />
                        <p><b>Nội dung:</b> {transaction.description}</p>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                        <DollarSign className="w-5 h-5 text-purple-600" />
                        <p><b>Số tiền:</b> {formatMoney(transaction.amount)}</p>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                        <CreditCard className="w-5 h-5 text-purple-600" />
                        <p><b>Phương thức:</b> {transaction.method?.toUpperCase()}</p>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        <p>
                            <b>Ngày thanh toán:</b>{" "}
                            {new Date(transaction.createdAt).toLocaleString("vi-VN")}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                        {transaction.status === "succeeded" ? (
                            <CheckCircle className="text-green-600 w-5 h-5" />
                        ) : (
                            <XCircle className="text-red-600 w-5 h-5" />
                        )}

                        <p>
                            <b>Trạng thái:</b>{" "}
                            {transaction.status === "succeeded"
                                ? "Thành công"
                                : "Không thành công"}
                        </p>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default StaffTransactionDetailModal;
