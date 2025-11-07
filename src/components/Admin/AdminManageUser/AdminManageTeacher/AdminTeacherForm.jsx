import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../../../utils/api';
import { Loader2, Save, ArrowLeft, Upload, X, UserIcon } from 'lucide-react';

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

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditMode) {
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
              category: s.category?._id || '',
              levels: (s.levels || []).join(', '),
              anyLevel: s.anyLevel || false,
              includeLowerLevels: s.includeLowerLevels || true,
            })));
          }
        } catch (err) {
          setError("Không thể tải dữ liệu giáo viên.");
        } finally {
          setLoading(false);
        }
      };
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

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-4xl">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b">Thông tin cơ bản</h2>
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
            <section className="mb-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b">Ảnh đại diện</h2>
              <div className="flex items-center gap-4">
                {photoPreview ? (
                  <img src={photoPreview} alt="Xem trước" className="w-24 h-24 rounded-full object-cover" />
                ) : (
                  <div classNameD="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                    <UserIcon size={40} />
                  </div>
                )}
                <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                  <Upload className="w-5 h-5 mr-2" />
                  Tải ảnh mới
                  <input type="file" name="photo" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                </label>
              </div>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b">Kỹ năng Giảng dạy</h2>
              <p className="text-sm text-gray-600 mb-4">Lưu ý: Bạn cần nhập ID của Category (vd: 68f5d50...) và Level (vd: Expert, Intermediate).</p>
              {skills.map((skill, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 border rounded-md mb-3 items-end">
                  <input 
                    value={skill.category} 
                    onChange={(e) => {
                      const newSkills = [...skills];
                      newSkills[index].category = e.target.value;
                      setSkills(newSkills);
                    }}
                    placeholder="Category ID"
                    className={inputClass}
                  />
                  <input 
                    value={skill.levels}
                    onChange={(e) => {
                      const newSkills = [...skills];
                      newSkills[index].levels = e.target.value;
                      setSkills(newSkills);
                    }}
                    placeholder="Levels (cách nhau bởi dấu ,)"
                    className={inputClass}
                  />
                  <button type="button" onClick={() => setSkills(skills.filter((_, i) => i !== index))} className="text-red-500 hover:bg-red-100 rounded p-2">
                    <X className="mx-auto" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => setSkills([...skills, { category: '', levels: '', anyLevel: false, includeLowerLevels: true }])} className="text-purple-600 text-sm font-medium hover:text-purple-800">
                + Thêm kỹ năng
              </button>
            </section>
          </>
        )}

        <div className="mt-6 pt-4 border-t border-gray-200 text-right">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400"
          >
            {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminTeacherForm;