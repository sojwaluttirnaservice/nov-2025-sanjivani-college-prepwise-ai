import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Loader2, Send, AlertCircle } from 'lucide-react';
import { assessmentService } from '../../services/assessmentService';
import Container from '../../components/utils/Container';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { extractErrorMessage } from '../../utils/errorHandler';

const AssessmentAttemptView = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { unitId: paramUnitId } = useParams(); // Get unitId from URL if available

    // State from navigation or fallback
    const { unitId: stateUnit, unitTitle: stateTitle } = location.state || {};
    const unitId = paramUnitId || stateUnit;

    const [attemptId, setAttemptId] = useState(null);
    const [responses, setResponses] = useState({});

    // Fetch Assessment Data (Start Assessment)
    const { data: assessmentData, isLoading, isError, error } = useQuery({
        queryKey: ['assessment', unitId],
        queryFn: () => assessmentService.startAssessment(unitId),
        enabled: !!unitId,
        retry: false,
    });

    useEffect(() => {
        if (assessmentData?.attemptId) {
            setAttemptId(assessmentData.attemptId);
        }
    }, [assessmentData]);

    /**
     * 🎯 TIMER PERSISTENCE FEATURE
     * 
     * WHY THIS EXISTS:
     * - Users might navigate away, close tab, or refresh during assessment
     * - Losing timer progress creates poor UX and unfair time tracking
     * - Backend expects accurate timeSpent for analytics
     * 
     * STRATEGY:
     * 1. Save timeSpent on component unmount (navigate away)
     * 2. Save every 30 seconds as backup (periodic auto-save)
     * 3. Save on page close/refresh (beforeunload event)
     * 
     * BENEFIT:
     * - Seamless resume experience
     * - Accurate time tracking
     * - No data loss
     */
    useEffect(() => {
        if (!attemptId) return;

        // Auto-save function
        const saveTimeSpent = async () => {
            const currentTime = window.currentTime || 0;
            if (currentTime > 0) {
                try {
                    await assessmentService.updateTimeSpent(attemptId, currentTime);
                    console.log(`✅ [Timer] Saved: ${currentTime}s`);
                } catch (err) {
                    console.error('❌ [Timer] Save failed:', err);
                }
            }
        };

        // STRATEGY #1: Periodic auto-save every 30 seconds
        const autoSaveInterval = setInterval(() => {
            saveTimeSpent();
        }, 30000); // 30s

        // STRATEGY #2: Save on page close/refresh
        const handleBeforeUnload = (e) => {
            saveTimeSpent();
            // Modern browsers ignore custom messages, but we still need to call preventDefault
            e.preventDefault();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        // STRATEGY #3: Cleanup - save on component unmount (navigate away)
        return () => {
            clearInterval(autoSaveInterval);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            saveTimeSpent(); // Final save before unmount
        };
    }, [attemptId]);

    // Submit Mutation
    const submitMutation = useMutation({
        mutationFn: (payload) => assessmentService.submitAssessment(attemptId, payload.answers),
        onSuccess: (data) => {
            toast.success(data.message || 'Assessment submitted successfully!');
            navigate('/assessment/results', {
                state: {
                    results: data.data || data, // Handle wrapped/unwrapped
                    unitId,
                    unitTitle: stateTitle || 'Unit Assessment'
                }
            });
        },
        onError: (err) => {
            toast.error(extractErrorMessage(err, 'Failed to submit assessment.'));
        }
    });

    if (!unitId) {
        return (
            <Container>
                <div className="p-10 text-center mt-10">
                    <h2 className="text-2xl font-bold text-gray-900">Invalid Assessment Session</h2>
                    <p className="text-gray-500 mt-2">No Unit ID provided. Please return to the curriculum.</p>
                    <button
                        onClick={() => navigate('/syllabus/subjects')}
                        className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold"
                    >
                        Return to Curriculum
                    </button>
                </div>
            </Container>
        );
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                <div className="text-center">
                    <p className="text-xl font-black text-gray-900">Generating Assessment...</p>
                    <p className="text-slate-500">Preparing questions for you.</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <Container>
                <div className="p-10 text-center mt-10 bg-red-50 rounded-3xl border border-red-100">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-red-900">Unable to Start Assessment</h2>
                    <p className="text-red-700 mt-2">{error?.message || 'Something went wrong while loading the quiz.'}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-6 px-6 py-3 bg-white text-red-600 border border-red-200 rounded-xl font-bold hover:bg-red-50"
                    >
                        Go Back
                    </button>
                </div>
            </Container>
        );
    }

    const { questions, quizType } = assessmentData || {};

    const handleOptionChange = (questionId, optionKey) => {
        setResponses(prev => ({ ...prev, [questionId]: optionKey }));
    };

    const isComplete = questions?.length > 0 && Object.keys(responses).length === questions.length;

    const handleSubmit = () => {
        const answers = Object.entries(responses).map(([questionId, selectedOption]) => ({
            questionId,
            selectedOption
        }));

        submitMutation.mutate({ answers, timeSpent: window.currentTime || 0 });
    };

    return (
        <div className="py-10 bg-slate-50 min-h-screen">
            <Container>
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="p-8 rounded-4xl shadow-xl shadow-slate-200/50 border border-slate-100 mb-10 sticky top-20 z-30 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-xl bg-white/90">
                        <div className="text-center md:text-left">
                            <div className="flex items-center gap-2 mb-1 justify-center md:justify-start">
                                <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-md border ${quizType === 'DIAGNOSTIC' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                                    }`}>
                                    {quizType || 'Assessment'}
                                </span>
                                <h1 className="text-2xl font-black text-gray-900 tracking-tight">{stateTitle || 'Unit Assessment'}</h1>
                            </div>
                            <p className="text-sm text-slate-500 font-medium">Answer all questions before submitting.</p>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="text-right hidden sm:block">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time</p>
                                <Timer
                                    initialTime={assessmentData?.timeSpent || 0}
                                    onTimeUpdate={(t) => window.currentTime = t}
                                />
                            </div>
                            <div className="text-right hidden sm:block">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Progress</p>
                                <p className="font-bold text-indigo-600">{Object.keys(responses).length} / {questions?.length || 0}</p>
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
                                        Submit
                                        <Send className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Questions List */}
                    <div className="space-y-8 pb-20">
                        {questions?.map((q, idx) => (
                            <div key={q._id} className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 hover:border-indigo-100 transition-colors">
                                <div className="flex gap-6 mb-8">
                                    <span className="shrink-0 w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg shadow-slate-200">
                                        {idx + 1}
                                    </span>
                                    <h3 className="text-xl font-bold text-gray-900 leading-snug pt-1">
                                        {q.questionText}
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 gap-4 ml-0 sm:ml-16">
                                    {q.options.map((opt) => (
                                        <button
                                            key={opt.key}
                                            onClick={() => handleOptionChange(q._id, opt.key)}
                                            className={`text-left px-6 py-5 rounded-[1.5rem] border-2 transition-all duration-300 font-bold tracking-tight text-lg relative overflow-hidden group ${responses[q._id] === opt.key
                                                ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-inner'
                                                : 'border-slate-50 bg-slate-50/50 hover:border-indigo-200 hover:bg-white text-slate-600'
                                                }`}
                                        >
                                            {responses[q._id] === opt.key && (
                                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-600"></div>
                                            )}
                                            <div className="flex items-center gap-4">
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${responses[q._id] === opt.key ? 'border-indigo-600 bg-indigo-600' : 'border-slate-200'
                                                    }`}>
                                                    {responses[q._id] === opt.key && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                                </div>
                                                <span className="mr-2 opacity-50">{opt.key}.</span>
                                                {opt.text}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {!isComplete && !isLoading && (
                        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-max max-w-[90vw]">
                            <div className="flex items-center gap-3 text-amber-700 bg-amber-50 px-8 py-4 rounded-[1.5rem] border border-amber-200 shadow-2xl backdrop-blur-md font-bold text-sm">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                Please answer all {questions?.length} questions to submit.
                            </div>
                        </div>
                    )}
                </div>
            </Container>
        </div>
    );
};

const Timer = ({ initialTime, onTimeUpdate }) => {
    const [seconds, setSeconds] = useState(initialTime);

    useEffect(() => {
        setSeconds(initialTime);
    }, [initialTime]);

    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds(s => {
                const newTime = s + 1;
                onTimeUpdate(newTime);
                return newTime;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [onTimeUpdate]);

    const formatTime = (totalSeconds) => {
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <p className="font-bold text-gray-900 font-mono text-lg">{formatTime(seconds)}</p>
    );
};

export default AssessmentAttemptView;
