import React, { useState } from "react";
import { Modal, Row, Col, Typography, Table, Tag, Button, Checkbox } from "antd";

const { Title, Text } = Typography;

const PaymentHistoryDetailModal = ({ open, onClose }) => {
  const student = {
    name: "Nguyễn Thành Trung",
    email: "trungnthe171142@fpt.edu.vn",
    phone: "0329428493",
    coursePath: "IELTS từ mất gốc - 3.5 đến IELTS 6.5",
  };

  const [courses, setCourses] = useState([
    { id: 1, name: "English Foundation", price: 5500000, status: "Đã thanh toán" },
    { id: 2, name: "Khóa học IELTS 4.5", price: 5500000, status: "Đã thanh toán" },
    { id: 3, name: "Khóa học IELTS 5.5", price: 5500000, status: "Chưa thanh toán", selected: false },
    { id: 4, name: "Khóa học IELTS 6.5", price: 5500000, status: "Chưa thanh toán", selected: false },
  ]);

  const handleSelect = (id, checked) => {
    setCourses((prev) =>
      prev.map((course) =>
        course.id === id ? { ...course, selected: checked } : course
      )
    );
  };

  const handleSelectAll = (checked) => {
    setCourses((prev) =>
      prev.map((c) =>
        c.status === "Chưa thanh toán" ? { ...c, selected: checked } : c
      )
    );
  };

  const selectedCourses = courses.filter((c) => c.selected);
  const totalPrice = selectedCourses.reduce((sum, c) => sum + c.price, 0);

  const columns = [
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Giá tiền",
      dataIndex: "price",
      key: "price",
      render: (value) => `${value.toLocaleString()} VNĐ`,
    },
    {
      title: "",
      key: "select",
      render: (_, record) =>
        record.status === "Chưa thanh toán" ? (
          <Checkbox
            checked={record.selected}
            onChange={(e) => handleSelect(record.id, e.target.checked)}
          />
        ) : null,
      align: "center",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={status === "Đã thanh toán" ? "#00B1FF" : "#D79F45"}
          style={{ fontWeight: 500 }}
        >
          {status}
        </Tag>
      ),
      align: "center",
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={950}
      title={
        <Title level={3} style={{ textAlign: "center", marginBottom: 0 }}>
          Thanh toán
        </Title>
      }
    >
      <div style={{ background: "#f5f5f5", padding: 24, borderRadius: 8 }}>
        <Row gutter={32}>
          {/* Bên trái */}
          <Col span={12}>
            <Title level={4}>Thông tin học viên</Title>
            <div style={{ marginTop: 12 }}>
              <p>
                <Text strong>Tên:</Text> {student.name}
              </p>
              <p>
                <Text strong>Email:</Text> {student.email}
              </p>
              <p>
                <Text strong>SDT:</Text> {student.phone}
              </p>
              <p>
                <Text strong>Lộ trình khóa học:</Text> {student.coursePath}
              </p>
            </div>
          </Col>

          {/* Bên phải */}
          <Col span={12}>
            <Title level={4}>Thông tin của bạn</Title>
            <div style={{ marginTop: 12 }}>
              <p>
                <Text strong>Tên:</Text> {student.name}
              </p>
              <p>
                <Text strong>Email:</Text> {student.email}
              </p>
              <p>
                <Text strong>SDT:</Text> {student.phone}
              </p>
            </div>
          </Col>
        </Row>

        {/* Bảng thanh toán */}
        <Table
          dataSource={courses}
          columns={columns}
          pagination={false}
          rowKey="id"
          style={{ marginTop: 24, background: "white" }}
        />

        {/* Tổng tiền + chọn tất cả */}
        <div
          style={{
            marginTop: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <Checkbox
              onChange={(e) => handleSelectAll(e.target.checked)}
              style={{ fontWeight: 500 }}
            >
              Chọn tất cả
            </Checkbox>
            <div style={{ marginTop: 8 }}>
              <Text strong style={{ fontSize: 16 }}>
                Tổng giá:
              </Text>{" "}
              <Text strong style={{ fontSize: 16 }}>
                {totalPrice.toLocaleString()} VNĐ
              </Text>
            </div>
          </div>

          <Button
            type="primary"
            size="large"
            disabled={selectedCourses.length === 0}
          >
            Thanh toán
          </Button>
        </div>

        <Text
          type="secondary"
          style={{
            fontSize: 13,
            display: "block",
            marginTop: 12,
            textAlign: "left",
          }}
        >
          Lưu ý: Cần phải thanh toán ít nhất 1 sản phẩm trước
        </Text>
      </div>
    </Modal>
  );
};

export default PaymentHistoryDetailModal;
