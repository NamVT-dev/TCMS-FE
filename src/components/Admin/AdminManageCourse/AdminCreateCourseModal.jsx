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
    Typography,
    Spin
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
    const { TextArea } = Input;

    const LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced"];
    
    
    const categoryOptions = (Array.isArray(categories) ? categories : categories?.data || []).map(c => ({
        label: c.name,
        value: c._id
    }));

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
            
            handleCancel(); // Reset và đóng
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error(err);
            showToast.updateError(toastId, err?.response?.data?.message || "Thêm mới thất bại!");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setFileList([]);
        setImageUrl(null);
        if (onClose) onClose();
    };

    return (
        <Modal
            title={<Title level={4} style={{ margin: 0, textAlign: "center" }}>Thêm mới khóa học</Title>}
            open={open}
            onOk={() => form.submit()}
            onCancel={handleCancel}
            confirmLoading={submitting}
            okText="Thêm mới"
            cancelText="Hủy"
            
            destroyOnHidden 
            width={800}
            centered
        >
            
            <Spin spinning={submitting}>
                <Form form={form} layout="vertical" onFinish={onFinish} className="mt-4">
                    <Row gutter={[24, 24]}>
                        <Col xs={24} md={8}>
                            <Form.Item label={<span className="font-semibold">Hình ảnh</span>}>
                                <Upload
                                    listType="picture-card"
                                    showUploadList={false}
                                    accept="image/*"
                                    beforeUpload={beforeUpload}
                                    onChange={onUploadChange}
                                    fileList={fileList}
                                    className="w-full"
                                >
                                    {imageUrl ? (
                                        <img src={imageUrl} alt="preview" className="w-full h-full object-cover rounded-lg" style={{AspectRatio: "1/1"}} />
                                    ) : (
                                        <div>
                                            <PlusOutlined />
                                            <div style={{ marginTop: 8 }}>Tải ảnh</div>
                                        </div>
                                    )}
                                </Upload>
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={16}>
                            <Form.Item
                                label={<span className="font-semibold">Tên khóa học</span>}
                                name="name"
                                rules={[{ required: true, message: "Vui lòng nhập tên" }]}
                            >
                                <Input placeholder="Nhập tên khóa học" />
                            </Form.Item>

                            <Form.Item
                                label={<span className="font-semibold">Danh mục</span>}
                                name="category"
                                rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
                            >
                                <Select placeholder="Chọn danh mục" options={categoryOptions} />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        label={<span className="font-semibold">Mức độ</span>}
                                        name="level"
                                        rules={[{ required: true }]}
                                    >
                                        <Select placeholder="Chọn mức độ" options={LEVEL_OPTIONS.map(l => ({ label: l, value: l }))} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label={<span className="font-semibold">Giá (VND)</span>}
                                        name="price"
                                        rules={[{ required: true }]}
                                    >
                                        <InputNumber
                                            style={{ width: "100%" }}
                                            formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                            parser={(v) => v.replace(/,/g, "")}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label={<span className="font-semibold">Số buổi</span>} name="session" rules={[{ required: true }]}>
                                <InputNumber min={1} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={<span className="font-semibold">Thời lượng (phút)</span>} name="durationInMinutes" rules={[{ required: true }]}>
                                <InputNumber min={1} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item label={<span className="font-semibold">Mô tả</span>} name="description">
                        <TextArea rows={4} placeholder="Nhập mô tả..." />
                    </Form.Item>
                </Form>
            </Spin>
        </Modal>
    );
};

export default AdminCreateCourseModal;