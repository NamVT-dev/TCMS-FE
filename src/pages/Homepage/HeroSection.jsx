import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { useNavigate } from "react-router-dom";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function HeroSection({ onOpenModal, showLoginMessage, isLoggedIn, onOpenChat }) {
    const navigate = useNavigate();

    const carouselImages = [
        {
            id: 1,
            src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800",
            alt: "Học sinh đang học tập",
            caption: "Lớp học sôi động"
        },
        {
            id: 2,
            src: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800",
            alt: "Giáo viên đang giảng dạy",
            caption: "Giảng viên nhiệt tình"
        },
        {
            id: 3,
            src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800",
            alt: "Học viên thuyết trình",
            caption: "Thực hành thực tế"
        }
    ];

    const handleStartLearning = () => {
        if (isLoggedIn) {
            navigate('/learner/my-classes');
        } else {
            // Hiển thị thông báo yêu cầu đăng nhập
            navigate('/login?redirect=/learner/my-classes');
        }
    };

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
                    <div className="md:w-5/12 space-y-6 relative z-10">

                        {/* THÔNG BÁO ĐĂNG NHẬP */}
                        {showLoginMessage && (
                            <div className="p-3 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-semibold border border-yellow-300 animate-slideDown flex items-center gap-2">
                                ⚠️ Vui lòng
                                <span
                                    onClick={() => navigate('/login?redirect=/register-first-test')}
                                    className="underline cursor-pointer text-yellow-900 hover:text-yellow-700 transition-colors"
                                >
                                    đăng nhập
                                </span>
                                để đăng ký kiểm tra.
                            </div>
                        )}

                        <button
                            onClick={onOpenModal}
                            disabled={showLoginMessage}
                            className="group relative overflow-hidden rounded-full bg-gradient-to-r from-purple-700 via-violet-700 to-indigo-700 px-8 py-3 text-white shadow-[0_4px_15px_rgba(109,40,217,0.4)] transition-all duration-300 hover:scale-105 hover:shadow-[0_6px_20px_rgba(109,40,217,0.6)] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {/* Hiệu ứng nền background di chuyển nhẹ khi hover   */}
                            <div className="absolute inset-0 bg-black/10 group-hover:opacity-0 transition-opacity" />

                            {/* Hiệu ứng luồng sáng (Shine) - Đã giảm độ gắt từ white/50 xuống white/20 */}
                            <div className="absolute top-0 -left-[100%] h-full w-full -skew-x-[20deg] bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine" />

                            {/* Nội dung nút */}
                            <span className="relative flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                                <span className="text-xl">✨</span>
                                Kiểm tra đầu vào miễn phí
                            </span>
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
                            {/* BUTTON BẮT ĐẦU HỌC NGAY */}
                            <button
                                onClick={handleStartLearning}
                                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-4 rounded-full font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group relative"
                            >
                                {isLoggedIn ? (
                                    <>
                                        Bắt đầu học ngay →
                                    </>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        Đăng nhập để học
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                        </svg>
                                    </span>
                                )}
                            </button>

                            {/* BUTTON TƯ VẤN MIỄN PHÍ - MỞ CHATBOT */}
                            <button
                                onClick={onOpenChat}
                                className="bg-white hover:bg-gray-50 text-purple-700 px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-purple-200 group"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    Tư vấn miễn phí
                                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </span>
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

                    {/* Right carousel - Swiper */}
                    <div className="md:w-7/12 mt-12 md:mt-0 flex justify-center relative z-10">
                        <div className="w-full">
                            <div className="bg-white rounded-3xl shadow-2xl p-6 transform hover:scale-[1.02] transition-all duration-300">
                                <Swiper
                                    modules={[Navigation, Pagination, Autoplay]}
                                    spaceBetween={0}
                                    slidesPerView={1}
                                    navigation
                                    pagination={{ clickable: true }}
                                    autoplay={{
                                        delay: 3000,
                                        disableOnInteraction: false,
                                    }}
                                    className="rounded-2xl"
                                >
                                    {carouselImages.map((image) => (
                                        <SwiperSlide key={image.id}>
                                            <div className="relative aspect-video bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl overflow-hidden">
                                                <img
                                                    src={image.src}
                                                    alt={image.alt}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white px-6 py-2 rounded-full">
                                                    <h5 className="font-semibold">{image.caption}</h5>
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                :global(.swiper-button-next),
                :global(.swiper-button-prev) {
                    color: rgb(147, 51, 234);
                    background: white;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                }
                
                :global(.swiper-button-next:after),
                :global(.swiper-button-prev:after) {
                    font-size: 20px;
                }
                
                :global(.swiper-pagination-bullet) {
                    background: rgb(147, 51, 234);
                    opacity: 0.5;
                }
                
                :global(.swiper-pagination-bullet-active) {
                    opacity: 1;
                }
                
                @keyframes slideDown {
                    from {
                        transform: translateY(-20px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }

                .animate-slideDown {
                    animation: slideDown 0.3s ease-out;
                }
                    @keyframes shine {
        0% {
            left: -100%;
        }
        20% {
            left: 100%;
        }
        100% {
            left: 100%;
        }
    }

    .animate-shine {
        animation: shine 3s infinite linear;
    }
            `}</style>
        </section>
    );
}