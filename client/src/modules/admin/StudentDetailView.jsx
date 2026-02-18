import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { ArrowLeft, Mail, BookOpen, Calendar, Award, User, Clock } from 'lucide-react';

const StudentDetailView = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: student, isLoading, isError } = useQuery({
        queryKey: ['student', id],
        queryFn: () => adminService.getStudentById(id),
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (isError || !student) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="bg-red-50 p-4 rounded-full mb-4">
                    <User className="text-red-500" size={32} />
                </div>
                <h2 className="text-xl font-semibold text-slate-800">Student Not Found</h2>
                <p className="text-slate-500 mt-2 mb-6">The student you are looking for does not exist or has been removed.</p>
                <button
                    onClick={() => navigate('/admin/students')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    Back to Students
                </button>
            </div>
        );
    }

    // Determine academic progress
    const totalSemesters = 8;
    const progress = (student.semester / totalSemesters) * 100;

    return (
        <div className="p-6 max-w-5xl mx-auto animate-fadeIn">
            <button
                onClick={() => navigate('/admin/students')}
                className="flex items-center text-slate-500 hover:text-indigo-600 mb-6 transition-colors group"
            >
                <ArrowLeft size={18} className="mr-1 group-hover:-translate-x-1 transition-transform" />
                Back to List
            </button>

            {/* Header Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                <div className="h-32 bg-linear-to-r from-indigo-600 to-purple-600 relative">
                    <div className="absolute -bottom-12 left-8">
                        <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg">
                            <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center text-2xl font-bold text-slate-400">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Academic Info */}
                <div className="col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <BookOpen size={20} className="text-indigo-600" />
                            Academic Profile
                        </h3>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Branch</p>
                                <p className="text-lg font-semibold text-slate-800 mt-1">{student.branchId?.name || 'Unknown Branch'}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Current Metrics</p>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <span className="text-lg font-semibold text-slate-800">Year {student.year}</span>
                                    <span className="text-slate-400">/</span>
                                    <span className="text-lg font-semibold text-slate-800">Sem {student.semester}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-600 font-medium">Degree Progress</span>
                                <span className="text-indigo-600 font-bold">{Math.round(progress)}%</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-600 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity Placeholder */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Clock size={20} className="text-indigo-600" />
                            Recent Activity
                        </h3>
                        <div className="text-center py-8 text-slate-500">
                            <p>No recent activity recorded for this student.</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Award size={20} className="text-indigo-600" />
                            Performance
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                                <span className="text-slate-600">Assessments Taken</span>
                                <span className="font-semibold text-slate-900">0</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                                <span className="text-slate-600">Avg. Score</span>
                                <span className="font-semibold text-slate-900">-</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                                <span className="text-slate-600">Study Notes</span>
                                <span className="font-semibold text-slate-900">0</span>
                            </div>
                        </div>
                        <button className="w-full mt-6 py-2 border border-indigo-200 text-indigo-700 font-medium rounded-lg hover:bg-indigo-50 transition-colors">
                            View Full Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDetailView;
