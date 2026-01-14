import React from 'react'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../../redux/slices/authSlice'
import { Bell, User } from 'lucide-react'
import clientConfig from '../../config/clientConfig'

const DashboardNavbar = () => {
    const user = useSelector(selectCurrentUser)

    const appNameParts = clientConfig.APP_NAME.split(' ')
    const firstPart = appNameParts.slice(0, -1).join(' ') || appNameParts[0]

    return (
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-10">
            {/* Left side (Mobile Toggle placeholder could go here) */}
            <div className="flex items-center md:hidden">
                <div className="text-xl font-bold text-indigo-600">{firstPart}</div>
            </div>

            {/* Title / Breadcrumbs (Optional) */}
            <div className="hidden md:block">
                {/* <h1 className="text-lg font-semibold text-gray-800">Dashboard</h1> */}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4 ml-auto">
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>

                <div className="h-8 w-px bg-gray-200 mx-1"></div>

                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-sm font-medium text-gray-700 truncate max-w-[150px]">
                            {user?.email}
                        </span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-tight">
                            {user?.role?.toLowerCase().replace('_', ' ')}
                        </span>
                    </div>
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center border border-indigo-200">
                        <User className="w-4 h-4 text-indigo-700" />
                    </div>
                </div>
            </div>
        </header>
    )
}

export default DashboardNavbar
