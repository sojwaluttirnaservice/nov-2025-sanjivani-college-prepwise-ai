import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { assessmentService } from '../../services/assessmentService';
import Container from '../../components/utils/Container';
import { Loader2, Calendar, Trophy, ArrowRight, LayoutList } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';

const AssessmentHistoryView = () => {
    const navigate = useNavigate();

    const { data: responseData, isLoading } = useQuery({
        queryKey: ['assessmentHistory'],
        queryFn: assessmentService.getHistory
    });

    const history = responseData?.history || [];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (!history || history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                    <LayoutList className="w-8 h-8 text-slate-400" />
                </div>
                <h2 className="text-xl font-black text-gray-900">No Assessment History</h2>
                <p className="text-slate-500 max-w-sm">
                    You haven't completed any assessments yet. Start a unit to see your performance over time.
                </p>
                <button
                    onClick={() => navigate('/syllabus/subjects')}
                    className="mt-4 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm tracking-wide"
                >
                    Start Learning
                </button>
            </div>
        );
    }

    return (
        <div className="py-8 bg-slate-50 min-h-screen">
            <Container>
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Performance History</h1>
                            <p className="text-slate-500 font-medium mt-1">Track your progress across all units.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {history.map((attempt) => (
                            <div
                                key={attempt._id}
                                className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-100 hover:border-indigo-100 transition-all cursor-pointer"
                                onClick={() => navigate(`/assessment/results/${attempt._id}`)}
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-md border ${attempt.quizType === 'DIAGNOSTIC' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                                                }`}>
                                                {attempt.quizType}
                                            </span>
                                            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(attempt.completedAt)}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                            Unit {attempt.unitNumber}: {attempt.unitName}
                                        </h3>
                                    </div>

                                    <div className="flex items-center gap-8 border-t md:border-t-0 md:border-l border-slate-50 pt-4 md:pt-0 md:pl-6">
                                        <div className="text-center min-w-[60px]">
                                            <div className="text-2xl font-black text-gray-900">{attempt.score}<span className="text-sm text-slate-300">/{attempt.totalQuestions}</span></div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score</div>
                                        </div>
                                        <div className="text-center min-w-[60px]">
                                            <div className="text-2xl font-black text-emerald-500">{Math.round(attempt.percentage)}%</div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Accuracy</div>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default AssessmentHistoryView;
