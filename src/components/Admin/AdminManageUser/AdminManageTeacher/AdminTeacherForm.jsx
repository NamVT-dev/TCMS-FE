// src/components/Admin/AdminManageUser/AdminManageTeacher/AdminTeacherForm.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../../../utils/api';
import { Loader2, Save, ArrowLeft, Upload, User as UserIcon, CheckSquare, Square } from 'lucide-react';

const inputClass = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm";

const AdminTeacherForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    dob: '',
    phoneNumber: '',
    gender: 'male',
  });
  
  const [skills, setSkills] = useState([]);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [allCategories, setAllCategories] = useState([]);

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const res = await api.user.getCourseCategories();
        if (res.data?.data?.data) {
          setAllCategories(res.data.data.data); 
        } else {
          setAllCategories([]);
        }
      } catch (err) {
        console.error("Không thể tải danh sách categories:", err);
      }
    };

    const fetchTeacher = async () => {
      setLoading(true);
      try {
        const res = await api.admin.getTeacherDetail(id);
        const teacher = res.data.data.teacher;
        setFormData({
          email: teacher.email,
          name: teacher.profile.fullname,
          dob: teacher.profile.dob ? teacher.profile.dob.slice(0, 10) : '',
          phoneNumber: teacher.profile.phoneNumber || '',
          gender: teacher.profile.gender || 'male',
        });
        setPhotoPreview(teacher.profile.photo || '');
        if (teacher.skills && teacher.skills.length > 0) {
          setSkills(teacher.skills.map(s => ({
            category: s.category?._id || s.category || '',
            levels: (s.levels || []).join(', '),
            anyLevel: s.anyLevel || false,
            includeLowerLevels: s.includeLowerLevels !== undefined ? s.includeLowerLevels : true,
          })));
        }
      } catch (err) {
        setError("Không thể tải dữ liệu giáo viên.");
      } finally {
        setLoading(false);
      }
    };

    fetchDropdownData();
    if (isEditMode) {
      fetchTeacher();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // ⬇️ HÀM MỚI: Toggle chọn category
  const toggleCategorySkill = (categoryId) => {
    setSkills(prevSkills => {
      const exists = prevSkills.find(s => s.category === categoryId);
      if (exists) {
        // Nếu đã có -> Xóa (Bỏ tích)
        return prevSkills.filter(s => s.category !== categoryId);
      } else {
        // Nếu chưa có -> Thêm mới với giá trị mặc định
        return [...prevSkills, { 
          category: categoryId, 
          levels: '', 
          anyLevel: false, 
          includeLowerLevels: true 
        }];
      }
    });
  };

  // ⬇️ HÀM MỚI: Cập nhật chi tiết kỹ năng (levels, flags...)
  const updateCategorySkill = (categoryId, field, value) => {
    setSkills(prevSkills => 
      prevSkills.map(s => 
        s.category === categoryId ? { ...s, [field]: value } : s
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (isEditMode) {
        const updateData = new FormData();
        updateData.append('profile[fullname]', formData.name);
        updateData.append('profile[phoneNumber]', formData.phoneNumber);
        updateData.append('profile[dob]', formData.dob);
        updateData.append('profile[gender]', formData.gender);
        if (photoFile) {
          updateData.append('profile[photo]', photoFile);
        }

        skills.forEach((skill, index) => {
          updateData.append(`skills[${index}][category]`, skill.category);
          updateData.append(`skills[${index}][anyLevel]`, skill.anyLevel);
          updateData.append(`skills[${index}][includeLowerLevels]`, skill.includeLowerLevels);
          const levelsArray = skill.levels.split(',').map(l => l.trim()).filter(Boolean);
          if (levelsArray.length > 0) {
            levelsArray.forEach((level, levelIndex) => {
              updateData.append(`skills[${index}][levels][${levelIndex}]`, level);
            });
          } else {
             updateData.append(`skills[${index}][levels]`, '');
          }
        });
        
        await api.admin.updateTeacher(id, updateData);

      } else {
        const createData = {
          email: formData.email,
          name: formData.name,
          dob: formData.dob,
          phoneNumber: formData.phoneNumber,
          gender: formData.gender,
        };
        await api.admin.createTeacher(createData);
      }
      
      alert(`Đã ${isEditMode ? 'cập nhật' : 'tạo mới'} giáo viên thành công!`);
      navigate('/admin/users/teachers');
    } catch (err) {
      setError(err.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[300px]">
        <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Link
        to="/admin/users/teachers"
        className="flex items-center text-purple-600 hover:text-purple-800 font-medium mb-4"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Quay lại Danh sách
      </Link>
      
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        {isEditMode ? 'Cập nhật Giáo viên' : 'Tạo mới Giáo viên'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-10xl mx-auto">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {/* --- Thông tin cơ bản (Giữ nguyên) --- */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">Thông tin cơ bản</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Tên đầy đủ</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className={inputClass} required disabled={isEditMode} />
              {!isEditMode && <p className="mt-1 text-xs text-gray-500">Mật khẩu tạm thời sẽ được gửi qua email này.</p>}
            </div>
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Số điện thoại</label>
              <input type="tel" name="phoneNumber" id="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Ngày sinh</label>
              <input type="date" name="dob" id="dob" value={formData.dob} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Giới tính</label>
              <select name="gender" id="gender" value={formData.gender} onChange={handleChange} className={inputClass}>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>
          </div>
        </section>

        {isEditMode && (
          <>
            {/* --- Ảnh đại diện (Giữ nguyên) --- */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">Ảnh đại diện</h2>
              <div className="flex items-center gap-6">
                {photoPreview ? (
                  <img src={photoPreview} alt="Xem trước" className="w-24 h-24 rounded-full object-cover border-2 border-purple-100" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border-2 border-gray-200">
                    <UserIcon size={40} />
                  </div>
                )}
                <div>
                  <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition">
                    <Upload className="w-4 h-4 mr-2" />
                    Tải ảnh mới
                    <input type="file" name="photo" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">Hỗ trợ JPG, PNG. Tối đa 5MB.</p>
                </div>
              </div>
            </section>

            {/* ⬇️ PHẦN KỸ NĂNG GIẢNG DẠY MỚI (CHECKBOX UI) */}
            <section className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">Kỹ năng Giảng dạy</h2>
              <p className="text-sm text-gray-600 mb-4">Chọn các môn học mà giáo viên này có thể dạy và thiết lập trình độ tương ứng.</p>
              
              <div className="space-y-3">
                {allCategories.length === 0 && <p className="text-gray-500 italic">Đang tải danh sách môn học...</p>}
                
                {allCategories.map((cat) => {
                  // Kiểm tra xem category này đã được chọn chưa
                  const activeSkill = skills.find(s => s.category === cat._id);
                  const isChecked = !!activeSkill;

                  return (
                    <div 
                      key={cat._id} 
                      className={`border rounded-lg transition-all duration-200 ${isChecked ? 'border-purple-500 bg-purple-50/50' : 'border-gray-200 hover:border-purple-300'}`}
                    >
                      {/* Header của Category (Checkbox) */}
                      <div 
                        className="flex items-center p-3 cursor-pointer"
                        onClick={() => toggleCategorySkill(cat._id)}
                      >
                        <div className={`flex items-center justify-center w-5 h-5 mr-3 rounded border ${isChecked ? 'bg-purple-600 border-purple-600' : 'bg-white border-gray-400'}`}>
                          {isChecked && <CheckSquare className="w-4 h-4 text-white" />}
                        </div>
                        <span className={`font-medium ${isChecked ? 'text-purple-800' : 'text-gray-700'}`}>
                          {cat.name}
                        </span>
                      </div>

                      {/* Phần chi tiết (chỉ hiện khi đã checked) */}
                      {isChecked && activeSkill && (
                        <div className="p-3 pt-0 pl-11 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 fade-in duration-200">
                          {/* Levels Input */}
                          <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Các Level có thể dạy (cách nhau bởi dấu phẩy)</label>
                            <input 
                              value={activeSkill.levels}
                              onChange={(e) => updateCategorySkill(cat._id, 'levels', e.target.value)}
                              placeholder="VD: Expert, Intermediate, Beginner"
                              className={`${inputClass} bg-white`}
                            />
                          </div>

                          {/* Tùy chọn nâng cao (Checkbox nhỏ) */}
                          <div className="flex items-center space-x-6">
                            <label className="flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={activeSkill.anyLevel}
                                onChange={(e) => updateCategorySkill(cat._id, 'anyLevel', e.target.checked)}
                                className="accent-purple-600 h-4 w-4" 
                              />
                              <span className="ml-2 text-sm text-gray-700">Dạy tất cả level</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={activeSkill.includeLowerLevels}
                                onChange={(e) => updateCategorySkill(cat._id, 'includeLowerLevels', e.target.checked)}
                                className="accent-purple-600 h-4 w-4" 
                              />
                              <span className="ml-2 text-sm text-gray-700">Bao gồm level thấp hơn</span>
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
            {/* ⬆️ KẾT THÚC PHẦN KỸ NĂNG */}
          </>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
            {saving ? 'Đang tạo...' : 'Tạo tài khoản'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminTeacherForm;