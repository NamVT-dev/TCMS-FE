import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import PropTypes from 'prop-types';
import Loading from "../components/UI/Loading";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  //  Đang tải user -> tạm dừng render
  if (loading) return <Loading fullscreen message="Đang tải thông tin người dùng..." />;

  //  Nếu load xong mà chưa có user => chưa đăng nhập
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  //  Nếu có user nhưng không đúng role
  if (!allowedRoles.includes(user.role)) {
    const roleRoutes = {
      admin: '/admin/overview',
      teacher: '/teacher/timetable',
      member: '/',
      staff: '/staff/profile',
    };
    return <Navigate to={roleRoutes[user.role] || '/login'} replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default ProtectedRoute;
