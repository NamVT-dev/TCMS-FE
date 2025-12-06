import React, { useState } from "react";
import { Modal, Form, Input } from "antd";
import api from "../../../utils/api";
import showToast from "../../../utils/showToast";

const AdminCreateRoomModal = ({ open, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleOk = () => form.submit();

  const onFinish = async (values) => {
    const toastId = showToast.loading("Đang tạo phòng...");
    try {
      setSubmitting(true);

      await api.admin.createRoom(values);

      showToast.updateSuccess(toastId, "Thêm phòng học mới thành công!");
      form.resetFields();
      onSuccess?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      showToast.updateError(
        toastId,
        err?.response?.data?.message || "Tạo phòng thất bại!"
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
      title="Thêm mới phòng học"
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={submitting}
      okText="Thêm mới"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Tên phòng"
          name="name"
          rules={[
            { required: true, message: "Tên phòng học không được để trống" },
            { max: 100, message: "Tên phòng học tối đa 100 ký tự" },
          ]}
        >
          <Input placeholder="Vui lòng nhập tên phòng học!" />
        </Form.Item>

        <Form.Item
          label="Số lượng chỗ ngồi"
          name="capacity"
          rules={[
            { required: true, message: "Số lượng chỗ ngồi không được để trống!" },
            {
              validator: (_, value) => {
                if (value === undefined || value === "") return Promise.resolve();
                const num = Number(value);
                if (isNaN(num)) return Promise.reject("Giá trị phải là số!");
                if (num < 1) return Promise.reject("Số lượng chỗ ngồi phải ≥ 1!");
                if (num > 120) return Promise.reject("Số lượng chỗ ngồi không được > 120!");
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input placeholder="Vui lòng nhập số lượng chỗ ngồi!" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AdminCreateRoomModal;
