import React, { useState } from "react";
import { Search, Eye, Edit, Trash2, Filter } from "lucide-react";

const AdminViewStaffList = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Sample parent data
  const [parents] = useState([
    {
      id: 1,
      name: "Nguyễn Văn Hùng",
      email: "hung.nguyen@email.com",
      phone: "0901234567",
      children: "Nguyễn Văn An, Nguyễn Thị Hoa",
    },
    {
      id: 2,
      name: "Trần Thị Mai",
      email: "mai.tran@email.com",
      phone: "0912345678",
      children: "Trần Văn Bình ",
    },
    {
      id: 3,
      name: "Lê Hoàng Nam",
      email: "nam.le@email.com",
      phone: "0923456789",
      children: "Lê Minh Quân , Lê Khánh Ly ",
    },
  ]);

  const filteredParents = parents.filter(
    (parent) =>
      parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.phone.includes(searchTerm)
  );

  const handleView = (id) => {
    console.log("View parent:", id);
  };

  const handleEdit = (id) => {
    console.log("Edit parent:", id);
  };

  const handleDelete = (id) => {
    console.log("Delete parent:", id);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Danh sách phụ huynh
        </h1>
        <p className="text-gray-600">
          Quản lý thông tin phụ huynh và học sinh liên quan
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Box */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, hoặc số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Filter Button */}
          <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200">
            <Filter className="w-5 h-5" />
            <span>Lọc</span>
          </button>

          {/* Add Parent Button */}
          <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all duration-200 shadow-md hover:shadow-lg">
            + Thêm phụ huynh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Tên phụ huynh
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Số điện thoại
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Học sinh
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredParents.map((parent) => (
                <tr
                  key={parent.id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-yellow-600 font-semibold text-sm">
                          {parent.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {parent.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{parent.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{parent.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs break-words">
                      {parent.children}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-3">
                      <button
                        onClick={() => handleView(parent.id)}
                        className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(parent.id)}
                        className="text-green-600 hover:text-green-800 transition-colors duration-200"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(parent.id)}
                        className="text-red-600 hover:text-red-800 transition-colors duration-200"
                        title="Xóa"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Hiển thị <span className="font-medium">1</span> đến{" "}
            <span className="font-medium">{filteredParents.length}</span> trong
            tổng số <span className="font-medium">{parents.length}</span> phụ
            huynh
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200">
              Trước
            </button>
            <button className="px-3 py-1 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700 transition-colors duration-200">
              1
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200">
              2
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200">
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminViewStaffList;
