import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut, X } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { logout } from '../../redux/slices/authSlice'
import clientConfig from '../../config/clientConfig'

const Sidebar = ({ roleName, links = [], onLogout, isOpen, onClose, theme = 'light' }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const appNameParts = clientConfig.APP_NAME.split(' ')
    const firstPart = appNameParts.slice(0, -1).join(' ') || appNameParts[0]
    const lastPart = appNameParts.length > 1 ? appNameParts[appNameParts.length - 1] : ''

    const isDark = theme === 'admin';

    const handleLogout = () => {
        if (onLogout) {
            onLogout()
        } else {
            dispatch(logout())
            navigate('/auth/login')
        }
    }

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                w-64 flex-col h-screen fixed left-0 top-0 z-50 font-sans transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0 md:flex
                ${isDark ? 'bg-[#0f0c29] border-r border-white/10' : 'bg-white border-r border-gray-200'}
            `}>
                {/* Logo / Brand */}
                <div className={`h-16 flex items-center justify-between px-6 border-b ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
                    <div className="flex items-center gap-2">
                        <div className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {firstPart} {lastPart && <span className="text-indigo-600">{lastPart}</span>}
                        </div>
                        <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded ${isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-gray-100 text-gray-500'}`}>
                            {roleName}
                        </span>
                    </div>
                    {/* Mobile Close Button */}
                    <button onClick={onClose} className={`md:hidden ${isDark ? 'text-white/50 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {links.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            end={link.exact}
                            onClick={() => onClose && onClose()} // Close sidebar on mobile when link clicked
                            className={({ isActive }) =>
                                `flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all duration-300 group relative ${isActive
                                    ? isDark ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'bg-indigo-50/50 text-indigo-700'
                                    : isDark ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-gray-500 hover:bg-slate-50 hover:text-slate-900'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && !isDark && (
                                        <div className="absolute left-0 top-3 bottom-3 w-1 bg-indigo-600 rounded-r-full shadow-[0_0_10px_rgba(79,70,229,0.4)] animate-in slide-in-from-left-1" />
                                    )}
                                    <link.icon
                                        className={`w-5 h-5 mr-3 transition-all duration-300 ${isActive ? (isDark ? 'text-white scale-110' : 'text-indigo-600 scale-110') : 'text-gray-400 group-hover:text-gray-600'
                                            }`}
                                        strokeWidth={2.5}
                                    />
                                    {link.label}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom Actions */}
                <div className={`p-4 border-t ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
                    <button
                        onClick={handleLogout}
                        className={`flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'}`}
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Sign Out
                    </button>
                </div>
            </aside>
        </>
    )
}

export default Sidebar
