import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { BarChart2, Book, CheckSquare, ClipboardList, User } from 'lucide-react';
import Sidebar from '../components/dashboard/Sidebar';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import { logout } from '../redux/slices/authSlice';
import message from '../utils/message';

const StudentLayout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const studentLinks = [
        { path: '/student/stats', label: 'My Performance', icon: BarChart2 },
        { path: '/syllabus/subjects', label: 'Syllabus', icon: Book },
        { path: '/assessment/attempt', label: 'New Assessment', icon: CheckSquare },
        { path: '/assessment/results', label: 'Past Results', icon: ClipboardList },
        { path: '/student/profile', label: 'My Profile', icon: User },
    ];

    const handleLogout = () => {
        dispatch(logout());
        message.success('Logged out successfully');
        navigate('/auth/login');
    };

    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="flex bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-indigo-50/50 via-slate-50 to-slate-100 min-h-screen">
            <Sidebar
                roleName="STUDENT"
                links={studentLinks}
                onLogout={handleLogout}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
            <div className="flex-1 md:ml-64 flex flex-col">
                <DashboardNavbar onToggleSidebar={toggleSidebar} />
                <main className="flex-1">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default StudentLayout;
