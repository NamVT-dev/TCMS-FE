import React, { useState, useMemo } from "react";
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
    Spin,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import api from "../../../utils/api";
import showToast from "../../../utils/showToast";

// Import LEVEL_RANGES từ file helper bạn cung cấp
import { getDisplayRange, LEVEL_RANGES } from "../../../utils/scoreToLevel";

const AdminCreateCourseModal = ({ open, onClose, onSuccess, categories }) => {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [fileList, setFileList] = useState([]);
    const { Title, Text } = Typography;
    const { TextArea } = Input;

    // Theo dõi giá trị để hiển thị range điểm realtime
    const selectedCategoryId = Form.useWatch("category", form);
    const selectedLevel = Form.useWatch("level", form);

    // Lấy danh sách Level từ LEVEL_RANGES của IELTS (làm chuẩn) hoặc hardcode
    const LEVEL_OPTIONS = LEVEL_RANGES.IELTS.map((l) => l.level);

    const categoryList = useMemo(() => {
        return Array.isArray(categories) ? categories : categories?.data || [];
    }, [categories]);

    const categoryOptions = categoryList.map((c) => ({
        label: c.name,
        value: c._id,
    }));

    // Hiển thị range điểm ước tính trên UI
    const scoreDisplay = useMemo(() => {
        if (!selectedCategoryId || !selectedLevel) return null;
        const selectedCategory = categoryList.find(
            (c) => c._id === selectedCategoryId
        );
        if (!selectedCategory) return null;
        return getDisplayRange(selectedCategory.name, selectedLevel);
    }, [selectedCategoryId, selectedLevel, categoryList]);

    // --- HÀM TÍNH TOÁN MIN/MAX SCORE ---
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

            // 1. Tính toán inputMinScore và inputMaxScore
            const { min: inputMinScore, max: inputMaxScore } = calculateScores(
                values.category,
                values.level
            );

            const fd = new FormData();
            fd.append("name", values.name);
            fd.append("description", values.description || "");
            fd.append("price", String(values.price));
            fd.append("category", values.category);
            fd.append("level", values.level);
            fd.append("session", String(values.session));
            fd.append("durationInMinutes", String(values.durationInMinutes));

            // 2. Append các trường mới bổ sung
            fd.append("sessionsPerWeek", String(values.sessionsPerWeek));
            fd.append("minStudent", String(values.minStudent));
            fd.append("maxStudent", String(values.maxStudent));

            // 3. Append điểm đầu vào đã tính toán
            fd.append("inputMinScore", String(inputMinScore));
            fd.append("inputMaxScore", String(inputMaxScore));

            if (imageFile) {
                fd.append("imageCover", imageFile);
            }

            await api.admin.createCourse(fd);
            showToast.updateSuccess(toastId, "Thêm mới khóa học thành công!");

            handleCancel();
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error(err);
            showToast.updateError(
                toastId,
                err?.response?.data?.message || "Thêm mới thất bại!"
            );
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
            title={
                <Title level={4} style={{ margin: 0, textAlign: "center" }}>
                    Thêm mới khóa học
                </Title>
            }
            open={open}
            onOk={() => form.submit()}
            onCancel={handleCancel}
            confirmLoading={submitting}
            okText="Thêm mới"
            cancelText="Hủy"
            destroyOnHidden
            width={900} // Tăng width một chút để chứa 3 cột
            centered
        >
            <Spin spinning={submitting}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    className="mt-4"
                    initialValues={{
                        sessionsPerWeek: 2,
                        minStudent: 8,
                        maxStudent: 15,
                    }}
                >
                    <Row gutter={[24, 24]}>
                        {/* Cột trái: Hình ảnh */}
                        <Col xs={24} md={8}>
                            <Form.Item label={<span className="font-semibold">Hình ảnh</span>}>
                                <Upload
                                    listType="picture-card"
                                    showUploadList={false}
                                    accept="image/*"
                                    beforeUpload={beforeUpload}
                                    onChange={onUploadChange}
                                    fileList={fileList}
                                    className="w-full course-uploader"
                                    style={{ width: "100%" }}
                                >
                                    {imageUrl ? (
                                        <img
                                            src={imageUrl}
                                            alt="preview"
                                            className="w-full h-full object-cover rounded-lg"
                                            style={{ aspectRatio: "16/9" }}
                                        />
                                    ) : (
                                        <div
                                            style={{
                                                width: "100%",
                                                aspectRatio: "16/9",
                                                display: "flex",
                                                flexDirection: "column",
                                                justifyContent: "center",
                                                alignItems: "center",
                                            }}
                                        >
                                            <PlusOutlined />
                                            <div style={{ marginTop: 8 }}>Tải ảnh bìa</div>
                                        </div>
                                    )}
                                </Upload>
                                <style>{`
                  .course-uploader .ant-upload.ant-upload-select {
                      width: 100% !important;
                      height: auto !important;
                      aspect-ratio: 16/9;
                  }
                `}</style>
                            </Form.Item>
                        </Col>

                        {/* Cột phải: Thông tin */}
                        <Col xs={24} md={16}>
                            <Form.Item
                                label="Tên khóa học"
                                name="name"
                                rules={[{ required: true, message: "Vui lòng nhập tên" }]}
                            >
                                <Input placeholder="Nhập tên khóa học" />
                            </Form.Item>

                            <Form.Item
                                label="Danh mục"
                                name="category"
                                rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
                            >
                                <Select
                                    placeholder="Chọn danh mục"
                                    options={categoryOptions}
                                />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        label="Mức độ"
                                        name="level"
                                        rules={[
                                            { required: true, message: "Vui lòng chọn mức độ" },
                                        ]}
                                        style={{ marginBottom: scoreDisplay ? 0 : 24 }}
                                    >
                                        <Select
                                            placeholder="Chọn mức độ"
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

                    {/* Hàng 2: Session, Duration */}
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Số buổi (Total Sessions)"
                                name="session"
                                rules={[{ required: true, message: "Vui lòng nhập số buổi" }]}
                            >
                                <InputNumber
                                    min={1}
                                    style={{ width: "100%" }}
                                    placeholder="Ví dụ: 24"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Thời lượng/buổi (phút)"
                                name="durationInMinutes"
                                rules={[
                                    { required: true, message: "Vui lòng nhập thời lượng" },
                                    { type: 'number', min: 15, message: "Tối thiểu 15 phút" }
                                ]}
                            >
                                <InputNumber
                                    min={15}
                                    style={{ width: "100%" }}
                                    placeholder="Ví dụ: 90"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Hàng 3: Cấu hình lớp học (Mới bổ sung) */}
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                label="Buổi/tuần"
                                name="sessionsPerWeek"
                                rules={[
                                    { required: true, message: "Bắt buộc" },
                                    { type: 'number', min: 1, max: 7, message: "1-7 buổi" }
                                ]}
                            >
                                <InputNumber min={1} max={7} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="Sĩ số tối thiểu"
                                name="minStudent"
                                rules={[{ required: true, message: "Bắt buộc" }]}
                            >
                                <InputNumber min={1} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="Sĩ số tối đa"
                                name="maxStudent"
                                dependencies={['minStudent']}
                                rules={[
                                    { required: true, message: "Bắt buộc" },
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
                                <InputNumber min={1} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label={<span className="font-semibold">Mô tả</span>}
                        name="description"
                    >
                        <TextArea
                            rows={4}
                            placeholder="Nhập mô tả chi tiết về khóa học..."
                        />
                    </Form.Item>
                </Form>
            </Spin>
        </Modal>
    );
};

export default AdminCreateCourseModal;