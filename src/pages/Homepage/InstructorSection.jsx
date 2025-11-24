import React, { useEffect, useState } from "react";
import api from "../../utils/api";

const InstructorSection = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gọi API lấy top teachers
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
    <section className="py-20 px-4 md:px-8 bg-white" id="instructors">
      <div className="container mx-auto text-center max-w-7xl">
        {/* Section Header */}
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Đội ngũ{" "}
            <span className="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              giảng viên xuất sắc
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Đội ngũ giảng viên luyện thi có trình độ chuyên môn cao và kỹ năng
            sư phạm vững chắc luôn đặt mục tiêu giúp học viên đạt điểm cao nhất.
          </p>
        </div>

        {/* Loading */}
        {loading && <p className="text-gray-600">Đang tải danh sách giảng viên...</p>}

        {/* Instructors Grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teachers.map((teacher) => (
              <div
                key={teacher._id}
                className="group bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 transform hover:-translate-y-2"
              >
                {/* Instructor Image */}
                <div className="relative w-40 h-48 bg-gradient-to-br from-purple-200 to-purple-300 rounded-2xl mx-auto mb-4 flex items-center justify-center overflow-hidden">
                  {teacher?.profile?.photo ? (
                    <img
                      src={teacher.profile.photo}
                      alt={teacher.profile.fullname}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <span className="text-6xl">👨‍🏫</span>
                  )}

                  {/* Star Badge */}
                  <div className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg">
                    <span className="text-yellow-500">⭐</span>
                  </div>
                </div>

                {/* Instructor Info */}
                <h4 className="font-bold text-lg text-gray-800 mb-1">
                  {teacher.profile.fullname}
                </h4>

                <p className="text-purple-600 font-semibold text-sm mb-2">
                  {teacher.highestSkillLevel || "High Level"}
                </p>

                <p className="text-gray-500 text-sm">
                  {teacher.skills && teacher.skills.length > 0
                    ? teacher.skills.map((s) => s.levels.join(", ")).join(" • ")
                    : "Không có dữ liệu kỹ năng"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default InstructorSection;
