import React, { useEffect, useState } from "react";
import {
    Modal,
    Form,
    Input,
    InputNumber,
    Select,
    Spin,
    Typography,
    Row,
    Col,
    Upload,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import api from "../../../utils/api";
import showToast from "../../../utils/showToast";

const { Option } = Select;

const AdminCourseDetailModal = ({
    open,
    courseId,
    mode = "view",
    onClose,
    onUpdated,
    categories,
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const isEdit = mode === "edit";
    const { Title } = Typography;
    // preview & file state
    const [imageUrl, setImageUrl] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [fileList, setFileList] = useState([]);

    useEffect(() => {
        if (!open || !courseId) return;
        (async () => {
            setLoading(true);
            try {
                const res = await api.admin.getCourseById(courseId);
                const data = res?.data?.data?.course;

                form.setFieldsValue({
                    name: data?.name,
                    price: data?.price,
                    category: data?.category?._id,
                    level: data?.level,
                    session: data?.session,
                    durationInMinutes: data?.durationInMinutes,
                    description: data?.description || "",
                });

                setImageUrl(data?.imageCover || "");
                setFileList([]);
            } finally {
                setLoading(false);
            }
        })();
    }, [open, courseId, form]);

    const onFinish = async (values) => {
        const toastId = showToast.loading("Đang cập nhật khóa học...");
        try {
            const fd = new FormData();
            fd.append("name", values.name);
            fd.append("price", String(values.price));
            fd.append("category", values.category);
            fd.append("level", values.level);
            fd.append("session", String(values.session));
            fd.append("description", values.description || "");
            fd.append("durationInMinutes", String(values.durationInMinutes));
            if (imageFile instanceof File) {
                fd.append("imageCover", imageFile);
            }
            await api.admin.updateCourseById(courseId, fd);
            showToast.updateSuccess(toastId, "Cập nhật thành công!");
            onUpdated?.();
            onClose?.();
        } catch (err) {
            showToast.updateError(toastId, err?.response?.data?.message || "Cập nhật khóa học thất bại!");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            open={open}
            title={
                <Title level={3} style={{ margin: 0, textAlign: "center" }}>
                    {isEdit ? "Chỉnh sửa khóa học" : "Chi tiết khóa học"}
                </Title>
            }
            onCancel={onClose}
            onOk={() => (isEdit ? form.submit() : onClose?.())}
            okText={isEdit ? "Lưu" : "Đóng"}
            confirmLoading={saving}
            width={800}
            destroyOnClose>
            {loading ? (
                <div className="py-6 text-center">
                    <Spin />
                </div>
            ) : (
                <Form form={form} layout="vertical" onFinish={onFinish} disabled={!isEdit}>
                    <Row gutter={[16, 16]}>
                        {/* Trái: Upload ảnh (giống Create) */}
                        <Col xs={24} md={8}>
                            <Form.Item label={<span style={{ fontWeight: 600 }}></span>}>
                                <Upload
                                    className="course-uploader"
                                    listType="picture-card"
                                    showUploadList={false}
                                    accept="image/*"
                                    beforeUpload={(file) => {
                                        const okType = file.type.startsWith("image/");
                                        const okSize = file.size / 1024 / 1024 <= 5;
                                        if (!okType){
                                            showToast.error("Chỉ được tải lên file ảnh!");
                                            return Upload.LIST_IGNORE
                                        } ;
                                        if (!okSize){
                                            showToast.error("Ảnh tải lên phải nhỏ hơn 5MB!");
                                            return Upload.LIST_IGNORE;
                                        } 
                                        return false;
                                    }}
                                    onChange={(info) => {
                                        const list = info.fileList.slice(-1);
                                        setFileList(list);
                                        const f = list[0]?.originFileObj;
                                        if (f) {
                                            setImageFile(f);
                                            setImageUrl(URL.createObjectURL(f));
                                        }
                                    }}
                                    fileList={fileList}
                                    disabled={!isEdit}
                                    style={{ width: "100%" }}
                                >
                                    {imageUrl ? (
                                        <div className="image-square">
                                            <img
                                                src={imageUrl}
                                                alt="course"
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover",
                                                    display: "block",
                                                    borderRadius: 8
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div>
                                            <PlusOutlined />
                                            <div style={{ marginTop: 8 }}>Tải ảnh</div>
                                        </div>
                                    )}
                                </Upload>
                            </Form.Item>
                        </Col>

                        {/* Phải: thông tin khóa học (giống Create) */}
                        <Col xs={24} md={16}>
                            <Form.Item
                                label={<span style={{ fontWeight: 600 }}>Tên khóa học</span>}
                                name="name"
                                rules={[
                                    { required: true, message: "Tên khóa học không được để trống!" },
                                    { max: 150, message: "Tên tối đa 150 ký tự" }
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
                                    optionFilterProp="label"
                                    options={(categories?.data || []).map((cat) => ({
                                        label: cat.name,
                                        value: cat._id
                                    }))}
                                />
                            </Form.Item>

                            <Row gutter={[12, 12]}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label={<span style={{ fontWeight: 600 }}>Mức độ</span>}
                                        name="level"
                                        rules={[{ required: true, message: "Mức độ khóa học không được để trống!" }]}
                                    >
                                        <Select
                                            allowClear
                                            placeholder="Chọn mức độ"
                                            options={[
                                                { label: "Beginner", value: "Beginner" },
                                                { label: "Intermediate", value: "Intermediate" },
                                                { label: "Advanced", value: "Advanced" }
                                            ]}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label={<span style={{ fontWeight: 600 }}>Giá (VND)</span>}
                                        name="price"
                                        rules={[{ required: true, message: "Giá khóa học không được để trống!" }]}
                                    >
                                        <InputNumber
                                            min={0}
                                            style={{ width: "100%" }}
                                            placeholder="Nhập giá khóa học"
                                            formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                            parser={(v) => v.replace(/,/g, "")}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Col>
                    </Row>

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
                                rules={[{ required: true, message: "Thời lượng mỗi buổi không được để trống!" }]}
                            >
                                <InputNumber min={1} style={{ width: "100%" }} placeholder="Nhập thời lượng mỗi buổi" />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Mô tả full width */}
                    <Form.Item
                        label={<span style={{ fontWeight: 600 }}>Mô tả</span>}
                        name="description"
                        style={{ marginTop: 12 }}
                        rules={[{ required: true, message: "Mô tả không được để trống!" }]}
                    >
                        <Input.TextArea rows={6} placeholder="Nhập mô tả chi tiết về khóa học" />
                    </Form.Item>

                    {/* CSS giống Create: ô ảnh vuông full-width */}
                    <style>{`
          .course-uploader.ant-upload-wrapper .ant-upload.ant-upload-select-picture-card {
            width: 100% !important;
          }
          .image-square {
            width: 100%;
            aspect-ratio: 1 / 1;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid #e6e6e6;
            box-shadow: 0 4px 14px rgba(31,93,255,0.12);
            background: #f7f9ff;
          }
        `}</style>
                </Form>
            )}
        </Modal>
    );

};

export default AdminCourseDetailModal;
