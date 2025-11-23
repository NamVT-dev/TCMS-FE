import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../utils/api";
import { Loader2, TrendingUp, CalendarPlus, Users } from "lucide-react";

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
      setDemands(res.data.data || []);
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

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-purple-600 w-10 h-10" /></div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <TrendingUp className="mr-2 text-purple-600" /> 
          Nhu Cầu Mở Lớp (Gợi ý)
        </h1>
        <p className="text-gray-600 mt-1">Danh sách các nhóm học viên có cùng nhu cầu về môn học và thời gian.</p>
      </div>

      {demands.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <p className="text-gray-500">Chưa có dữ liệu nhu cầu nào đủ lớn hoặc tất cả đã được xử lý.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demands.map((item, index) => (
            <div key={index} className="bg-white rounded-lg shadow hover:shadow-md transition border-l-4 border-purple-500 overflow-hidden flex flex-col">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${item.targetType === 'Course' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                    {item.targetType}
                  </span>
                  <div className="flex items-center bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
                    <Users className="w-3 h-3 mr-1" />
                    {item.studentCount} Waiting
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-2 h-14">
                    {item.targetInfo?.name || "Unknown"}
                </h3>
                {item.targetType === 'Course' && <p className="text-sm text-gray-500 mb-3">{item.targetInfo?.level}</p>}

                <div className="bg-gray-50 p-3 rounded border text-sm text-gray-700 space-y-1">
                  <p> Thứ: <strong>{item.dayOfWeek}</strong></p>
                  <p> Ca: <strong>{item.shift}</strong></p>
                </div>

                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2">Học viên quan tâm:</p>
                  <div className="flex -space-x-2 overflow-hidden">
                    {item.students.slice(0, 5).map((st) => (
                      <img
                        key={st._id}
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                        src={st.profile?.photo || "https://ui-avatars.com/api/?name=" + st.name}
                        alt={st.name}
                        title={`${st.name} - ${st.profile?.phoneNumber}`}
                      />
                    ))}
                    {item.studentCount > 5 && (
                      <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white bg-gray-200 text-xs font-medium text-gray-600">
                        +{item.studentCount - 5}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleCreateClass(item)}
                className="w-full py-3 bg-gray-50 hover:bg-purple-50 text-purple-600 font-medium text-sm border-t transition flex justify-center items-center"
              >
                <CalendarPlus className="w-4 h-4 mr-2" />
                Tạo lớp học cho nhóm này
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminRequestDashboard;