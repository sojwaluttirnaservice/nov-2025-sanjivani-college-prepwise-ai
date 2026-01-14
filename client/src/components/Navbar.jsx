import React from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import Container from './utils/Container'
import { selectCurrentUser, selectIsAuthenticated, logout } from '../redux/slices/authSlice'
import message from '../utils/message'
import { LogOut, User } from 'lucide-react'

import toast from 'react-hot-toast'
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
        toast.success('Logged out successfully')
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
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-gray-900 tracking-tight">
                                {firstPart} {lastPart && <span className="text-indigo-600">{lastPart}</span>}
                            </span>
                        </Link>


                        {/* Navigation Links */}
                        <div className="hidden md:flex items-center space-x-8 font-medium text-gray-600">
                            <NavLink to={'/'} className={({ isActive }) => `hover:text-indigo-600 transition-colors ${isActive ? 'text-indigo-600' : ''}`}>Home</NavLink>
                            <NavLink to={'/about'} className={({ isActive }) => `hover:text-indigo-600 transition-colors ${isActive ? 'text-indigo-600' : ''}`}>About</NavLink>
                            <NavLink to={'/contact'} className={({ isActive }) => `hover:text-indigo-600 transition-colors ${isActive ? 'text-indigo-600' : ''}`}>Contact</NavLink>
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