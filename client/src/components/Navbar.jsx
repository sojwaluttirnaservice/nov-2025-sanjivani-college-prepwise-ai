import React from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import Container from './utils/Container'
import { selectCurrentUser, selectIsAuthenticated, logout } from '../redux/slices/authSlice'
import { LogOut, GraduationCap } from 'lucide-react'

import message from '../utils/message'
import clientConfig from '../config/clientConfig'

const Navbar = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const isAuthenticated = useSelector(selectIsAuthenticated)
    const user = useSelector(selectCurrentUser)

    const appNameParts = clientConfig.APP_NAME.split(' ')
    const firstPart = appNameParts.slice(0, -1).join(' ') || appNameParts[0]
    const lastPart = appNameParts.length > 1 ? appNameParts[appNameParts.length - 1] : ''

    const handleLogout = () => {
        dispatch(logout())
        message.success('Logged out successfully')
        navigate('/auth/login')
    }

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
            <Container>
                <div className="py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo Section */}
                        <Link to={'/'} className="flex items-center gap-2 group">
                            <div className="bg-indigo-600 text-white p-2 rounded-lg group-hover:bg-indigo-700 transition-colors">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <span className="text-xl font-bold text-gray-900 tracking-tight">
                                {firstPart} {lastPart && <span className="text-indigo-600">{lastPart}</span>}
                            </span>
                        </Link>


                        {/* Navigation Links */}
                        <div className="hidden md:flex items-center space-x-8 font-medium text-gray-600">
                            <NavLink
                                to={'/'}
                                className={({ isActive }) => `group relative py-1 transition-all duration-300 hover:text-indigo-600 ${isActive ? 'text-indigo-600 font-bold active-link' : ''}`}
                            >
                                Home
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-full animate-in fade-in slide-in-from-bottom-1 duration-500 opacity-0 group-[.active-link]:opacity-100 transition-opacity"></span>
                            </NavLink>
                            <NavLink
                                to={'/about'}
                                className={({ isActive }) => `group relative py-1 transition-all duration-300 hover:text-indigo-600 ${isActive ? 'text-indigo-600 font-bold active-link' : ''}`}
                            >
                                About
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-full animate-in fade-in slide-in-from-bottom-1 duration-500 opacity-0 group-[.active-link]:opacity-100 transition-opacity"></span>
                            </NavLink>
                            <NavLink
                                to={'/contact'}
                                className={({ isActive }) => `group relative py-1 transition-all duration-300 hover:text-indigo-600 ${isActive ? 'text-indigo-600 font-bold active-link' : ''}`}
                            >
                                Contact
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-full animate-in fade-in slide-in-from-bottom-1 duration-500 opacity-0 group-[.active-link]:opacity-100 transition-opacity"></span>
                            </NavLink>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-4">
                            {isAuthenticated ? (
                                <div className="flex items-center gap-4">
                                    <NavLink to={user?.role === 'ADMIN' ? '/admin' : '/student/stats'} className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Dashboard</NavLink>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 font-medium rounded-lg transition-all duration-300"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span className="hidden sm:inline">Logout</span>
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <NavLink to={'/auth/login'} className="hidden sm:block text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                                        Log In
                                    </NavLink>
                                    <NavLink to={'/auth/register'} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
                                        Join Now
                                    </NavLink>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </Container>
        </nav>
    )
}

export default Navbar