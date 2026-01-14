import React from 'react';
import { BookOpen, CheckCircle, Clock, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../redux/slices/authSlice';
import { studentService } from '../../services/studentService';
import Container from '../../components/utils/Container';

const StudentDashboardView = () => {
    const user = useSelector(selectCurrentUser);

    const { data: stats, isLoading } = useQuery({
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

    const statCards = [
        { label: 'Completed Assessments', value: stats?.completedAssessments, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Average Score', value: `${stats?.averageScore}%`, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Study Hours', value: `${stats?.studyHours}h`, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Weak Topics', value: stats?.weakTopicsCount, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
    ];

    return (
        <div className="py-8">
            <Container>
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                        Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋
                    </h1>
                    <p className="text-gray-600">Here's your preparation overview for Semester 6.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statCards.map((stat, index) => (
                        <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow cursor-default">
                            <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Assessments */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gray-50/50">
                                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-indigo-600" />
                                    Recent Assessments
                                </h2>
                                <button className="text-indigo-600 text-sm font-semibold hover:text-indigo-700 transition-colors">View All</button>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {stats?.recentTests.map((test) => (
                                    <div key={test.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                        <div className="space-y-1">
                                            <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{test.subject}</p>
                                            <p className="text-sm text-gray-500">{test.unit}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold ${parseInt(test.score) >= 80 ? 'text-emerald-600' : parseInt(test.score) >= 60 ? 'text-amber-600' : 'text-red-600'}`}>{test.score}</p>
                                            <p className="text-xs text-gray-400 capitalize">{test.date}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Weak Topics */}
                    <div className="space-y-6">
                        <div className="bg-indigo-600 p-6 rounded-xl shadow-lg shadow-indigo-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                            <h2 className="font-bold text-white mb-2 relative z-10">Start Preparation</h2>
                            <p className="text-indigo-100 text-sm mb-4 relative z-10">Generate a new 10-question AI assessment.</p>
                            <button className="w-full bg-white text-indigo-600 py-2.5 rounded-lg font-bold hover:bg-slate-50 transition-colors shadow-sm relative z-10 flex items-center justify-center gap-2">
                                Launch Quiz
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                                Growth Areas
                            </h2>
                            <div className="space-y-3">
                                {stats?.weakTopics.map((topic, i) => (
                                    <div key={i} className="group p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-red-100 hover:bg-red-50 transition-all">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="text-sm font-semibold text-gray-900 group-hover:text-red-700 transition-colors">{topic.name}</p>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${topic.level === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {topic.level} Priority
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500">{topic.subject}</p>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-4 text-center text-xs font-semibold text-gray-400 hover:text-indigo-600 transition-colors uppercase tracking-wider">
                                View Full Analysis
                            </button>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default StudentDashboardView;
