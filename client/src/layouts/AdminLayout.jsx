import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { LayoutDashboard, Users, Activity, ClipboardList, LogOut } from 'lucide-react';
import Sidebar from '../components/dashboard/Sidebar';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import { selectCurrentUser, logout } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';

const AdminLayout = () => {
    const user = useSelector(selectCurrentUser);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const adminLinks = [
        { path: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
        { path: '/admin/students', label: 'Students', icon: Users },
        { path: '/admin/assessments', label: 'Assessments', icon: ClipboardList },
        { path: '/admin/activity', label: 'System Activity', icon: Activity },
    ];

    const handleLogout = () => {
        dispatch(logout());
        toast.success('Logged out successfully');
        navigate('/auth/login');
    };

    return (
        <div className="flex bg-slate-50 min-h-screen">
            <Sidebar
                roleName="ADMIN"
                links={adminLinks}
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

export default AdminLayout;
