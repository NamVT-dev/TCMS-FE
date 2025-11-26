import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { Loader2, Save, X, User, BookOpen, Target, Trophy, Pencil, Image as ImageIcon } from 'lucide-react';
import showToast from "../../../utils/showToast";
import moment from 'moment';

const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-white";
const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

const LearnerProfileDetailModal = ({ isOpen, onClose, onSuccess, learnerId }) => {

    // Form State (Editable)
    const [formData, setFormData] = useState({
        name: '',
        dob: '',
        gender: 'male',
        photo: null,       // 👈 THÊM PHOTO VÀO STATE
    });

    // Read-only Data (Academic Info)
    const [learnerData, setLearnerData] = useState(null);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    // Preview ảnh
    const [photoPreview, setPhotoPreview] = useState(null);

    useEffect(() => {
        if (isOpen && learnerId) {
            const fetchDetail = async () => {
                setFetching(true);
                try {
                    const res = await api.user.getLearnerById(learnerId);
                    const data = res.data.data;
                    setLearnerData(data);

                    setFormData({
                        name: data.name || '',
                        dob: data.dob ? data.dob.split('T')[0] : '',
                        gender: data.gender || 'male',
                        photo: null, // reset file khi mở modal
                    });

                    setPhotoPreview(data.photo || null);  // preview ảnh cũ
                } catch (err) {
                    console.error("Lỗi tải thông tin học viên:", err);
                    showToast.error("Không thể tải thông tin học viên");
                } finally {
                    setFetching(false);
                }
            };
            fetchDetail();
        }
    }, [isOpen, learnerId]);


    /** ---------------------
     *  HANDLE INPUT CHANGES
     ----------------------*/
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 👇 Handle upload ảnh
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        setFormData(prev => ({ ...prev, photo: file }));

        if (file) {
            const url = URL.createObjectURL(file);
            setPhotoPreview(url);
        }
    };


    /** ---------------------
     *  HANDLE SUBMIT FORM
     ----------------------*/
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const toastId = showToast.loading("Đang cập nhật...");

        try {
            const fd = new FormData();
            fd.append("name", formData.name);
            fd.append("dob", formData.dob);
            fd.append("gender", formData.gender);

            if (formData.photo) {
                fd.append("photo", formData.photo); // 👈 Append file
            }

            await api.user.updateLearnerById(learnerId, fd, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            showToast.updateSuccess(toastId, "Cập nhật thành công!");
            onSuccess();
            onClose();
        } catch (err) {
            showToast.updateError(toastId, err.response?.data?.message || "Lỗi khi cập nhật");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;


    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Hồ sơ Học viên</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Thông tin chi tiết và học vụ</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                    {fetching ? (
                        <div className="h-64 flex items-center justify-center">
                            <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                            {/* LEFT: Editable Personal Info */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                    <User className="w-5 h-5 text-purple-600" />
                                    <h3 className="font-bold text-gray-700">Thông tin cá nhân</h3>
                                </div>

                                <form id="learner-form" onSubmit={handleSubmit} className="space-y-4">

                                    {/* Ảnh đại diện */}
                                    <div>
                                        <label className={labelClass}>Ảnh đại diện</label>

                                        {photoPreview && (
                                            <img
                                                src={photoPreview}
                                                alt="preview"
                                                className="w-24 h-24 rounded-lg object-cover border mb-2"
                                            />
                                        )}

                                        <div className="flex items-center gap-3">
                                            <label
                                                htmlFor="photo-upload"
                                                className="flex items-center gap-2 cursor-pointer bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition"
                                            >
                                                <Pencil className="w-4 h-4" />
                                                <span>Chọn ảnh</span>
                                            </label>

                                            <input
                                                id="photo-upload"
                                                type="file"
                                                accept="image/*"
                                                onChange={handlePhotoChange}
                                                className="hidden"
                                            />
                                        </div>

                                    </div>

                                    {/* Name */}
                                    <div>
                                        <label className={labelClass}>Họ và tên</label>
                                        <input
                                            type="text" name="name"
                                            value={formData.name} onChange={handleChange}
                                            className={inputClass} required
                                        />
                                    </div>

                                    {/* DOB */}
                                    <div>
                                        <label className={labelClass}>Ngày sinh</label>
                                        <input
                                            type="date" name="dob"
                                            value={formData.dob} onChange={handleChange}
                                            className={inputClass}
                                        />
                                    </div>

                                    {/* Gender */}
                                    <div>
                                        <label className={labelClass}>Giới tính</label>
                                        <div className="flex gap-6 mt-2">
                                            {['male', 'female'].map((g) => (
                                                <label key={g} className="flex items-center cursor-pointer">
                                                    <input
                                                        type="radio" name="gender" value={g}
                                                        checked={formData.gender === g}
                                                        onChange={handleChange}
                                                        className="w-4 h-4 text-purple-600"
                                                    />
                                                    <span className="ml-2 text-gray-700 capitalize">
                                                        {g === 'male' ? 'Nam' : 'Nữ'}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </form>
                            </div>

                            {/* RIGHT: Read-only Academic Info */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                    <BookOpen className="w-5 h-5 text-blue-600" />
                                    <h3 className="font-bold text-gray-700">Thông tin học tập</h3>
                                </div>

                                {learnerData ? (
                                    <div className="bg-gray-50 rounded-xl p-4 space-y-4 border border-gray-200">

                                        {/* Category */}
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                                    Môn học
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {learnerData.category?.map(c => (
                                                        <span key={c._id} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">
                                                            {c.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                                    Trình độ hiện tại
                                                </p>
                                                <div className="flex items-center justify-end text-purple-700 font-bold">
                                                    <Trophy className="w-4 h-4 mr-1" />
                                                    {learnerData.testScore || "Chưa test"}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Learning Goal */}
                                        {learnerData.learningGoal && (
                                            <div className="pt-3 border-t border-gray-200">
                                                <p className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center">
                                                    <Target className="w-3 h-3 mr-1" /> Mục tiêu học tập
                                                </p>
                                                <div className="grid grid-cols-1 gap-3 text-sm">
                                                    <div className="bg-white p-2 rounded border">
                                                        <span className="text-gray-500 block text-xs">Mục tiêu</span>
                                                        <span className="font-medium text-gray-800">
                                                            {learnerData.learningGoal.targetScore || "N/A"}
                                                        </span>
                                                    </div>
                                                    
                                                </div>
                                            </div>
                                        )}

                                        {/* Classes */}
                                        <div className="pt-3 border-t border-gray-200">
                                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Lớp học hiện tại</p>

                                            {learnerData.class?.length > 0 ? (
                                                <div className="space-y-2">
                                                    {learnerData.class.map(c => (
                                                        <div key={c._id} className="px-3 py-2 bg-white border rounded-lg text-sm font-medium text-gray-800">
                                                            {c.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400 italic">Chưa tham gia lớp nào.</span>
                                            )}

                                        </div>

                                        {/* Status */}
                                        <div className="pt-3 border-t border-gray-200">
                                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Trạng thái nhập học</p>
                                            <span
                                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${learnerData.enrolled ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}
                                            >
                                                {learnerData.enrolled ? 'Đã nhập học' : 'Chưa nhập học'}
                                            </span>
                                        </div>

                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic text-sm">Không có dữ liệu học tập.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-white hover:shadow-sm transition-all"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        onClick={() => document.getElementById('learner-form').requestSubmit()}
                        disabled={loading || fetching}
                        className="px-6 py-2.5 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                        Lưu thay đổi
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LearnerProfileDetailModal;
