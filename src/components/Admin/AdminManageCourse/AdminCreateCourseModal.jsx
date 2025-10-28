import React, { useState } from "react";
import {
    Modal,
    Form,
    Input,
    InputNumber,
    Select,
    Row,
    Col,
    Upload,
    Typography
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import api from "../../../utils/api";
import showToast from "../../../utils/showToast";

const AdminCreateCourseModal = ({ open, onClose, onSuccess, categories }) => {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [fileList, setFileList] = useState([]);
    const { Title } = Typography;

    const LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced"];
    const CATEGORY_OPTIONS = categories?.data || [];
    const { TextArea } = Input;

    const beforeUpload = (file) => {
        const isImage = file.type.startsWith("image/");
        const isLt5MB = file.size / 1024 / 1024 <= 5;

        if (!isImage) {
            showToast.error("Chỉ được tải lên file ảnh!");
            return Upload.LIST_IGNORE;
        }
        if (!isLt5MB) {
            showToast.error("Ảnh tối đa 5MB!");
            return Upload.LIST_IGNORE;
        }
        return false;
    };

    const onUploadChange = ({ fileList: newList }) => {
        const latest = newList.slice(-1);
        setFileList(latest);

        const file = latest[0]?.originFileObj;
        if (file) {
            setImageFile(file);
            setImageUrl(URL.createObjectURL(file));
        }
    };

    const onFinish = async (values) => {
        const toastId = showToast.loading("Đang tạo khóa học...");
        try {
            setSubmitting(true);

            const fd = new FormData();
            fd.append("name", values.name);
            fd.append("description", values.description || "");
            fd.append("price", String(values.price));
            fd.append("category", values.category);
            fd.append("level", values.level);
            fd.append("session", String(values.session));
            fd.append("durationInMinutes", String(values.durationInMinutes));

            if (imageFile) {
                fd.append("imageCover", imageFile);
            }

            await api.admin.createCourse(fd);

            showToast.updateSuccess(toastId, "Thêm mới khóa học thành công!");
            form.resetFields();
            setFileList([]);
            setImageUrl(null);

            onSuccess?.();
            onClose?.();
        } catch (err) {
            console.error(err);
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
        setFileList([]);
        setImageUrl(null);
        onClose?.();
    };

    return (
        <Modal
            title={
                <Title level={3} style={{ margin: 0, textAlign: "center" }}>
                    Thêm mới khóa học
                </Title>
            }
            open={open}
            onOk={() => form.submit()}
            onCancel={handleCancel}
            confirmLoading={submitting}
            okText="Thêm mới"
            cancelText="Hủy"
            destroyOnClose
            width={700}
        >
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Row gutter={[16, 16]}>
                    {/* Upload ảnh */}
                    <Col xs={24} md={8}>
                        <Form.Item
                            label={<span style={{ fontWeight: 600 }}></span>}
                        >
                            <Upload
                                listType="picture-card"
                                showUploadList={false}
                                accept="image/*"
                                beforeUpload={beforeUpload}
                                onChange={onUploadChange}
                                fileList={fileList}
                                style={{ width: "100%" }}
                            >
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt="preview"
                                        style={{
                                            width: "100%",
                                            aspectRatio: "1/1",
                                            objectFit: "cover",
                                            borderRadius: 8,
                                        }}
                                    />
                                ) : (
                                    <div>
                                        <PlusOutlined />
                                        <div style={{ marginTop: 8 }}>Tải ảnh</div>
                                    </div>
                                )}
                            </Upload>
                        </Form.Item>
                    </Col>

                    {/* Form text */}
                    <Col xs={24} md={16}>
                        <Form.Item
                            label={<span style={{ fontWeight: 600 }}>Tên khóa học</span>}
                            name="name"
                            rules={[
                                { required: true, message: "Tên khóa học không được để trống!" },
                                { max: 150, message: "Tối đa 150 ký tự" },
                            ]}
                        >
                            <Input placeholder="Nhập tên khóa học" />
                        </Form.Item>

                        <Form.Item
                            label={<span style={{ fontWeight: 600 }}>Danh mục</span>}
                            name="category"
                            rules={[{ required: true, message: "Danh mục không được để trống!" }]}
                        >
                            <Select
                                placeholder="Chọn danh mục"
                                options={CATEGORY_OPTIONS.map((c) => ({
                                    label: c.name,
                                    value: c._id,
                                }))}
                            />
                        </Form.Item>

                        <Row gutter={[12, 12]}>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label={<span style={{ fontWeight: 600 }}>Mức độ</span>}
                                    name="level"
                                    rules={[{ required: true, message: "Mức độ không được để trống!" }]}
                                >
                                    <Select
                                        placeholder="Chọn mức độ"
                                        options={LEVEL_OPTIONS.map((lv) => ({
                                            label: lv,
                                            value: lv,
                                        }))}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label={<span style={{ fontWeight: 600 }}>Giá (VND)</span>}
                                    name="price"
                                    rules={[{ required: true, message: "Giá không được để trống!" }]}
                                >
                                    <InputNumber
                                        min={0}
                                        style={{ width: "100%" }}
                                        placeholder="Nhập giá"
                                        formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                        parser={(v) => v.replace(/,/g, "")}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Col>
                </Row>

                {/* Còn lại */}
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label={<span style={{ fontWeight: 600 }}>Số buổi học</span>}
                            name="session"
                            rules={[{ required: true, message: "Số buổi học không được để trống!" }]}
                        >
                            <InputNumber min={1} style={{ width: "100%" }} placeholder="Nhập số buổi học" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label={<span style={{ fontWeight: 600 }}>Thời lượng buổi học (phút)</span>}
                            name="durationInMinutes"
                            rules={[{ required: true, message: "Thời lượng buổi học không được để trống!" }]}
                        >
                            <InputNumber min={1} style={{ width: "100%" }} placeholder="Nhập thời lượng buổi học" />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    label={<span style={{ fontWeight: 600 }}>Mô tả</span>}
                    name="description"
                    rules={[{ required: true, message: "Mô tả không được để trống!" }]}
                >
                    <TextArea rows={4} placeholder="Nhập mô tả về khóa học" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AdminCreateCourseModal;
