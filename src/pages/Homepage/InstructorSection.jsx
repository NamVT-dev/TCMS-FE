import React from "react";

const InstructorSection = () => {
  const instructors = [
    { name: "Nguyễn Thành Trung", score: "8.0 IELTS overall", specialty: "IELTS Speaking" },
    { name: "Trần Minh Anh", score: "8.5 IELTS overall", specialty: "IELTS Writing" },
    { name: "Lê Hoàng Nam", score: "950 TOEIC", specialty: "TOEIC Expert" },
    { name: "Phạm Thu Hà", score: "8.0 IELTS overall", specialty: "Grammar Master" },
  ];

  return (
    <section className="py-20 px-4 md:px-8 bg-white" id="instructors">
      <div className="container mx-auto text-center max-w-7xl">
        {/* Section Header */}
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Đội ngũ <span className="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">giảng viên</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Đội ngũ giảng viên luyện thi có trình độ chuyên môn cao và kỹ năng sư
            phạm vững chắc luôn đặt mục tiêu giúp học viên đạt điểm cao nhất.
          </p>
        </div>

        {/* Instructors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {instructors.map((inst, i) => (
            <div
              key={i}
              className="group bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 transform hover:-translate-y-2"
            >
              {/* Instructor Image */}
              <div className="relative w-40 h-48 bg-gradient-to-br from-purple-200 to-purple-300 rounded-2xl mx-auto mb-4 flex items-center justify-center text-6xl overflow-hidden">
                👨‍🏫
                {/* Star Badge */}
                <div className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg">
                  <span className="text-yellow-500">⭐</span>
                </div>
              </div>

              {/* Instructor Info */}
              <h4 className="font-bold text-lg text-gray-800 mb-1">
                {inst.name}
              </h4>
              <p className="text-purple-600 font-semibold text-sm mb-2">
                {inst.score}
              </p>
              <p className="text-gray-500 text-sm">
                {inst.specialty}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstructorSection;