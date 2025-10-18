import axios from "axios";



const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});


axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);



const api = {
  // --- Nhóm API Xác thực ---
  auth: {
    
    login: (credentials) => axiosInstance.post('auth/login', credentials),

    signup: (data) => axiosInstance.post('/auth/signup', data),

    logout: () => axiosInstance.get('auth/logout'),
    
    confirmEmail: (pin) => axiosInstance.get(`auth/confirmEmail/${pin}`),

    resendConfirmEmail: () => axiosInstance.get('auth/resendConfirmEmail'),

    forgotPassword: (email) => axiosInstance.post('auth/forgotPassword', { email }),
    
    resetPassword: (data) => axiosInstance.post('auth/resetPassword', data),
  },
  
  // --- Nhóm API Người dùng ---
  user: {
    getMe: () => axiosInstance.get('auth/profile'),

    updatePassword: (data) => axiosInstance.patch('auth/updatePassword', data),

    updateProfile: (data) => axiosInstance.patch('auth/profile', data),

    registerTest: (testData) => axiosInstance.post('test/register-test', testData),
  },

  admin: {
    getTeachers: (params) => axiosInstance.get('/admin/teachers', { params }),

    getTeacherDetail: (id) => axiosInstance.get(`/admin/teachers/${id}`),
    
    center: {
       getConfig: () => axiosInstance.get("/admin/center/config"),

      updateConfig: (data) => axiosInstance.patch("/admin/center/config", data),
    }
    // Thêm các hàm khác cho admin ở đây (ví dụ: getStudents, getCourses...)
  },

  teacher: {
    
    getShiftConfig: () => axiosInstance.get('/teacher/shift'),
    registerShift: (scheduleData) => axiosInstance.patch('/teacher/register-shift', scheduleData),
    getTeachCategories: () => axiosInstance.get('/teacher/categories'),
    registerCategories: (categories) => axiosInstance.patch('/teacher/register-categories', { categories }),
  
  },
};

export default api;