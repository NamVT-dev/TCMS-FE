import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
  DocumentTextIcon,
  PlusCircleIcon,
  MapPinIcon,
  ClockIcon,
  LinkIcon,
  EyeIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";

import api from "../../../utils/api";
import Loading from "../../UI/Loading";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

// Import Modal Upload
import TeacherUploadMaterialModal from "./TeacherUploadMaterialModal";

const TeacherClassDetail = () => {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [classData, setClassData] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const [isStudentsExpanded, setIsStudentsExpanded] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  // --- HÀM FETCH DỮ LIỆU ---
  const fetchClass = async () => {
    try {
      if (!classData) setIsLoading(true);

      const res = await api.teacher.getMyClassDetail(classId);
      const data = res.data.data;

      setClassData(data);

      if (data.classInfo && data.classInfo.learningMaterial) {
        setMaterials(data.classInfo.learningMaterial);
      } else {
        setMaterials([]);
      }

    } catch (err) {
      console.error("Lỗi khi tải chi tiết lớp:", err);
      setError(err?.message || "Không thể tải chi tiết lớp học.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (classId) {
      fetchClass();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  const getInitials = (name = "") => {
    if (!name) return "HV"; // Mặc định là Học Viên
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const handleMaterialUploaded = () => {
    fetchClass();
  };

  // --- RENDER ---

  if (isLoading) return <Loading fullscreen message="Đang tải chi tiết lớp..." />;
  if (error) return <div className="text-red-600 bg-red-50 p-4 rounded-lg m-4 border border-red-200">{error}</div>;
  if (!classData) return <p className="text-gray-600 p-6">Không tìm thấy dữ liệu lớp học.</p>;

  const { classInfo, sessions = [], enrollments = [] } = classData;

  return (
    <div className="container mx-auto px-4 md:px-6 pb-12 pt-6">
      {/* Nút Quay lại */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/teacher/my-classes")}
          className="flex items-center text-purple-600 hover:text-purple-800 font-medium transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Quay lại Danh sách lớp
        </button>
      </div>

      {/* Header: Class Name & Course */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-8 rounded-2xl shadow-lg mb-8">
        <h1 className="text-3xl md:text-4xl font-bold leading-tight">{classInfo.name}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 opacity-90 text-sm md:text-base">
          <span className="hidden sm:inline">Khóa học: </span>
          <p>{classInfo.course?.name || "Khóa học"}</p>
        </div>
      </div>

      {/* --- BỐ CỤC CHÍNH (2 Cột) --- */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">

        {/* === CỘT TRÁI (2/3): SCHEDULE === */}
        <div className="w-full lg:w-2/3 space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <CalendarDaysIcon className="w-6 h-6 text-purple-600" />
                Lịch trình học tập
              </h2>
              <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                {sessions.length} Buổi
              </span>
            </div>

            {(() => {
              const now = new Date();
              const upcoming = sessions
                .filter((s) => new Date(s.endAt) >= now)
                .sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
              const past = sessions
                .filter((s) => new Date(s.endAt) < now)
                .sort((a, b) => new Date(b.startAt) - new Date(a.startAt));

              const showing = showAll ? upcoming : upcoming.slice(0, 3);

              return (
                <div className="relative pl-2 md:pl-4">
                  {/* Vertical Line */}
                  <div className="absolute left-[19px] md:left-[27px] top-2 bottom-0 w-0.5 bg-gray-200"></div>

                  {sessions.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-500 italic">Chưa có lịch học nào được tạo.</p>
                    </div>
                  )}

                  {/* Upcoming Sessions List */}
                  <div className="space-y-6 relative z-10">
                    {showing.map((session, index) => {
                      const isNext = index === 0;
                      return (
                        <div key={session._id} className="flex gap-4 group">
                          {/* Dot */}
                          <div className={`mt-1.5 w-6 h-6 rounded-full border-4 shrink-0 bg-white z-10 transition-colors
                                ${isNext ? "border-purple-500 shadow-[0_0_0_4px_rgba(168,85,247,0.2)]" : "border-gray-300 group-hover:border-purple-300"}`}
                          />

                          {/* Card */}
                          <div className={`flex-1 p-5 rounded-xl border transition-all duration-200 
                                ${isNext ? "bg-purple-50 border-purple-200 shadow-sm" : "bg-white border-gray-200 hover:border-purple-200 hover:shadow-sm"}`}>

                            <div className="flex flex-wrap justify-between items-start mb-3 gap-2">
                              <div className="flex items-center gap-3">
                                <h3 className={`font-bold text-lg ${isNext ? "text-purple-900" : "text-gray-800"}`}>
                                  Buổi {session.sessionNo}
                                </h3>
                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border
                                                ${session.status === 'scheduled' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                  {session.status}
                                </span>
                              </div>
                              {isNext && <span className="text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded font-bold animate-pulse">NEXT</span>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <CalendarDaysIcon className="w-4 h-4 text-purple-500" />
                                <span className="capitalize font-medium">
                                  {format(new Date(session.startAt), "EEEE, dd/MM/yyyy", { locale: vi })}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <ClockIcon className="w-4 h-4 text-purple-500" />
                                <span>
                                  {format(new Date(session.startAt), "HH:mm")} - {format(new Date(session.endAt), "HH:mm")}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 sm:col-span-2">
                                <MapPinIcon className="w-4 h-4 text-purple-500" />
                                <span className="font-medium text-gray-700">
                                  {session.room?.name || "Chưa xếp phòng"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Show More */}
                  {upcoming.length > 3 && (
                    <div className="pl-10 mt-4">
                      <button
                        onClick={() => setShowAll(!showAll)}
                        className="text-sm font-medium text-purple-600 hover:text-purple-800 hover:underline transition"
                      >
                        {showAll ? "Thu gọn danh sách" : `Xem thêm ${upcoming.length - 3} buổi sắp tới`}
                      </button>
                    </div>
                  )}

                  {/* Past Sessions */}
                  {past.length > 0 && showAll && (
                    <div className="mt-8 pt-6 border-t border-dashed border-gray-200">
                      <h4 className="ml-2 md:ml-10 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Đã kết thúc</h4>
                      <div className="space-y-4 relative z-10">
                        {past.map((session) => (
                          <div key={session._id} className="flex gap-4 opacity-60 hover:opacity-100 transition-opacity">
                            <div className="mt-1.5 w-6 h-6 rounded-full border-4 border-gray-300 shrink-0 bg-gray-100 z-10" />
                            <div className="flex-1 p-3 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-between">
                              <span className="font-semibold text-gray-700 text-sm">Buổi {session.sessionNo}</span>
                              <span className="text-sm text-gray-500">{format(new Date(session.startAt), "dd/MM/yyyy")}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        {/* === CỘT PHẢI (1/3): MATERIALS (Trên) & STUDENTS (Dưới) === */}
        <aside className="w-full lg:w-1/3 space-y-6">

          {/* 1. SECTION: LEARNING MATERIALS */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-bold text-gray-800">Tài liệu</h2>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="p-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition"
                title="Thêm tài liệu"
              >
                <PlusCircleIcon className="w-5 h-5" />
              </button>
            </div>

            {/* List Materials Compact */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
              {materials.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <p className="text-xs text-gray-500">Chưa có tài liệu nào.</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {materials.map((m) => {
                    const isLink = m.content.startsWith("http");
                    return (
                      <li key={m._id} className="p-3 bg-gray-50 border border-gray-100 rounded-lg hover:border-purple-200 transition group">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-800 truncate" title={m.title}>{m.title}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {m.createAt ? format(new Date(m.createAt), "dd/MM/yyyy") : ""}
                            </p>
                          </div>
                          <div className="shrink-0">
                            {isLink ? (
                              <a href={m.content} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                                <LinkIcon className="w-4 h-4" />
                              </a>
                            ) : (
                              <button
                                onClick={() => setExpandedId(expandedId === m._id ? null : m._id)}
                                className="text-gray-500 hover:text-purple-600 transition"
                              >
                                <ChevronDownIcon className={`w-4 h-4 transition-transform ${expandedId === m._id ? 'rotate-180' : ''}`} />
                              </button>
                            )}
                          </div>
                        </div>
                        {!isLink && expandedId === m._id && (
                          <div className="mt-2 pt-2 border-t border-gray-200 max-h-40 overflow-y-auto scrollbar-thin">
                            <p className="text-xs text-gray-600 whitespace-pre-wrap pr-2">{m.content}</p>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* 2. SECTION: STUDENT LIST */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
            <div
              className="flex items-center justify-between mb-4 cursor-pointer"
              onClick={() => setIsStudentsExpanded(!isStudentsExpanded)}
            >
              <div className="flex items-center gap-2">
                <UserGroupIcon className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-bold text-gray-800">
                  Học viên <span className="ml-1 text-sm font-normal text-gray-500">({enrollments.length})</span>
                </h3>
              </div>
              <ChevronDownIcon
                className={`w-4 h-4 text-gray-400 transform transition-transform ${isStudentsExpanded ? 'rotate-180' : ''}`}
              />
            </div>

            {/* List Students */}
            <div className={`transition-all duration-300 ease-in-out ${isStudentsExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"} overflow-hidden`}>
              <div className="space-y-3 overflow-y-auto max-h-[400px] pr-1 custom-scrollbar">
                {enrollments.length === 0 && (
                  <p className="text-gray-500 italic text-sm text-center py-4">Chưa có học viên nào.</p>
                )}

                {enrollments.map((e) => {
                  const student = e.student || {};
                  // Lấy tên từ student.name (ưu tiên) hoặc profile
                  const fullname = student.name || student.profile?.fullname || "Học viên";
                  // Lấy URL ảnh
                  const photoUrl = student.photo; 
                  // Tạo thông tin phụ (Vd: Nam - 2003) thay vì email vì JSON không có email
                  const subInfo = [
                    student.gender === 'male' ? 'Nam' : (student.gender === 'female' ? 'Nữ' : ''),
                    student.dob ? new Date(student.dob).getFullYear() : ''
                  ].filter(Boolean).join(" - ");

                  const initials = getInitials(fullname);

                  return (
                    <div
                      key={e._id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition cursor-default"
                    >
                      {/* --- AVATAR LOGIC --- */}
                      {photoUrl ? (
                        <img 
                          src={photoUrl} 
                          alt={fullname} 
                          className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0"
                          onError={(e) => {
                            e.target.onerror = null; 
                            e.target.src = "https://res.cloudinary.com/dmskqrjiu/image/upload/v1742210170/users/default.jpg.jpg"; // Fallback nếu ảnh lỗi
                          }}
                        />
                      ) : (
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0"
                          style={{
                            background: "linear-gradient(135deg, #f472b6 0%, #a855f7 100%)",
                          }}
                        >
                          {initials}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-800 truncate">{fullname}</p>
                        {/* Hiển thị thông tin phụ thay vì email bị thiếu */}
                        <p className="text-[11px] text-gray-500 truncate">
                          {subInfo || "Học viên"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </aside>
      </div>

      {/* --- MODAL UPLOAD MATERIAL --- */}
      <TeacherUploadMaterialModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        classId={classId}
        onUploaded={handleMaterialUploaded}
      />
    </div>
  );
};

export default TeacherClassDetail;