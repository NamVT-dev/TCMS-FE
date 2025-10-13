import React, { useState, useEffect } from "react";
import { Search, Edit, Trash2, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../../utils/api";


const AdminViewRoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          page: currentPage,
          search: searchTerm,
        };

        // Gọi API
        const response = await api.admin.getRooms(params);

        console.log("get data:", response.data.data.rooms);

        setRooms(response.data.data.rooms);
        setPagination({
          page: response.data.page,
          totalPages: response.data.totalPages,
          total: response.data.total,
          results: response.data.results,
        });
      } catch (err) {
        console.error(err);
        setError("Không thể tải dữ liệu phòng học.");
      } finally {
        setLoading(false);
      }
    };
    const debounceFetch = setTimeout(() => fetchRooms(), 500);
    return () => clearTimeout(debounceFetch);
  }, [currentPage, searchTerm]);

  // Hàm tiện ích để render trạng thái hoạt động
    const getStatusColor = (isActive) => {
        if (isActive === 'active') {
            return 'bg-green-100 text-green-800';
        } else if (isActive === 'closed') {
            return 'bg-red-100 text-red-800';
        }
        return 'bg-red-100 text-red-800';
    };

  // === EVENT HANDLERS ===
  const handleView = (id) => console.log("View room detail:", id);
  const handleEdit = (id) => console.log("Edit room:", id);
  const handleDelete = (id) => console.log("Delete room:", id);

  // === LOADING / ERROR ===
  if (loading)
    return <div className="p-6 text-center">Đang tải dữ liệu...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  // === RENDER ===
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Danh sách phòng học
        </h1>
        <p className="text-gray-600">Quản lý phòng học và tình trạng sử dụng</p>
      </div>

      {/* Search + Create Button */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Box */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
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

          {/* Add Room */}
          <Link
            to="/admin/rooms/create"
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all duration-200 shadow-md hover:shadow-lg inline-block"
          >
            + Tạo phòng
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Tên phòng
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Sức chứa
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
              {rooms.length > 0 ? (
                rooms.map((room) => (
                  <tr
                    key={room._id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4">{room.name}</td>
                    <td className="px-6 py-4">{room.capacity}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          room.status
                        )}`}
                      >
                        {room.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-3">
                        <button
                          onClick={() => handleView(room._id)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(room._id)}
                          className="text-green-600 hover:text-green-800"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(room._id)}
                          className="text-red-600 hover:text-red-800"
                          title="Xóa"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Không có dữ liệu phòng học
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Hiển thị <span className="font-medium">{pagination.results}</span>{" "}
              trong tổng số{" "}
              <span className="font-medium">{pagination.total}</span> phòng
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => prev - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <span className="px-3 py-1 text-sm">
                Trang {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={currentPage === pagination.totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminViewRoomList;
