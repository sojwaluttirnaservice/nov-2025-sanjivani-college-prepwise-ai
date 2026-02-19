import React, { useState } from 'react';
import { BookOpen, CheckCircle, Clock, AlertTriangle, ArrowRight, Loader2, TrendingUp, Calendar, Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { studentService } from '../../services/studentService';
import Container from '../../components/utils/Container';
import PerformanceChart from '../../components/charts/PerformanceChart';
import ActivityHeatmap from '../../components/charts/ActivityHeatmap';
import StatCard from '../../components/dashboard/StatCard';



import { adminService } from '../../services/adminService';

const StudentDashboardView = ({ studentId }) => {
    const [performanceRange, setPerformanceRange] = useState('30d');

    // Dashboard Summary Stats
    const { data: dashboardData, isLoading: isLoadingStats, error: statsError } = useQuery({
        queryKey: ['student-dashboard-stats', studentId],
        queryFn: () => studentId ? adminService.getStudentAnalytics(studentId) : studentService.getDashboardStats()
    });

    // Performance Trends
    // Note: getStudentAnalytics returns trends too, so we might stick to that for admin view
    // But for separation, if we use the same hook structure:
    const { data: trendData, isLoading: isLoadingTrends, error: trendsError } = useQuery({
        queryKey: ['student-performance-trends', performanceRange, studentId],
        queryFn: () => {
            // Admin analytics endpoint returns everything in one go, but let's see.
            // If studentId is present, we might want to extract from dashboardData if possible or make separate calls if endpoints differ.
            // The adminService.getStudentAnalytics returns { stats, trends, topics }.
            // So we should probably avoid refetching if we have it?
            // Actually, let's just make the dashboardData the primary source for admin view
            // and distinct hooks for student view.
            if (studentId) return null; // Handled by dashboardData for admin
            return studentService.getPerformanceTrends(performanceRange);
        },
        enabled: !studentId // Only fetch separately for student
    });

    // Topic Mastery
    const { data: topicData, isLoading: isLoadingTopics, error: topicsError } = useQuery({
        queryKey: ['student-topic-mastery', studentId],
        queryFn: () => studentId ? null : studentService.getTopicMastery(),
        enabled: !studentId
    });

    // AI Study Notes History
    const { data: notesData } = useQuery({
        queryKey: ['student-notes-history', studentId],
        queryFn: () => studentId ? { notes: [] } : studentService.getNotesHistory(), // Admin doesn't view notes yet or implement getStudentNotes
        enabled: !studentId
    });

    // Unified Data Access
    // If Admin (studentId), extract from dashboardData
    const stats = dashboardData?.stats || {
        currentStreak: 0,
        averageScore: 0,
        totalHoursStudy: 0,
        totalAssessments: 0,
        activityHeatmap: {}
    };

    const trends = studentId ? dashboardData?.trends : trendData?.trends;
    const topics = studentId ? dashboardData?.topics : topicData?.topics;


    const [selectedNote, setSelectedNote] = useState(null);
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);


    // Debug logging
    React.useEffect(() => {
        console.log('[Dashboard] Raw API Responses:', {
            dashboardData,
            trendData,
            topicData,
            notesData,
            errors: { statsError, trendsError, topicsError }
        });
    }, [dashboardData, trendData, topicData, notesData, statsError, trendsError, topicsError]);

    const isLoading = isLoadingStats || isLoadingTrends || isLoadingTopics;

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

    // Use unified data access below for stats



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
            title: 'Assessments',
            value: stats?.totalAssessments || 0,
            unit: 'Tests',
            icon: CheckCircle,
            color: 'rose',
            trend: null
        },
    ];

    const currentNotes = notesData?.notes || [];

    const NoteModal = ({ note, onClose }) => {
        if (!note) return null;
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white">
                        <div>
                            <h2 className="text-xl font-black italic tracking-tight">AI STUDY BOOSTER <span className="text-indigo-200">/</span> Ver {note.version}</h2>
                            <p className="text-xs text-indigo-100 font-bold opacity-80 uppercase tracking-widest mt-0.5">Focus: {note.topics?.join(', ')}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                            <ArrowRight className="w-5 h-5 rotate-180" />
                        </button>
                    </div>
                    <div className="p-8 overflow-y-auto space-y-8">
                        <div>
                            <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Zap className="w-3.5 h-3.5 fill-indigo-600" /> Executive Summary
                            </h3>
                            <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100/50 italic text-slate-700 leading-relaxed">
                                "{note.summary}"
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-black text-rose-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <TrendingUp className="w-3.5 h-3.5" /> High-Impact Key Points
                            </h3>
                            <div className="grid grid-cols-1 gap-3">
                                {note.keyPoints?.map((point, i) => (
                                    <div key={i} className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-all">
                                        <div className="shrink-0 w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:text-indigo-600">
                                            {i + 1}
                                        </div>
                                        <p className="text-sm text-slate-700 font-medium group-hover:text-slate-900 leading-snug">{point}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <BookOpen className="w-3.5 h-3.5" /> Topic Deep Dive
                            </h3>
                            <div className="text-sm text-slate-600 prose prose-slate max-w-none whitespace-pre-wrap leading-relaxed font-medium">
                                {note.detailedContent}
                            </div>
                        </div>
                    </div>
                    <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                        >
                            Got it, let's master this!
                        </button>
                    </div>
                </div>
            </div>
        );
    };

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
                        {!studentId && (
                            <button
                                onClick={() => window.location.href = '/syllabus/subjects'}
                                className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
                            >
                                <BookOpen className="w-4 h-4" />
                                Start Learning
                            </button>
                        )}
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
                                {!studentId && (
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
                                )}
                            </div>
                            <PerformanceChart data={trends} />
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
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">Focus Areas</h3>
                            </div>

                            {topics?.length > 0 ? (
                                <div className="space-y-4">
                                    {topics.slice(0, 5).map((topic, idx) => (
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
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-slate-400 text-sm">No data available yet. Start a quiz!</p>
                                </div>
                            )}
                        </div>

                        {/* AI Study Booster Widget - Hide for admin view for now as we don't have notes data */}
                        {!studentId && (
                            <div className="bg-linear-to-br from-indigo-600 to-violet-700 p-6 rounded-3xl shadow-xl shadow-indigo-200 relative overflow-hidden group">
                                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>

                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl text-white">
                                            <Zap className="w-5 h-5 fill-white" />
                                        </div>
                                        <h3 className="text-lg font-black text-white italic tracking-tight">BOOST VAULT</h3>
                                    </div>

                                    <p className="text-indigo-100 text-sm font-medium leading-relaxed mb-6">
                                        Master your weak areas with targeted AI boosts. Take tests to unlock more!
                                    </p>

                                    <div className="space-y-3">
                                        {currentNotes.length > 0 ? (
                                            currentNotes.map((note) => (
                                                <button
                                                    key={note._id}
                                                    onClick={() => {
                                                        setSelectedNote(note);
                                                        setIsNoteModalOpen(true);
                                                    }}
                                                    className="w-full bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl flex items-center justify-between group/item hover:bg-white/20 transition-all"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[10px] font-black text-white border border-white/10">
                                                            V{note.version}
                                                        </div>
                                                        <div className="text-left">
                                                            <div className="text-[10px] text-indigo-200 font-bold uppercase tracking-tight">Boost {note.version}</div>
                                                            <div className="text-xs font-bold text-white truncate max-w-[120px]">
                                                                {note.topics?.join(', ')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <ArrowRight className="w-4 h-4 text-white group-hover/item:translate-x-1 transition-transform" />
                                                </button>
                                            ))
                                        ) : (
                                            <div className="text-center py-6 bg-white/5 border border-dashed border-white/10 rounded-2xl">
                                                <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest">No Boosts Unlocked</p>
                                                <p className="text-[10px] text-indigo-300 mt-1">Complete assessments to generate boosts.</p>
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-[9px] text-center text-indigo-300 font-bold uppercase tracking-tighter mt-4 opacity-60">
                                        {currentNotes.length < 2
                                            ? `UNLOCKED: ${currentNotes.length}/2 BOOSTS`
                                            : "ALL BOOSTS UNLOCKED!"}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Container>

            {/* Note Display Modal */}
            {isNoteModalOpen && (
                <NoteModal
                    note={selectedNote}
                    onClose={() => setIsNoteModalOpen(false)}
                />
            )}
        </div>
    );
};

export default StudentDashboardView;
