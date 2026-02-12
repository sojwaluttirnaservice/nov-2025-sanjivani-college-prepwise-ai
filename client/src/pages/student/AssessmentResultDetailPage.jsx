import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { assessmentService } from '../../services/assessmentService';
import AssessmentResultsView from '../../modules/student/AssessmentResultsView';
import { Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';

const AssessmentResultDetailPage = () => {
    const { attemptId } = useParams();
    const navigate = useNavigate();

    const { data: responseData, isLoading, isError } = useQuery({
        queryKey: ['assessmentResult', attemptId],
        queryFn: () => assessmentService.getResult(attemptId),
        enabled: !!attemptId
    });

    const result = responseData?.result;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <p className="text-slate-500 font-medium">Analyzing performance...</p>
            </div>
        );
    }

    if (isError || !result) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6">
                <AlertTriangle className="w-12 h-12 text-red-500" />
                <h2 className="text-2xl font-black text-gray-900">Result Not Found</h2>
                <button
                    onClick={() => navigate('/assessment/results')}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-100 rounded-xl font-bold text-slate-600 hover:bg-slate-200"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to History
                </button>
            </div>
        );
    }

    const viewProps = {
        results: {
            score: result.score,
            accuracy: result.percentage,
            weakTopics: result.weakTopics || [],
            answers: result.answers || [] // Pass answers for detailed review
        },
        unitTitle: `Unit ${result.quizId?.unitId?.unitNumber || '?'}: ${result.quizId?.unitId?.name || 'Assessment'}`,
        unitId: result.quizId?.unitId?._id,
        subjectId: result.quizId?.unitId?.subjectId,
        aiAnalysis: result.aiAnalysis,
        analysisAttempts: result.analysisAttempts || 0,
        analysisLog: result.analysisLog || [],
        attemptId: result._id // Pass attemptId for re-analysis
    };

    return (
        <div className="relative">
            <button
                onClick={() => navigate('/assessment/results')}
                className="absolute top-6 left-6 z-50 p-3 bg-white/80 backdrop-blur-md rounded-full shadow-sm border border-slate-200 text-slate-600 hover:bg-white hover:text-indigo-600 transition-all hidden md:flex"
                title="Back to History"
            >
                <ArrowLeft className="w-5 h-5" />
            </button>
            <AssessmentResultsView
                data={viewProps}
                isPersistent={true}
            />
        </div>
    );
};

export default AssessmentResultDetailPage;
