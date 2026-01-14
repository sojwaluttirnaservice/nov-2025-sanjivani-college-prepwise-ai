import { Routes, Route, Navigate } from 'react-router-dom'
import { ROLES } from './redux/slices/authSlice'

// Layouts
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'
import StudentLayout from './layouts/StudentLayout'
import AdminLayout from './layouts/AdminLayout'

// Guards
import ProtectedRoute from './components/auth/ProtectedRoute'
import PublicRoute from './components/auth/PublicRoute'

// Pages
import HomePage from './pages/outer/HomePage'
import AboutPage from './pages/outer/AboutPage'
import ContactPage from './pages/outer/ContactPage'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import StudentDashboard from './pages/student/StudentDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'

const App = () => {
    return (
        <Routes>
            {/* PUBLIC ROUTES (Unauthenticated Only) */}
            <Route element={<PublicRoute />}>
                {/* Landing Pages Group */}
                <Route element={<MainLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                </Route>

                {/* Authentication Group */}
                <Route path="/auth" element={<AuthLayout />}>
                    <Route path="login" element={<LoginPage />} />
                    <Route path="register" element={<SignupPage />} />
                </Route>
            </Route>

            {/* AUTHENTICATED STUDENT ROUTES */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.STUDENT]} />}>
                <Route element={<StudentLayout />}>
                    <Route path="/student/stats" element={<StudentDashboard />} />
                    <Route path="/student/profile" element={<div>Student Profile Page</div>} />

                    {/* Syllabus Section */}
                    <Route path="/syllabus" element={<div>Syllabus Overview</div>} />
                    <Route path="/syllabus/subjects" element={<div>Subjects List</div>} />
                    <Route path="/syllabus/subjects/:subjectId" element={<div>Subject Details</div>} />

                    {/* Assessment Section */}
                    <Route path="/assessment/start" element={<div>Start Assessment</div>} />
                    <Route path="/assessment/attempt" element={<div>Attempt Assessment (10 MCQs)</div>} />
                    <Route path="/assessment/results" element={<div>Assessment Results</div>} />
                </Route>
            </Route>

            {/* AUTHENTICATED ADMIN ROUTES */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
                <Route element={<AdminLayout />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/students" element={<div>Student Management</div>} />
                    <Route path="/admin/activity" element={<div>Activity Logs</div>} />
                    <Route path="/admin/assessments" element={<div>Question Bank</div>} />
                </Route>
            </Route>

            {/* Global Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

export default App