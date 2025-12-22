import React, { useState, useEffect } from 'react';
import api from '../../../../utils/api';
import { Loader2, Save, X, User, Mail, Phone, Calendar as CalendarIcon, Lock } from 'lucide-react';
import showToast from "../../../../utils/showToast";

import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { vi } from 'date-fns/locale';
import { format } from 'date-fns';

registerLocale('vi', vi);

const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-white";
const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const isValidPhoneNumber = (phone) => {
    const phoneRegex = /(0[3|5|7|8|9])+([0-9]{8})\b/g; 
    return phoneRegex.test(phone);
};

const AdminStaffModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        dob: '',
        phoneNumber: '',
        gender: 'male',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData({ email: '', name: '', dob: '', phoneNumber: '', gender: 'male' });
        }
    }, [isOpen]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const toastId = showToast.loading("Đang tạo nhân viên...");

        try {
            const { name, email, dob, phoneNumber, gender } = formData;
            

            if (!name.trim() || name.length < 3) {
                throw new Error("Họ và tên phải có ít nhất 3 ký tự!");
            }

            if (!email.trim() || !isValidEmail(email)) {
                throw new Error("Email không hợp lệ hoặc bị trống!");
            }
            
            if (!phoneNumber.trim() || !isValidPhoneNumber(phoneNumber)) {
                throw new Error("Số điện thoại không hợp lệ (cần 10 chữ số)!");
            }

            if (!dob) {
                throw new Error("Ngày sinh không được để trống!");
            }
            const birthDate = new Date(dob);
            const today = new Date();
            today.setHours(0, 0, 0, 0); 
            if (birthDate > today) {
                throw new Error("Ngày sinh không thể là ngày trong tương lai!");
            }
            

            const createData = {
                email: email,
                name: name,
                dob: dob, 
                phoneNumber: phoneNumber,
                gender: gender,
            };

            await api.admin.createStaff(createData);

            showToast.updateSuccess(toastId, "Tạo nhân viên thành công!");
            onSuccess();
            onClose();
        } catch (err) {
            const errorMessage = err.message.includes(":") ? err.message : (err.response?.data?.message || "Lỗi khi tạo nhân viên");
            showToast.updateError(toastId, errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const GENDER_OPTIONS = ['male', 'female']; 

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-all duration-300">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Thêm nhân viên mới</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Tạo tài khoản và thông tin cơ bản cho nhân viên</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <form id="staff-create-form" onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <label className={labelClass}>Họ và tên <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={`${inputClass} pl-10`}
                                        placeholder="Nhập họ tên đầy đủ"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className={labelClass}>Email đăng nhập <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`${inputClass} pl-10`}
                                        required
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1 flex items-center">
                                    <Lock className="w-3 h-3 mr-1" /> Mật khẩu sẽ được gửi tự động qua email này.
                                </p>
                            </div>

                            <div>
                                <label className={labelClass}><span className="text-red-500">*</span> Số điện thoại</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        className={`${inputClass} pl-10`}
                                        placeholder="09xxxxxxxx"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}><span className="text-red-500">*</span> Ngày sinh</label>
                                <div className="relative">
                                    <DatePicker
                                        selected={formData.dob ? new Date(formData.dob) : null}
                                        onChange={(date) => {
                                            setFormData({
                                                ...formData,
                                                dob: date ? format(date, 'yyyy-MM-dd') : ''
                                            });
                                        }}
                                        dateFormat="dd/MM/yyyy"
                                        locale="vi"
                                        maxDate={new Date()} 
                                        showYearDropdown 
                                        showMonthDropdown 
                                        dropdownMode="select" 
                                        yearDropdownItemNumber={100} 
                                        scrollableYearDropdown 
                                        
                                        className={`${inputClass} pl-10`} 
                                        wrapperClassName="w-full"
                                        required
                                        onKeyDown={(e) => e.preventDefault()}
                                    />
                                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none z-10" />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className={labelClass}>Giới tính</label>
                                <div className="flex gap-6 mt-2">
                                    {GENDER_OPTIONS.map((g) => (
                                        <label key={g} className="flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                name="gender"
                                                value={g}
                                                checked={formData.gender === g}
                                                onChange={handleChange}
                                                className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                                            />
                                            <span className="ml-2 text-gray-700 capitalize">
                                                {g === 'male' ? 'Nam' : 'Nữ'}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-white hover:shadow-sm transition-all"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        onClick={() => document.getElementById('staff-create-form').requestSubmit()}
                        disabled={loading}
                        className="px-6 py-2.5 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                        Tạo nhân viên
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminStaffModal;