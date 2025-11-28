import React, { useState, useEffect } from "react";
import { KeyRound, RefreshCcw, ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../utils/api";
import toast from "react-hot-toast";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Lấy thông tin user được truyền từ trang Login (nếu có)
  const userData = location.state?.userData;

  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  
  // YÊU CẦU: Active ngay nút gửi lại khi mới vào trang
  // Khởi tạo timer = 0 để không phải chờ
  const [timer, setTimer] = useState(0);

  // Cho phép gửi lại ngay lập tức
  const [canResend, setCanResend] = useState(true);
  
  const email = localStorage.getItem("pendingEmail");

  useEffect(() => {
    let interval;
    if (!canResend && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timer === 0 && !canResend) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, canResend]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!otp.trim()) {
      setError("Vui lòng nhập mã OTP");
      return;
    }

    try {
      setLoading(true);
      // Gọi API confirmEmail
      const res = await api.auth.confirmEmail(otp);
      
      if (res?.data?.status === "success") {
        setMessage("✅ Xác thực thành công! Đang quay về trang đăng nhập...");
        toast.success("Xác thực email thành công!");
        localStorage.removeItem("pendingEmail");

        setTimeout(() => navigate("/login"), 1500);
      } else {
        setError("OTP không chính xác, vui lòng kiểm tra lại");
      }
    } catch (err) {
      // Xử lý lỗi an toàn hơn
      const msg = err.response?.data?.message || "OTP không chính xác hoặc đã hết hạn";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setResending(true);
    try {
      // Gọi API gửi lại OTP
      await api.auth.resendConfirmEmail();
      
      toast.success("Đã gửi lại mã OTP!");
      
      // Sau khi gửi thành công, bắt đầu đếm ngược 60s
      setCanResend(false);
      setTimer(60); 
    } catch (err) {
      const msg = err.response?.data?.message || "Không thể gửi lại mã OTP. Vui lòng thử lại sau.";
      toast.error(msg);
      setError(msg); 
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 justify-center items-center">
      <div className="bg-white rounded-3xl shadow-2xl px-8 py-10 w-[400px] relative">
        {/* Thêm nút Back để trải nghiệm tốt hơn nếu lỡ vào nhầm */}
        <button 
            onClick={() => navigate("/login")}
            className="absolute top-6 left-6 text-gray-400 hover:text-purple-600 transition-colors"
        >
            <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center space-y-3 mb-6">
          <KeyRound className="w-12 h-12 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-800">Xác minh Email</h2>
          <p className="text-gray-500 text-center text-sm">
            Mã OTP đã được gửi đến email{" "}
            <span className="text-purple-600 font-semibold block mt-1">
              {email || "(Không rõ email)"}
            </span>
          </p>
        </div>

        {message && (
          <p className="text-green-600 text-center font-medium mb-2 bg-green-50 p-2 rounded-lg border border-green-100">
            {message}
          </p>
        )}
        {error && (
          <p className="text-red-500 text-center font-medium mb-2 bg-red-50 p-2 rounded-lg border border-red-100">
            {error}
          </p>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            placeholder="Nhập mã OTP (6 số)"
            value={otp}
            onChange={(e) => {
              // Chỉ cho nhập số để tránh lỗi
              const val = e.target.value.replace(/[^0-9]/g, '');
              setOtp(val);
              if (error) setError("");
            }}
            className="w-full border border-gray-300 rounded-xl py-3 text-center text-lg tracking-widest focus:ring-2 focus:ring-purple-500 outline-none transition-all"
            maxLength={6}
          />

          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-3 rounded-xl shadow-lg hover:shadow-xl font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Đang xác thực..." : "Xác nhận OTP"}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={handleResend}
            disabled={!canResend || resending}
            className={`flex items-center justify-center gap-2 text-sm font-medium mx-auto ${
              canResend
                ? "text-purple-600 hover:text-purple-800 cursor-pointer"
                : "text-gray-400 cursor-not-allowed"
            }`}
          >
            <RefreshCcw className={`w-4 h-4 ${resending ? "animate-spin" : ""}`} />
            {resending
              ? "Đang gửi lại..."
              : canResend
              ? "Gửi lại mã OTP"
              : `Gửi lại sau ${timer}s`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;