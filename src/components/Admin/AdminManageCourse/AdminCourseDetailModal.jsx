import React, { useEffect, useState } from "react";
import { Modal, Form, Input, InputNumber, Select, Spin } from "antd";
import api from "../../../utils/api";
import showToast from "../../../utils/showToast";

const { Option } = Select;

const AdminCourseDetailModal = ({ open, courseId, mode = "view", onClose, onUpdated }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const isEdit = mode === "edit";

    useEffect(() => {
        if (!open || !courseId) return;
        const fetchCourse = async () => {
            setLoading(true);
            try {
                const res = await api.admin.getCourseById(courseId); // Lấy thông tin khóa học
                console.log("res: ", res);
                const data = res?.data?.data?.course;
                console.log("Chi tiết khóa học: ", data);
                form.setFieldsValue({
                    name: data?.name,
                    price: data?.price,
                    category: data?.category,
                    level: data?.level,
                    session: data?.session,
                    durationInMinutes: data?.durationInMinutes,
                    description: data?.description || "",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [open, courseId, form]);

    const handleOk = () => {
        if (isEdit) form.submit(); // Nếu là chỉnh sửa thì submit form
        else onClose?.(); // Nếu không thì đóng modal
    };

    const onFinish = async (values) => {
        const toastId = showToast.loading("Đang cập nhật khóa học...");

        try {
            setSaving(true);

            // Gọi API cập nhật khóa học
            await api.admin.updateCourseById(courseId, {
                name: values.name,
                description: values.description?.trim(),
                price: Number(values.price),
                category: values.category,
                level: values.level,
                session: Number(values.session),
                durationInMinutes: Number(values.durationInMinutes),
            });

            // Update success message
            showToast.updateSuccess(toastId, "Cập nhật khóa học thành công!");

            form.resetFields();
            onUpdated?.();  // Reload dữ liệu
            onClose?.();    // Đóng modal
        } catch (err) {
            console.error(err);
            // Update error message
            showToast.updateError(
                toastId,
                err?.response?.data?.message || "Cập nhật khóa học thất bại!"
            );
        } finally {
            setSaving(false);
        }
    };


    return (
        <Modal
            open={open}
            title={isEdit ? "Chỉnh sửa khóa học" : "Chi tiết khóa học"}
            onCancel={onClose}
            onOk={handleOk}
            okText={isEdit ? "Lưu" : "Đóng"}
            confirmLoading={saving}
            destroyOnClose
        >
            {loading ? (
                <div className="py-6 text-center"><Spin /></div>
            ) : (
                <Form form={form} layout="vertical" onFinish={onFinish} disabled={!isEdit}>
                    <Form.Item
                        label="Tên khóa học"
                        name="name"
                        rules={[
                            { required: true, message: "Tên khóa học không được để trống" },
                            { max: 150, message: "Tên khóa học tối đa 150 ký tự" },
                        ]}
                    >
                        <Input placeholder="Nhập tên khóa học" />
                    </Form.Item>

                    <Form.Item
                        label="Mô tả"
                        name="description">
                        <Input.TextArea
                            rows={4}
                            placeholder="Nhập mô tả chi tiết về khóa học"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Giá (VNĐ)"
                        name="price"
                        rules={[{ required: true, message: "Vui lòng nhập giá khóa học" }]} >
                        <InputNumber
                            min={0}
                            style={{ width: "100%" }}
                            placeholder="Nhập giá khóa học"
                            formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                            parser={(v) => v.replace(/,/g, "")}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Danh mục"
                        name="category"
                        rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}>
                        <Select
                            allowClear
                            placeholder="Chọn danh mục (IELTS, TOEIC)"
                            options={[
                                { label: "IELTS", value: "IELTS" },
                                { label: "TOEIC", value: "TOEIC" },
                            ]}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Mức độ"
                        name="level"
                        rules={[{ required: true, message: "Vui lòng chọn mức độ" }]}>
                        <Select
                            allowClear
                            placeholder="Chọn mức độ (Beginner, Intermediate, Advanced)"
                            options={[
                                { label: "Beginner", value: "Beginner" },
                                { label: "Intermediate", value: "Intermediate" },
                                { label: "Advanced", value: "Advanced" },
                            ]}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Số buổi học"
                        name="session"
                        rules={[{ required: true, message: "Vui lòng nhập số buổi học" }]}>
                        <InputNumber min={1} style={{ width: "100%" }} placeholder="Nhập số buổi học" />
                    </Form.Item>

                    <Form.Item
                        label="Thời lượng buổi học (phút)"
                        name="durationInMinutes"
                        rules={[{ required: true, message: "Vui lòng nhập thời lượng mỗi buổi" }]}>
                        <InputNumber min={1} style={{ width: "100%" }} placeholder="Nhập thời lượng (phút)" />
                    </Form.Item>
                </Form>
            )}
        </Modal>
    );
};

export default AdminCourseDetailModal;
