import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Calendar, 
  User, 
  Clock, 
  Shield, 
  BookOpen,
  CheckCircle,
  XCircle,
  AlertCircle, RefreshCw
} from "lucide-react";
import api from "../../../../utils/api";
import toast from "react-hot-toast";

const AdminStudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudentDetail = async () => {
      try {
        setLoading(true);
        
        const res = await api.admin.getOnemember(id);
        
        if (res.data?.status === "success") {
          setStudent(res.data.data);
        } else {
          setError("Không tìm thấy thông tin học viên");
        }
      } catch (err) {
        console.error("Lỗi khi tải chi tiết học viên:", err);
        setError("Có lỗi xảy ra khi tải dữ liệu");
        toast.error("Không thể tải thông tin chi tiết");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStudentDetail();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-gray-500 font-medium">Đang tải thông tin chi tiết...</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Đã xảy ra lỗi</h2>
            <p className="text-gray-500 mb-6">{error || "Không tìm thấy dữ liệu học viên"}</p>
            <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
            >
            Quay lại danh sách
            </button>
        </div>
      </div>
    );
  }

  const { profile, email, role, active, createdAt, updatedAt, student: studentCourses } = student;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-purple-700 transition-colors mb-6 font-medium group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Quay lại danh sách
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
              <div className="h-32 bg-gradient-to-r from-purple-600 to-indigo-600 relative">
                 <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                    <img
                        src={profile?.photo || "https://via.placeholder.com/150"}
                        alt={profile?.fullname}
                        className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-md bg-white"
                        onError={(e) => {e.target.src = "https://via.placeholder.com/150"}}
                    />
                 </div>
              </div>
              <div className="pt-14 pb-6 px-6 text-center">
                <h1 className="text-xl font-bold text-gray-900 mb-1">{profile?.fullname}</h1>
                <p className="text-gray-500 text-sm mb-4">{email}</p>
                
                <div className="flex justify-center mb-6">
                   {active ? (
                    <span className="px-4 py-1.5 inline-flex text-sm font-semibold rounded-full bg-green-50 text-green-700 items-center gap-1.5 border border-green-200">
                        <CheckCircle className="w-4 h-4" /> Đang hoạt động
                    </span>
                   ) : (
                    <span className="px-4 py-1.5 inline-flex text-sm font-semibold rounded-full bg-red-50 text-red-700 items-center gap-1.5 border border-red-200">
                        <XCircle className="w-4 h-4" /> Đã vô hiệu hóa
                    </span>
                   )}
                </div>

                <div className="border-t border-gray-100 pt-6 text-left space-y-4">
                    <div className="flex items-start">
                        <User className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold">Vai trò</p>
                            <p className="text-gray-700 font-medium capitalize">{role}</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <Phone className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold">Số điện thoại</p>
                            <p className="text-gray-700 font-medium">{profile?.phoneNumber || "Chưa cập nhật"}</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <Calendar className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold">Ngày sinh</p>
                            <p className="text-gray-700 font-medium">
                                {profile?.dob ? new Date(profile.dob).toLocaleDateString('vi-VN') : "Chưa cập nhật"}
                            </p>
                        </div>
                    </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            
            

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center">
                        <BookOpen className="w-5 h-5 mr-2 text-purple-600" />
                        Khóa học / Lớp học tham gia
                    </h3>
                    <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-md">
                        {studentCourses?.length || 0} lớp
                    </span>
                </div>
                
                {studentCourses && studentCourses.length > 0 ? (
                    <div className="space-y-3">
                        {studentCourses.map((courseId, index) => (
                            <div key={index} className="flex items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                                    <BookOpen className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">Lớp học ID: {courseId}</p>
                                    <p className="text-xs text-gray-500">Đang cập nhật tên lớp...</p>
                                </div>
                                <button className="ml-auto text-xs font-medium text-purple-600 hover:text-purple-800">
                                    Xem lớp
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 font-medium">Chưa tham gia lớp học nào</p>
                    </div>
                )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStudentDetail;
// ```

// **Lưu ý:**
// * **Routing:** Bạn cần thêm route cho trang chi tiết vào `App.js` hoặc file quản lý route của bạn:
//     ```javascript
//     <Route path="/admin/student/:id" element={<AdminStudentDetail />} />