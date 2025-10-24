import React from "react";
import StudentRegisterTest from "./StudentRegisterTest";

const StudentOverview = () => {
  return (
    <div className="flex h-screen">
      {/* Phần bên trái (70%) */}
      <div className="w-[70%] bg-white p-8 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4 text-indigo-700">Tổng quan học viên</h1>
        <p className="text-gray-700">
          Đây là khu vực hiển thị thông tin tổng quan của học viên, như lịch học, kết quả test, tiến độ, v.v...
        </p>
        {/* Nội dung khác ở đây */}
      </div>

      {/* Phần bên phải (30%) */}
       <div className="w-[30%] bg-white fixed right-0 top-0 h-screen flex items-center justify-center px-8 py-6">
        <div className="w-full">
          <StudentRegisterTest />
        </div>
      </div>
    </div>
  );
};

export default StudentOverview;
