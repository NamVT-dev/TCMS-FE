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
} from "@heroicons/react/24/outline";

import api from "../../../utils/api";
import Loading from "../../UI/Loading";
import { format, isBefore } from "date-fns";
import { vi } from "date-fns/locale";

// Giả sử file modal nằm cùng thư mục, hãy điều chỉnh đường dẫn nếu cần
import TeacherUploadMaterialModal from "./TeacherUploadMaterialModal"; 

const TeacherClassDetail = () => {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [classData, setClassData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);

  
  const [isStudentsExpanded, setIsStudentsExpanded] = useState(true);
  
 
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

 
  const [materials, setMaterials] = useState([]);

  const fetchClass = async () => {
    try {
      
      if (!classData) setIsLoading(true); 
      
      const res = await api.teacher.getMyClassDetail(classId);
      setClassData(res.data.data);
      
     
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
  
  }, [classId]);

  
  const getInitials = (name = "") => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  
  const handleMaterialUploaded = () => {
   
    fetchClass();
    
    
    console.log("Upload thành công, đang làm mới dữ liệu...");
  };

 

  if (isLoading) return <Loading fullscreen message="Đang tải chi tiết lớp..." />;
  if (error) return <div className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>;
  if (!classData) return <p className="text-gray-600">Không tìm thấy dữ liệu lớp học.</p>;

  const { classInfo, sessions = [], enrollments = [] } = classData;

  return (
    <div className="container mx-auto px-4 md:px-6 pb-12">
      {/* Back */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/teacher/my-classes")}
          className="flex items-center text-purple-600 hover:text-purple-800 font-medium"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Quay lại Danh sách lớp
        </button>
      </div>

      {/* Header: Class Name & Course */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-2xl shadow-lg mb-8">
        <h1 className="text-3xl font-bold leading-tight">{classInfo.name}</h1>
        <p className="mt-1 text-sm opacity-90">{classInfo.course?.name || "Khóa học"}</p>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left column (2/3 on md) */}
        <div className="w-full md:w-2/3 space-y-6">
          
          {/* Upload Materials Section */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-500 rounded-lg text-white">
                  <DocumentTextIcon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Learning Materials</h2>
                  <p className="text-sm text-gray-500">Upload slide, bài tập, tài liệu cho lớp học</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Nút mở Modal Upload */}
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer transition shadow-sm hover:shadow"
                >
                  <PlusCircleIcon className="w-5 h-5 mr-2" />
                  <span>Upload</span>
                </button>

                
              </div>
            </div>

            {/* Materials list */}
            <div className="mt-4">
              {materials.length === 0 ? (
                <div className="text-gray-500 italic">Chưa có tài liệu nào. Bạn có thể upload ở trên.</div>
              ) : (
                <ul className="space-y-2">
                  {materials.map((m) => (
                    <li
                      key={m.id}
                      className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm hover:shadow-md transition"
                    >
                      <div>
                        <p className="font-medium text-gray-800">{m.name}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(m.uploadedAt), "dd/MM/yyyy HH:mm")}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <a
                          className="text-sm text-purple-600 hover:underline"
                          href="#"
                          onClick={(ev) => ev.preventDefault()}
                        >
                          Tải xuống
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* === TIMELINE BUỔI HỌC === */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <CalendarDaysIcon className="w-6 h-6 text-purple-600" />
                Lịch trình học tập
              </h2>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
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
                <>
                  {sessions.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                      <CalendarDaysIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">Chưa có lịch học nào được tạo.</p>
                    </div>
                  )}

                  <div className="relative">
                    {/* Vertical Line */}
                    <div
                      className="absolute left-3 md:left-6 top-0 bottom-0 w-1 rounded-full"
                      style={{
                        background: "linear-gradient(180deg, rgba(168,85,247,1) 0%, rgba(6,182,212,1) 100%)",
                      }}
                    />

                    {showing.map((session, index) => {
                      const isPast = new Date(session.endAt) < now;
                      const isNext = index === 0 && !isPast;

                      return (
                        <div key={session._id} className="relative pl-10 md:pl-14 mb-8 group">
                          {/* Dot */}
                          <div className="absolute left-1.5 md:left-4 top-6 w-4 h-4 rounded-full bg-white border-4 border-purple-400 shadow-lg"
                               style={{ boxShadow: "0 0 12px rgba(139,92,246,0.6)" }}
                          ></div>

                          {/* Card */}
                          <div className={`relative p-5 rounded-xl border transition-all duration-300 hover:shadow-lg hover:border-purple-300 ${isPast ? "bg-gray-50 border-gray-200" : "bg-white border-purple-200"}`}>
                            {isNext && (
                              <span className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full bg-purple-600 text-white shadow">
                                NEXT
                              </span>
                            )}
                            <div className="flex flex-col md:flex-row md:items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-bold text-gray-900 text-lg">Buổi {session.sessionNo}</h3>
                                  <span className="px-2.5 py-0.5 rounded text-xs font-semibold capitalize bg-purple-50 text-purple-700 border border-purple-200">
                                    {session.status}
                                  </span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm text-gray-600">
                                  <div className="flex items-center gap-1.5">
                                    <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
                                    <span className="capitalize font-medium">
                                      {format(new Date(session.startAt), "EEEE, dd/MM/yyyy", { locale: vi })}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <ClockIcon className="w-4 h-4 text-gray-400" />
                                    <span>{format(new Date(session.startAt), "HH:mm")} - {format(new Date(session.endAt), "HH:mm")}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-4 md:mt-0 md:ml-6">
                                <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                  <MapPinIcon className="w-4 h-4 text-purple-500" />
                                  {session.room?.name || "Chưa xếp phòng"}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {upcoming.length > 3 && (
                      <button
                        onClick={() => setShowAll(!showAll)}
                        className="mx-auto block text-purple-600 text-sm font-medium hover:underline mt-2"
                      >
                        {showAll ? "Thu gọn" : `Xem tất cả (${upcoming.length})`}
                      </button>
                    )}

                    {past.length > 0 && showAll && (
                      <div className="mt-6 pt-4 border-t">
                        <p className="text-gray-500 font-medium mb-3 text-sm">Buổi đã qua</p>
                        {past.map((session) => (
                          <div key={session._id} className="pl-10 md:pl-14 mb-6 opacity-80">
                            <div className="p-5 rounded-xl border bg-gray-50 border-gray-200">
                              <h3 className="font-semibold text-gray-700 mb-1">Buổi {session.sessionNo}</h3>
                              <p className="text-sm text-gray-500">{format(new Date(session.startAt), "dd/MM/yyyy")}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Right column (1/3 on md) - sticky student list */}
        <aside className="w-full md:w-1/3">
          <div className="md:sticky md:top-24">
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Danh sách học viên ({enrollments.length})</h3>
                <button
                  onClick={() => setIsStudentsExpanded(!isStudentsExpanded)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ChevronDownIcon className={`w-5 h-5 transform ${isStudentsExpanded ? "rotate-180" : "rotate-0"}`} />
                </button>
              </div>

              <div className={`${isStudentsExpanded ? "block" : "hidden"}`}>
                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2">
                  {enrollments.length === 0 && <div className="text-gray-500 italic">Chưa có học viên.</div>}
                  {enrollments.map((e) => {
                    const fullname = e.student?.profile?.fullname || "Chưa cập nhật";
                    const initials = getInitials(fullname);
                    return (
                      <div
                        key={e._id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:shadow-md transition cursor-pointer hover:bg-white"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                            style={{
                              background: "linear-gradient(135deg,#f472b6 0%,#8b5cf6 50%,#06b6d4 100%)",
                              boxShadow: "inset 0 -6px 18px rgba(0,0,0,0.06)",
                            }}
                          >
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-800 truncate">{fullname}</p>
                            <p className="text-sm text-gray-500 truncate">{e.student?.email || "N/A"}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Trạng thái</p>
                          <p className="text-sm font-medium text-gray-700">{e.status || "active"}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
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