// src/components/Admin/AdminManageCourse/AdminCreateCourseModal.jsx
import React, { useState } from "react";
import { Modal, Form, Input, InputNumber, Select } from "antd";
import api from "../../../utils/api";
import showToast from "../../../utils/showToast";

const AdminCreateCourseModal = ({ open, onClose, onSuccess }) => {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const handleOk = () => form.submit();

    const LEVEL_OPTIONS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
    const CATEGORY_OPTIONS = ["IELTS", "TOEIC"];
    const { TextArea } = Input;

    const onFinish = async (values) => {
        const toastId = showToast.loading("Đang tạo khóa học...");
        try {
            setSubmitting(true);
            // Gửi request tạo khóa học
            await api.admin.createCourse({
                name: values.name,
                description: values.description?.trim(),
                price: Number(values.price),
                category: values.category,
                level: values.level,
                session: Number(values.session),
                durationInMinutes: Number(values.durationInMinutes)
            });
            // Cập nhật thông báo thành công
            showToast.updateSuccess(toastId, "Thêm mới khó học thành công!");
            // Reset form và gọi callback success
            form.resetFields();
            onSuccess?.();
            onClose?.();
        } catch (err) {
            console.error(err);
            // Cập nhật thông báo lỗi
            showToast.updateError(
                toastId,
                err?.response?.data?.message || "Thêm mới khóa học thất bại!"
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onClose?.();
    };

    return (
        <Modal
            title="Thêm mới khóa học"
            open={open}
            onOk={handleOk}
            onCancel={handleCancel}
            confirmLoading={submitting}
            okText="Thêm mới"
            cancelText="Hủy"
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                    levels: "",
                    categories: "",
                    session: "",
                    durationInMinutes: "",
                    price: "",
                    description: "",
                }}
            >
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
                    label="Mô tả khóa học"
                    name="description"
                    rules={[{ max: 1000, message: "Mô tả tối đa 1000 ký tự" }]}
                >
                    <TextArea
                        rows={4}
                        showCount
                        maxLength={1000}
                        placeholder="Nhập mô tả chi tiết về khóa học (tối đa 1000 ký tự)"
                    />
                </Form.Item>

                <Form.Item
                    label="Giá (VNĐ)"
                    name="price"
                    rules={[{ required: true, message: "Giá khóa học không được để trống" }]}
                >
                    <InputNumber
                        min={0}
                        style={{ width: "100%" }}
                        placeholder="Nhập giá (VNĐ)"
                        formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        parser={(v) => v.replace(/,/g, "")}
                    />
                </Form.Item>

                <Form.Item
                    label="Danh mục"
                    name="category"
                    rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
                >
                    <Select
                        allowClear
                        placeholder="Chọn danh mục (IELTS, TOEIC)"
                        options={CATEGORY_OPTIONS.map((c) => ({ label: c, value: c }))}
                    />
                </Form.Item>

                <Form.Item
                    label="Mức độ"
                    name="level"
                    rules={[{ required: true, message: "Vui lòng chọn mức độ" }]}
                >
                    <Select
                        allowClear
                        placeholder="Chọn mức độ (Beginner, Intermediate, Advanced)"
                        options={LEVEL_OPTIONS.map((c) => ({ label: c, value: c }))}
                    />
                </Form.Item>

                <Form.Item
                    label="Số buổi học"
                    name="session"
                    rules={[
                        { required: true, message: "Số buổi học không được để trống" },
                        {
                            validator: (_, value) => {
                                if (value === undefined || value === "") return Promise.resolve();
                                const num = Number(value);
                                if (isNaN(num)) return Promise.reject("Giá trị phải là số");
                                if (num < 1) return Promise.reject("Số buổi học phải ≥ 1");
                                return Promise.resolve();
                            },
                        },
                    ]}
                >
                    <Input placeholder="Vui lòng nhập số buổi học" />
                </Form.Item>

                <Form.Item
                    label="Thời lượng buổi học (phút)"
                    name="durationInMinutes"
                    rules={[
                        { required: true, message: "Thời lượng buổi học không được để trống" },
                        {
                            validator: (_, value) => {
                                if (value === undefined || value === "") return Promise.resolve();
                                const num = Number(value);
                                if (isNaN(num)) return Promise.reject("Giá trị phải là số");
                                if (num < 1) return Promise.reject("Số buổi học phải ≥ 1");
                                return Promise.resolve();
                            },
                        },
                    ]}
                >
                    <Input placeholder="Vui lòng nhập thời lượng (phút) buổi học" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AdminCreateCourseModal;
