import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { ArrowLeft, Mail, BookOpen, Calendar, User, Eye, X, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';
import PerformanceChart from '../../components/charts/PerformanceChart';
import ActivityHeatmap from '../../components/charts/ActivityHeatmap';
import StudentDashboardView from '../student/StudentDashboardView';

const StudentDetailView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isViewAsStudentOpen, setIsViewAsStudentOpen] = useState(false);

    // Fetch Student Details
    const { data: student, isLoading: isStudentLoading } = useQuery({
        queryKey: ['student', id],
        queryFn: () => adminService.getStudentById(id),
    });

    // Fetch Student Analytics
    const { data: analytics, isLoading: isAnalyticsLoading } = useQuery({
        queryKey: ['student-analytics', id],
        queryFn: () => adminService.getStudentAnalytics(id),
    });

    const isLoading = isStudentLoading || isAnalyticsLoading;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="bg-red-50 p-4 rounded-full mb-4">
                    <User className="text-red-500" size={32} />
                </div>
                <h2 className="text-xl font-semibold text-slate-800">Student Not Found</h2>
                <button
                    onClick={() => navigate('/admin/students')}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    Back to Students
                </button>
            </div>
        );
    }

    const stats = analytics?.stats || {};
    const trends = analytics?.trends || [];

    const statCards = [
        {
            title: 'Avg Score',
            value: stats.averageScore || 0,
            unit: '%',
            icon: TrendingUp,
            color: 'emerald',
        },
        {
            title: 'Total Study',
            value: stats.totalHoursStudy || 0,
            unit: 'Hours',
            icon: Clock,
            color: 'indigo',
        },
        {
            title: 'Tests Taken',
            value: stats.totalAssessments || 0,
            unit: '',
            icon: CheckCircle,
            color: 'rose',
        },
    ];

    return (
        <div className="max-w-7xl mx-auto animate-fadeIn">
            {/* Navigation & Actions */}
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => navigate('/admin/students')}
                    className="flex items-center text-slate-500 hover:text-indigo-600 transition-colors group"
                >
                    <ArrowLeft size={18} className="mr-1 group-hover:-translate-x-1 transition-transform" />
                    Back to List
                </button>
                <button
                    onClick={() => setIsViewAsStudentOpen(true)}
                    className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm font-medium"
                >
                    <Eye size={18} />
                    View as Student
                </button>
            </div>

            {/* Profile Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                <div className="h-32 bg-linear-to-r from-indigo-600 to-purple-600 relative">
                    <div className="absolute -bottom-12 left-8">
                        <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg">
                            <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center text-3xl font-bold text-slate-400">
                                {student.name.charAt(0)}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="pt-16 pb-8 px-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">{student.name}</h1>
                            <div className="flex items-center mt-2 text-slate-500 gap-4">
                                <span className="flex items-center gap-1.5">
                                    <Mail size={16} />
                                    {student.email}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <BookOpen size={16} />
                                    {student.branchId?.name || 'Unknown Branch'} • Sem {student.semester}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Calendar size={16} />
                                    Joined {new Date(student.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-100">
                                Active Student
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {statCards.map((stat, idx) => (
                    <StatCard key={idx} {...stat} />
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Performance Chart */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-indigo-600" />
                            Performance History
                        </h3>
                        {trends.length > 0 ? (
                            <PerformanceChart data={trends} />
                        ) : (
                            <div className="text-center py-10 text-slate-400">No performance data available.</div>
                        )}
                    </div>

                    {/* Activity Heatmap */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-emerald-600" />
                            Activity Heatmap
                        </h3>
                        <ActivityHeatmap data={stats.activityHeatmap} />
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Topic Mastery / Weak Areas */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-6">Weakest Topics</h3>
                        {analytics?.topics?.length > 0 ? (
                            <div className="space-y-4">
                                {analytics.topics.slice(0, 5).map((topic, idx) => (
                                    <div key={idx} className="group">
                                        <div className="flex justify-between items-end mb-1">
                                            <span className="text-sm font-medium text-slate-700">{topic.topic}</span>
                                            <span className="text-xs font-bold text-rose-500">{topic.mastery}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-rose-400 rounded-full"
                                                style={{ width: `${topic.mastery}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-slate-400">No topic data available.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* View as Student Modal - Rendered via Portal */}
            {isViewAsStudentOpen && createPortal(
                <div className="fixed inset-0 z-[100] flex flex-col bg-slate-50 animate-in fade-in duration-200">
                    <div className="bg-slate-900 text-white px-6 py-3 flex justify-between items-center shadow-md shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="bg-indigo-500/20 p-2 rounded-lg">
                                <Eye size={20} className="text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Viewing as {student.name}</h3>
                                <p className="text-xs text-slate-400">Read-only preview mode</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsViewAsStudentOpen(false)}
                            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <X size={16} />
                            Exit Preview
                        </button>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <StudentDashboardView studentId={id} />
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default StudentDetailView;
