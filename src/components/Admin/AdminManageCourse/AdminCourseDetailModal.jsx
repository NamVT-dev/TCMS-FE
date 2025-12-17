import React, { useEffect, useState, useMemo } from "react";
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
    Button,
    Space,
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    SaveOutlined,
    RollbackOutlined,
} from "@ant-design/icons";
import api from "../../../utils/api";
import showToast from "../../../utils/showToast";
import { LEVEL_RANGES, getDisplayRange } from "../../../utils/scoreToLevel"; // Import helper

const { Title, Text } = Typography;

const AdminCourseDetailModal = ({
    open,
    courseId,
    onClose,
    onUpdated,
    categories,
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [isEditing, setIsEditing] = useState(false);

    const [imageUrl, setImageUrl] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [fileList, setFileList] = useState([]);

    // Dùng để tính toán score khi update
    const categoryList = useMemo(() => {
        return Array.isArray(categories) ? categories : categories?.data || [];
    }, [categories]);

    // Lấy level options
    const LEVEL_OPTIONS = LEVEL_RANGES.IELTS.map((l) => l.level);

    // Watch fields để hiện display range
    const selectedCategoryId = Form.useWatch("category", form);
    const selectedLevel = Form.useWatch("level", form);

    // Hiển thị range điểm ước tính
    const scoreDisplay = useMemo(() => {
        if (!selectedCategoryId || !selectedLevel) return null;
        const selectedCategory = categoryList.find(
            (c) => c._id === selectedCategoryId
        );
        if (!selectedCategory) return null;
        return getDisplayRange(selectedCategory.name, selectedLevel);
    }, [selectedCategoryId, selectedLevel, categoryList]);

    useEffect(() => {
        if (open && courseId) {
            setIsEditing(false);
            fetchDetail();
        } else {
            form.resetFields();
            setImageUrl("");
            setFileList([]);
        }
    }, [open, courseId]);

    const fetchDetail = async () => {
        setLoading(true);
        try {
            const res = await api.admin.getCourseById(courseId);
            const data = res?.data?.data?.course;
            if (data) {
                form.setFieldsValue({
                    name: data.name,
                    price: data.price,
                    category: data.category?._id || data.category,
                    level: data.level,
                    session: data.session,
                    durationInMinutes: data.durationInMinutes,
                    description: data.description || "",
                    // Bổ sung map dữ liệu mới
                    sessionsPerWeek: data.sessionsPerWeek || 2,
                    minStudent: data.minStudent || 8,
                    maxStudent: data.maxStudent || 15,
                });
                setImageUrl(data.imageCover || "");
                setFileList([]);
            }
        } catch (err) {
            showToast.error("Lỗi tải chi tiết khóa học");
        } finally {
            setLoading(false);
        }
    };

    // --- HÀM TÍNH TOÁN MIN/MAX SCORE (Giống bên create) ---
    const calculateScores = (categoryId, levelName) => {
        const selectedCategory = categoryList.find((c) => c._id === categoryId);
        if (!selectedCategory) return { min: 0, max: 0 };

        const catName = selectedCategory.name.toUpperCase();
        let type = null;
        if (catName.includes("IELTS")) type = "IELTS";
        else if (catName.includes("TOEIC")) type = "TOEIC";

        if (!type) return { min: 0, max: 0 };

        const range = LEVEL_RANGES[type].find((r) => r.level === levelName);
        return range ? { min: range.min, max: range.max } : { min: 0, max: 0 };
    };

    const onFinish = async (values) => {
        setSaving(true);
        try {
            // 1. Tính toán inputMinScore và inputMaxScore lại (đề phòng user đổi level)
            const { min: inputMinScore, max: inputMaxScore } = calculateScores(
                values.category,
                values.level
            );

            const fd = new FormData();
            fd.append("name", values.name);
            fd.append("price", String(values.price));
            fd.append("category", values.category);
            fd.append("level", values.level);
            fd.append("session", String(values.session));
            fd.append("description", values.description || "");
            fd.append("durationInMinutes", String(values.durationInMinutes));

            // 2. Append các trường mới bổ sung
            fd.append("sessionsPerWeek", String(values.sessionsPerWeek));
            fd.append("minStudent", String(values.minStudent));
            fd.append("maxStudent", String(values.maxStudent));

            // 3. Append điểm đầu vào
            fd.append("inputMinScore", String(inputMinScore));
            fd.append("inputMaxScore", String(inputMaxScore));

            if (imageFile instanceof File) {
                fd.append("imageCover", imageFile);
            }

            await api.admin.updateCourseById(courseId, fd);

            // Đóng modal trước
            onClose();

            // Gọi callback để reload data và hiển thị toast
            if (onUpdated) {
                onUpdated();
            }
            showToast.success("Cập nhật thành công!");
        } catch (err) {
            showToast.error(
                err?.response?.data?.message || "Cập nhật thất bại!"
            );
        } finally {
            setSaving(false);
        }
    };

    const categoryOptions = categoryList.map((c) => ({
        label: c.name,
        value: c._id,
    }));

    const renderFooter = () => {
        if (loading) return null;

        if (isEditing) {
            return (
                <Space>
                    <Button
                        icon={<RollbackOutlined />}
                        onClick={() => {
                            setIsEditing(false);
                            fetchDetail();
                        }}
                    >
                        Hủy bỏ
                    </Button>
                    <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        loading={saving}
                        onClick={() => form.submit()}
                        style={{ backgroundColor: "#7e22ce", borderColor: "#7e22ce" }}
                    >
                        Lưu thay đổi
                    </Button>
                </Space>
            );
        }

        return (
            <Space>
                <Button onClick={onClose}>Đóng</Button>
                <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => setIsEditing(true)}
                    style={{ backgroundColor: "#2563eb", borderColor: "#2563eb" }}
                >
                    Cập nhật
                </Button>
            </Space>
        );
    };

    return (
        <Modal
            open={open}
            title={
                <Title level={4} style={{ margin: 0 }}>
                    {isEditing ? "Chỉnh sửa" : "Chi tiết"}
                </Title>
            }
            onCancel={onClose}
            footer={renderFooter()}
            width={900} // Tăng width để chứa 3 cột
            centered
            maskClosable={!isEditing}
            destroyOnClose
        >
            <Spin spinning={loading}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    disabled={!isEditing}
                    className="mt-4"
                    style={{
                        opacity: loading ? 0.5 : 1,
                        pointerEvents: loading ? "none" : "auto",
                    }}
                >
                    <Row gutter={[24, 24]}>
                        <Col xs={24} md={8}>
                            <Form.Item label={<span className="font-semibold">Hình ảnh</span>}>
                                <Upload
                                    listType="picture-card"
                                    showUploadList={false}
                                    accept="image/*"
                                    beforeUpload={(file) => {
                                        const okType = file.type.startsWith("image/");
                                        if (!okType) return Upload.LIST_IGNORE;
                                        return false;
                                    }}
                                    onChange={(info) => {
                                        const f = info.fileList.slice(-1)[0]?.originFileObj;
                                        if (f) {
                                            setImageFile(f);
                                            setImageUrl(URL.createObjectURL(f));
                                            setFileList(info.fileList.slice(-1));
                                        }
                                    }}
                                    fileList={fileList}
                                    disabled={!isEditing}
                                    className="course-uploader"
                                >
                                    {imageUrl ? (
                                        <div className="w-full h-full overflow-hidden rounded-lg border border-gray-200">
                                            <img
                                                src={imageUrl}
                                                alt="cover"
                                                className="w-full h-full object-cover"
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

                        <Col xs={24} md={16}>
                            <Form.Item
                                label={<span className="font-semibold">Tên khóa học</span>}
                                name="name"
                                rules={[{ required: true, message: "Vui lòng nhập tên" }]}
                            >
                                <Input size="large" />
                            </Form.Item>

                            <Form.Item
                                label={<span className="font-semibold">Danh mục</span>}
                                name="category"
                                rules={[{ required: true }]}
                            >
                                <Select
                                    placeholder="Chọn danh mục"
                                    size="large"
                                    options={categoryOptions}
                                />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        label={<span className="font-semibold">Mức độ</span>}
                                        name="level"
                                        rules={[{ required: true }]}
                                        style={{ marginBottom: scoreDisplay ? 0 : 24 }}
                                    >
                                        <Select
                                            size="large"
                                            options={LEVEL_OPTIONS.map((l) => ({
                                                label: l,
                                                value: l,
                                            }))}
                                        />
                                    </Form.Item>
                                    {scoreDisplay && (
                                        <div className="mb-6 mt-1 ml-1">
                                            <Text
                                                type="secondary"
                                                style={{ fontSize: "12px" }}
                                                italic
                                            >
                                                Tương đương:{" "}
                                                <strong className="text-blue-600">
                                                    {scoreDisplay}
                                                </strong>
                                            </Text>
                                        </div>
                                    )}
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label={("Giá (VND)")}
                                        name="price"
                                        rules={[
                                            { required: true, message: "Vui lòng nhập giá" },
                                            { type: 'number', min: 0, message: "Giá không được âm" } 
                                        ]}
                                    >
                                        <InputNumber
                                            min={0} 
                                            style={{ width: "100%" }}
                                            formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                            parser={(v) => v.replace(/,/g, "")}
                                            placeholder="0"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label={<span className="font-semibold">Số buổi</span>}
                                name="session"
                                rules={[{ required: true }]}
                            >
                                <InputNumber min={1} style={{ width: "100%" }} size="large" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label={<span className="font-semibold">Thời lượng (phút)</span>}
                                name="durationInMinutes"
                                rules={[
                                    { required: true },
                                    { type: 'number', min: 15, message: "Tối thiểu 15p" }
                                ]}
                            >
                                <InputNumber min={15} style={{ width: "100%" }} size="large" />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Hàng mới bổ sung */}
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                label={<span className="font-semibold">Buổi/tuần</span>}
                                name="sessionsPerWeek"
                                rules={[
                                    { required: true },
                                    { type: 'number', min: 1, max: 7, message: "1-7 buổi" }
                                ]}
                            >
                                <InputNumber min={1} max={7} style={{ width: "100%" }} size="large" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label={<span className="font-semibold">Sĩ số tối thiểu</span>}
                                name="minStudent"
                                rules={[{ required: true }]}
                            >
                                <InputNumber min={1} style={{ width: "100%" }} size="large" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label={<span className="font-semibold">Sĩ số tối đa</span>}
                                name="maxStudent"
                                dependencies={['minStudent']}
                                rules={[
                                    { required: true },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || value >= getFieldValue('minStudent')) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Max phải >= Min'));
                                        },
                                    }),
                                ]}
                            >
                                <InputNumber min={1} style={{ width: "100%" }} size="large" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label={<span className="font-semibold">Mô tả chi tiết</span>}
                        name="description"
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>

                    <style>{`
            .course-uploader .ant-upload.ant-upload-select-picture-card {
                width: 100% !important;
                height: 200px !important;
                border-radius: 12px;
            }
          `}</style>
                </Form>
            </Spin>
        </Modal>
    );
};

export default AdminCourseDetailModal;