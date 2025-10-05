import React, { useState } from "react";
import { Search, Filter, Eye, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

const AdminViewClassList = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("Tất cả");
    const [selectedProgress, setSelectedProgress] = useState("Tất cả");

    // Sample data
    const [classes] = useState([
        {
            id: 1,
            name: "Lớp TOEIC A1",
            course: "TOEIC 450+",
            teacher: "Nguyễn Văn Hùng",
            month: "01/2025",
            students: 25,
            room: "P201",
            progress: "Chưa bắt đầu",
            onprogress: "0%",
        },
        {
            id: 2,
            name: "Lớp IELTS B2",
            course: "IELTS 6.5",
            teacher: "Trần Thị Mai",
            month: "02/2025",
            students: 20,
            room: "P305",
            progress: "Đang học",
            onprogress: "50%",
        },
        {
            id: 3,
            name: "Lớp TOEIC C1",
            course: "TOEIC 650+",
            teacher: "Lê Hoàng Nam",
            month: "01/2025",
            students: 30,
            room: "P102",
            progress: "Kết thúc",
            onprogress: "100%",
        },
    ]);

    const months = ["Tất cả", "01/2025", "02/2025"];
    const progressOptions = ["Tất cả", "Chưa bắt đầu", "Đang học", "Kết thúc"];

    const filteredClasses = classes.filter((cls) => {
        const matchSearch =
            cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cls.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cls.teacher.toLowerCase().includes(searchTerm.toLowerCase());

        const matchMonth =
            selectedMonth === "Tất cả" || cls.month === selectedMonth;

        const matchProgress =
            selectedProgress === "Tất cả" || cls.progress === selectedProgress;

        return matchSearch && matchMonth && matchProgress;
    });

    const getProgressColor = (status) => {
        switch (status) {
            case "Chưa bắt đầu":
                return "bg-yellow-100 text-yellow-700";
            case "Đang học":
                return "bg-green-100 text-green-700";
            case "Kết thúc":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const handleViewDetail = (id) => {
        console.log("View class detail:", id);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Danh sách lớp học
                </h1>
                <p className="text-gray-600">Quản lý thông tin lớp học và tiến độ</p>
            </div>

            {/* Search & Filter */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên lớp, khóa học, hoặc giáo viên..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        />
                    </div>

                    {/* Filter Month */}
                    <div className="relative">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                        >
                            {months.map((m) => (
                                <option key={m} value={m}>
                                    {m}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Filter Progress */}
                    <div className="relative">
                        <select
                            value={selectedProgress}
                            onChange={(e) => setSelectedProgress(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                        >
                            {progressOptions.map((p) => (
                                <option key={p} value={p}>
                                    {p}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Add Class Button */}
                    <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all duration-200 shadow-md hover:shadow-lg">
                        <Link to="/admin/classes/create" className="block w-full h-full">
                            + Tạo lớp
                        </Link>
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Tên lớp
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Khóa học
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Giáo viên
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Tháng mở
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Số học sinh
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Phòng học
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Tiến độ
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                                    Chi tiết
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredClasses.map((cls) => (
                                <tr
                                    key={cls.id}
                                    className="hover:bg-gray-50 transition-colors duration-150"
                                >
                                    <td className="px-6 py-4">{cls.name}</td>
                                    <td className="px-6 py-4">{cls.course}</td>
                                    <td className="px-6 py-4">{cls.teacher}</td>
                                    <td className="px-6 py-4">{cls.month}</td>
                                    <td className="px-6 py-4">{cls.students}</td>
                                    <td className="px-6 py-4">{cls.room}</td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-3 py-1 text-xs font-medium rounded-full ${getProgressColor(
                                                cls.progress
                                            )}`}
                                        >
                                            {cls.progress}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{cls.onprogress}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => handleViewDetail(cls.id)}
                                            className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </button>
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
                        <span className="font-medium">{filteredClasses.length}</span> trong
                        tổng số <span className="font-medium">{classes.length}</span> lớp
                    </div>
                    <div className="flex space-x-2">
                        <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100">
                            Trước
                        </button>
                        <button className="px-3 py-1 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700">
                            1
                        </button>
                        <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100">
                            Sau
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminViewClassList;