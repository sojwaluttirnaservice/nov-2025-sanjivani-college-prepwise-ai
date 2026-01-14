import React from 'react';
import { BookOpen, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import Container from '../../components/utils/Container';

const StudentDashboardView = () => {
    const stats = [
        { label: 'Completed Assessments', value: '12', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Average Score', value: '85%', icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Study Hours', value: '24h', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Weak Topics', value: '5', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
    ];

    const recentTests = [
        { id: 1, subject: 'Operating Systems', unit: 'Unit 3: Process Sync', score: '90%', date: '2 hours ago' },
        { id: 2, subject: 'Database Systems', unit: 'Unit 2: SQL', score: '70%', date: 'Yesterday' },
        { id: 3, subject: 'Software Engineering', unit: 'Unit 1: Agile', score: '95%', date: '2 days ago' },
    ];

    return (
        <div className="py-8">
            <Container>
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Welcome back, Student!</h1>
                    <p className="text-gray-600">Here's your preparation overview for Semester 6.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 flex items-center gap-4">
                            <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
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
                        <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h2 className="font-bold text-gray-900">Recent Assessments</h2>
                                <button className="text-indigo-600 text-sm font-semibold hover:text-indigo-700">View All</button>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {recentTests.map((test) => (
                                    <div key={test.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div>
                                            <p className="font-semibold text-gray-900">{test.subject}</p>
                                            <p className="text-sm text-gray-500">{test.unit}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold ${parseInt(test.score) >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>{test.score}</p>
                                            <p className="text-xs text-gray-400">{test.date}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions / Weak Topics */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
                            <h2 className="font-bold text-gray-900 mb-4">Quick Action</h2>
                            <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-100">
                                Start New Assessment
                            </button>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
                            <h2 className="font-bold text-gray-900 mb-4">Weak Topics</h2>
                            <div className="space-y-3">
                                {['Deadlock Avoidance', 'B+ Tree Indexing', 'Normal Forms'].map((topic, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600 bg-red-50 p-2 rounded border border-red-100">
                                        <AlertTriangle className="w-4 h-4 text-red-500" />
                                        <span>{topic}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default StudentDashboardView;
