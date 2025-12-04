import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../utils/api";
import { 
  Loader2, TrendingUp, CalendarPlus, Users, 
  Clock, Calendar, BookOpen, AlertCircle 
} from "lucide-react";

const DAYS_MAP = {
  0: "Chủ Nhật", 1: "Thứ 2", 2: "Thứ 3", 3: "Thứ 4", 
  4: "Thứ 5", 5: "Thứ 6", 6: "Thứ 7"
};

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
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = (item) => {
    navigate("/admin/classes/create", {
      state: {
        prefill: {
          courseId: item.targetType === "Course" ? item.targetInfo._id : null,
          categoryId: item.targetType === "Category" ? item.targetInfo._id : null,
          schedule: [
            { dayOfWeek: item.dayOfWeek, shiftName: item.shift }
          ]
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <TrendingUp className="mr-3 text-purple-600 w-8 h-8" /> 
          Nhu Cầu Mở Lớp
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          Danh sách các nhóm học viên đang chờ xếp lớp, được sắp xếp theo độ ưu tiên.
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
            
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 flex flex-col overflow-hidden group">
                
                <div className="p-5 border-b border-gray-100 relative">
                  <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-xs font-bold border-l border-b tracking-wide flex items-center ${priorityClass}`}>
                    <Users className="w-3 h-3 mr-1" />
                    {item.studentCount} HỌC VIÊN
                  </div>

                  <div className="flex items-start gap-3 mt-2">
                    <div className={`p-3 rounded-lg flex-shrink-0 ${item.targetType === 'Course' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 line-clamp-2 leading-tight">
                        {item.targetInfo?.name || "Chưa xác định"}
                      </h3>
                      {item.targetInfo?.level && (
                        <p className="text-sm font-medium text-gray-500 mt-1 flex items-center">
                          Level: <span className="text-gray-700 ml-1 bg-gray-100 px-2 py-0.5 rounded">{item.targetInfo.level}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col gap-4">
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-bold">Ngày học</p>
                        <p className="font-semibold text-gray-800">{DAYS_MAP[item.dayOfWeek]}</p>
                      </div>
                    </div>
                    <div className="h-8 w-[1px] bg-gray-300 mx-2"></div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-bold">Ca học</p>
                        <p className="font-semibold text-purple-700 text-lg">{item.shift}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center">
                      DANH SÁCH CHỜ ({item.studentCount})
                    </p>
                    <div className="flex items-center">
                      <div className="flex -space-x-3 overflow-hidden py-1 pl-1">
                        {item.students.slice(0, 5).map((st) => (
                          <img
                            key={st._id}
                            className="inline-block h-9 w-9 rounded-full ring-2 ring-white object-cover shadow-sm bg-gray-200"
                            src={st.profile?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(st.name)}&background=random`}
                            alt={st.name}
                            title={st.name}
                          />
                        ))}
                      </div>
                      {item.studentCount > 5 && (
                        <div className="ml-3 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          +{item.studentCount - 5} người khác
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 mt-auto">
                  <button
                    onClick={() => handleCreateClass(item)}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all flex justify-center items-center group-hover:scale-[1.02]"
                  >
                    <CalendarPlus className="w-5 h-5 mr-2" />
                    Mở Lớp Ngay
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