import React, { useEffect, useState } from "react";
import api from "../../utils/api";

const CourseSection = () => {
  const [coursesByCategory, setCoursesByCategory] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.user.getCourses();
        const courses = res.data.data.courses;

        const grouped = courses.reduce((acc, course) => {
          const cat = course.category || "Khác";
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(course);
          return acc;
        }, {});

        setCoursesByCategory(grouped);
        setLoading(false);
      } catch (err) {
        console.error("Lỗi khi load khóa học:", err);
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <section className="py-20 px-6 bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 md:px-8 bg-gray-50" id="courses">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Khóa học <span className="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">nổi bật</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Chương trình học được thiết kế bài bản, phù hợp với mọi trình độ
          </p>
        </div>

        {Object.keys(coursesByCategory).map((category) => (
          <div key={category} className="mb-16">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
                📖
              </div>
              <h3 className="text-2xl font-bold text-gray-800">
                Khóa học {category}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {coursesByCategory[category].map((course) => (
                <div
                  key={course._id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2"
                >
                  {/* Course Image */}
                  <div className="relative w-full h-48 bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center overflow-hidden">
                    {course.imageCover ? (
                      <img
                        src={course.imageCover}
                        alt={course.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-6xl">📚</span>
                    )}
                    <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-lg">
                      <span className="text-purple-600 font-semibold text-xs">{category}</span>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-gray-800 mb-3 group-hover:text-purple-600 transition-colors">
                      {course.name}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                      {course.description}
                    </p>

                    {/* Course Info */}
                    <div className="flex items-center justify-between text-sm mb-4 pb-4 border-b border-gray-100">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <span className="font-medium">⏱️ {course.session || "20"} buổi</span>
                      </div>
                      <div className="text-purple-600 font-bold">
                        {course.price ? `${parseInt(course.price).toLocaleString()}₫` : "Liên hệ"}
                      </div>
                    </div>

                    {/* CTA Button */}
                    <button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform group-hover:scale-105 shadow-md hover:shadow-lg">
                      Tìm hiểu ngay 
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CourseSection;