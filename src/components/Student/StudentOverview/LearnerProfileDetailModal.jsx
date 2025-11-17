import React, { useEffect, useState } from "react";
import {
    Modal,
    Form,
    Input,
    Radio,
    DatePicker,
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
import dayjs from "dayjs";

const { Option } = Select;

const LearnerProfileDetailModal = ({
    open,
    learnnerID,
    mode = "view",
    onClose,
    onUpdated
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
        if (!open || !learnnerID) return;
        (async () => {
            setLoading(true);
            try {
                const res = await api.user.getLearnerById(learnnerID);
                const data = res?.data?.data ?? [];

                form.setFieldsValue({
                    name: data?.name,
                    dob: data?.dob ? dayjs(data.dob) : null,
                    gender: data?.gender
                });

                setImageUrl(data?.photo || "");
                setFileList([]);
            } finally {
                setLoading(false);
            }
        })();
    }, [open, learnnerID, form]);

    const onFinish = async (values) => {
        const toastId = showToast.loading("Đang cập nhật thông tin học viên...");
        try {
            const lennerProfile = {
                name: values.name,
                dob: values.dob ? values.dob.toISOString() : "",
                gender: values.gender,
                phone: values.phone || "",
                photo: imageFile
            };

            await api.user.updateLearnerById(learnnerID, lennerProfile);
            showToast.updateSuccess(toastId, "Cập nhật thông tin học viên thành công!");
            onUpdated?.();
            onClose?.();
        } catch (err) {
            showToast.updateError(toastId, err?.response?.data?.message || "Cập nhật thông tin học viên thất bại!");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            open={open}
            title={
                <Title level={3} style={{ margin: 0, textAlign: "center" }}>
                    {isEdit ? "Chỉnh sửa thông tin học viên" : "Chi tiết thông tin học viên"}
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
                <Form form={form} layout="vertical"
                    onFinish={onFinish}
                    disabled={!isEdit}>
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
                                        if (!okType) {
                                            showToast.error("Chỉ được tải lên file ảnh!");
                                            return Upload.LIST_IGNORE
                                        };
                                        if (!okSize) {
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
                                                    width: "160",
                                                    height: "160",
                                                    objectFit: "cover",
                                                    display: "block",
                                                    borderRadius: "8px"
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

                        {/* thông tin học viên */}
                        <Col xs={24} md={16}>
                            <Row gutter={[12, 12]}>
                                <Col xs={24} md={24}>
                                    <Form.Item
                                        label="Họ và tên"
                                        name="name"
                                        rules={[
                                            { required: true, message: "Vui lòng nhập họ và tên" },
                                        ]}
                                    >
                                        <Input placeholder="Nhập họ và tên" />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Ngày sinh"
                                        name="dob"
                                        rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
                                    >
                                        <DatePicker
                                            style={{ width: "100%" }}
                                            placeholder="Nhập ngày sinh"
                                            format="DD/MM/YYYY"
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Giới tính"
                                        name="gender"
                                        rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
                                    >
                                        <Radio.Group>
                                            <Radio value="male">Nam</Radio>
                                            <Radio value="female">Nữ</Radio>
                                        </Radio.Group>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <style>{`
          .course-uploader.ant-upload-wrapper .ant-upload.ant-upload-select-picture-card {
            width: 100% !important;
          }
          .image-square {
            width: 80%;
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

export default LearnerProfileDetailModal;
