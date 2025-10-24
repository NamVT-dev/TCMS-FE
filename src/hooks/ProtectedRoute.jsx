import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles?.includes(user.role)) {
    const roleRoutes = {
      admin: '/admin/overview',
      teacher: '/teacher/overview',
      member: '/student/overview',
      parent: '/parent/overview'
    };

    return <Navigate to={roleRoutes[user.role] || '/login'} replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default ProtectedRoute;