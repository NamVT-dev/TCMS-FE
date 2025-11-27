import React, { useState, useEffect } from 'react';
import { 
  Filter, Eye, Trash2, X, Save, 
  CheckCircle, AlertCircle, Clock, Ban, Loader2, AlertTriangle, ShieldCheck 
} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../../../../utils/api';

const STATUS_CONFIG = {
  Pending: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
  Received: { label: 'Đã tiếp nhận', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle },
  In_Progress: { label: 'Đang xử lý', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: Loader2 },
  Resolved: { label: 'Đã giải quyết', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
  Closed: { label: 'Đóng', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: X },
  Rejected: { label: 'Từ chối', color: 'bg-red-100 text-red-800 border-red-200', icon: Ban },
};

const FINAL_STATUSES = ['Resolved', 'Closed', 'Rejected'];

const AdminViewListComplain = () => {
  const [complains, setComplains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  
  const [selectedComplain, setSelectedComplain] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [tempStatus, setTempStatus] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const fetchComplains = async () => {
    setLoading(true);
    try {
      const res = await api.admin.complain.getAllComplains(); 
      const data = res.data.data?.data || res.data.data || res.data.complains || []; 
      setComplains(data);
    } catch (error) {
      toast.error("Không thể tải danh sách phản ánh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplains();
  }, []);

  const confirmDelete = (id) => {
    setDeleteId(id);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.admin.complain.deleteComplain(deleteId);
      
      setComplains(prev => prev.filter(item => item._id !== deleteId));
      if (selectedComplain?._id === deleteId) closeModal();
      
      toast.success("Đã xóa phản ánh thành công!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      toast.error("Xóa thất bại: " + (error.response?.data?.message || error.message));
    } finally {
      setDeleteId(null);
    }
  };

  const openModal = (complain) => {
    setSelectedComplain(complain);
    setTempStatus(complain.status);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedComplain(null);
    setIsModalOpen(false);
    setUpdating(false);
  };

  const handleUpdateStatus = async () => {
    if (!selectedComplain) return;
    
    if (FINAL_STATUSES.includes(selectedComplain.status)) {
      toast.warning("Phản ánh này đã ở trạng thái cuối cùng.");
      return;
    }

    setUpdating(true);
    try {
      const res = await api.admin.complain.updateComplainStatus(selectedComplain._id, { status: tempStatus });
      const updatedItem = res.data.data?.data || res.data.data || res.data;
      
      setComplains(prev => prev.map(item => 
        item._id === updatedItem._id ? updatedItem : item
      ));
      
      // Update selectedComplain để modal hiển thị thông tin mới nhất (bao gồm staffInCharge mới nếu BE trả về)
      setSelectedComplain(updatedItem);
      
      toast.success("Cập nhật trạng thái thành công!");
      closeModal();
    } catch (error) {
      toast.error("Cập nhật thất bại: " + (error.response?.data?.message || error.message));
    } finally {
      setUpdating(false);
    }
  };

  const filteredComplains = filterStatus === 'All' 
    ? complains 
    : complains.filter(c => c.status === filterStatus);

  const renderStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
    const Icon = config.icon;
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1 w-fit ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer />

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý Phản ánh & Khiếu nại</h1>
            <p className="text-sm text-gray-500">Xem và xử lý các phản hồi từ học viên</p>
          </div>
          
          <div className="flex items-center bg-white border border-gray-300 rounded-lg p-1 shadow-sm">
            <Filter className="w-4 h-4 text-gray-500 ml-2 mr-2" />
            <select 
              className="bg-transparent text-sm text-gray-700 outline-none p-1 cursor-pointer"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">Tất cả trạng thái</option>
              {Object.keys(STATUS_CONFIG).map(key => (
                <option key={key} value={key}>{STATUS_CONFIG[key].label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
              <tr>
                <th className="p-4 border-b">Người gửi</th>
                <th className="p-4 border-b">Nội dung tóm tắt</th>
                <th className="p-4 border-b">Trạng thái</th>
                <th className="p-4 border-b">Người phụ trách</th>
                <th className="p-4 border-b">Ngày gửi</th>
                <th className="p-4 border-b text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredComplains.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    Không tìm thấy phản ánh nào.
                  </td>
                </tr>
              ) : (
                filteredComplains.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.user?.profile?.photo || item.user?.photo || `https://ui-avatars.com/api/?name=${item.user?.profile?.fullname || 'U'}`} 
                          alt="Avt" 
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{item.user?.profile?.fullname || item.user?.fullname || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{item.user?.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 max-w-xs truncate text-gray-600" title={item.content}>
                      {item.content}
                    </td>

                    <td className="p-4">
                      {renderStatusBadge(item.status)}
                    </td>

                    <td className="p-4">
                      {item.staffInCharge ? (
                        <div className="flex items-center gap-2">
                            <img 
                                src={item.staffInCharge.profile?.photo || `https://ui-avatars.com/api/?name=${item.staffInCharge.profile?.fullname || 'Admin'}`}
                                alt="Staff"
                                className="w-6 h-6 rounded-full object-cover border border-gray-200"
                            />
                            <div>
                                <p className="text-sm font-medium text-gray-800">{item.staffInCharge.profile?.fullname || item.staffInCharge.username}</p>
                                <p className="text-[10px] text-gray-500 uppercase font-semibold">{item.staffInCharge.role}</p>
                            </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">-- Chưa có --</span>
                      )}
                    </td>

                    <td className="p-4 text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openModal(item)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => confirmDelete(item._id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Xác nhận xóa?</h3>
              <p className="text-gray-500 text-sm mb-6">
                Bạn có chắc chắn muốn xóa phản ánh này không? Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setDeleteId(null)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Hủy
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  Xóa ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && selectedComplain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800">Chi tiết phản ánh</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="flex items-center gap-4 mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                <img 
                   src={selectedComplain.user?.profile?.photo || selectedComplain.user?.photo || `https://ui-avatars.com/api/?name=${selectedComplain.user?.fullname}`} 
                   className="w-12 h-12 rounded-full border-2 border-white"
                   alt=""
                />
                <div>
                  <p className="font-bold text-blue-900">{selectedComplain.user?.profile?.fullname || selectedComplain.user?.fullname}</p>
                  <p className="text-sm text-blue-700">Email: {selectedComplain.user?.email}</p>
                  <p className="text-sm text-blue-700">SĐT: {selectedComplain.user?.profile?.phoneNumber || 'N/A'}</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nội dung:</label>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {selectedComplain.content}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Trạng thái xử lý:</label>
                    
                    {FINAL_STATUSES.includes(selectedComplain.status) ? (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        <span>Đã đóng (<strong>{STATUS_CONFIG[selectedComplain.status]?.label}</strong>).</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1">
                        <select
                          value={tempStatus}
                          onChange={(e) => setTempStatus(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                        >
                          {Object.keys(STATUS_CONFIG).map((statusKey) => (
                            <option key={statusKey} value={statusKey}>
                              {STATUS_CONFIG[statusKey].label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Người phụ trách:</label>
                      {selectedComplain.staffInCharge ? (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                              <img 
                                  src={selectedComplain.staffInCharge.profile?.photo || `https://ui-avatars.com/api/?name=${selectedComplain.staffInCharge.profile?.fullname || 'Admin'}`} 
                                  className="w-10 h-10 rounded-full object-cover"
                                  alt=""
                              />
                              <div>
                                  <p className="text-sm font-bold text-gray-800">{selectedComplain.staffInCharge.profile?.fullname || selectedComplain.staffInCharge.username}</p>
                                  <p className="text-xs text-gray-500 flex items-center gap-1">
                                      <ShieldCheck className="w-3 h-3 text-purple-600" />
                                      {selectedComplain.staffInCharge.role}
                                  </p>
                              </div>
                          </div>
                      ) : (
                          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 text-sm italic">
                              Chưa có người phụ trách
                          </div>
                      )}
                  </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={closeModal}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Đóng
              </button>
              
              {!FINAL_STATUSES.includes(selectedComplain.status) && (
                <button 
                  onClick={handleUpdateStatus}
                  disabled={updating || tempStatus === selectedComplain.status}
                  className={`px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2 transition
                    ${updating || tempStatus === selectedComplain.status 
                      ? 'bg-purple-300 cursor-not-allowed' 
                      : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                >
                  {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Lưu thay đổi
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminViewListComplain;