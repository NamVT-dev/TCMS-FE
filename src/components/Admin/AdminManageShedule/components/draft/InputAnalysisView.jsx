
import React from "react";
import { Users, ClipboardList, ListFilter } from "lucide-react";

function InputAnalysisView({ inputAnalysis }) {
  const { demandList = [], virtualClassList = [], pendingList = [] } = inputAnalysis || {};

  return (
    <div className="space-y-8">
      {/* 1. Demand List (Nhu cầu) */}
      <AnalysisSection
        icon={ListFilter}
        title="Phân Tích Nhu Cầu"
        description="Số lượng học viên tìm thấy theo từng khóa học dựa trên ngày intake."
      >
        <AnalysisTable
          headers={["Khóa Học", "Ngưỡng Điểm", "Số HS Tìm Thấy"]}
          data={demandList}
          renderRow={(item) => (
            <>
              <td className={tdStyle}>{item.courseName} (Level {item.targetLevel})</td>
              <td className={tdStyle}>{item.inputRange}</td>
              <td className={tdStyle}>{item.foundStudents}</td>
            </>
          )}
        />
      </AnalysisSection>

      {/* 2. Virtual Class List (Lớp Ảo đã tạo) */}
      <AnalysisSection
        icon={ClipboardList}
        title="Lớp Ảo Đã Tạo"
        description="Các lớp ảo được tạo ra từ nhu cầu học viên, dựa trên sĩ số min/max."
      >
        <AnalysisTable
          headers={["ID Lớp Ảo", "Khóa Học", "Số Lượng HS"]}
          data={virtualClassList}
          renderRow={(item) => (
            <>
              <td className={tdStyle}>{item.id}</td>
              <td className={tdStyle}>{item.courseInfo?.name}</td>
              <td className={tdStyle}>{item.studentCount}</td>
            </>
          )}
        />
      </AnalysisSection>

      {/* 3. Pending List (Học viên chờ) */}
      <AnalysisSection
        icon={Users}
        title="Danh Sách Chờ"
        description="Số học viên còn lại không đủ để mở lớp (nhỏ hơn sĩ số tối thiểu)."
      >
        <AnalysisTable
          headers={["Khóa Học", "Số HS Chờ", "Yêu Cầu Tối Thiểu"]}
          data={pendingList}
          renderRow={(item) => (
            <>
              <td className={tdStyle}>{item.courseName}</td>
              <td className={tdStyle}>{item.studentCount}</td>
              <td className={tdStyle}>{item.minRequired}</td>
            </>
          )}
        />
      </AnalysisSection>
    </div>
  );
}

// Component nội bộ để render 1 section
const AnalysisSection = ({ icon: Icon, title, description, children }) => (
  <div className="bg-white shadow border border-gray-200 rounded-lg p-6">
    <div className="flex items-center space-x-3 mb-4">
      <Icon className="h-8 w-8 text-purple-600" />
      <div>
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
    {children}
  </div>
);

// Component nội bộ để render 1 bảng
const AnalysisTable = ({ headers, data, renderRow }) => (
  <div className="overflow-x-auto max-h-60 scrollbar-thin">
    <table className="min-w-full divide-y divide-gray-300">
      <thead className="bg-gray-50 sticky top-0">
        <tr>
          {headers.map((header) => (
            <th key={header} scope="col" className={thStyle}>
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 bg-white">
        {data.map((item, index) => (
          <tr key={index}>{renderRow(item)}</tr>
        ))}
      </tbody>
    </table>
    {data.length === 0 && (
      <p className="text-center py-4 text-gray-500">Không có dữ liệu.</p>
    )}
  </div>
);

// CSS cho Table
const thStyle = "px-3 py-3.5 text-left text-sm font-semibold text-gray-900";
const tdStyle = "whitespace-nowrap px-3 py-4 text-sm text-gray-700";

export default InputAnalysisView;