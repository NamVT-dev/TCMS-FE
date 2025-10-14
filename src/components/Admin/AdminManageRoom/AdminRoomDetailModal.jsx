import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, Spin } from "antd";
import api from "../../../utils/api";
const { Option } = Select;

const AdminRoomDetailModal = ({ open, roomId, mode = "view", onClose, onUpdated }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const isEdit = mode === "edit";

  console.log("roomId", roomId);
  
  useEffect(() => {
    if (!open || !roomId) return;
    (async () => {
      try {
        setLoading(true);
        const res = await api.admin.getRoomById(roomId);
        const data = res?.data?.data?.room || res?.data?.data || res?.data;
        form.setFieldsValue({
          name: data?.name,
          capacity: data?.capacity,
          status: data?.status || "active",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [open, roomId, form]);

  const handleOk = () => {
    if (isEdit) form.submit();
    else onClose?.();
  };

  const onFinish = async (values) => {
    try {
      setSaving(true);
      await api.admin.updateRoom(roomId, values);
      onUpdated?.();
      onClose?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={isEdit ? "Chỉnh sửa phòng học" : "Chi tiết phòng học"}
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
            label="Tên phòng"
            name="name"
            rules={[
              { required: true, message: "Tên phòng học không được để trống" },
              { max: 100, message: "Tên phòng học tối đa 100 ký tự" },
            ]}
          >
            <Input placeholder="Nhập tên phòng" />
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
            <Input placeholder="Nhập số lượng chỗ ngồi" />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default AdminRoomDetailModal;
