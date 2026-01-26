import React from 'react';
import { extractErrorMessage } from '../../utils/errorHandler';
import { BookOpen, CheckCircle, Clock, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { studentService } from '../../services/studentService';
import Container from '../../components/utils/Container';

const StudentDashboardView = () => {
    // const user = useSelector(selectCurrentUser);

    const { data: stats, isLoading, isError, error } = useQuery({
        queryKey: ['student-stats'],
        queryFn: studentService.getStats
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <AlertTriangle className="w-12 h-12 text-red-500" />
                <p className="text-xl font-bold text-gray-900">Failed to load dashboard data</p>
                <p className="text-slate-500">{extractErrorMessage(error)}</p>
            </div>
        );
    }

    const statCards = [
        { label: 'Completed Assessments', value: stats?.completedAssessments, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Average Score', value: `${stats?.averageScore}%`, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Study Hours', value: `${stats?.studyHours}h`, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Weak Topics', value: stats?.weakTopicsCount, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
    ];

    return (
        <div className="py-8 bg-slate-50/30 min-h-screen">
            <Container>
                {/* Dashboard Welcome Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
                            Dashboard Pulse <span className="text-indigo-600">.</span>
                        </h1>
                        <p className="text-gray-500 font-medium">Monitoring preparation for Semester 6 finals.</p>
                    </div>
                    <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-6">
                        <div className="text-center">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Health Index</p>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-lg font-bold text-gray-900">Optimal</span>
                            </div>
                        </div>
                        <div className="w-px h-8 bg-slate-100"></div>
                        <div className="text-center">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Next Goal</p>
                            <p className="text-lg font-bold text-indigo-600">Unit 3 DBMS</p>
                        </div>
                    </div>
                </div>

                {/* Performance Analytics Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
                    {statCards.map((stat, index) => (
                        <div key={index} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                            <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110`}></div>
                            <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl w-fit mb-4 relative z-10`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className="relative z-10">
                                <p className="text-sm text-gray-500 font-bold uppercase tracking-tight mb-1">{stat.label}</p>
                                <p className="text-3xl font-black text-gray-900 tracking-tighter">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Dashboard Interaction Area */}
                {!stats?.recentTests || stats.recentTests.length === 0 ? (
                    <div className="bg-indigo-600 rounded-[2.5rem] p-16 text-center shadow-2xl shadow-indigo-200 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        <div className="relative z-10">
                            <div className="bg-white/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 backdrop-blur-md border border-white/30">
                                <BookOpen className="w-12 h-12 text-white" />
                            </div>
                            <h2 className="text-4xl font-black text-white mb-4">Initialize Preparation</h2>
                            <p className="text-indigo-100 text-lg mb-12 max-w-xl mx-auto leading-relaxed">
                                You haven't generated any AI assessments yet. Start your journey by exploring the curriculum and taking your first diagnostic test.
                            </p>
                            <button
                                onClick={() => window.location.href = '/syllabus/subjects'}
                                className="bg-white text-indigo-700 px-10 py-4 rounded-2xl font-black hover:bg-slate-50 transition-all shadow-xl flex items-center gap-3 mx-auto uppercase tracking-widest text-sm"
                            >
                                Browse Subjects
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Timeline / Recent Activity */}
                        <div className="lg:col-span-8">
                            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-gray-50/30">
                                    <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                                        <Clock className="w-6 h-6 text-indigo-600" />
                                        Activity Log
                                    </h2>
                                    <button className="bg-white px-4 py-2 rounded-xl text-xs font-bold text-gray-500 border border-slate-100 hover:text-indigo-600 transition-colors">History</button>
                                </div>
                                <div className="divide-y divide-slate-50">
                                    {stats?.recentTests.map((test) => (
                                        <div key={test.id} className="p-8 flex items-center justify-between hover:bg-slate-50 transition-all duration-300 group">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-white transition-colors border border-transparent group-hover:border-slate-100">
                                                    <span className="font-black text-indigo-200 text-xl group-hover:text-indigo-600">{test.subject.charAt(0)}</span>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors tracking-tight">{test.subject}</p>
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{test.unit}</p>
                                                </div>
                                            </div>
                                            <div className="text-right flex items-center gap-8">
                                                <div className="hidden sm:block">
                                                    <p className="text-xs font-black text-slate-300 uppercase tracking-tighter mb-1">Score</p>
                                                    <p className={`text-xl font-black ${parseInt(test.score) >= 80 ? 'text-emerald-500' : 'text-amber-500'}`}>{test.score}</p>
                                                </div>
                                                <ArrowRight className="w-5 h-5 text-slate-200 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Risk Factors / Growth Areas */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                                        <AlertTriangle className="w-6 h-6 text-red-500" />
                                        Gaps
                                    </h2>
                                    <span className="bg-red-50 text-red-600 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">Priority</span>
                                </div>
                                <div className="space-y-4">
                                    {stats?.weakTopics.map((topic, i) => (
                                        <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-red-100 hover:bg-white transition-all duration-300 cursor-pointer">
                                            <div className="flex justify-between items-center mb-2">
                                                <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{topic.name}</p>
                                                <div className={`w-2 h-2 rounded-full ${topic.level === 'High' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="w-3 h-3 text-slate-400" />
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{topic.subject}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button className="w-full mt-8 py-4 px-6 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-colors shadow-xl shadow-slate-100">
                                    Analyze Gaps
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Container>
        </div>
    );
};

export default StudentDashboardView;
