import React, { useState } from 'react';
import { Search, Eye, Edit, Trash2, Filter } from 'lucide-react';

const AdminViewTeacherList = () => {
    const [searchTerm, setSearchTerm] = useState('');

    // Sample teacher data
    const [teachers] = useState([
        {
            id: 1,
            name: "Nguyễn Thị Mai",
            email: "mai.nguyen@tutorcenter.com",
            phone: "0901234567",
            skills: "IELTS 8.0, TOEIC 950",
            contract: "Full Time",
            contractStatus: "active"
        },
        {
            id: 2,
            name: "Trần Văn Hùng",
            email: "hung.tran@tutorcenter.com",
            phone: "0912345678",
            skills: "IELTS 7.5, TOEFL 110",
            contract: "Part Time",
            contractStatus: "active"
        },
        {
            id: 3,
            name: "Lê Thị Lan",
            email: "lan.le@tutorcenter.com",
            phone: "0923456789",
            skills: "TOEIC 900, Business English",
            contract: "Full Time",
            contractStatus: "active"
        },
        {
            id: 4,
            name: "Phạm Minh Tuấn",
            email: "tuan.pham@tutorcenter.com",
            phone: "0934567890",
            skills: "IELTS 7.0, Speaking 8.0",
            contract: "Part Time",
            contractStatus: "end"
        },
        {
            id: 5,
            name: "Hoàng Thị Hương",
            email: "huong.hoang@tutorcenter.com",
            phone: "0945678901",
            skills: "TOEIC 850, Grammar Expert",
            contract: "Full Time",
            contractStatus: "active"
        }
    ]);

    const filteredTeachers = teachers.filter(teacher =>
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.phone.includes(searchTerm) ||
        teacher.skills.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getContractBadge = (contractStatus, contractType) => {
        if (contractStatus === 'end') {
            return 'bg-red-100 text-red-800';
        }

        switch (contractType) {
            case 'Full Time':
                return 'bg-green-100 text-green-800';
            case 'Part Time':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getContractText = (contract, status) => {
        return status === 'end' ? 'End' : contract;
    };

    const handleView = (id) => {
        console.log('View teacher:', id);
    };

    const handleEdit = (id) => {
        console.log('Edit teacher:', id);
    };

    const handleDelete = (id) => {
        console.log('Delete teacher:', id);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Danh sách giáo viên</h1>
                <p className="text-gray-600">Quản lý thông tin giáo viên trong hệ thống</p>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search Box */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, email, số điện thoại, hoặc kỹ năng..."
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

                    {/* Add Teacher Button */}
                    <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all duration-200 shadow-md hover:shadow-lg">
                        + Thêm giáo viên
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Tên giáo viên
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Số điện thoại
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Kỹ năng
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Hợp đồng
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredTeachers.map((teacher) => (
                                <tr key={teacher.id} className="hover:bg-gray-50 transition-colors duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="text-blue-600 font-semibold text-sm">
                                                    {teacher.name.charAt(0)}
                                                </span>
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{teacher.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{teacher.phone}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">
                                            {teacher.skills.split(', ').map((skill, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-block bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs mr-1 mb-1"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getContractBadge(teacher.contractStatus, teacher.contract)}`}>
                                            {getContractText(teacher.contract, teacher.contractStatus)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center space-x-3">
                                            <button
                                                onClick={() => handleView(teacher.id)}
                                                className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                                                title="Xem chi tiết"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(teacher.id)}
                                                className="text-green-600 hover:text-green-800 transition-colors duration-200"
                                                title="Chỉnh sửa"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(teacher.id)}
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
                        Hiển thị <span className="font-medium">1</span> đến <span className="font-medium">{filteredTeachers.length}</span> trong tổng số <span className="font-medium">{teachers.length}</span> giáo viên
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

export default AdminViewTeacherList;