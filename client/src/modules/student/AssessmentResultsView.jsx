
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Trophy, Target, AlertTriangle, ArrowRight, ChevronDown, ChevronUp, CheckCircle, XCircle, Sparkles, TrendingUp, Clock, Award, RefreshCw, History, BookOpen, Zap, Loader2 } from 'lucide-react';
import Container from '../../components/utils/Container';
import { assessmentService } from '../../services/assessmentService';
import { studentService } from '../../services/studentService';
import { useMutation, useQuery } from '@tanstack/react-query';
import message from '../../utils/message';
import { handleError } from '../../utils/errorHandler';

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

    // AI Study Notes History
    const { data: notesData, refetch: refetchNotes } = useQuery({
        queryKey: ['student-notes-history'],
        queryFn: studentService.getNotesHistory
    });

    const [selectedNote, setSelectedNote] = useState(null);
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

    // AI Note Generation with timeout handling
    const { mutate: generateNotes, isPending: isGenerating } = useMutation({
        mutationFn: async (attemptId) => {
            // Show processing message after 30 seconds
            const processingTimeout = setTimeout(() => {
                message.loading('Still processing... This may take a minute for complex analysis.');
            }, 30000);

            try {
                const result = await studentService.generateStudyNotes(attemptId);
                clearTimeout(processingTimeout);
                message.dismiss('notes-processing');
                return result;
            } catch (error) {
                clearTimeout(processingTimeout);
                message.dismiss('notes-processing');
                throw error;
            }
        },
        onSuccess: (data) => {
            message.success('AI Boost Notes generated successfully!');
            refetchNotes();
            setSelectedNote(data.note);
            setIsNoteModalOpen(true);
        },
        onError: (error) => {
            // Handle timeout specifically
            if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
                message.loading(
                    '⏳ Your notes are being prepared in the background! They\'ll appear in a few moments. Feel free to refresh in 1-2 minutes.'
                );
                // Refetch after a delay to check if notes appeared
                setTimeout(() => refetchNotes(), 10000);
            } else {
                handleError(error, 'Failed to generate AI notes');
            }
        }
    });

    // Filter notes for THIS attempt only
    const attemptNotes = notesData?.notes?.filter(n => n.attemptId === attemptId) || [];
    const currentNotesCount = attemptNotes.length;
    const canGenerate = currentNotesCount < 2;

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

            message.success('Analysis updated successfully');
        } catch (error) {
            console.error(error);

            // Handle limit reached (403 Forbidden)
            if (error?.response?.status === 403) {
                message.error('Maximum re-analysis attempts reached');
                // Lock UI by setting to limit
                setLocalAttempts(2);
            } else {
                handleError(error, 'Failed to re-analyze');
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
                        <div className="bg-linear-to-r from-indigo-600 to-purple-600 px-4 md:px-8 py-6 md:py-8">
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
                                <div className="bg-linear-to-br from-white to-indigo-50/30 rounded-2xl border border-indigo-200/50 shadow-sm relative overflow-hidden flex flex-col">
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
                                                        {isLatest ? 'Latest Analysis' : `Version ${log.version} `}
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
                                                    <div className="p-1.5 bg-linear-to-br from-indigo-100 to-purple-100 rounded-lg shadow-sm">
                                                        <Sparkles className="w-4 h-4 text-indigo-600" />
                                                    </div>
                                                    <h3 className="text-base font-bold text-gray-900">AI Performance Analysis</h3>
                                                </div>

                                                {/* Meta Info */}
                                                {currentLog.length > 0 && (
                                                    <div className="text-xs text-slate-500 ml-9 flex items-center gap-2">
                                                        <span className="font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                                                            {currentLog.find(l => l.analysisText === (localAnalysis || currentAnalysis))
                                                                ? `Version ${currentLog.find(l => l.analysisText === (localAnalysis || currentAnalysis)).version} `
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
                                <div className="bg-linear-to-r from-red-50 to-orange-50/50 border-b border-red-100 px-4 md:px-6 py-3 md:py-4">
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
                                    <div className="bg-linear-to-r from-slate-50 to-gray-50 border-b border-slate-200 px-4 md:px-6 py-3 md:py-4">
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
                                                                <div className="bg-linear-to-r from-blue-50 to-indigo-50/50 border border-blue-200 rounded-lg p-3 shadow-sm">
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
                            <div className="bg-linear-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-5 text-white">
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
                                            onClick={() => navigate(`/ syllabus / subjects / ${subjectId} `)}
                                            className="w-full bg-white/10 border border-white/20 text-white py-3 rounded-xl font-bold text-sm hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            <BookOpen className="w-4 h-4" />
                                            <span>Review Unit Material</span>
                                        </button>
                                    )}

                                    {/* Secondary Action: Improve Score (if unitId available) */}
                                    {unitId && (
                                        <button
                                            onClick={() => setShowRetakeModal(true)}
                                            className="w-full bg-white text-indigo-700 py-3 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                                        >
                                            <span>Improve Score</span>
                                            <TrendingUp className="w-4 h-4" />
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
                                className="w-full bg-white border-2 border-slate-200 py-3 rounded-xl font-bold text-sm text-slate-700 hover:border-indigo-300 hover:text-indigo-700 transition-all mb-4"
                            >
                                View Dashboard
                            </button>

                            {/* AI Study Booster Widget */}
                            <div className="bg-linear-to-br from-indigo-600 to-violet-700 p-6 rounded-3xl shadow-xl shadow-indigo-200 relative overflow-hidden group">
                                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>

                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl text-white">
                                            <Zap className="w-5 h-5 fill-white" />
                                        </div>
                                        <h3 className="text-lg font-black text-white italic tracking-tight">AI STUDY BOOSTER</h3>
                                    </div>

                                    <p className="text-indigo-100 text-sm font-medium leading-relaxed mb-6">
                                        Get notes specific to the topics you missed in this test.
                                    </p>

                                    {/* Check for existing note for this attempt */}
                                    {notesData?.notes?.find(n => n.attemptId === attemptId) ? (
                                        <button
                                            onClick={() => {
                                                setSelectedNote(notesData.notes.find(n => n.attemptId === attemptId));
                                                setIsNoteModalOpen(true);
                                            }}
                                            className="w-full py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20 bg-white text-indigo-600 hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            <Sparkles className="w-4 h-4 fill-indigo-600" />
                                            VIEW BOOST NOTES
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => generateNotes(attemptId)}
                                            disabled={!canGenerate || isGenerating || results.weakTopics.length === 0}
                                            className={`
w-full py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2
shadow-lg shadow-indigo-900/20
                                                ${(!canGenerate || results.weakTopics.length === 0)
                                                    ? 'bg-indigo-400/30 text-indigo-200 cursor-not-allowed border border-white/5'
                                                    : 'bg-white text-indigo-600 hover:scale-[1.02] active:scale-[0.98]'
                                                }
`}
                                        >
                                            {isGenerating ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    ANALYZING...
                                                </>
                                            ) : !canGenerate ? (
                                                <>LIMIT REACHED (2/2)</>
                                            ) : results.weakTopics.length === 0 ? (
                                                <>PERFECT SCORE! (0/2)</>
                                            ) : (
                                                <>GENERATE BOOST NOTES ({currentNotesCount}/2)</>
                                            )}
                                        </button>
                                    )}

                                    <p className="text-[9px] text-center text-indigo-300 font-bold uppercase tracking-tighter mt-4 opacity-60">
                                        {!canGenerate
                                            ? "Master these notes to improve your score!"
                                            : results.weakTopics.length === 0
                                                ? "No weak areas detected in this test."
                                                : "Uses AI to pinpoint exactly what you missed."}
                                    </p>
                                </div>
                            </div>
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
                                <TrendingUp className="w-8 h-8 text-indigo-600" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Improve Your Score?</h3>
                            <p className="text-slate-500 font-medium mb-8">
                                You are about to start a new adaptive practice session for <span className="text-indigo-600 font-bold">{unitTitle || 'this unit'}</span>. This will help target your weak areas.
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
                                    Start Practice
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Note Display Modal */}
            {isNoteModalOpen && (
                <NoteModal
                    note={selectedNote}
                    onClose={() => setIsNoteModalOpen(false)}
                />
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


const NoteModal = ({ note, onClose }) => {
    // Prevent background scroll when modal is open
    useEffect(() => {
        if (!note) return;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [note]);

    if (!note) return null;

    // Parse markdown sections from detailedContent
    const parseMarkdown = (markdown) => {
        if (!markdown) return {};

        const sections = {};

        // Extract "What You Got Wrong" section (NEW FORMAT)
        let wrongMatch = markdown.match(/## 🔎 What You Got Wrong\s+([\s\S]*?)(?=\n##|$)/);
        // Fallback to old format if new format not found
        if (!wrongMatch) {
            wrongMatch = markdown.match(/## 🧠 Why This Needs Attention\s+([\s\S]*?)(?=\n##|$)/);
        }
        sections.whatWrong = wrongMatch ? wrongMatch[1].trim() : '';

        // Extract "Mistake Breakdown" section (NEW FORMAT)
        let mistakesMatch = markdown.match(/## ❌ Mistake Breakdown\s+([\s\S]*?)(?=\n##|$)/);
        // Fallback to old format
        if (!mistakesMatch) {
            mistakesMatch = markdown.match(/## ⚠️ Common Mistakes Identified\s+([\s\S]*?)(?=\n##|$)/);
        }

        if (mistakesMatch) {
            const mistakesText = mistakesMatch[1];
            sections.mistakes = [];

            // Try parsing new format (### 1. Title)
            const mistakeBlocks = mistakesText.split(/###\s+\d+\.\s+/).filter(Boolean);

            if (mistakeBlocks.length > 0) {
                // New format with sections
                mistakeBlocks.forEach(block => {
                    const titleMatch = block.match(/^(.+?)\n/);
                    const whyWrongMatch = block.match(/\*\*Why it's wrong:\*\*\s+([\s\S]*?)(?=\*\*Correct Understanding:|$)/);
                    const correctMatch = block.match(/\*\*Correct Understanding:\*\*\s+([\s\S]*?)(?=``` |### | $)/);
                    const codeMatch = block.match(/```[\w]*\n([\s\S]*?)```/);

                    if (titleMatch) {
                        sections.mistakes.push({
                            title: titleMatch[1].trim(),
                            whyWrong: whyWrongMatch ? whyWrongMatch[1].trim() : '',
                            correct: correctMatch ? correctMatch[1].trim() : '',
                            code: codeMatch ? codeMatch[1].trim() : ''
                        });
                    }
                });
            } else {
                // Old format or malformed format with bullet points
                // Handle formats like "1. - Text" or "- Text"
                const bulletPoints = mistakesText
                    .split('\n')
                    .map(line => line.trim())
                    .filter(line => {
                        // Match "- text" or "1. - text" or "* text"
                        return line.match(/^(\d+\.\s*)?[-*]\s+/);
                    })
                    .map(line => {
                        // Remove "1. - " or "- " or "* " prefixes
                        return line.replace(/^(\d+\.\s*)?[-*]\s+/, '').trim();
                    })
                    .filter(Boolean);

                bulletPoints.forEach((point) => {
                    sections.mistakes.push({
                        title: point,
                        whyWrong: '',
                        correct: '',
                        code: ''
                    });
                });
            }
        }

        // Extract "Quick Mental Rules" (NEW FORMAT ONLY)
        const rulesMatch = markdown.match(/## ⚡ Quick Mental Rules\s+([\s\S]*?)(?=\n##|$)/);
        if (rulesMatch) {
            sections.rules = rulesMatch[1]
                .split('\n')
                .filter(line => line.trim().startsWith('-') || line.trim().startsWith('✔'))
                .map(line => line.replace(/^[-✔]\s*/, '').trim())
                .filter(Boolean);
        }

        // Extract "Micro Practice" (NEW FORMAT ONLY)
        const practiceMatch = markdown.match(/## 🧪 Micro Practice\s+([\s\S]*?)(?=\n##|$)/);
        if (practiceMatch) {
            const practiceText = practiceMatch[1];
            const codeMatch = practiceText.match(/```[\w]*\n([\s\S]*?)```/);
            const answerMatch = practiceText.match(/\*\*Answer:\*\*\s+(.+)/);

            sections.practice = {
                code: codeMatch ? codeMatch[1].trim() : '',
                answer: answerMatch ? answerMatch[1].trim() : ''
            };
        }

        // Extract "Immediate Fix Strategy" (NEW FORMAT ONLY)
        const fixMatch = markdown.match(/## 🎯 Immediate Fix Strategy\s+([\s\S]*?)(?=\n##|$)/);
        if (fixMatch) {
            sections.fixSteps = fixMatch[1]
                .split('\n')
                .filter(line => line.trim().startsWith('-'))
                .map(line => line.replace(/^-\s*/, '').trim())
                .filter(Boolean);
        }

        return sections;
    };

    console.log(note.detailedContent)
    const parsed = parseMarkdown(note.detailedContent);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-slate-50 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-white">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">📘 Targeted Weak-Area Correction</h2>
                        <p className="text-sm text-slate-500 font-medium mt-1">
                            <strong>Focus:</strong> {note.topics?.join(', ') || 'General Topics'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                        <ArrowRight className="w-5 h-5 rotate-180 text-slate-600" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto p-8 space-y-6" style={{ maxHeight: 'calc(90vh - 180px)' }}>
                    {/* What You Got Wrong */}
                    {parsed.whatWrong && (
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h2 className="text-lg font-bold text-slate-900 border-l-4 border-indigo-600 pl-3 mb-4">
                                🔎 What You Got Wrong
                            </h2>
                            <p className="text-slate-700 leading-relaxed">{parsed.whatWrong}</p>
                        </div>
                    )}

                    {/* Mistake Breakdown */}
                    {parsed.mistakes && parsed.mistakes.length > 0 && (
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h2 className="text-lg font-bold text-slate-900 border-l-4 border-indigo-600 pl-3 mb-4">
                                ❌ Mistake Breakdown
                            </h2>
                            <div className="space-y-6">
                                {parsed.mistakes.map((mistake, idx) => (
                                    <div key={idx}>
                                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-3">
                                            <h3 className="font-bold text-red-900 mb-2">{idx + 1}. {mistake.title}</h3>
                                            <p className="text-sm text-red-800"><strong>Why it's wrong:</strong> {mistake.whyWrong}</p>
                                        </div>
                                        {mistake.correct && (
                                            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                                                <p className="text-sm text-green-900 mb-2"><strong>Correct Understanding:</strong></p>
                                                <p className="text-sm text-green-800">{mistake.correct}</p>
                                                {mistake.code && (
                                                    <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg mt-3 text-xs overflow-x-auto">
                                                        <code>{mistake.code}</code>
                                                    </pre>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick Mental Rules */}
                    {parsed.rules && parsed.rules.length > 0 && (
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h2 className="text-lg font-bold text-slate-900 border-l-4 border-indigo-600 pl-3 mb-4">
                                ⚡ Quick Mental Rules
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {parsed.rules.map((rule, idx) => (
                                    <span
                                        key={idx}
                                        className="inline-block bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium"
                                    >
                                        ✔ {rule}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Micro Practice */}
                    {parsed.practice && (parsed.practice.code || parsed.practice.answer) && (
                        <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-2xl">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">🧪 Micro Practice</h2>
                            {parsed.practice.code && (
                                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-3 text-sm overflow-x-auto">
                                    <code>{parsed.practice.code}</code>
                                </pre>
                            )}
                            {parsed.practice.answer && (
                                <p className="text-amber-900 font-medium">
                                    <strong>Answer:</strong> {parsed.practice.answer}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Immediate Fix Strategy */}
                    {parsed.fixSteps && parsed.fixSteps.length > 0 && (
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h2 className="text-lg font-bold text-slate-900 border-l-4 border-indigo-600 pl-3 mb-4">
                                🎯 Immediate Fix Strategy
                            </h2>
                            <ul className="space-y-2">
                                {parsed.fixSteps.map((step, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <span className="shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                                            {idx + 1}
                                        </span>
                                        <span className="text-slate-700 leading-relaxed">{step}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-200 bg-white flex justify-between items-center">
                    <div className="text-xs text-slate-500">
                        Generated on {formatDate(note.createdAt)}
                    </div>
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                    >
                        Got it, let's master this!
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssessmentResultsView;
