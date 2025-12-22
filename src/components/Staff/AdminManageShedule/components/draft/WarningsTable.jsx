
import React from "react";
import { AlertTriangle } from "lucide-react";

function WarningsTable({ warnings }) {
  if (!warnings || warnings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <AlertTriangle className="h-16 w-16 text-gray-400" />
        <p className="mt-4 text-lg font-semibold text-gray-700">
          Không có cảnh báo nào.
        </p>
        <p className="text-gray-500">Tất cả giáo viên được xếp lịch đều trong khung giờ đăng ký.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-yellow-50">
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                >
                  Giáo Viên
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Lớp
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Chi Tiết Cảnh Báo (Lịch làm việc không phù hợp)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {warnings.map((item, index) => (
                <tr key={index}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {item.teacherName}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {item.classInfo}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-yellow-800 font-medium">
                    {item.message}
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

export default WarningsTable;