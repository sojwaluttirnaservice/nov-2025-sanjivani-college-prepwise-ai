import React from 'react'
import { Outlet } from 'react-router-dom'

import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const RootLayout = () => {
    return (
        <div id='main-wrapper' className='flex flex-col min-h-screen'>
            <Navbar />

            <main className='flex-1'>
                {/* content */}
                <Outlet />
            </main>

            <Footer />
        </div>
    )
}

export default RootLayout