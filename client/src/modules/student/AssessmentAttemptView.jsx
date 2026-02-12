import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Loader2, Send, AlertCircle } from 'lucide-react';
import { assessmentService } from '../../services/assessmentService';
import Container from '../../components/utils/Container';
import toast from 'react-hot-toast';
import { useEffect, useState, useRef } from 'react';
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
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const questionRefs = useRef({});
    const isSubmittingRef = useRef(false);

    const scrollToQuestion = (idx) => {
        questionRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

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
            // Don't save if submitting or submitted
            if (isSubmittingRef.current) return;

            const currentTime = window.currentTime || 0;
            if (currentTime > 0) {
                try {
                    await assessmentService.updateTimeSpent(attemptId, currentTime);
                    console.log(`✅ [Timer] Saved: ${currentTime}s`);
                } catch (err) {
                    // Ignore errors if we are actually submitting now
                    if (!isSubmittingRef.current) {
                        console.error('❌ [Timer] Save failed:', err);
                    }
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
        setShowConfirmModal(true);
    };

    const confirmSubmit = () => {
        isSubmittingRef.current = true; // Stop timer updates
        setShowConfirmModal(false);
        const answers = Object.entries(responses).map(([questionId, selectedOption]) => ({
            questionId,
            selectedOption
        }));

        submitMutation.mutate({ answers, timeSpent: window.currentTime || 0 });
    };

    return (
        <div className="py-10 bg-slate-50 min-h-screen">
            <Container>
                <div className="flex gap-8 items-start relative">
                    {/* Main Content */}
                    <div className="flex-1 max-w-4xl mx-auto lg:mr-0">
                        {/* Header */}
                        <div className="p-8 rounded-4xl shadow-xl shadow-slate-200/50 border border-slate-100 mb-10 sticky top-4 z-30 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-xl bg-white/90">
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
                                <div
                                    key={q._id}
                                    ref={el => questionRefs.current[idx] = el}
                                    className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 hover:border-indigo-100 transition-colors"
                                >
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

                    {/* Minimap Sidebar (Desktop) */}
                    <div className="hidden lg:block w-72 sticky top-4 h-[calc(100vh-2rem)] overflow-y-auto shrink-0">
                        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                Question Map
                            </h3>

                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-100">
                                    <span className="block text-2xl font-black text-gray-900">{questions?.length || 0}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
                                </div>
                                <div className="bg-emerald-50 rounded-2xl p-3 text-center border border-emerald-100">
                                    <span className="block text-2xl font-black text-emerald-600">{Object.keys(responses).length}</span>
                                    <span className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest">Done</span>
                                </div>
                                <div className="bg-rose-50 rounded-2xl p-3 text-center border border-rose-100 col-span-2">
                                    <span className="block text-xl font-black text-rose-600">{(questions?.length || 0) - Object.keys(responses).length}</span>
                                    <span className="text-[10px] font-bold text-rose-600/60 uppercase tracking-widest">Remaining</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-2">
                                {questions?.map((q, idx) => {
                                    const isAnswered = !!responses[q._id];
                                    return (
                                        <button
                                            key={q._id}
                                            onClick={() => scrollToQuestion(idx)}
                                            className={`aspect-square rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 flex items-center justify-center border-2 ${isAnswered
                                                ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200'
                                                : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-200 hover:text-indigo-600'
                                                }`}
                                        >
                                            {idx + 1}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <div className="flex items-center gap-4 text-xs font-medium text-slate-500 justify-center">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded bg-emerald-500"></div>
                                        <span>Answered</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded border-2 border-slate-200 bg-white"></div>
                                        <span>Unanswered</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200 border border-white/20">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Send className="w-8 h-8 text-indigo-600 ml-1" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Submit Assessment?</h3>
                            <p className="text-slate-500 font-medium mb-8">
                                You are about to submit your answers. You won't be able to change them after this.
                            </p>

                            <div className="bg-slate-50 rounded-2xl p-4 mb-8 grid grid-cols-2 gap-4 border border-slate-100">
                                <div className="text-center">
                                    <span className="block text-2xl font-black text-gray-900">{questions?.length || 0}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Total Questions</span>
                                </div>
                                <div className="text-center">
                                    <span className="block text-2xl font-black text-emerald-600">{Object.keys(responses).length}</span>
                                    <span className="text-[10px] font-bold text-emerald-600/60 uppercase">Attempted</span>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="flex-1 py-4 rounded-xl font-bold text-slate-600 hover:bg-slate-50 border border-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmSubmit}
                                    className="flex-1 py-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2"
                                >
                                    Confirm Submit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
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
