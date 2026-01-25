import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Book, ChevronRight, Loader2 } from 'lucide-react';
import { resourceService } from '../../services/resourceService';
import Container from '../../components/utils/Container';

const SubjectSelectionView = () => {
    const navigate = useNavigate();
    const { data, isLoading } = useQuery({
        queryKey: ['subjects'],
        queryFn: () => resourceService.getSubjects()
    });

    const subjects = data?.subjects || [];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="py-10 bg-slate-50/50 min-h-screen">
            <Container>
                {/* Header Section */}
                <div className="relative mb-12 bg-indigo-900 rounded-3xl p-10 overflow-hidden shadow-2xl shadow-indigo-200">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                    <div className="relative z-10 max-w-2xl">
                        <span className="text-indigo-300 font-bold uppercase tracking-widest text-xs mb-4 block">Semester 6 Curriculum</span>
                        <h1 className="text-4xl font-black text-white mb-4 leading-tight">Master Your Syllabus</h1>
                        <p className="text-indigo-100/80 text-lg">
                            AI-curated topics and adaptive assessments tailored to your academic department's MSBTE standards.
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Available Subjects</h2>
                        <p className="text-gray-500">Pick a course to start your unit-wise training.</p>
                    </div>
                    <div className="hidden sm:flex gap-2">
                        <span className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold border border-indigo-100">All Courses</span>
                        <span className="px-4 py-2 bg-white text-gray-500 rounded-lg text-sm font-bold border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">Technical</span>
                        <span className="px-4 py-2 bg-white text-gray-500 rounded-lg text-sm font-bold border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">Management</span>
                    </div>
                </div>

                {/* Catalog Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {subjects.map((sub) => (
                        <div
                            key={sub._id}
                            onClick={() => navigate(`/syllabus/subjects/${sub._id}`)}
                            className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-500 cursor-pointer flex flex-col sm:flex-row overflow-hidden"
                        >
                            {/* Visual Side */}
                            <div className="sm:w-48 bg-slate-50 flex flex-col items-center justify-center p-8 transition-colors group-hover:bg-indigo-50/50 border-r border-slate-50">
                                <div className="bg-white p-5 rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-500">
                                    <Book className="w-8 h-8 text-indigo-600" />
                                </div>
                                <span className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{sub.code}</span>
                            </div>

                            {/* Text Side */}
                            <div className="flex-1 p-8 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{sub.name}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                                        Comprehensive coverage across {sub.units} learning units with practice MCQs.
                                    </p>
                                </div>
                                <div className="mt-6 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white"></div>
                                            ))}
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400">1.2k Started</span>
                                    </div>
                                    <div className="flex items-center text-indigo-600 text-sm font-black uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        Enroll
                                        <ChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
        </div>
    );
};

export default SubjectSelectionView;
