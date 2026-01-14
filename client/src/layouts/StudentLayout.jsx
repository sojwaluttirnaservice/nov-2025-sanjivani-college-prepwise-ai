import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { BarChart2, Book, CheckSquare, ClipboardList, User, LogOut } from 'lucide-react';
import Sidebar from '../components/dashboard/Sidebar';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import { selectCurrentUser, logout } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';

const StudentLayout = () => {
    const user = useSelector(selectCurrentUser);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const studentLinks = [
        { path: '/student/stats', label: 'My Performance', icon: BarChart2 },
        { path: '/syllabus', label: 'Syllabus', icon: Book },
        { path: '/assessment/start', label: 'New Assessment', icon: CheckSquare },
        { path: '/assessment/results', label: 'Past Results', icon: ClipboardList },
        { path: '/student/profile', label: 'My Profile', icon: User },
    ];

    const handleLogout = () => {
        dispatch(logout());
        toast.success('Logged out successfully');
        navigate('/login');
    };

    return (
        <div className="flex bg-slate-50 min-h-screen">
            <Sidebar
                roleName="STUDENT"
                links={studentLinks}
                onLogout={handleLogout}
            />
            <div className="flex-1 md:ml-64 flex flex-col">
                <DashboardNavbar />
                <main className="flex-1">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default StudentLayout;
