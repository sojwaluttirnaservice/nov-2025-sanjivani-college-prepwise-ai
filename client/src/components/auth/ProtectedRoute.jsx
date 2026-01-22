import React from 'react'
import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated, selectCurrentUser } from '../../redux/slices/authSlice'

const ProtectedRoute = ({ allowedRoles = [] }) => {
    const location = useLocation()
    const isAuthenticated = useSelector(selectIsAuthenticated)
    const user = useSelector(selectCurrentUser)

    // 1. Not authenticated -> Redirect to Login
    if (!isAuthenticated) {
        return <Navigate to="/auth/login" state={{ from: location }} replace />
    }

    // 2. Role Protection (e.g. Student trying to access Admin routes)
    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        // Silently redirect unauthorized users to student home
        return <Navigate to="/student/stats" replace />
    }

    // 3. Authorized -> Render content
    return <Outlet />
}

export default ProtectedRoute
