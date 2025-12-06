import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../utils/api";
import { 
  Loader2, TrendingUp, CalendarPlus, Users, 
  BookOpen, Layers 
} from "lucide-react";

const AdminRequestDashboard = () => {
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await api.admin.request.getSummary();
      let data = res.data.data || [];
      
      data.sort((a, b) => b.studentCount - a.studentCount);
      
      setDemands(data);
    } catch (error) {
      console.error("Lỗi tải summary:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = (item) => {
    navigate("/staff/classes/create", {
      state: {
        prefill: {
          courseId: item.targetType === "Course" ? item.targetInfo._id : null,
          categoryId: item.targetType === "Category" ? item.targetInfo._id : null,
        }
      }
    });
  };

  const getPriorityColor = (count) => {
    if (count >= 5) return "border-red-500 bg-red-50 text-red-700"; 
    if (count >= 3) return "border-orange-500 bg-orange-50 text-orange-700"; 
    return "border-blue-500 bg-blue-50 text-blue-700"; 
  };

  if (loading) return (
    <div className="p-10 flex justify-center items-center h-[50vh]">
      <Loader2 className="animate-spin text-purple-600 w-10 h-10" />
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db; 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af; 
        }
      `}</style>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <TrendingUp className="mr-3 text-purple-600 w-8 h-8" /> 
          Tổng Hợp Nhu Cầu
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          Danh sách các nhóm học viên đang chờ, được gom nhóm theo Khóa học hoặc Danh mục.
        </p>
      </div>

      {demands.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="bg-gray-100 p-4 rounded-full mb-4">
            <Users className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg font-medium">Hiện chưa có nhu cầu nào cần xử lý.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {demands.map((item, index) => {
            const priorityClass = getPriorityColor(item.studentCount);
            const isCourse = item.targetType === 'Course';
            
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 flex flex-col overflow-hidden group">
                
                {/* Header Card */}
                <div className="p-5 border-b border-gray-100 relative">
                  <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-xs font-bold border-l border-b tracking-wide flex items-center ${priorityClass}`}>
                    <Users className="w-3 h-3 mr-1" />
                    {item.studentCount} HỌC VIÊN
                  </div>

                  <div className="flex items-start gap-3 mt-2">
                    <div className={`p-3 rounded-lg flex-shrink-0 ${isCourse ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                      {isCourse ? <BookOpen className="w-6 h-6" /> : <Layers className="w-6 h-6" />}
                    </div>
                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 block ${isCourse ? 'text-blue-600' : 'text-green-600'}`}>
                        {isCourse ? 'Khóa Học' : 'Danh Mục'}
                      </span>
                      <h3 className="text-lg font-bold text-gray-800 line-clamp-2 leading-tight">
                        {item.targetInfo?.name || "Chưa xác định"}
                      </h3>
                      {isCourse && item.targetInfo?.level && (
                        <p className="text-sm font-medium text-gray-500 mt-1 flex items-center">
                          Level: <span className="text-gray-700 ml-1 bg-gray-100 px-2 py-0.5 rounded">{item.targetInfo.level}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Body Card: Danh sách học viên (SCROLLABLE) */}
                <div className="p-5 flex-1 flex flex-col">
                  <p className="text-xs font-semibold text-gray-500 mb-3 flex items-center uppercase tracking-wide">
                    Danh sách chờ ({item.studentCount})
                  </p>
                  
                  {/* --- KHU VỰC CUỘN --- */}
                  {/* max-h-[180px]: Chiều cao cố định khoảng 3-4 item */}
                  {/* overflow-y-auto: Tự động hiện thanh cuộn nếu danh sách dài */}
                  {/* custom-scrollbar: Class CSS tùy chỉnh thanh cuộn cho đẹp */}
                  <div className="max-h-[180px] overflow-y-auto custom-scrollbar pr-2 space-y-2">
                      {item.students.map((st) => (
                          <div key={st._id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                              <img
                                  className="h-9 w-9 rounded-full ring-1 ring-gray-200 object-cover bg-gray-100 flex-shrink-0"
                                  src={st.profile?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(st.name)}&background=random`}
                                  alt={st.name}
                              />
                              <div className="min-w-0 flex-1">
                                  <p className="text-sm font-semibold text-gray-800 truncate">{st.name}</p>
                                  {/* Hiển thị thêm thông tin phụ nếu cần */}
                                  <p className="text-xs text-gray-500 truncate">
                                      {st.learningGoal?.category?.name || "Chưa có mục tiêu"}
                                  </p>
                              </div>
                          </div>
                      ))}
                  </div>
                  {/* ------------------- */}
                </div>

                {/* Footer Action */}
                <div className="p-4 pt-0 mt-auto bg-white border-t border-gray-50">
                  <button
                    onClick={() => handleCreateClass(item)}
                    className="w-full mt-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all flex justify-center items-center group-hover:scale-[1.02]"
                  >
                    <CalendarPlus className="w-5 h-5 mr-2" />
                    Tạo Lớp Cho Nhóm Này
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminRequestDashboard;