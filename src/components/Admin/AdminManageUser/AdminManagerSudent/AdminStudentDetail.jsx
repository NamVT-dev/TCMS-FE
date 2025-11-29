import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Phone, Calendar, User, BookOpen,
  CheckCircle, XCircle, AlertCircle, 
  GraduationCap, Target, Clock, X
} from "lucide-react";
import api from "../../../../utils/api"; 
import toast from "react-hot-toast";

const AdminStudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [accountData, setAccountData] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    const fetchStudentDetail = async () => {
      try {
        setLoading(true);
        const res = await api.admin.getOnemember(id);
        
        if (res.data?.status === "success") {
          setAccountData(res.data.data);
        } else {
          setError("Không tìm thấy thông tin tài khoản");
        }
      } catch (err) {
        console.error("Lỗi:", err);
        setError("Có lỗi xảy ra khi tải dữ liệu");
        toast.error("Không thể tải thông tin");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchStudentDetail();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa cập nhật";
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
       <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (error || !accountData) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
         <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
         <h2 className="text-xl font-bold text-gray-800 mb-2">Đã xảy ra lỗi</h2>
         <p className="text-gray-500 mb-6">{error || "Không tìm thấy dữ liệu"}</p>
         <button onClick={() => navigate(-1)} className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">Quay lại</button>
      </div>
    </div>
  );

  const { profile, email, role, active, student: linkedStudents } = accountData;

  return (
    <div className="min-h-screen bg-gray-50 p-6 relative">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-purple-700 transition-colors mb-6 font-medium group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Quay lại danh sách
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
              <div className="h-32 bg-gradient-to-br from-purple-600 to-indigo-700 relative">
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
                <h1 className="text-xl font-bold text-gray-900">{profile?.fullname}</h1>
                <p className="text-gray-500 text-sm mb-3">{email}</p>
                
                <div className="flex justify-center mb-6">
                   {active ? (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Active
                    </span>
                   ) : (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Inactive
                    </span>
                   )}
                </div>

                <div className="border-t border-gray-100 pt-6 text-left space-y-4">
                    <InfoRow icon={User} label="Vai trò" value={role} capitalize />
                    <InfoRow icon={Phone} label="Điện thoại" value={profile?.phoneNumber} />
                    <InfoRow icon={Calendar} label="Ngày sinh" value={formatDate(profile?.dob)} />
                </div>
              </div>
            </div>
          </div>

          
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 flex items-center">
                            <GraduationCap className="w-6 h-6 mr-2 text-purple-600" />
                            Hồ sơ học viên quản lý
                        </h3>
                        <p className="text-gray-500 text-sm mt-1">Các học viên thuộc quản lý của tài khoản này</p>
                    </div>
                    <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full">
                        {linkedStudents?.length || 0} hồ sơ
                    </span>
                </div>
                
                {linkedStudents && linkedStudents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {linkedStudents.map((std, index) => (
                            <div 
                                key={index} 
                                onClick={() => setSelectedStudent(std)}
                                className="border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group bg-white"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg">
                                            {std.name?.charAt(0) || "S"}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                                                {std.name}
                                            </h4>
                                            <p className="text-xs text-gray-500">
                                                {std.gender === 'male' ? 'Nam' : std.gender === 'female' ? 'Nữ' : 'Khác'} 
                                                • {new Date().getFullYear() - new Date(std.dob).getFullYear()} tuổi
                                            </p>
                                        </div>
                                    </div>
                                    {std.enrolled ? (
                                        <div className="w-2 h-2 rounded-full bg-green-500" title="Đã nhập học"></div>
                                    ) : (
                                        <div className="w-2 h-2 rounded-full bg-gray-300" title="Chưa nhập học"></div>
                                    )}
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    {std.category?.map(cat => (
                                        <span key={cat._id} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                                            {cat.name}
                                        </span>
                                    ))}
                                    {std.tested ? (
                                         <span className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-medium">
                                            Đã test: {std.testScore}
                                         </span>
                                    ) : (
                                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">
                                            Chưa test
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">Chưa có hồ sơ học viên nào</p>
                    </div>
                )}
            </div>
          </div>
        </div>

        {selectedStudent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xl">
                                {selectedStudent.name?.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{selectedStudent.name}</h3>
                                <p className="text-sm text-gray-500">Mã học viên: {selectedStudent._id}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setSelectedStudent(null)}
                            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6 text-gray-500" />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto max-h-[70vh]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            <div className="space-y-4">
                                <h4 className="font-semibold text-gray-900 border-b pb-2">Thông tin cá nhân</h4>
                                <DetailRow label="Ngày sinh" value={formatDate(selectedStudent.dob)} />
                                <DetailRow label="Giới tính" value={selectedStudent.gender === 'male' ? 'Nam' : 'Nữ'} />
                                <DetailRow label="Ngày đăng ký" value={formatDate(selectedStudent.registeredAt)} />
                                <DetailRow 
                                    label="Trạng thái nhập học" 
                                    value={selectedStudent.enrolled ? "Đã nhập học" : "Chưa nhập học"} 
                                    isStatus={true}
                                    statusColor={selectedStudent.enrolled ? "text-green-600" : "text-gray-500"}
                                />
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-semibold text-gray-900 border-b pb-2">Hồ sơ học tập</h4>
                                <div className="flex flex-col gap-2">
                                    <span className="text-sm text-gray-500">Chương trình đăng ký:</span>
                                    <div className="flex gap-2">
                                        {selectedStudent.category?.map(cat => (
                                            <span key={cat._id} className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-sm font-medium border border-purple-100">
                                                {cat.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                
                                <DetailRow 
                                    label="Điểm đầu vào (Test)" 
                                    value={selectedStudent.tested ? `${selectedStudent.testScore}` : "Chưa kiểm tra"} 
                                />
                                
                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mt-2">
                                    <div className="flex items-center gap-2 mb-2 text-blue-800 font-semibold text-sm">
                                        <Target className="w-4 h-4" /> Mục tiêu học tập
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Target Score:</span>
                                            <span className="font-medium text-gray-900">{selectedStudent.learningGoal?.targetScore || "N/A"}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Thời gian kết thúc lộ trình:</span>
                                            <span className="font-medium text-gray-900">{formatDate(selectedStudent.learningGoal?.deadline)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 text-right">
                         <button 
                            onClick={() => setSelectedStudent(null)}
                            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium mr-2"
                        >
                            Đóng
                        </button>
                        
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

const InfoRow = ({ icon: Icon, label, value, capitalize = false }) => (
    <div className="flex items-start">
        <Icon className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
        <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">{label}</p>
            <p className={`text-gray-700 font-medium ${capitalize ? 'capitalize' : ''}`}>
                {value || "Chưa cập nhật"}
            </p>
        </div>
    </div>
);

const DetailRow = ({ label, value, isStatus = false, statusColor = "" }) => (
    <div className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0">
        <span className="text-sm text-gray-500">{label}</span>
        <span className={`text-sm font-medium ${isStatus ? statusColor : 'text-gray-900'}`}>
            {value || "N/A"}
        </span>
    </div>
);

export default AdminStudentDetail;