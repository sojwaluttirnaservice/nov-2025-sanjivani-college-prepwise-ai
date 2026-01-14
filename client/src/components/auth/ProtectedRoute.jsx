import React, { useEffect, useState } from 'react'
import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { selectIsAuthenticated, selectCurrentUser, selectCurrentToken, setCredentials, logout } from '../../redux/slices/authSlice'
import { instance } from '../../utils/instance'
import message from '../../utils/message'
import { Loader2 } from 'lucide-react'

const ProtectedRoute = ({ allowedRoles = [] }) => {
    const dispatch = useDispatch()
    const location = useLocation()
    const isAuthenticated = useSelector(selectIsAuthenticated)
    const user = useSelector(selectCurrentUser)
    const token = useSelector(selectCurrentToken)

    // Local state to track verification process on reload
    const [isVerifying, setIsVerifying] = useState(!isAuthenticated && !!localStorage.getItem('token'))

    useEffect(() => {
        const verifySession = async () => {
            // If already authenticated, no need to verify
            if (isAuthenticated) {
                setIsVerifying(false)
                return
            }

            // If no token in localStorage, stop verifying (let it redirect)
            const storedToken = localStorage.getItem('token')
            if (!storedToken) {
                setIsVerifying(false)
                return
            }

            try {
                // Call verification endpoint
                // Note: axios instance automatically attaches token from localStorage
                const response = await instance.get('/users/verify')

                if (response.success) {
                    dispatch(setCredentials({
                        user: response.data.user,
                        token: storedToken // Keep existing token
                    }))
                } else {
                    // Token invalid
                    dispatch(logout())
                    message.error("Session expired. Please login again.")
                }
            } catch (error) {
                console.error("Session verification failed", error)
                dispatch(logout())
                // Error handled by interceptor ideally, but ensuring safety
            } finally {
                setIsVerifying(false)
            }
        }

        verifySession()
    }, [isAuthenticated, dispatch])

    const storedToken = localStorage.getItem('token')

    // 1. Show loader while verifying (only on reload when we have a token but no Redux state)
    if (isVerifying) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                    <p className="text-gray-500 font-medium">Verifying session...</p>
                </div>
            </div>
        )
    }

    // 2. Not authenticated (and not verifying) -> Redirect to Login
    if (!isAuthenticated && !storedToken) {
        return <Navigate to="/auth/login" state={{ from: location }} replace />
    }

    // 3. Authenticated but Role not allowed -> Redirect to Home or Error
    if (isAuthenticated && allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        message.error("You are not authorized to access this page")
        return <Navigate to="/" replace />
    }

    // 4. Authorized -> Render content
    return <Outlet />
}

export default ProtectedRoute
