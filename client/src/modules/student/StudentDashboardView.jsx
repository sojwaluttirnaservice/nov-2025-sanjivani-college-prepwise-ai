import React, { useState } from 'react';
import { BookOpen, CheckCircle, Clock, AlertTriangle, ArrowRight, Loader2, TrendingUp, Calendar, Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { studentService } from '../../services/studentService';
import Container from '../../components/utils/Container';
import PerformanceChart from '../../components/charts/PerformanceChart';
import ActivityHeatmap from '../../components/charts/ActivityHeatmap';
import StatCard from '../../components/dashboard/StatCard';

const StudentDashboardView = () => {
    const [performanceRange, setPerformanceRange] = useState('30d');

    // Dashboard Summary Stats
    const { data: dashboardData, isLoading: isLoadingStats, error: statsError } = useQuery({
        queryKey: ['student-dashboard-stats'],
        queryFn: studentService.getDashboardStats
    });

    // Performance Trends
    const { data: trendData, isLoading: isLoadingTrends, error: trendsError } = useQuery({
        queryKey: ['student-performance-trends', performanceRange],
        queryFn: () => studentService.getPerformanceTrends(performanceRange)
    });

    // Topic Mastery
    const { data: topicData, isLoading: isLoadingTopics, error: topicsError } = useQuery({
        queryKey: ['student-topic-mastery'],
        queryFn: studentService.getTopicMastery
    });

    // Debug logging
    React.useEffect(() => {
        console.log('[Dashboard] Raw API Responses:', {
            dashboardData,
            trendData,
            topicData,
            errors: { statsError, trendsError, topicsError }
        });
    }, [dashboardData, trendData, topicData, statsError, trendsError, topicsError]);

    const isLoading = isLoadingStats || isLoadingTrends || isLoadingTopics;

    // Use empty defaults when data is undefined or on error
    const stats = dashboardData?.stats || {
        currentStreak: 0,
        averageScore: 0,
        totalHoursStudy: 0,
        totalAssessments: 0,
        activityHeatmap: {}
    };

    // Debug stats extraction
    React.useEffect(() => {
        if (statsError || trendsError || topicsError) {
            console.error('[Dashboard] API Errors:', { statsError, trendsError, topicsError });
        }
    }, [statsError, trendsError, topicsError]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }


    const statCards = [
        {
            title: 'Current Streak',
            value: stats?.currentStreak || 0,
            unit: 'Days',
            icon: Zap,
            color: 'amber',
            trend: stats?.currentStreak > 0 ? 100 : 0
        },
        {
            title: 'Avg Score',
            value: stats?.averageScore || 0,
            unit: '%',
            icon: TrendingUp,
            color: 'emerald',
            trend: null
        },
        {
            title: 'Total Study',
            value: stats?.totalHoursStudy || 0,
            unit: 'Hours',
            icon: Clock,
            color: 'indigo',
            trend: null
        },
        {
            title: 'assessments',
            value: stats?.totalAssessments || 0,
            unit: 'Tests',
            icon: CheckCircle,
            color: 'rose',
            trend: null
        },
    ];

    return (
        <div className="py-8 bg-slate-50/50 min-h-screen">
            <Container>
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                            Dashboard <span className="text-indigo-600">.</span>
                        </h1>
                        <p className="text-slate-500 font-medium">Your learning analytics and progress tracking.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => window.location.href = '/syllabus/subjects'}
                            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
                        >
                            <BookOpen className="w-4 h-4" />
                            Start Learning
                        </button>
                    </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {statCards.map((stat, idx) => (
                        <StatCard key={idx} {...stat} />
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Chart Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Performance Chart */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">Performance Trend</h3>
                                </div>
                                <div className="flex bg-slate-100 p-1 rounded-xl">
                                    {['7d', '30d', '90d'].map((range) => (
                                        <button
                                            key={range}
                                            onClick={() => setPerformanceRange(range)}
                                            className={`
                                                px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                                                ${performanceRange === range
                                                    ? 'bg-white text-indigo-600 shadow-sm'
                                                    : 'text-slate-500 hover:text-slate-700'}
                                            `}
                                        >
                                            {range.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <PerformanceChart data={trendData?.trends} />
                        </div>

                        {/* Recent Activity Heatmap */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">Study Consistency</h3>
                            </div>
                            <ActivityHeatmap data={stats?.activityHeatmap} />
                        </div>
                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-6">
                        {/* Weak Areas */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-full">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">Focus Areas</h3>
                            </div>

                            {topicData?.topics?.length > 0 ? (
                                <div className="space-y-4">
                                    {topicData.topics.map((topic, idx) => (
                                        <div key={idx} className="group cursor-pointer">
                                            <div className="flex justify-between items-end mb-1">
                                                <span className="text-sm font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">
                                                    {topic.topic}
                                                </span>
                                                <span className="text-xs font-black text-rose-500">
                                                    {topic.mastery}%
                                                </span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-rose-400 rounded-full"
                                                    style={{ width: `${topic.mastery}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                    <button className="w-full mt-6 py-3 border border-slate-200 text-slate-500 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors uppercase tracking-wider">
                                        View All Topics
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-slate-400 text-sm">No data available yet. Start a quiz!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default StudentDashboardView;
