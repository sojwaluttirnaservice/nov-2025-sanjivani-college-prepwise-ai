import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import { LayoutDashboard, Users, ClipboardCheck, History } from 'lucide-react';

const AdminLayout = () => {
    const adminLinks = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
        { path: '/admin/students', label: 'Students', icon: Users },
        { path: '/admin/assessments', label: 'Assessments', icon: ClipboardCheck },
        { path: '/admin/activity', label: 'Activity Logs', icon: History },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar roleName="Admin" links={adminLinks} />
            <div className="md:pl-64 flex flex-col min-h-screen">
                <DashboardNavbar />
                <main className="flex-1 p-4 md:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
