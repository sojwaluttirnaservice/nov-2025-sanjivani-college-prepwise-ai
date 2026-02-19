import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { LayoutDashboard, Users, Activity, ClipboardList, LogOut, Library } from 'lucide-react';
import Sidebar from '../components/dashboard/Sidebar';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import { logout } from '../redux/slices/authSlice';
import message from '../utils/message';

const AdminLayout = () => {
    // const user = useSelector(selectCurrentUser); // Unused
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const adminLinks = [
        { path: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
        { path: '/admin/students', label: 'Students', icon: Users },
        { path: '/admin/academics', label: 'Academics', icon: Library },
        { path: '/admin/assessments', label: 'Assessments', icon: ClipboardList },
        { path: '/admin/activity', label: 'System Activity', icon: Activity },
    ];

    const handleLogout = () => {
        dispatch(logout());
        message.success('Logged out successfully');
        navigate('/auth/login');
    };

    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="flex bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-indigo-100/40 via-slate-50 to-slate-100 min-h-screen">
            <Sidebar
                roleName="ADMIN"
                links={adminLinks}
                onLogout={handleLogout}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
            <div className="flex-1 md:ml-64 flex flex-col min-w-0">
                <DashboardNavbar onToggleSidebar={toggleSidebar} />
                <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
