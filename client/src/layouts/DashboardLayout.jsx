import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'

const DashboardLayout = () => {
    return (
        <div id='dashboard-wrapper' className='flex flex-col min-h-screen bg-gray-50'>
            {/* Same Navbar as public, or could be a specific DashboardNavbar */}
            <Navbar />

            <main className='flex-1'>
                {/* Specific Dashboard content renders here */}
                <Outlet />
            </main>

            {/* No Footer for Dashboard Layout as requested */}
        </div>
    )
}

export default DashboardLayout
