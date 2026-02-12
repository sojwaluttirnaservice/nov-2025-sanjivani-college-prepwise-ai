import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Trophy, Target, AlertTriangle, ArrowRight, ChevronDown, ChevronUp, CheckCircle, XCircle, Sparkles, TrendingUp, Clock, Award, RefreshCw, History, BookOpen } from 'lucide-react';
import Container from '../../components/utils/Container';
import { assessmentService } from '../../services/assessmentService';
import { toast } from 'react-hot-toast';
const AssessmentResultsView = ({ data }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [expandedQuestion, setExpandedQuestion] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [localAnalysis, setLocalAnalysis] = useState(null);
    const [localAttempts, setLocalAttempts] = useState(null);
    const [localLog, setLocalLog] = useState(null);
    const [showRetakeModal, setShowRetakeModal] = useState(false);

    const viewData = data || location.state;
    const {
        results,
        unitTitle,
        aiAnalysis: propAnalysis,
        analysisAttempts: propAttempts,
        analysisLog: propLog,
        attemptId: propAttemptId,
        unitId: propUnitId,
        subjectId: propSubjectId
    } = viewData || {};

    // Extract attemptId and other props if nested in results (compatibility with submission flow)
    const attemptId = propAttemptId || results?.attemptId || results?._id;
    // Fallback for when data comes from submission result directly (might not have unitId/subjectId at top level)
    const unitId = propUnitId || results?.quizId?.unitId;
    const subjectId = propSubjectId || results?.quizId?.subjectId; // unlikely to be here but safe check

    const initialAttempts = propAttempts ?? results?.analysisAttempts ?? 0;

    // Use local state if available, otherwise prop
    const currentAnalysis = localAnalysis || propAnalysis || results?.aiAnalysis;
    const currentAttempts = localAttempts !== null ? localAttempts : initialAttempts;
    const currentLog = localLog || propLog || results?.analysisLog || [];

    const handleReanalyze = async () => {
        if (!attemptId) return;

        setIsAnalyzing(true);
        try {
            const data = await assessmentService.reanalyzeResult(attemptId);

            // CRITICAL: Always use server response as source of truth
            setLocalAnalysis(data.result.aiAnalysis);
            setLocalAttempts(data.result.analysisAttempts); // Never client-side increment
            setLocalLog(data.result.analysisLog);

            toast.success('Analysis updated successfully');
        } catch (error) {
            console.error(error);

            // Handle limit reached (403 Forbidden)
            if (error?.response?.status === 403) {
                toast.error('Maximum re-analysis attempts reached');
                // Lock UI by setting to limit
                setLocalAttempts(2);
            } else {
                toast.error(error?.response?.data?.message || 'Failed to re-analyze');
            }
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (!viewData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6">
                <AlertTriangle className="w-12 h-12 text-amber-500" />
                <div className="text-center">
                    <h2 className="text-2xl font-black text-gray-900">No Results Found</h2>
                    <p className="text-slate-500">It seems you haven't completed an assessment recently.</p>
                    <button
                        onClick={() => navigate('/syllabus/subjects')}
                        className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold"
                    >
                        Go to Curriculum
                    </button>
                </div>
            </div>
        );
    }

    const toggleQuestion = (idx) => {
        setExpandedQuestion(expandedQuestion === idx ? null : idx);
    };

    return (
        <div className="py-4 md:py-8 bg-slate-50 min-h-screen">
            <Container>
                <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
                    {/* Compact Hero Header */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 md:px-8 py-6 md:py-8">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Award className="w-5 h-5 text-indigo-200" />
                                        <span className="text-indigo-200 text-xs font-bold uppercase tracking-wider">Assessment Complete</span>
                                    </div>
                                    <h1 className="text-2xl md:text-3xl font-black text-white mb-1">{unitTitle || 'Unit Assessment'}</h1>
                                    <p className="text-indigo-100 text-sm">Performance Report • MSBTE Semester 6</p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-3 border border-white/20">
                                        <div className="text-3xl md:text-4xl font-black text-white">{results.score}<span className="text-lg text-white/60">/10</span></div>
                                        <div className="text-xs text-indigo-200 font-semibold mt-1">Score</div>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-3 border border-white/20">
                                        <div className="text-3xl md:text-4xl font-black text-white">{results.accuracy}<span className="text-lg text-white/60">%</span></div>
                                        <div className="text-xs text-indigo-200 font-semibold mt-1">Accuracy</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Grid Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                        {/* Left Column - Main Content (2/3) */}
                        <div className="lg:col-span-2 space-y-4 md:space-y-6">
                            {/* AI Analysis Compact */}
                            {(currentAnalysis || currentAttempts < 2) && (
                                <div className="bg-gradient-to-br from-white to-indigo-50/30 rounded-2xl border border-indigo-200/50 shadow-sm relative overflow-hidden flex flex-col">
                                    {currentAttempts >= 2 && (
                                        <div className="absolute top-0 right-0 bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded-bl-lg border-b border-l border-indigo-200 z-10">
                                            Max Analysis Limit Reached
                                        </div>
                                    )}

                                    {/* Tabs for History */}
                                    {currentLog.length > 1 && (
                                        <div className="flex border-b border-indigo-100 bg-indigo-50/30 px-4 pt-4 gap-2">
                                            {currentLog.map((log, idx) => {
                                                const isLatest = idx === currentLog.length - 1;
                                                const isActive = (localAnalysis === log.analysisText) || (!localAnalysis && isLatest);

                                                return (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setLocalAnalysis(log.analysisText)}
                                                        className={`pb-2 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${isActive
                                                            ? 'border-indigo-600 text-indigo-700'
                                                            : 'border-transparent text-slate-500 hover:text-indigo-600'
                                                            }`}
                                                    >
                                                        <Clock className="w-3 h-3" />
                                                        {isLatest ? 'Latest Analysis' : `Version ${log.version}`}
                                                        <span className="font-normal opacity-60 ml-1">
                                                            {formatDate(log.date).split(',')[0]}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    <div className="p-4 md:p-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg shadow-sm">
                                                        <Sparkles className="w-4 h-4 text-indigo-600" />
                                                    </div>
                                                    <h3 className="text-base font-bold text-gray-900">AI Performance Analysis</h3>
                                                </div>

                                                {/* Meta Info */}
                                                {currentLog.length > 0 && (
                                                    <div className="text-xs text-slate-500 ml-9 flex items-center gap-2">
                                                        <span className="font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                                                            {currentLog.find(l => l.analysisText === (localAnalysis || currentAnalysis))
                                                                ? `Version ${currentLog.find(l => l.analysisText === (localAnalysis || currentAnalysis)).version}`
                                                                : 'Current Version'}
                                                        </span>
                                                        <span>
                                                            {currentLog.find(l => l.analysisText === (localAnalysis || currentAnalysis))
                                                                ? formatDate(currentLog.find(l => l.analysisText === (localAnalysis || currentAnalysis)).date)
                                                                : ''}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {currentAttempts < 2 && attemptId && currentLog.length === 0 && (
                                                <button
                                                    onClick={handleReanalyze}
                                                    disabled={isAnalyzing}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-50 disabled:opacity-50 transition-all shadow-sm self-start mt-1"
                                                >
                                                    <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                                                    {isAnalyzing ? 'Analyzing...' : (currentAnalysis ? 'Re-analyze' : 'Generate Analysis')}
                                                </button>
                                            )}

                                            {/* Show re-analyze button only on latest view if allowed */}
                                            {currentAttempts < 2 && attemptId && currentLog.length > 0 && (!localAnalysis || localAnalysis === currentLog[currentLog.length - 1].analysisText) && (
                                                <button
                                                    onClick={handleReanalyze}
                                                    disabled={isAnalyzing}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-50 disabled:opacity-50 transition-all shadow-sm self-start mt-1"
                                                >
                                                    <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                                                    {isAnalyzing ? 'Re-analyzing...' : 'Re-analyze'}
                                                </button>
                                            )}
                                        </div>

                                        {currentAnalysis ? (
                                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">{localAnalysis || currentAnalysis}</p>
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 text-slate-500 text-sm">
                                                No analysis available yet. Click the button above to generate.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Knowledge Gaps Compact */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="bg-gradient-to-r from-red-50 to-orange-50/50 border-b border-red-100 px-4 md:px-6 py-3 md:py-4">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-red-600" />
                                        <h3 className="text-base md:text-lg font-bold text-gray-900">Areas for Improvement</h3>
                                    </div>
                                </div>
                                <div className="p-4 md:p-6 space-y-4">
                                    {results.weakTopics.map((topic, idx) => (
                                        <div key={idx} className="border-l-4 border-red-400 pl-4 bg-linear-to-r from-red-50/40 to-transparent rounded-r-lg py-2">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <h4 className="font-bold text-gray-900 text-sm md:text-base">{topic.topicTitle}</h4>
                                                <span className="text-xs font-bold text-red-700 bg-linear-to-r from-red-100 to-red-200/50 px-2 py-0.5 rounded shrink-0">{topic.topicCode}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {topic.subtopics.map((sub, sIdx) => (
                                                    <span key={sIdx} className="text-xs bg-linear-to-r from-white to-red-50/50 border border-red-200 text-slate-700 px-2.5 py-1 rounded-full shadow-sm">
                                                        {sub}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Question Review - Accordion Style with Smooth Animation */}
                            {results.answers && results.answers.length > 0 && (
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-200 px-4 md:px-6 py-3 md:py-4">
                                        <h3 className="text-base md:text-lg font-bold text-gray-900">Question Review</h3>
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                        {results.answers.map((ans, idx) => {
                                            const question = ans.questionId;
                                            if (!question || typeof question !== 'object') return null;

                                            const isCorrect = ans.isCorrect;
                                            const userSelected = ans.selectedOption;
                                            const correctOption = question.correctOption;
                                            const isExpanded = expandedQuestion === idx;

                                            return (
                                                <div key={question._id || idx} className={`transition-colors duration-200 ${isCorrect ? 'bg-emerald-50/20' : 'bg-red-50/20'}`}>
                                                    {/* Question Header - Clickable */}
                                                    <button
                                                        onClick={() => toggleQuestion(idx)}
                                                        className="w-full px-4 md:px-6 py-3 md:py-4 flex items-start gap-3 hover:bg-white/60 transition-all duration-200 text-left"
                                                    >
                                                        <span className={`shrink-0 w-7 h-7 flex items-center justify-center rounded-full font-bold text-xs transition-transform duration-200 ${isExpanded ? 'scale-110' : ''} ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                                                            {idx + 1}
                                                        </span>
                                                        <span className="flex-1 font-semibold text-gray-900 text-sm md:text-base leading-snug">
                                                            {question.questionText}
                                                        </span>
                                                        {isCorrect ? (
                                                            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                                        ) : (
                                                            <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                                        )}
                                                        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 mt-0.5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                                    </button>

                                                    {/* Expanded Content with Smooth Animation */}
                                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                                        <div className="px-4 md:px-6 pb-4 space-y-3">
                                                            <div className="bg-linear-to-br from-white to-slate-50/50 rounded-lg border border-slate-200 p-3 md:p-4 shadow-sm">
                                                                <div className="space-y-2">
                                                                    {question.options.map((opt) => {
                                                                        const isUserSelected = opt.key === userSelected;
                                                                        const isCorrectOpt = opt.key === correctOption;

                                                                        let optionClass = "bg-white border-slate-200";
                                                                        if (isCorrectOpt) {
                                                                            optionClass = "bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-emerald-300 ring-2 ring-emerald-100";
                                                                        } else if (isUserSelected && !isCorrect) {
                                                                            optionClass = "bg-gradient-to-r from-red-50 to-red-100/50 border-red-300 ring-2 ring-red-100";
                                                                        }

                                                                        return (
                                                                            <div key={opt.key} className={`px-3 py-2 rounded-lg border flex items-center gap-2 text-sm transition-all duration-200 ${optionClass}`}>
                                                                                <span className="font-bold text-xs opacity-70 shrink-0">{opt.key}.</span>
                                                                                <span className="flex-1">{opt.text}</span>
                                                                                {isCorrectOpt && <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />}
                                                                                {isUserSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-700 shrink-0" />}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                            {question.explanation && (
                                                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-200 rounded-lg p-3 shadow-sm">
                                                                    <div className="text-xs font-bold text-blue-900 mb-1">💡 Explanation</div>
                                                                    <p className="text-sm text-blue-800 leading-relaxed">{question.explanation}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Sidebar - Actions (1/3) */}
                        <div className="lg:col-span-1 space-y-4">
                            {/* Quick Stats */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                                <h3 className="font-bold text-gray-900 mb-3 text-sm">Performance Summary</h3>
                                <div className="space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-600 flex items-center gap-1.5">
                                            <Trophy className="w-3.5 h-3.5 text-indigo-600" />
                                            Questions Answered
                                        </span>
                                        <span className="font-bold text-sm">{results.score}/10</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-600 flex items-center gap-1.5">
                                            <Target className="w-3.5 h-3.5 text-emerald-600" />
                                            Accuracy Rate
                                        </span>
                                        <span className="font-bold text-sm">{results.accuracy}%</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-600 flex items-center gap-1.5">
                                            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                                            Weak Topics
                                        </span>
                                        <span className="font-bold text-sm">{results.weakTopics.length}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions Card */}
                            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-5 text-white">
                                <div className="mb-4">
                                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">Ready to Improve?</h3>
                                    <p className="text-indigo-100 text-sm leading-relaxed">
                                        Focus on the weak topics identified above to strengthen your understanding.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3">
                                    {/* Primary Action: Review Material (Logic: Weak topics found? Review. Perfect score? Retake/Next) */}
                                    {subjectId && (
                                        <button
                                            onClick={() => navigate(`/syllabus/subjects/${subjectId}`)}
                                            className="w-full bg-white/10 border border-white/20 text-white py-3 rounded-xl font-bold text-sm hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            <BookOpen className="w-4 h-4" />
                                            <span>Review Unit Material</span>
                                        </button>
                                    )}

                                    {/* Secondary Action: Retake (if unitId available) */}
                                    {unitId && (
                                        <button
                                            onClick={() => setShowRetakeModal(true)}
                                            className="w-full bg-white text-indigo-700 py-3 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                                        >
                                            <span>Retake Assessment</span>
                                            <RefreshCw className="w-4 h-4" />
                                        </button>
                                    )}

                                    {/* Fallback if no IDs */}
                                    {!unitId && !subjectId && (
                                        <button
                                            onClick={() => navigate('/syllabus/subjects')}
                                            className="w-full bg-white text-indigo-700 py-3 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                                        >
                                            <span>Go to Curriculum</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Dashboard Link */}
                            <button
                                onClick={() => navigate('/student/stats')}
                                className="w-full bg-white border-2 border-slate-200 py-3 rounded-xl font-bold text-sm text-slate-700 hover:border-indigo-300 hover:text-indigo-700 transition-all"
                            >
                                View Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </Container>

            {/* Retake Confirmation Modal */}
            {showRetakeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200 border border-white/20">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <RefreshCw className="w-8 h-8 text-indigo-600" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Retake Assessment?</h3>
                            <p className="text-slate-500 font-medium mb-8">
                                You are about to start a new attempt for <span className="text-indigo-600 font-bold">{unitTitle || 'this unit'}</span>. This will be recorded as a new attempt in your history.
                            </p>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowRetakeModal(false)}
                                    className="flex-1 py-4 rounded-xl font-bold text-slate-600 hover:bg-slate-50 border border-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => navigate('/assessment/attempt', { state: { unitId, unitTitle } })}
                                    className="flex-1 py-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2"
                                >
                                    Start Attempt
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export default AssessmentResultsView;
