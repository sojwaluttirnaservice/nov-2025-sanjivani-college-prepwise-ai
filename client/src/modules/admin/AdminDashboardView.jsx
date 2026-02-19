import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { Users, ClipboardCheck, TrendingUp, AlertCircle, Loader2, Calendar, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import StatCard from '../../components/dashboard/StatCard';
import AdminActivityChart from '../../components/charts/AdminActivityChart';
import ActivityHeatmap from '../../components/charts/ActivityHeatmap';
import Container from '../../components/utils/Container';

const AdminDashboardView = () => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['adminDashboardStats'],
        queryFn: adminService.getDashboardStats,
        refetchInterval: 60000, // Refresh every minute
    });

    const stats = data?.stats || [];
    const recentActivity = data?.recentActivity || [];
    const popularSubjects = data?.popularSubjects || [];
    const activityTrend = data?.activityTrend || [];

    // Map string icon names to Lucide components for StatCard
    const iconMap = {
        Users: Users,
        ClipboardCheck: ClipboardCheck,
        TrendingUp: TrendingUp,
        AlertCircle: AlertCircle
    };

    const dashboardStats = stats.map(stat => ({
        ...stat,
        icon: iconMap[stat.icon] || Users,
        // Map backend color classes to StatCard color props
        color: stat.color.includes('indigo') ? 'indigo' :
            stat.color.includes('emerald') ? 'emerald' :
                stat.color.includes('blue') ? 'indigo' :
                    stat.color.includes('amber') ? 'amber' : 'indigo'
    }));

    // Skeleton Component
    const DashboardSkeleton = () => (
        <div className="space-y-8 animate-pulse">
            <div>
                <div className="h-8 w-48 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-64 bg-gray-200 rounded"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="h-80 bg-gray-200 rounded-3xl"></div>
                <div className="h-80 bg-gray-200 rounded-3xl"></div>
            </div>
        </div>
    );

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-white rounded-xl border border-dashed border-slate-300">
                <div className="bg-red-50 p-3 rounded-full mb-4">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-1">Failed to load dashboard data</h3>
                <p className="text-slate-500 mb-6 max-w-sm">
                    We encountered an error while fetching the latest statistics. Please ensure the server is running and try again.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
                    >
                        Reload Page
                    </button>
                </div>
            </div>
        );
    }

    // Transform activityTrend for heatmap (map array to object keys)
    const heatmapData = {};
    activityTrend.forEach(item => {
        heatmapData[item.date] = item.count;
    });

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                    Admin Overview <span className="text-indigo-600">.</span>
                </h1>
                <p className="text-slate-500 font-medium">Monitor system activity and student performance.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {dashboardStats.map((stat, idx) => (
                    <StatCard key={idx} {...stat} unit="" />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Activity Trend Chart */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                <Activity className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Activity Trend (Last 30 Days)</h3>
                        </div>
                        <AdminActivityChart data={activityTrend} />
                    </div>

                    {/* Recent Student Activity */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="font-bold text-slate-900">Recent Student Activity</h2>
                            <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">Real-time</span>
                        </div>
                        <div className="p-0">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4 font-bold border-b border-slate-100">Student</th>
                                        <th className="px-6 py-4 font-bold border-b border-slate-100">Action</th>
                                        <th className="px-6 py-4 font-bold border-b border-slate-100">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 text-sm">
                                    {recentActivity.length > 0 ? (
                                        recentActivity.map((row, i) => (
                                            <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                                                <td className="px-6 py-4 font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
                                                    {row.name}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">{row.action}</td>
                                                <td className="px-6 py-4 text-slate-400 text-xs font-medium">
                                                    {formatDistanceToNow(new Date(row.time), { addSuffix: true })}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-12 text-center text-slate-400 font-medium">
                                                No recent activity found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    {/* Activity Heatmap */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Consistency</h3>
                        </div>
                        {/* We reuse the Student component but pass our aggregated data */}
                        <ActivityHeatmap data={heatmapData} />
                    </div>

                    {/* Popular Subjects */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100">
                            <h2 className="font-bold text-slate-900">Most Searched Subjects</h2>
                        </div>
                        <div className="p-6 space-y-5">
                            {popularSubjects.length > 0 ? (
                                popularSubjects.map((sub, i) => (
                                    <div key={i} className="group">
                                        <div className="flex justify-between text-sm mb-1.5">
                                            <span className="font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">{sub.name}</span>
                                            <span className="text-xs font-bold text-slate-400">{sub.count} attempts</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ease-out ${sub.color}`}
                                                style={{ width: `${Math.min((sub.count / (popularSubjects[0]?.count || 1)) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-slate-400 py-8 text-sm font-medium">
                                    No subject data available.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardView;
