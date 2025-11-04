import axios from "axios";


const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  withCredentials: true, // ✅ Gửi cookie tự động
});

// 🟩 Không cần interceptor request thêm token nữa
axiosInstance.interceptors.request.use(
  (config) => {
    // Nếu là FormData: để axios tự thêm boundary
    const isFD =
      typeof FormData !== "undefined" && config.data instanceof FormData;

    if (isFD) {
      if (config.headers) delete config.headers["Content-Type"];
    } else {
      if (config.headers) config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 🟥 Interceptor xử lý lỗi 401 (token hết hạn)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // ⬅️ FIX: CHỈ redirect khi 401 VÀ KHÔNG PHẢI từ endpoint login
    if (error.response?.status === 401 && !error.config.url.includes('auth/login')) {
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
    login: (credentials) => axiosInstance.post("auth/login", credentials),
    signup: (data) => axiosInstance.post("auth/signup", data),
    logout: () => axiosInstance.get("auth/logout"),
    confirmEmail: (pin) => axiosInstance.get(`auth/confirmEmail/${pin}`),
    resendConfirmEmail: () => axiosInstance.get("auth/resendConfirmEmail"),
    forgotPassword: (email) =>
      axiosInstance.post("auth/forgotPassword", { email }),
    resetPassword: (data) => axiosInstance.post("auth/resetPassword", data),
  },

  // --- Nhóm API Người dùng ---
  user: {
    getMe: () => axiosInstance.get("auth/profile"),
    updatePassword: (data) => axiosInstance.patch("auth/updatePassword", data),
    updateProfile: (data) => axiosInstance.patch("auth/profile", data),
    forgotPassword: (email) =>axiosInstance.post("auth/forgotPassword", { email }),
    resetPassword: (data) => axiosInstance.post("auth/resetPassword", data),
  
    registerTest: (testData) =>
      axiosInstance.post("test/register-test", testData),
    getCourseCategories: () => axiosInstance.get("categories"),
    getCourses: (params) => axiosInstance.get("courses", { params }),
    getCourseById: (id) => axiosInstance.get(`courses/${id}`),
  },

  // --- Nhóm API Admin ---
  admin: {
    getTeachers: (params) => axiosInstance.get("/admin/teachers", { params }),
    getTeacherDetail: (id) => axiosInstance.get(`/admin/teachers/${id}`),

    center: {
      getConfig: () => axiosInstance.get("/admin/center/config"),
      updateConfig: (data) =>
        axiosInstance.patch("/admin/center/config", data),
    },

    getRooms: (params) => axiosInstance.get("/admin/rooms", { params }),
    createRoom: (data) => axiosInstance.post("/admin/rooms", data),
    updateRoom: (id, data) =>
      axiosInstance.patch(`/admin/rooms/update/${id}`, data),
    deleteRoomById: (id) =>
      axiosInstance.delete(`/admin/rooms/${id}/delete`),

    getCourse: (params) => axiosInstance.get("/admin/courses", { params }),
    createCourse: (data) => axiosInstance.post("/admin/courses", data),
    getCourseById: (id) => axiosInstance.get(`/admin/courses/${id}`),
    updateCourseById: (id, data) =>
      axiosInstance.patch(`/admin/courses/update/${id}`, data),
    deleteCourseById: (id) =>
      axiosInstance.delete(`/admin/courses/${id}/delete`),
    getCategories: (params) => axiosInstance.get("/categories", { params }),
  },

  // --- Nhóm API Giáo viên ---
  teacher: {
    getShiftConfig: () => axiosInstance.get("/teacher/shift"),
    registerShift: (scheduleData) =>
      axiosInstance.patch("/teacher/register-shift", scheduleData),
    getTeachCategories: () => axiosInstance.get("/teacher/categories"),
    registerCategories: (categories) =>
      axiosInstance.patch("/teacher/register-categories", { categories }),
  },
};

export default api;
