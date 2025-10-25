import React from "react";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-purple-200 via-white to-purple-200">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 right-20 w-64 h-64 bg-purple-300 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-purple-400 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-3 md:px-6 pt-24 pb-12 max-w-7xl">
        <div className="md:flex items-center justify-between gap-12">
          {/* Left content */}
          <div className="md:w-1/2 space-y-6 relative z-10">
            <button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-sm font-semibold px-6 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              ✨ Kiểm tra đầu vào miễn phí
            </button>

            <h1 className="text-5xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              Lộ trình Học & Luyện{" "}
              <span className="block mt-2 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                Tiếng Anh toàn diện
              </span>
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed">
              TutorCenter không dạy theo một kịch bản duy nhất. Chúng tôi lắng nghe mục tiêu,
              thấu hiểu điểm mạnh và xây dựng một lộ trình học tập thích ứng hoàn toàn
              với nhu cầu của bạn.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-4 rounded-full font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                Bắt đầu học ngay →
              </button>
              <button className="bg-white hover:bg-gray-50 text-purple-700 px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-purple-200">
                Tư vấn miễn phí
              </button>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 pt-6">
              <div>
                <div className="text-3xl font-bold text-purple-600">1000+</div>
                <div className="text-sm text-gray-600">Học viên</div>
              </div>
              <div className="h-12 w-px bg-gray-300"></div>
              <div>
                <div className="text-3xl font-bold text-purple-600">50+</div>
                <div className="text-sm text-gray-600">Khóa học</div>
              </div>
              <div className="h-12 w-px bg-gray-300"></div>
              <div>
                <div className="text-3xl font-bold text-purple-600">98%</div>
                <div className="text-sm text-gray-600">Hài lòng</div>
              </div>
            </div>
          </div>

          {/* Right image */}
          <div className="md:w-1/2 mt-12 md:mt-0 flex justify-center relative z-10">
            <div className="w-full max-w-lg">
              <div className="bg-white rounded-3xl shadow-2xl p-6 transform hover:scale-105 transition-all duration-300">
                <div className="aspect-video bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center text-purple-600 text-xl font-semibold">
                  📚 Hình ảnh học tập
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
