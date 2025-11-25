import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { LEVEL_RANGES, getDisplayRange } from "../../utils/scoreToLevel"; 

const InstructorSection = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await api.learner.getTeacherHighlights();
        setTeachers(res.data.data || []);
      } catch (error) {
        console.error("Failed to load teacher highlights", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  return (
    <section className="py-24 px-4 bg-gray-50 font-sans" id="instructors">
      <div className="container mx-auto max-w-7xl">
        
        {/* --- Header Section (Marketing Copywriting) --- */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Đồng hành cùng <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Top Giảng Viên</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Đội ngũ giảng viên luyện thi có trình độ chuyên môn cao và kỹ năng
            sư phạm vững chắc luôn đặt mục tiêu giúp học viên đạt điểm cao nhất.
          </p>
        </div>

        {loading && (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        )}

        {/* --- Teachers Grid --- */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teachers.map((teacher) => (
              <div
                key={teacher._id}
                className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden border border-gray-100 flex flex-col"
              >
                {/* 1. Image Area - Full width tạo cảm giác chuyên nghiệp */}
                <div className="relative h-72 w-full overflow-hidden">
                  {teacher.profile?.photo ? (
                    <img
                      src={teacher.profile.photo}
                      alt={teacher.profile.fullname}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-6xl">
                      👨‍🏫
                    </div>
                  )}
                  
                  {/* Overlay Gradient giúp chữ dễ đọc hơn nếu muốn chèn lên ảnh */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Verified Badge (Tạo uy tín) */}
                  
                </div>

                {/* 2. Content Body */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors mb-1">
                    {teacher.profile.fullname}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 font-medium uppercase tracking-wide">
                    Senior Instructor
                  </p>

                  {/* Divider */}
                  <div className="w-full h-px bg-gray-100 mb-4"></div>

                  {/* 3. Skills & Scores (Phần quan trọng nhất) */}
                  <div className="space-y-3 mt-auto">
                    {teacher.skills?.map((skill, idx) => {
                      const categoryName = skill.category?.name || "Other";
                      const levelName = skill.levels?.[0] || ""; // Lấy level đầu tiên
                      const displayScore = getDisplayRange(categoryName, levelName);
                      
                      // Màu sắc riêng cho từng môn
                      const isIELTS = categoryName.toUpperCase().includes("IELTS");
                      const bgClass = isIELTS ? "bg-purple-50 border-purple-100" : "bg-blue-50 border-blue-100";
                      const textClass = isIELTS ? "text-purple-700" : "text-blue-700";
                      const labelColor = isIELTS ? "bg-purple-500" : "bg-blue-500";

                      return (
                        <div key={idx} className={`flex items-center justify-between p-2 rounded-xl border ${bgClass}`}>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded ${labelColor}`}>
                              {categoryName}
                            </span>
                            <span className={`text-sm font-semibold ${textClass}`}>
                              {levelName}
                            </span>
                          </div>
                          {/* Hiển thị điểm số cụ thể */}
                          <div className="text-xs font-bold text-gray-700 bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100">
                             {displayScore}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* CTA Button (Ẩn hiện khi hover - Tạo tương tác) */}
                  
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default InstructorSection;