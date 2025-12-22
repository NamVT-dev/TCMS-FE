import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { Loader2, Save, X, User, BookOpen, Trophy, Pencil, Calendar as CalendarIcon } from 'lucide-react';
import showToast from "../../../utils/showToast";
import moment from 'moment';
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { vi } from 'date-fns/locale';
import { format } from 'date-fns';

registerLocale('vi', vi);

const baseInputClass = "w-full px-3 py-2 border rounded-lg outline-none transition-all bg-white";
const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

const LearnerProfileDetailModal = ({ isOpen, onClose, onSuccess, learnerId }) => {

    const [formData, setFormData] = useState({
        name: '',
        dob: '',
        gender: 'male',
        photo: null,
    });

    const [errors, setErrors] = useState({});

    const [learnerData, setLearnerData] = useState(null);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    const [photoPreview, setPhotoPreview] = useState(null);

    useEffect(() => {
        if (isOpen && learnerId) {
            const fetchDetail = async () => {
                setFetching(true);
                setErrors({}); 
                try {
                    const res = await api.user.getLearnerById(learnerId);
                    const data = res.data.data;
                    setLearnerData(data);

                    setFormData({
                        name: data.name || '',
                        dob: data.dob ? data.dob.split('T')[0] : '',
                        gender: data.gender || 'male',
                        photo: null, 
                    });

                    setPhotoPreview(data.photo || null);  
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

   
    const validateForm = () => {
        const newErrors = {};
        const { name, dob } = formData;

        if (!name || !name.trim()) {
            newErrors.name = "Vui lòng nhập họ và tên.";
        }

        if (!dob) {
            newErrors.dob = "Vui lòng chọn ngày sinh.";
        } else {
            const selectedDate = moment(dob);
            const today = moment().startOf('day'); 

            if (selectedDate.isAfter(today)) {
                newErrors.dob = "Ngày sinh không được lớn hơn ngày hiện tại.";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors(prev => {
                const newErrs = { ...prev };
                delete newErrs[name];
                return newErrs;
            });
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        setFormData(prev => ({ ...prev, photo: file }));

        if (file) {
            const url = URL.createObjectURL(file);
            setPhotoPreview(url);
        }
    };


    
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        const toastId = showToast.loading("Đang cập nhật...");

        try {
            const fd = new FormData();
            fd.append("name", formData.name);
            fd.append("dob", formData.dob);
            fd.append("gender", formData.gender);

            if (formData.photo) {
                fd.append("photo", formData.photo); 
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

    const getInputClass = (fieldName) => {
        return `${baseInputClass} ${
            errors[fieldName] 
            ? "border-red-500 focus:ring-2 focus:ring-red-200" 
            : "border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        }`;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">

                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Hồ sơ Học viên</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Thông tin chi tiết và học vụ</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                    {fetching ? (
                        <div className="h-64 flex items-center justify-center">
                            <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                            <div className="space-y-6">
                                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                    <User className="w-5 h-5 text-purple-600" />
                                    <h3 className="font-bold text-gray-700">Thông tin cá nhân</h3>
                                </div>

                                <form id="learner-form" onSubmit={handleSubmit} className="space-y-4">

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

                                    <div>
                                        <label className={labelClass}>Họ và tên <span className="text-red-500">*</span></label>
                                        <input
                                            type="text" 
                                            name="name"
                                            value={formData.name} 
                                            onChange={handleChange}
                                            className={getInputClass('name')}
                                            placeholder="Nhập họ và tên"
                                        />
                                        {errors.name && (
                                            <p className="text-red-500 text-xs mt-1 font-medium">{errors.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className={labelClass}>Ngày sinh <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <DatePicker
                                                selected={formData.dob ? new Date(formData.dob) : null}
                                                onChange={(date) => {
                                                    const formattedDate = date ? format(date, 'yyyy-MM-dd') : '';
                                                    setFormData(prev => ({ ...prev, dob: formattedDate }));
                                                    if (errors.dob) {
                                                        setErrors(prev => {
                                                            const newErrs = { ...prev };
                                                            delete newErrs.dob;
                                                            return newErrs;
                                                        });
                                                    }
                                                }}
                                                dateFormat="dd/MM/yyyy"
                                                locale="vi"
                                                maxDate={new Date()} 
                                                
                                                showYearDropdown
                                                showMonthDropdown
                                                dropdownMode="select"
                                                yearDropdownItemNumber={100}
                                                scrollableYearDropdown
                                                
                                                className={`${getInputClass('dob')} pl-10`} 
                                                wrapperClassName="w-full"
                                                placeholderText="dd/mm/yyyy"
                                                onKeyDown={(e) => e.preventDefault()}
                                            />
                                            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none z-10" />
                                        </div>
                                        {errors.dob && (
                                            <p className="text-red-500 text-xs mt-1 font-medium">{errors.dob}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className={labelClass}>Giới tính</label>
                                        <div className="flex gap-6 mt-2">
                                            {['male', 'female'].map((g) => (
                                                <label key={g} className="flex items-center cursor-pointer">
                                                    <input
                                                        type="radio" name="gender" value={g}
                                                        checked={formData.gender === g}
                                                        onChange={handleChange}
                                                        className="w-4 h-4 text-purple-600 focus:ring-purple-500"
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

                            <div className="space-y-6">
                                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                    <BookOpen className="w-5 h-5 text-blue-600" />
                                    <h3 className="font-bold text-gray-700">Thông tin học tập</h3>
                                </div>

                                {learnerData ? (
                                    <div className="bg-gray-50 rounded-xl p-4 space-y-4 border border-gray-200">

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