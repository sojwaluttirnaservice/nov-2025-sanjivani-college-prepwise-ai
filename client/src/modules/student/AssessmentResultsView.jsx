import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Trophy, Target, AlertTriangle, ArrowRight, LayoutGrid } from 'lucide-react';
import Container from '../../components/utils/Container';

const AssessmentResultsView = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { results, unitTitle } = location.state || {};

    if (!results) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <Target className="w-8 h-8 text-indigo-600 absolute inset-0 m-auto animate-pulse" />
                </div>
                <div className="text-center">
                    <h2 className="text-2xl font-black text-gray-900">Evaluating your responses...</h2>
                    <p className="text-slate-500">AI is mapping your performance to the syllabus topics.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="py-12 bg-slate-50 min-h-screen">
            <Container>
                <div className="max-w-5xl mx-auto">
                    {/* Performance Certificate Header */}
                    <div className="bg-slate-900 rounded-[3rem] p-12 mb-10 shadow-2xl relative overflow-hidden text-white">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10 text-center md:text-left">
                            <div className="space-y-4">
                                <span className="px-4 py-1.5 bg-white/10 text-indigo-300 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-white/5">Assessment Completed</span>
                                <h1 className="text-5xl font-black tracking-tighter leading-none">{unitTitle || 'Unit Final'}</h1>
                                <p className="text-slate-400 text-lg max-w-md">Detailed performance mapping for Semester 6 MSBTE Standards.</p>
                            </div>

                            <div className="flex gap-8 bg-white/5 p-8 rounded-[2rem] border border-white/10 backdrop-blur-md">
                                <div className="text-center">
                                    <p className="text-5xl font-black tracking-tighter text-indigo-400">{results.score}<span className="text-2xl text-white/20">/10</span></p>
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-2">Final Score</p>
                                </div>
                                <div className="w-px h-16 bg-white/10 self-center"></div>
                                <div className="text-center">
                                    <p className="text-5xl font-black tracking-tighter text-emerald-400">{results.accuracy}<span className="text-2xl text-white/20">%</span></p>
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-2">Accuracy</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Detailed Analysis */}
                        <div className="lg:col-span-8 space-y-8">
                            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                                <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-gray-50/30">
                                    <h2 className="text-2xl font-black text-gray-900 flex items-center gap-4">
                                        <AlertTriangle className="w-8 h-8 text-red-500" />
                                        Knowledge Gaps
                                    </h2>
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Unit I Analysis</span>
                                </div>

                                <div className="p-10 space-y-12">
                                    {results.weakTopics.map((topic, idx) => (
                                        <div key={idx} className="relative pl-8 border-l-4 border-slate-100 group hover:border-red-400 transition-colors">
                                            <div className="absolute -left-3 top-0 w-6 h-6 bg-white border-4 border-slate-100 rounded-full group-hover:border-red-400 transition-colors"></div>
                                            <div className="mb-6">
                                                <span className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-2 block">Topic {topic.topicCode}</span>
                                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">{topic.topicTitle}</h3>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {topic.subtopics.map((sub, sIdx) => (
                                                    <div key={sIdx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                                                        <span className="text-sm font-bold text-slate-700">{sub}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar: Recommendations */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-indigo-600 p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-100 text-white flex flex-col justify-between min-h-[400px]">
                                <div>
                                    <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-md">
                                        <Target className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-2xl font-black mb-4 leading-tight">Revise & Conquer</h3>
                                    <p className="text-indigo-100 font-medium leading-relaxed mb-8">
                                        Based on your performance, you should focus on revising <span className="text-white font-black underline decoration-indigo-400 decoration-4 underline-offset-4">{unitTitle || 'this unit'}</span>.
                                        Your accuracy in technical sub-topics shows room for growth.
                                    </p>
                                </div>

                                <button
                                    onClick={() => navigate('/syllabus/subjects')}
                                    className="w-full bg-white text-indigo-700 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-50 transition-all shadow-xl"
                                >
                                    Retry Syllabus
                                </button>
                            </div>

                            <button
                                onClick={() => navigate('/student/stats')}
                                className="w-full py-6 rounded-2xl border-2 border-slate-100 font-black text-xs uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all bg-white"
                            >
                                Dashboard Command Center
                            </button>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default AssessmentResultsView;
