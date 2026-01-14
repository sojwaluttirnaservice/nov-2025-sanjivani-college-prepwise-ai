import { Routes, Route } from 'react-router-dom'

import { ROLES } from './redux/slices/authSlice'

import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'
import AdminLayout from './layouts/AdminLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'

import HomePage from './pages/outer/HomePage'
import AboutPage from './pages/outer/AboutPage'
import ContactPage from './pages/outer/ContactPage'

// Auth Pages
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'

const App = () => {
    return (
        <Routes>
            {/* Public Layout */}
            <Route path='/' element={<MainLayout />}>
                <Route index element={<HomePage />} />
                <Route path='about' element={<AboutPage />} />
                <Route path='contact' element={<ContactPage />} />

                {/* Protected Student Routes within MainLayout */}
                <Route element={<ProtectedRoute allowedRoles={[ROLES.STUDENT]} />}>
                    <Route path='dashboard' element={<StudentDashboard />} />
                    {/* more student routes like curriculum, assessments will go here */}
                </Route>
            </Route>

            {/* Auth Layout */}
            <Route path='auth' element={<AuthLayout />}>
                <Route path='login' element={<LoginPage />} />
                <Route path='signup' element={<SignupPage />} />
            </Route>

            {/* Admin Layout */}
            <Route path='admin' element={<AdminLayout />}>
                <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
                    <Route path='dashboard' element={<AdminDashboard />} />
                    {/* more admin routes will go here */}
                </Route>
            </Route>
        </Routes>
    )
}

export default App