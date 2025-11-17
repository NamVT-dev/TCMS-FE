import React, { useEffect, useState } from "react";
import { Modal, Spin, Typography } from "antd";
import api from "../../../../utils/api";
import showToast from "../../../../utils/showToast";
import { Mail, Phone, Calendar, User as UserIcon } from "lucide-react";

const { Title } = Typography;

const StaffManageStudentDetail = ({ open, studentId, onClose }) => {
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open || !studentId) return;

        (async () => {
            setLoading(true);
            try {
                const res = await api.staff.getStudentDetail(studentId);
                const data = res?.data?.data;
                setStudent(data);
            } catch (err) {
                showToast.error(err?.response?.data?.message || "Không thể tải chi tiết giáo viên!");
            } finally {
                setLoading(false);
            }
        })();
    }, [open, studentId]);

    if (loading) {
        return (
            <Modal open={open} onCancel={onClose} footer={null}>
                <div className="text-center py-6"><Spin /></div>
            </Modal>
        );
    }

    if (!student) {
        return (
            <Modal open={open} onCancel={onClose} footer={null}>
                <div className="text-center py-6 text-gray-500">
                    Không có dữ liệu giáo viên
                </div>
            </Modal>
        );
    }

    const profile = student.profile || {};
    const email = student.email || "";
    const active = student.active;

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            width={850}
            title={
                <Title level={3} style={{ textAlign: "center", marginBottom: 0 }}>
                    Chi tiết giáo viên
                </Title>
            }
        >
            {/* Header */}
            <div className="rounded-lg overflow-hidden">
                <div className="h-40 bg-gradient-to-r from-purple-500 to-blue-500" />

                <div className="flex flex-col items-center -mt-16 mb-4">
                    <img
                        src={profile.photo}
                        alt="avatar"
                        className="w-28 h-28 rounded-full border-4 border-white shadow-md object-cover"
                    />

                    <h2 className="mt-2 text-2xl font-semibold">{profile.fullname}</h2>
                    <p className="text-gray-600 -mt-1">{email}</p>

                    <span
                        className={`px-3 py-1 mt-2 text-sm rounded-full font-medium ${active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}
                    >
                        {active ? "Đang hoạt động" : "Tạm ngưng"}
                    </span>
                </div>
            </div>

            {/* INFO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="border rounded-lg p-4 flex items-center gap-3">
                    <UserIcon className="text-purple-600 w-5 h-5" />
                    <p><b>Giới tính:</b> {profile.gender === "male" ? "Nam" : "Nữ"}</p>
                </div>

                <div className="border rounded-lg p-4 flex items-center gap-3">
                    <Calendar className="text-purple-600 w-5 h-5" />
                    <p><b>Ngày sinh:</b> {profile.dob ? new Date(profile.dob).toLocaleDateString("vi-VN") : "N/A"}</p>
                </div>

                <div className="border rounded-lg p-4 flex items-center gap-3">
                    <Mail className="text-purple-600 w-5 h-5" />
                    <p><b>Email:</b> {email}</p>
                </div>

                <div className="border rounded-lg p-4 flex items-center gap-3">
                    <Phone className="text-purple-600 w-5 h-5" />
                    <p><b>Số điện thoại:</b> {profile.phoneNumber || "N/A"}</p>
                </div>
            </div>

            {/* Skills */}
            {/* <div className="mt-8 border rounded-lg p-5">
                <h3 className="text-lg font-semibold mb-3">Kỹ năng giảng dạy</h3>
                {skills.length ? (
                    skills.map((skill, i) => (
                        <div key={i} className="p-3 bg-gray-50 border rounded shadow-sm mb-2">
                            <p className="font-semibold text-purple-700">
                                {skill.category?.name || "N/A"}
                            </p>
                            <p className="text-sm pl-2">
                                {skill.anyLevel ? "Tất cả level" : (skill.levels || []).join(", ")}
                            </p>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 text-sm">Chưa đăng ký kỹ năng</p>
                )}
            </div> */}
        </Modal>
    );
};

export default StaffManageStudentDetail;
