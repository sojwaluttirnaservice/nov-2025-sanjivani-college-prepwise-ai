import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser } from '../../redux/slices/authSlice';

/**
 * PublicRoute Guard
 * Redirects authenticated users AWAY from public pages (like /login) 
 * to their respective internal home (/student/stats).
 */
const PublicRoute = () => {
    const isAuthenticated = useSelector(selectIsAuthenticated);

    if (isAuthenticated) {
        // Authenticated users should never see login/register/landing
        return <Navigate to="/student/stats" replace />;
    }

    return <Outlet />;
};

export default PublicRoute;
