import React, { useState, useEffect } from 'react';
import { Plus, MessageSquare, Clock } from 'lucide-react'; 
import StudentComplainModal from './StudentComplainModal'; 
import api from '../../../utils/api'; 

const StudentViewComplain = () => {
  const [complains, setComplains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Received':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'In_Progress':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const fetchComplains = async () => {
    setLoading(true);
    try {
      const res = await api.user.getMyComplains();
     
      if (res.data && res.data.complains) {
        
        const sortedList = res.data.complains.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        setComplains(sortedList);
      }
    } catch (error) {
      console.error("Lỗi tải danh sách khiếu nại:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplains();
  }, []);

  return (
    <div className="max-w-8xl mx-auto p-6"> 
    
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <MessageSquare className="text-purple-600" /> Danh sách phản ánh
          </h1>
          <p className="text-gray-500 mt-1">Quản lý các ý kiến, khiếu nại của bạn gửi tới trung tâm.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg shadow-md transition flex items-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" /> Tạo phản ánh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : complains.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-10 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Chưa có phản ánh nào</h3>
          <p className="text-gray-500 mt-1 mb-6">Bạn chưa gửi bất kỳ ý kiến đóng góp nào.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {complains.map((item) => (
            <div 
              key={item._id} 
              className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition duration-200 group"
            >
              <div className="flex justify-between items-start mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusStyle(item.status)}`}>
                  {item.status === 'Pending' ? 'Đang chờ xử lý' : item.status}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {formatDate(item.createdAt)}
                </span>
              </div>
              
              <h3 className="text-gray-800 font-medium text-lg mb-2 group-hover:text-purple-700 transition">
                {item.content}
              </h3>

              <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-100">
                 <div className="flex items-center gap-2 text-sm text-gray-500">
                    <img 
                        // Đã thay placeholder bị lỗi bằng ui-avatars
                        src={item.user?.profile?.photo || `https://ui-avatars.com/api/?name=${item.user?.profile?.fullname || 'U'}`} 
                        alt="User" 
                        className="w-6 h-6 rounded-full object-cover"
                    />
                    <span>{item.user?.profile?.fullname}</span>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <StudentComplainModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchComplains} 
      />
    </div>
  );
}

export default StudentViewComplain;