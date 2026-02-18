import { Routes, Route, Navigate } from 'react-router-dom'
import { ROLES } from './redux/slices/authSlice'

// Layouts
import ScrollToTop from './components/utils/ScrollToTop'
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
import SubjectSelectionPage from './pages/student/SubjectSelectionPage'
import UnitSelectionPage from './pages/student/UnitSelectionPage'
import AssessmentAttemptPage from './pages/student/AssessmentAttemptPage'
import AssessmentResultsPage from './pages/student/AssessmentResultsPage'
import AssessmentResultDetailPage from './pages/student/AssessmentResultDetailPage'
import StudentProfilePage from './pages/student/StudentProfilePage'
import PageNotFound from './pages/outer/PageNotFound'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import StudentListView from './modules/admin/StudentListView'
import StudentDetailView from './modules/admin/StudentDetailView'

const App = () => {
    return (
        <>
            <ScrollToTop />
            <Routes>
                {/* ACCESSIBLE TO EVERYONE (Landing, About, Contact, Auth) */}
                <Route element={<MainLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />

                    {/* PUBLIC ONLY (Redirects if logged in) */}
                    <Route element={<PublicRoute />}>
                        <Route path="/auth" element={<AuthLayout />}>
                            <Route path="login" element={<LoginPage />} />
                            <Route path="register" element={<SignupPage />} />
                        </Route>
                    </Route>
                </Route>

                {/* AUTHENTICATED STUDENT ROUTES */}
                <Route element={<ProtectedRoute allowedRoles={[ROLES.STUDENT]} />}>
                    <Route element={<StudentLayout />}>
                        <Route path="/student/stats" element={<StudentDashboard />} />
                        <Route path="/student/profile" element={<StudentProfilePage />} />

                        {/* Syllabus Section */}
                        <Route path="/syllabus/subjects" element={<SubjectSelectionPage />} />
                        <Route path="/syllabus/subjects/:subjectId" element={<UnitSelectionPage />} />

                        {/* Assessment Section */}
                        <Route path="/assessment/attempt" element={<AssessmentAttemptPage />} />
                        <Route path="/assessment/results" element={<AssessmentResultsPage />} />
                        <Route path="/assessment/results/:attemptId" element={<AssessmentResultDetailPage />} />
                    </Route>
                </Route>

                {/* ADMIN LOGIN (public, standalone) */}
                <Route path="/admin/login" element={<AdminLoginPage />} />

                {/* AUTHENTICATED ADMIN ROUTES */}
                <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
                    <Route element={<AdminLayout />}>
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/admin/students" element={<StudentListView />} />
                        <Route path="/admin/students/:id" element={<StudentDetailView />} />
                        <Route path="/admin/activity" element={<div>Activity Logs</div>} />
                        <Route path="/admin/assessments" element={<div>Question Bank</div>} />
                    </Route>
                </Route>

                {/* Global Fallback (404) */}
                <Route path="*" element={<PageNotFound />} />
            </Routes>
        </>
    )
}

export default App