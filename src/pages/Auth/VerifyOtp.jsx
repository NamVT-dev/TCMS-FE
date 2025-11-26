import React, { useState, useEffect } from "react";
import { KeyRound, RefreshCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import toast from "react-hot-toast";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60); // 60s countdown
  const [canResend, setCanResend] = useState(false);
  const email = localStorage.getItem("pendingEmail");

  // Countdown logic
  useEffect(() => {
    let interval;
    if (!canResend && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
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
      const res = await api.auth.confirmEmail(otp);
      if (res?.data?.status === "success") {
        setMessage("✅ Xác thực thành công! Đang quay về trang đăng nhập...");
        toast.success("Xác thực email thành công!");
        localStorage.removeItem("pendingEmail");

        // ⏳ Delay 1.5s rồi điều hướng
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setError("OTP không chính xác, vui lòng kiểm tra lại");
      }
    } catch {
      setError("OTP không chính xác, vui lòng kiểm tra lại");
      toast.error("OTP không chính xác, vui lòng kiểm tra lại");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setResending(true);
    try {
      await api.auth.resendConfirmEmail();
      toast.success("Đã gửi lại mã OTP!");
      setCanResend(false);
      setTimer(60); // reset timer
    } catch {
      toast.error("Không thể gửi lại mã OTP. Vui lòng thử lại sau.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 justify-center items-center">
      <div className="bg-white rounded-3xl shadow-2xl px-8 py-10 w-[400px]">
        <div className="flex flex-col items-center space-y-3 mb-6">
          <KeyRound className="w-12 h-12 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-800">Xác minh Email</h2>
          <p className="text-gray-500 text-center text-sm">
            Mã OTP đã được gửi đến email{" "}
            <span className="text-purple-600 font-semibold">
              {email || "(Không rõ email)"}
            </span>
          </p>
        </div>

        {/* Thông báo */}
        {message && (
          <p className="text-green-600 text-center font-medium mb-2">
            {message}
          </p>
        )}
        {error && (
          <p className="text-red-500 text-center font-medium mb-2">{error}</p>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            placeholder="Nhập mã OTP (6 số)"
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value);
              if (error) setError("");
            }}
            className="w-full border border-gray-300 rounded-xl py-3 text-center text-lg tracking-widest focus:ring-2 focus:ring-purple-500"
            maxLength={6}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-3 rounded-xl shadow-lg hover:shadow-xl font-semibold transition-all disabled:opacity-60"
          >
            {loading ? "Đang xác thực..." : "Xác nhận OTP"}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={handleResend}
            disabled={!canResend || resending}
            className={`flex items-center justify-center gap-2 text-sm font-medium ${
              canResend
                ? "text-purple-600 hover:text-purple-800"
                : "text-gray-400 cursor-not-allowed"
            }`}
          >
            <RefreshCcw className="w-4 h-4" />
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
