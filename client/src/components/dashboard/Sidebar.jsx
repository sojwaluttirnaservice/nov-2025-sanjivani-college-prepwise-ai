import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { logout } from '../../redux/slices/authSlice'
import clientConfig from '../../config/clientConfig'

const Sidebar = ({ roleName, links = [], onLogout }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const appNameParts = clientConfig.APP_NAME.split(' ')
    const firstPart = appNameParts.slice(0, -1).join(' ') || appNameParts[0]
    const lastPart = appNameParts.length > 1 ? appNameParts[appNameParts.length - 1] : ''

    const handleLogout = () => {
        if (onLogout) {
            onLogout()
        } else {
            dispatch(logout())
            navigate('/auth/login')
        }
    }

    return (
        <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col h-screen fixed left-0 top-0 z-10 font-sans">
            {/* Logo / Brand */}
            <div className="h-16 flex items-center px-6 border-b border-gray-100">
                <div className="text-xl font-bold text-gray-900 tracking-tight">
                    {firstPart} {lastPart && <span className="text-indigo-600">{lastPart}</span>}
                </div>
                <span className="ml-2 text-[10px] font-medium text-gray-500 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded">
                    {roleName}
                </span>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {links.map((link) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        end={link.exact}
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all duration-300 group relative ${isActive
                                ? 'bg-indigo-50/50 text-indigo-700'
                                : 'text-gray-500 hover:bg-slate-50 hover:text-slate-900'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <div className="absolute left-0 top-3 bottom-3 w-1 bg-indigo-600 rounded-r-full shadow-[0_0_10px_rgba(79,70,229,0.4)] animate-in slide-in-from-left-1" />
                                )}
                                <link.icon
                                    className={`w-5 h-5 mr-3 transition-all duration-300 ${isActive ? 'text-indigo-600 scale-110' : 'text-gray-400 group-hover:text-gray-600'
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
            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    Sign Out
                </button>
            </div>
        </aside>
    )
}

export default Sidebar
