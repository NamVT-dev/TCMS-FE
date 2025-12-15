import { createContext, useEffect, useState } from "react";
import api from "../utils/api";
import { useNavigate, useLocation } from "react-router-dom";

const UserContext = createContext();

const isPublicRoute = (path, publicRoutes) => {
    const regexRoutes = publicRoutes.map(route => {
        return new RegExp("^" + route.replace(/\//g, "\\/").replace(/:\w+/g, "[^/]+") + "$");
    });
    return regexRoutes.some(regex => regex.test(path));
};

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    const publicRoutes = [
        "/",
        "/login",
        "/register",
        "/verify-otp",
        "/about",
        "/contact",
        "/courses/:id",
        "/forgot-password",
        "/reset-password",
        "/return"
    ];

    useEffect(() => {
        const token = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");
        const currentPath = location.pathname;

        async function fetchUserAndSetup() {
            if (!token) {
                // CASE 1: KHÔNG CÓ TOKEN
                setUser(null);
                setLoading(false);

                // ✅ CHỈ redirect nếu KHÔNG PHẢI public route
                if (!isPublicRoute(currentPath, publicRoutes)) {
                    console.log(`🚫 Not authenticated, redirecting from ${currentPath} to /`);
                    navigate("/", { replace: true });
                }
                return;
            }

            // CASE 2: CÓ TOKEN
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

                    // CHỈ redirect khi đang ở trang login/register/verify-otp và ĐÃ CÓ TOKEN
                    if (["/login", "/register", "/verify-otp"].includes(currentPath)) {
                        const { role } = userData;
                        const roleRoutes = {
                            admin: "/admin/overview",
                            teacher: "/teacher/overview",
                            staff: "/staff/profile",
                            member: "/",
                        };
                        console.log(`✅ Already authenticated, redirecting from ${currentPath} to dashboard`);
                        navigate(roleRoutes[role] || "/", { replace: true });
                    }
                }
            } catch (error) {
                console.error('Auth error, clearing session:', error);
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                setUser(null);

                if (!isPublicRoute(currentPath, publicRoutes)) {
                    console.log(`❌ Auth failed, redirecting from ${currentPath} to /`);
                    navigate("/", { replace: true });
                }
            } finally {
                setLoading(false);
            }
        }

        fetchUserAndSetup();
    }, [navigate, location]);

    const login = async (email, password) => {
        try {
            const response = await api.auth.login({ email, password });
            if (response?.data?.data?.user) {
                const userData = response.data.data.user;

                if (userData.active === false) {

                    if (userData.confirmPinExpires || userData.confirmPin) {

                        return {
                            success: true,
                            needVerify: true,
                            user: userData
                        };
                    }


                    return {
                        success: false,
                        message: "Tài khoản bị vô hiệu hóa. Vui lòng liên hệ với Admin để mở khóa"
                    };
                }


                const token = response.data.token;
                const { role } = userData;

                localStorage.setItem('token', token);
                setUser(userData);

                const roleRoutes = {
                    admin: '/admin/overview',
                    teacher: '/teacher/timetable',
                    staff: '/staff/classes',
                    member: '/',
                };

                navigate(roleRoutes[role] || '/', { replace: true });
                return { success: true, data: response };
            }

            return { success: false, message: response?.data?.message || "Đăng nhập thất bại" };
        } catch (error) {
            console.error('Login error:', error);
            const message = error.response?.data?.message || "Đăng nhập thất bại";
            return { success: false, message };
        }
    };

    const signup = async (signupData) => {
        try {
            const res = await api.auth.signup(signupData);
            if (res.data.status === "success") {
                console.log("✅ Signup successful, user needs to verify email");
                return true;
            }
        } catch (err) {
           
            throw err;
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
            
            throw err;
        }
    };

    const resetPassword = async (email, token, password, passwordConfirm) => {
        try {
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
                localStorage.setItem('user', JSON.stringify(updatedUser));
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