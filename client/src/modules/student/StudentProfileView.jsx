import React from 'react';
import { useSelector } from 'react-redux';
import { User, Mail, Hash, BookOpen, Calendar, GraduationCap, Settings, Award } from 'lucide-react';
import { selectCurrentUser } from '../../redux/slices/authSlice';
import Container from '../../components/utils/Container';

const StudentProfileView = () => {
    const user = useSelector(selectCurrentUser);

    const academicInfo = [
        { label: 'Enrollment ID', value: user?.enrollmentId || 'ENR2024001', icon: Hash },
        { label: 'Department', value: user?.department || 'Information Technology', icon: GraduationCap },
        { label: 'Semester', value: user?.semester || 'Semester 6', icon: BookOpen },
        { label: 'Academic Year', value: user?.academicYear || '2025-2026', icon: Calendar },
    ];

    const performanceMetrics = [
        { label: 'Assessments Taken', value: '12', color: 'text-indigo-600' },
        { label: 'Average Accuracy', value: '78%', color: 'text-emerald-600' },
        { label: 'Top Subject', value: 'DBMS', color: 'text-amber-600' },
    ];

    return (
        <div className="py-10 bg-slate-50/50 min-h-screen">
            <Container>
                {/* Profile Header */}
                <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 mb-10 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-700"></div>

                    <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-32 h-32 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-100 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                <User className="w-16 h-16 text-white" strokeWidth={2.5} />
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 border-4 border-white rounded-2xl flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            </div>
                        </div>

                        <div className="text-center md:text-left space-y-2">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <h1 className="text-4xl font-black text-gray-900 tracking-tight">{user?.name || 'Academic Scholar'}</h1>
                                <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-100">
                                    Student
                                </span>
                            </div>
                            <div className="flex items-center justify-center md:justify-start gap-2 text-slate-500 font-medium">
                                <Mail className="w-4 h-4" />
                                <span>{user?.email || 'scholar@sanjivani.edu.in'}</span>
                            </div>
                            <button className="mt-4 flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                                <Settings className="w-4 h-4" />
                                Edit Account
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Academic Information */}
                    <div className="lg:col-span-7 space-y-8">
                        <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100 h-full">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-4">
                                    <GraduationCap className="w-8 h-8 text-indigo-600" />
                                    Academic Standing
                                </h2>
                                <Award className="w-6 h-6 text-amber-500" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {academicInfo.map((info, idx) => (
                                    <div key={idx} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:bg-white transition-all duration-300">
                                        <div className="flex items-center gap-4 mb-2">
                                            <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-sm">
                                                <info.icon className="w-5 h-5 text-indigo-600" />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{info.label}</span>
                                        </div>
                                        <p className="text-lg font-bold text-gray-900 px-1">{info.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats & Performance */}
                    <div className="lg:col-span-5 space-y-10">
                        <div className="bg-slate-900 rounded-[2rem] p-10 shadow-xl shadow-indigo-100/20 text-white h-full relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full -mr-24 -mt-24 blur-3xl"></div>
                            <h2 className="text-xl font-black mb-8 relative z-10 uppercase tracking-widest text-indigo-300">Performance Snapshot</h2>

                            <div className="space-y-8 relative z-10">
                                {performanceMetrics.map((perf, idx) => (
                                    <div key={idx} className="flex items-center justify-between border-b border-white/10 pb-6 last:border-0 last:pb-0">
                                        <p className="font-bold text-slate-400">{perf.label}</p>
                                        <p className={`text-2xl font-black tracking-tight ${perf.color}`}>{perf.value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-12 p-6 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md">
                                <p className="text-sm font-medium text-slate-400 leading-relaxed text-center italic">
                                    "Your accuracy in Computer Networking has improved by 12% this week."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default StudentProfileView;
