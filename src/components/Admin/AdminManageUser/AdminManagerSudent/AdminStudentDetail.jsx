import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Phone, Calendar, User, 
  CheckCircle, XCircle, AlertCircle, 
  GraduationCap, Target, Clock, X, MapPin, Flag
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

  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const ageDiffMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDiffMs); 
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const getGenderLabel = (gender) => {
      switch(gender) {
          case 'male': return 'Nam';
          case 'female': return 'Nữ';
          default: return 'Khác';
      }
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
              <div className="h-32 bg-gradient-to-br from-indigo-600 to-purple-700 relative">
                 <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                    <img
                        src={profile?.photo || "https://via.placeholder.com/150"}
                        alt={profile?.fullname}
                        className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-md bg-white"
                        onError={(e) => {e.target.src = `https://ui-avatars.com/api/?name=${profile?.fullname}&background=random`}}
                    />
                 </div>
              </div>

              <div className="pt-14 pb-6 px-6 text-center">
                <h1 className="text-xl font-bold text-gray-900">{profile?.fullname}</h1>
                <p className="text-gray-500 text-sm mb-3">{email}</p>
                
                <div className="flex justify-center mb-6">
                   {active ? (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Tài khoản Active
                    </span>
                   ) : (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Tài khoản Inactive
                    </span>
                   )}
                </div>

                <div className="border-t border-gray-100 pt-6 text-left space-y-4">
                    <InfoRow icon={User} label="Vai trò" value={role} capitalize />
                    <InfoRow icon={Phone} label="Điện thoại" value={profile?.phoneNumber} />
                    <InfoRow icon={Calendar} label="Ngày sinh" value={formatDate(profile?.dob)} />
                    <InfoRow icon={User} label="Giới tính" value={getGenderLabel(profile?.gender)} />
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
                        <p className="text-gray-500 text-sm mt-1">Danh sách học viên thuộc tài khoản này</p>
                    </div>
                    <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full">
                        {linkedStudents?.length || 0} hồ sơ
                    </span>
                </div>
                
                {linkedStudents && linkedStudents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {linkedStudents.map((std, index) => (
                            <div 
                                key={std._id || index} 
                                onClick={() => setSelectedStudent(std)}
                                className="border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer group bg-white relative overflow-hidden"
                            >
                                <div className={`absolute top-0 right-0 w-16 h-16 pointer-events-none overflow-hidden`}>
                                    {std.enrolled && (
                                        <div className="absolute top-[10px] -right-[22px] rotate-45 bg-green-500 text-white text-[10px] font-bold py-1 w-24 text-center shadow-sm">
                                            Enrolled
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="shrink-0">
                                        <img 
                                            src={std.photo} 
                                            alt={std.name}
                                            className="w-14 h-14 rounded-full object-cover border-2 border-gray-100 group-hover:border-purple-400 transition-colors"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = `https://ui-avatars.com/api/?name=${std.name}&background=random`;
                                            }}
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-900 truncate group-hover:text-purple-700 transition-colors">
                                            {std.name}
                                        </h4>
                                        <div className="text-xs text-gray-500 flex flex-wrap gap-2 mt-1">
                                            <span>{getGenderLabel(std.gender)}</span>
                                            <span>•</span>
                                            <span>{calculateAge(std.dob)} tuổi</span>
                                        </div>
                                        
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {std.category?.map(cat => (
                                                <span key={cat._id} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-100 uppercase">
                                                    {cat.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
                                    <span className="text-gray-500">Đầu vào:</span>
                                    {std.tested ? (
                                         <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                                            {std.testScore} điểm
                                         </span>
                                    ) : (
                                        <span className="italic text-gray-400">Chưa test</span>
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
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedStudent(null)}>
                <div 
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="bg-gradient-to-r from-purple-50 to-white px-6 py-5 border-b border-gray-100 flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            <img 
                                src={selectedStudent.photo} 
                                alt={selectedStudent.name}
                                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = `https://ui-avatars.com/api/?name=${selectedStudent.name}&background=random`;
                                }}
                            />
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{selectedStudent.name}</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">{selectedStudent._id}</span>
                                    {selectedStudent.enrolled && <CheckCircle className="w-4 h-4 text-green-500" />}
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => setSelectedStudent(null)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6 text-gray-500" />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            
                            <div className="space-y-5">
                                <h4 className="font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
                                    <User className="w-4 h-4 text-purple-600" /> Thông tin cá nhân
                                </h4>
                                <div className="space-y-3">
                                    <DetailRow label="Ngày sinh" value={formatDate(selectedStudent.dob)} />
                                    <DetailRow label="Tuổi" value={`${calculateAge(selectedStudent.dob)} tuổi`} />
                                    <DetailRow label="Giới tính" value={getGenderLabel(selectedStudent.gender)} />
                                    <DetailRow label="Ngày đăng ký" value={formatDate(selectedStudent.registeredAt)} />
                                    <div className="flex justify-between items-center py-1">
                                        <span className="text-sm text-gray-500">Trạng thái</span>
                                        {selectedStudent.enrolled ? (
                                            <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">Đã nhập học</span>
                                        ) : (
                                            <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Chưa nhập học</span>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <h4 className="font-bold text-gray-900 flex items-center gap-2 border-b pb-2 mb-3">
                                        <Target className="w-4 h-4 text-red-500" /> Kết quả đầu vào
                                    </h4>
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-gray-600">Điểm test</span>
                                            <span className="text-lg font-bold text-gray-900">
                                                {selectedStudent.tested ? selectedStudent.testScore : "--"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-500">Ngày test</span>
                                            <span className="text-xs text-gray-700 font-medium">
                                                {selectedStudent.testResultAt ? formatDate(selectedStudent.testResultAt) : "N/A"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <h4 className="font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
                                    <Flag className="w-4 h-4 text-blue-600" /> Mục tiêu học tập
                                </h4>
                                
                                {selectedStudent.learningGoal ? (
                                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                        <div className="mb-4">
                                            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block mb-1">Chương trình</span>
                                            <div className="flex gap-2">
                                                <span className="text-lg font-bold text-blue-900">
                                                    {selectedStudent.learningGoal.category?.name || "N/A"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="bg-white p-3 rounded-lg shadow-sm">
                                                <span className="text-xs text-gray-500 block mb-1">Target Score</span>
                                                <span className="font-bold text-indigo-600 text-md">
                                                    {selectedStudent.learningGoal.targetScore}
                                                </span>
                                            </div>
                                            <div className="bg-white p-3 rounded-lg shadow-sm">
                                                <span className="text-xs text-gray-500 block mb-1">Ngày kết thúc lộ trình học</span>
                                                <span className="font-bold text-red-500 text-md">
                                                    {formatDate(selectedStudent.learningGoal.deadline)}
                                                </span>
                                            </div>
                                        </div>

                                        {(selectedStudent.learningGoal.constraints?.days?.length > 0 || selectedStudent.learningGoal.constraints?.shifts?.length > 0) && (
                                            <div className="border-t border-blue-200 pt-3 mt-3">
                                                <span className="text-xs text-blue-800 font-medium block mb-1">Lịch học mong muốn:</span>
                                                <p className="text-xs text-blue-700">
                                                    Khung giờ: {selectedStudent.learningGoal.constraints.shifts.join(", ") || "Linh hoạt"}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-gray-400 italic bg-gray-50 rounded-lg">
                                        Chưa thiết lập mục tiêu
                                    </div>
                                )}

                                
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 text-right shrink-0">
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

const DetailRow = ({ label, value }) => (
    <div className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0 last:pb-0">
        <span className="text-sm text-gray-500">{label}</span>
        <span className="text-sm font-medium text-gray-900 text-right">{value}</span>
    </div>
);

export default AdminStudentDetail;