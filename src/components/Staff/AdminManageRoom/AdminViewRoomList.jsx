import React, { useState, useEffect, useCallback } from "react";
import { Search, Trash2, Loader2 } from "lucide-react";
import api from "../../../utils/api";
import AdminCreateRoomModal from "./AdminCreateRoomModal";
import { Switch, Modal, Tooltip, Spin } from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";
import showToast from "../../../utils/showToast";

const AdminViewRoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [modal, contextHolder] = Modal.useModal();
  const [togglingId, setTogglingId] = useState(null);
  const PAGE_SIZE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    results: 0,
  });

  const [openCreate, setOpenCreate] = useState(false);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: currentPage, limit: PAGE_SIZE, search: searchTerm };
      const response = await api.admin.getRooms(params);

      const data = response.data;
      const total = data.total ?? 0;
      const results = data.results;

      setRooms(response.data.data.rooms);
      setPagination({
        page: data.page ?? currentPage,
        totalPages: Math.ceil(total / PAGE_SIZE),
        total,
        results,
      });
    } catch (err) {
      console.error(err);
      setError("Không thể tải dữ liệu phòng học.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    const debounce = setTimeout(() => {
        fetchRooms();
    }, 500);
    return () => clearTimeout(debounce);
  }, [fetchRooms]);

  const getStatusColor = (status) => {
    if (status === "active") return "bg-green-100 text-green-800";
    if (status === "closed") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  // Chuyển đổi text hiển thị trạng thái
  const getStatusLabel = (status) => {
    if (status === "active") return "Hoạt động";
    if (status === "closed") return "Đã đóng";
    return "N/A";
  };

  const updateStatus = async (roomId, status) => {
    const toastId = showToast.loading("Đang cập nhật trạng thái...");
    try {
      setTogglingId(roomId);
      await api.admin.updateRoom(roomId, { status });
      setRooms((prev) =>
        prev.map((r) => (r._id === roomId ? { ...r, status } : r))
      );
      showToast.updateSuccess(
        toastId,
        status === "closed" ? "Đã đóng phòng học!" : "Đã mở phòng học!"
      );
    } catch (err) {
      console.error(err);
      showToast.updateError(
        toastId,
        err?.response?.data?.message || "Cập nhật thất bại!"
      );
    } finally {
      setTogglingId(null);
    }
  };

  const handleToggleSwitch = (room, checked) => {
    if (room.status === "active" && !checked) {
      modal.confirm({
        title: "Bạn có muốn đóng phòng học này?",
        icon: <ExclamationCircleFilled />,
        content: "Thao tác này sẽ chuyển trạng thái về 'Đã đóng'.",
        okText: "Đồng ý",
        cancelText: "Hủy bỏ",
        okType: "danger",
        getContainer: false,
        zIndex: 2000,
        onOk: () => updateStatus(room._id, "closed"),
      });
      return;
    }

    if (room.status === "closed" && checked) {
      modal.confirm({
        title: "Bạn có muốn mở lại phòng học này?",
        content: "Thao tác này sẽ chuyển trạng thái về 'Hoạt động'.",
        icon: <ExclamationCircleFilled />,
        okText: "Đồng ý",
        cancelText: "Hủy bỏ",
        getContainer: false,
        zIndex: 2000,
        onOk: () => updateStatus(room._id, "active"),
      });
      return;
    }
  };

  const handleDelete = (id) => {
    modal.confirm({
      title: "Xác nhận xóa phòng học?",
      icon: <ExclamationCircleFilled />,
      content: "Thao tác này không thể hoàn tác.",
      okText: "Xóa",
      cancelText: "Hủy",
      okType: "danger",
      getContainer: false,
      zIndex: 2000,
      async onOk() {
        const toastId = showToast.loading("Đang xóa phòng học...");
        try {
          await api.admin.deleteRoomById(id);
          showToast.updateSuccess(toastId, "Xóa phòng học thành công!");
          if (rooms.length === 1 && currentPage > 1) {
            setCurrentPage((p) => p - 1);
          } else {
            fetchRooms();
          }
        } catch (err) {
          console.error(err);
          showToast.updateError(
            toastId,
            err?.response?.data?.message || "Xóa phòng học thất bại!"
          );
        }
      },
    });
  };

  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {contextHolder}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Danh sách phòng học
        </h1>
        <p className="text-gray-600">Quản lý phòng học và tình trạng sử dụng</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            {loading ? (
                <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500 w-5 h-5 animate-spin" />
            ) : (
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            )}
            
            <input
              type="text"
              placeholder="Tìm kiếm theo tên phòng hoặc chỗ học..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </div>

          <button
            onClick={() => setOpenCreate(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            + Tạo phòng
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  STT
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Tên phòng
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Số lượng chỗ ngồi
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                        <Spin size="large" />
                        <span className="mt-2 text-gray-500">Đang tải dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              ) : rooms.length > 0 ? (
                rooms.map((room, index) => (
                  <tr
                    key={room._id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {(currentPage - 1) * PAGE_SIZE + index + 1}
                    </td>
                    <td className="px-6 py-4">{room.name}</td>
                    <td className="px-6 py-4">{room.capacity}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          room.status
                        )}`}
                      >
                        {getStatusLabel(room.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <Tooltip
                          placement="top"
                          title={"Đóng/Mở phòng học"}
                        >
                          <Switch
                            checked={room.status === "active"}
                            loading={togglingId === room._id}
                            onChange={(checked) =>
                              handleToggleSwitch(room, checked)
                            }
                            checkedChildren="Mở"
                            unCheckedChildren="Đóng"
                          />
                        </Tooltip>
                        <Tooltip placement="top" title={"Xóa phòng học"}>
                          <button
                            onClick={() => handleDelete(room._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <p>Không tìm thấy phòng học nào phù hợp.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!loading && rooms.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Hiển thị <span className="font-medium">{pagination.results}</span>{" "}
              trong tổng số{" "}
              <span className="font-medium">{pagination.total}</span> phòng học
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>

              <span className="px-3 py-1 text-sm">
                Trang {pagination.page} / {pagination.totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                disabled={currentPage === pagination.totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      <AdminCreateRoomModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSuccess={fetchRooms}
      />
    </div>
  );
};

export default AdminViewRoomList;