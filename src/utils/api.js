import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 10000,
    withCredentials: true, 
});

axiosInstance.interceptors.request.use(
    (config) => {
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


axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";
   
    if (
      error.response?.status === 401 &&
      !url.includes("auth/login") &&
      !url.includes("auth/updatePassword")
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);


const api = {
    // --- Auth ---
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

    // --- User ---
    user: {
        getMe: () => axiosInstance.get("auth/profile"),
        updatePassword: (data) => axiosInstance.patch("auth/updatePassword", data),
        updateProfile: (data) => axiosInstance.patch("auth/profile", data),
        forgotPassword: (email) => axiosInstance.post("auth/forgotPassword", { email }),
        resetPassword: (data) => axiosInstance.post("auth/resetPassword", data),

        registerTest: (testData) =>
            axiosInstance.post("test/register-test", testData),

        getCourseCategories: () => axiosInstance.get("categories"),
        getCourses: (params) => axiosInstance.get("courses", { params }),
        getCourseById: (id) => axiosInstance.get(`courses/${id}`),

        getLearnerProfile: () => axiosInstance.get("learner"),
        getLearnerById: (id) => axiosInstance.get(`learner/${id}`),
        updateLearnerById: (id, data) => axiosInstance.patch(`/learner/${id}`, data),
    },

    // --- Admin ---
    admin: {
        getDashboardOverview: () => axiosInstance.get("/admin/dashboard"),

        getTeachers: (params) => axiosInstance.get("/admin/teachers", { params }),
        getTeacherDetail: (id) => axiosInstance.get(`/admin/teachers/${id}`),
        createTeacher: (data) => axiosInstance.post("/admin/teachers", data),
        updateTeacher: (id, formData) =>
            axiosInstance.patch(`/admin/teachers/${id}`, formData),
        deleteTeacher: (id) => axiosInstance.delete(`/admin/teachers/${id}`),

        getStaffs: (params) => axiosInstance.get("/admin/staff", { params }),
        getStaffDetail: (id) => axiosInstance.get(`/admin/staff/${id}`),
        createStaff: (data) => axiosInstance.post("/admin/staff", data),
        updateStaff: (id, formData) =>
            axiosInstance.patch(`admin/staff/${id}`, formData),
        deleteStaff: (id) => axiosInstance.delete(`/admin/staff/${id}`),

        center: {
            getConfig: () => axiosInstance.get("/admin/center/config"),
            updateConfig: (data) =>
                axiosInstance.patch("/admin/center/config", data),
        },

        schedule: {
            runScheduler: (data) => axiosInstance.post("schedule/run", data),
            getAllJobs: () => axiosInstance.get("schedule/jobs"),
            getJobDetails: (jobId) => axiosInstance.get(`schedule/jobs/${jobId}`),
            finalizeJob: (jobId) =>
                axiosInstance.post(`schedule/jobs/${jobId}/finalize`),
            getAnalytics: () => axiosInstance.get("schedule/analytics"),
            getStatus: () => axiosInstance.get("schedule/status"),
        },

        class: {
            listClasses: (params) => axiosInstance.get("admin/classes", { params }),
            getClassDetail: (id, params) =>
                axiosInstance.get(`admin/classes/${id}`, { params }),
            previewChangeTeacher: (classId, data) =>
                axiosInstance.patch(`admin/classes/${classId}/preview`, data),
            applyChangeTeacher: (classId, data) =>
                axiosInstance.patch(`admin/classes/${classId}/apply`, data),
            createClass: (classData) => axiosInstance.post("staff/class", classData),
            createSessions: (sessionsData) =>
                axiosInstance.post("staff/class/session", sessionsData),
            updateClass: (id, classData) =>
                axiosInstance.patch(`staff/class/${id}`, classData),
            updateSession: (id, data) =>
                axiosInstance.patch(`admin/session/${id}`, data),
            cancelClass: (id) =>
                axiosInstance.patch(`admin/classes/${id}/cancel`),
        },

        enrollment: {
            getStudentDemand: (params) =>
                axiosInstance.get("/admin/student-demand", { params }),
        },

        request: {
            getAll: (params) =>
                axiosInstance.get("/staff/custom-requests", { params }),
            getSummary: () => axiosInstance.get("/staff/custom-requests/summary"),
            getOne: (id) => axiosInstance.get(`/staff/custom-requests/${id}`),
            update: (id, data) =>
                axiosInstance.patch(`/staff/custom-requests/${id}`, data),
            delete: (id) => axiosInstance.delete(`/staff/custom-requests/${id}`),
        },

        finance: {
            getRevenueReport: (params) =>
                axiosInstance.get("/admin/reports/revenue", { params }),
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

    // --- Teacher ---
    teacher: {
        getShiftConfig: () => axiosInstance.get("/teacher/shift"),
        registerShift: (scheduleData) =>
            axiosInstance.patch("/teacher/register-shift", scheduleData),
        getTeachCategories: () => axiosInstance.get("/teacher/categories"),
        registerCategories: (categories) =>
            axiosInstance.patch("/teacher/register-categories", { categories }),

        getMyClasses: () => axiosInstance.get("teacher/my-class"),
        getMyClassDetail: (classId) =>
            axiosInstance.get(`teacher/my-class/${classId}`),
        getMySchedule: (params) =>
            axiosInstance.get("teacher/my-schedule", { params }),

        attendance: {
            getTodaySession: () =>
                axiosInstance.get("attendance/today-session"),

            startSession: (sessionId) =>
                axiosInstance.post(`attendance/start-session/${sessionId}`),

            takeAttendance: (attendanceId, attendanceData) =>
                axiosInstance.patch(`attendance/take-attendance/${attendanceId}`, {
                    attendance: attendanceData,
                }),

            getAllAttendanceReport: () =>
                axiosInstance.get("attendance"),
        },
    },

    // --- Learner ---
    learner: {
        getAllMyStudents: () => axiosInstance.get("learner"),

        getStudentProfile: (studentId) =>
            axiosInstance.get(`learner/${studentId}`),

        updateLearningGoal: (studentId, data) =>
            axiosInstance.post(`${studentId}/goals`, data),

        getRoadmap: (studentId, categoryId) =>
            axiosInstance.get(`${studentId}/roadmap`, {
                params: { category: categoryId },
            }),

        createSeatHold: (data) => axiosInstance.post("enrollment", data),

        createCustomSchedule: (data) =>
            axiosInstance.post("custom-schedule", data),

        getMyEnrolledClasses: (studentId) =>
            axiosInstance.get(`${studentId}/classes`),

        getStudentClassDetail: (studentId, classId) =>
            axiosInstance.get(`${studentId}/classes/${classId}`),

        getMySchedule: (studentId, params) =>
            axiosInstance.get(`${studentId}/schedule`, { params }),
    },

    // --- Staff ---
    staff: {
        getTeachers: (params) =>
            axiosInstance.get("/staff/account?role=teacher", { params }),
        getTeacherDetail: (id) =>
            axiosInstance.get(`/staff/account/${id}`),
        getStudents: (params) =>
            axiosInstance.get("/staff/account?role=member", { params }),
        getStudentDetail: (id) =>
            axiosInstance.get(`/staff/account/${id}`),
    },
};

export default api;
