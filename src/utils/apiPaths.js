import axios from "axios";

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000, // 10 seconds timeout
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        const errorMessage = error.response.data?.message || "";
        if (
          errorMessage.includes("Token expired") ||
          errorMessage.includes("Invalid token")
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
      }
      console.error('API Error:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config.url
      });
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email, password) => {
    try {
      const response = await axiosInstance.post('auth/login', {
        email,
        password
      });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  signup: (name, email, phoneNumber, dob, password, passwordConfirm) =>
    axiosInstance.post('auth/signup', {
      name,
      email,
      phoneNumber,
      dob,
      password,
      passwordConfirm
    }),

  logout: () => axiosInstance.get('auth/logout'),

  confirmEmail: (pin) => axiosInstance.get(`auth/confirmEmail/${pin}`),

  resendConfirmEmail: () => axiosInstance.get('auth/resendConfirmEmail'),

  forgotPassword: (email) => axiosInstance.post('auth/forgotPassword', { email }),

  resetPassword: (email, token, password, passwordConfirm) =>
    axiosInstance.post('auth/resetPassword', {
      email,
      token,
      password,
      passwordConfirm
    })
};

export const userService = {
  getMe: () => axiosInstance.get('auth/profile'),

  updatePassword: (passwordCurrent, password, passwordConfirm) =>
    axiosInstance.patch('auth/updatePassword', {
      passwordCurrent,
      password,
      passwordConfirm
    }),

  updateProfile: (data) => axiosInstance.patch('auth/profile', data)
};

// export function getTours(params) {
//   return axios.get(`${import.meta.env.VITE_API_URL}tours`, {
//     params,
//   });
// }

// export function getTourBySlug(slug) {
//   return axios.get(`${import.meta.env.VITE_API_URL}tours/detail/${slug}`);
// }

// export function getBookingSession(tourId, numberOfPeople, startDate) {
//   return axios.post(
//     `${import.meta.env.VITE_API_URL}bookings/checkout-session`,
//     {
//       tourId,
//       numberOfPeople,
//       startDate,
//     },
//     {
//       withCredentials: true,
//     }
//   );
// }
