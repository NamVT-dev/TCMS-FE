// src/components/Admin/AdminManageShedule/components/draft/FailedClassesTable.jsx

import React from "react";
import { ListX } from "lucide-react";

function FailedClassesTable({ failedClasses }) {
  if (!failedClasses || failedClasses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <ListX className="h-16 w-16 text-green-500" />
        <p className="mt-4 text-lg font-semibold text-gray-700">
          Không có lớp nào thất bại!
        </p>
        <p className="text-gray-500">Thuật toán đã xếp lịch thành công cho tất cả lớp ảo.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                >
                  Thông Tin Lớp
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Số Lượng HS
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Lý Do Thất Bại (Chi tiết)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {failedClasses.map((item, index) => (
                <tr key={index}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {item.classInfo}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">
                    {item.studentCount}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-red-600 font-medium">
                    {item.reasonMessage}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default FailedClassesTable;