import { createContext, useEffect, useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

const UserContext = createContext();

// 💡 HÀM KIỂM TRA ROUTE ĐỘNG BẰNG REGEX (GIỮ NGUYÊN)
const isPublicRoute = (path, publicRoutes) => {
    const regexRoutes = publicRoutes.map(route => {
        return new RegExp("^" + route.replace(/\//g, "\\/").replace(/:\w+/g, "[^/]+") + "$");
    });
    return regexRoutes.some(regex => regex.test(path));
};

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    // Vẫn cần loading để chặn dashboard khi user chưa tải xong
    const [loading, setLoading] = useState(true); 
    const navigate = useNavigate();

    // ✅ Các route public
   const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/about",
  "/contact",
  "/verify-otp",
  "/courses/:id",
  "/forgot-password",
  "/reset-password"
];


    // 1. TÁC VỤ KHỞI TẠO ĐƠN LẺ: Gộp logic kiểm tra Auth, Redirect, và Fetch User
    useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    const currentPath = window.location.pathname;

    async function fetchUserAndSetup() {
        if (!token) {
            // CASE 1: KHÔNG CÓ TOKEN (GUEST)
            setUser(null);
            setLoading(false);

            // ⬅️ FIX: KHÔNG redirect nếu đang ở trang login
            if (!isPublicRoute(currentPath, publicRoutes) && currentPath !== "/login") {
                navigate("/", { replace: true });
            }
            return;
        }

        // CASE 2: CÓ TOKEN (MEMBER)
        try {
            const localUser = savedUser ? JSON.parse(savedUser) : null;
            if (localUser) {
                setUser(localUser); 
            }
            
            const res = await api.user.getMe();
            const userData = res.data.data.data;
            
            if (userData) {
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                
                // ⬅️ CHỈ redirect khi đang ở trang login/register và ĐÃ ĐĂNG NHẬP
                if (["/login", "/register"].includes(currentPath)) { 
                    const { role } = userData;
                    const roleRoutes = {
                        admin: "/admin/overview",
                        teacher: "/teacher/overview",
                        staff: "/staff/overview",
                        member: "/",
                    };
                    navigate(roleRoutes[role] || "/", { replace: true });
                }
            }
        } catch (error) {
            console.error('Auth error, clearing session:', error);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
            
            // ⬅️ FIX: KHÔNG redirect nếu đang ở trang login
            if (!isPublicRoute(currentPath, publicRoutes) && currentPath !== "/login") {
                 navigate("/", { replace: true });
            }
        } finally {
            setLoading(false);
        }
    }
    
    fetchUserAndSetup();
}, [navigate]); // ⬅️ QUAN TRỌNG: CHỈ chạy 1 lần khi mount

  const login = async (email, password) => {
  try {
    const response = await api.auth.login({ email, password });

    if (response?.data?.data?.user) {
      const userData = response.data.data.user;
      const token = response.data.token;
      const { role } = userData;

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);
      setUser(userData);

      const roleRoutes = {
        admin: '/admin/overview',
        teacher: '/teacher/overview',
        staff: '/staff/overview',
        member: '/',
      };
      navigate(roleRoutes[role] || '/', { replace: true });
      return { success: true, data: response };
    }

    return { success: false, message: response?.data?.message || "Đăng nhập thất bại" };
  } catch (error) {
    console.error('Login error:', error);
    // ⬅️ LẤY MESSAGE TỪ BACKEND
    const message = error.response?.data?.message || "Đăng nhập thất bại";
    return { success: false, message };
  }
};


  const signup = async (signupData) => {
    try {
      
      const res = await api.auth.signup(signupData);
      if (res.data.status === "success") {
        setUser(res.data.data.user); 
        return true;
      }
    } catch (err) {
      throw new Error(err.response?.data?.message || "Không thể đăng kí");
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate("/");
      return true;
    } catch (err) {
      
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate("/");
      console.error(err.response?.data?.message || "Lỗi khi đăng xuất");
    }
  };

  const updatePassword = async (passwordData) => {
    try {
     
      await api.user.updatePassword(passwordData);
      return true;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Không thể đổi mật khẩu");
    }
  };

  const forgotPassword = async (email) => {
  try {
    const res = await api.user.forgotPassword(email);
    return res.data.status === "success";
  } catch (err) {
    throw new Error(err.response?.data?.message || "Có lỗi xảy ra");
  }
};

const resetPassword = async (email, token, password, passwordConfirm) => {
  try {
    // 🧠 Không gửi Authorization header
    const res = await api.auth.resetPassword({ email, token, password, passwordConfirm });

    if (res.data.status === "success") {
      const userData = res.data.data.user;
      const newToken = res.data.token;

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', newToken);
      setUser(userData);
    }
    return res.data.status === "success";
  } catch (err) {
    throw new Error(err.response?.data?.message || "Không thể đặt lại mật khẩu");
  }
};


  const updateProfile = async (data) => {
    try {
      const res = await api.user.updateProfile(data);
      if (res.data.status === "success") {
        const updatedUser = res.data.data.user;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser)); // Cập nhật lại user trong localStorage
      }
      return true;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Không thể cập nhật hồ sơ");
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        updatePassword,
        forgotPassword,
        resetPassword,
        isAuthenticated: !!user,
        updateProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;