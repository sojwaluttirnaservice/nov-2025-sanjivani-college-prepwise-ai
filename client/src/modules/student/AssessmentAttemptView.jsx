import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Loader2, Send, AlertCircle } from 'lucide-react';
import { studentService } from '../../services/studentService';
import Container from '../../components/utils/Container';
import toast from 'react-hot-toast';

const AssessmentAttemptView = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { subjectId, unitId, unitTitle, questions: initialQuestions } = location.state || {};

    const [responses, setResponses] = useState({});

    // Mandated: We rely on the questions passed via state from the generator view
    // Fallback query if they refresh (though theoretically discouraged by rules)
    const { data: questions, isLoading } = useQuery({
        queryKey: ['assessment', subjectId, unitId],
        queryFn: () => studentService.startAssessment({ subjectId, unitId }),
        enabled: !initialQuestions && !!subjectId && !!unitId,
        initialData: initialQuestions
    });

    // Submit Mutation
    const submitMutation = useMutation({
        mutationFn: (payload) => studentService.submitAssessment(payload),
        onSuccess: (data) => {
            toast.success('Assessment submitted successfully!');
            navigate('/assessment/results', { state: { results: data, unitId, unitTitle } });
        },
        onError: () => {
            toast.error('Failed to submit assessment.');
        }
    });

    if (!subjectId || !unitId) {
        return (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 max-w-lg mx-auto mt-20">
                <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Session Expired</h2>
                <p className="text-gray-500 mb-6">Assessment sessions are temporary and cannot be resumed.</p>
                <button
                    onClick={() => navigate('/syllabus/subjects')}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold"
                >
                    Back to Syllabus
                </button>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                <div className="text-center">
                    <p className="text-xl font-black text-gray-900">Reloading Logic...</p>
                    <p className="text-slate-500">Retrieving your synchronized session data.</p>
                </div>
            </div>
        );
    }

    const handleOptionChange = (qId, option) => {
        setResponses(prev => ({ ...prev, [qId]: option }));
    };

    const isComplete = questions?.length > 0 && Object.keys(responses).length === questions.length;

    const handleSubmit = () => {
        const payload = {
            unitId,
            responses: Object.entries(responses).map(([questionId, selectedOption]) => ({
                questionId,
                selectedOption
            }))
        };
        submitMutation.mutate(payload);
    };

    return (
        <div className="py-10 bg-slate-50 min-h-screen">
            <Container>
                <div className="max-w-4xl mx-auto">
                    {/* Focused Assessment Header */}
                    <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 mb-10 sticky top-4 z-30 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-xl bg-white/90">
                        <div className="text-center md:text-left">
                            <div className="flex items-center gap-2 mb-1 justify-center md:justify-start">
                                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-md border border-indigo-100">Testing Mode</span>
                                <h1 className="text-2xl font-black text-gray-900 tracking-tight">{unitTitle || 'Unit Assessment'}</h1>
                            </div>
                            <p className="text-sm text-slate-500 font-medium">Answer all questions before submitting. This test can be submitted only once.</p>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="text-right hidden sm:block">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Progress</p>
                                <p className="font-bold text-indigo-600">{Object.keys(responses).length} / {questions?.length || 10}</p>
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={!isComplete || submitMutation.isPending}
                                className={`px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl flex items-center gap-3 ${submitMutation.isPending
                                        ? 'bg-slate-900 text-white cursor-wait'
                                        : 'bg-indigo-600 text-white hover:bg-slate-900 shadow-indigo-100 disabled:opacity-50 disabled:shadow-none'
                                    }`}
                            >
                                {submitMutation.isPending ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        Submit Test
                                        <Send className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Questions Body */}
                    <div className="space-y-8 pb-20">
                        {questions?.map((q, idx) => (
                            <div key={q.id} className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 hover:border-indigo-100 transition-colors">
                                <div className="flex gap-6 mb-8">
                                    <span className="shrink-0 w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg shadow-slate-200">
                                        {idx + 1}
                                    </span>
                                    <h3 className="text-xl font-bold text-gray-900 leading-snug pt-1">
                                        {q.question}
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 gap-4 ml-0 sm:ml-16">
                                    {q.options.map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => handleOptionChange(q.id, opt)}
                                            className={`text-left px-6 py-5 rounded-[1.5rem] border-2 transition-all duration-300 font-bold tracking-tight text-lg relative overflow-hidden group ${responses[q.id] === opt
                                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-inner'
                                                    : 'border-slate-50 bg-slate-50/50 hover:border-indigo-200 hover:bg-white text-slate-600'
                                                }`}
                                        >
                                            {responses[q.id] === opt && (
                                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-600"></div>
                                            )}
                                            <div className="flex items-center gap-4">
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${responses[q.id] === opt ? 'border-indigo-600 bg-indigo-600' : 'border-slate-200'
                                                    }`}>
                                                    {responses[q.id] === opt && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                                </div>
                                                {opt}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {!isComplete && (
                        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
                            <div className="flex items-center gap-3 text-amber-700 bg-amber-50 px-8 py-4 rounded-[1.5rem] border border-amber-200 shadow-2xl backdrop-blur-md font-bold text-sm">
                                <AlertCircle className="w-5 h-5" />
                                Please finalize all {questions?.length} answers to enable submission.
                            </div>
                        </div>
                    )}
                </div>
            </Container>
        </div>
    );
};

export default AssessmentAttemptView;
