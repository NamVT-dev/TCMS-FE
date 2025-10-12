// Khai báo api vào đây nhé
import axios from "axios";

// Interceptor để xử lý 401 errors (unauthorized)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const errorMessage = error.response.data?.message || "";
      if (
        errorMessage.includes("Token expired") ||
        errorMessage.includes("Invalid token")
      ) {
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (email, password) => {
    return axios.post(
      `${import.meta.env.VITE_API_URL}auth/login`,
      {
        email,
        password,
      },
      {
        withCredentials: true,
      }
    );
  },

  signup: (name, email, phoneNumber, dob, password, passwordConfirm) =>
    axios.post(
      `${import.meta.env.VITE_API_URL}auth/signup`,
      {
        name,
        email,
        phoneNumber,
        dob,
        password,
        passwordConfirm,
      },
      {
        withCredentials: true,
      }
    ),

  logout: () =>
    axios.get(`${import.meta.env.VITE_API_URL}auth/logout`, {
      withCredentials: true,
    }),

  confirmEmail: (pin) =>
    axios.get(`${import.meta.env.VITE_API_URL}auth/confirmEmail/${pin}`, {
      withCredentials: true,
    }),

  resendConfirmEmail: () =>
    axios.get(`${import.meta.env.VITE_API_URL}auth/resendConfirmEmail`, {
      withCredentials: true,
    }),

  forgotPassword: (email) =>
    axios.post(`${import.meta.env.VITE_API_URL}auth/forgotPassword`, {
      email,
    }),

  resetPassword: (email, token, password, passwordConfirm) =>
    axios.post(
      `${import.meta.env.VITE_API_URL}auth/resetPassword`,
      {
        email,
        token,
        password,
        passwordConfirm,
      },
      { withCredentials: true }
    ),
};

export const userService = {
  getMe: () =>
    axios.get(`${import.meta.env.VITE_API_URL}auth/profile`, {
      withCredentials: true,
    }),

  updatePassword: (passwordCurrent, password, passwordConfirm) =>
    axios.patch(
      `${import.meta.env.VITE_API_URL}auth/updatePassword`,
      {
        passwordCurrent,
        password,
        passwordConfirm,
      },
      {
        withCredentials: true,
      }
    ),
  updateProfile: (data) => {
    return axios.patch(`${import.meta.env.VITE_API_URL}auth/profile`, data, {
      withCredentials: true,
    });
  },
};

export function getTours(params) {
  return axios.get(`${import.meta.env.VITE_API_URL}tours`, {
    params,
  });
}

export function getTourBySlug(slug) {
  return axios.get(`${import.meta.env.VITE_API_URL}tours/detail/${slug}`);
}

export function getBookingSession(tourId, numberOfPeople, startDate) {
  return axios.post(
    `${import.meta.env.VITE_API_URL}bookings/checkout-session`,
    {
      tourId,
      numberOfPeople,
      startDate,
    },
    {
      withCredentials: true,
    }
  );
}
