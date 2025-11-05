// src/utils/socket.js

import { io } from "socket.io-client";

// 1. Đọc VITE_API_URL từ file .env của bạn
const URL = import.meta.env.VITE_API_URL;

// 2. Khởi tạo socket
export const socket = io(URL, {
  /**
   * 3. Tắt tự động kết nối (RẤT QUAN TRỌNG)
   * quản lý kết nối thủ công (socket.connect(), socket.disconnect())
   * bên trong component AdminScheduleJobDetail.
   */
  autoConnect: false,

  /**
   * 4. Gửi cookie (nếu backend cookie/session để xác thực socket)
   */
  withCredentials: true,
});