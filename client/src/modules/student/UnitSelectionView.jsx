import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { ListChecks, Play, Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import { resourceService } from '../../services/resourceService';
import { assessmentService } from '../../services/assessmentService';
import Container from '../../components/utils/Container';
import toast from 'react-hot-toast';
import { extractErrorMessage } from '../../utils/errorHandler';
import { Accordion, AccordionItem } from '../../components/ui/Accordion';

const UnitSelectionView = () => {
    const { subjectId } = useParams();
    const navigate = useNavigate();
    const [generatingUnit, setGeneratingUnit] = useState(null);
    const [openUnitId, setOpenUnitId] = useState(null);

    const { data, isLoading } = useQuery({
        queryKey: ['units', subjectId],
        queryFn: () => resourceService.getUnits(subjectId),
        enabled: !!subjectId
    });

    const units = data?.units || [];


    const handleStartTest = async (unit) => {
        setGeneratingUnit(unit._id);
        try {
            // Mandated Flow: Wait for API to return questions before navigating
            const assessmentData = await assessmentService.startAssessment(unit._id);

            // Success: Clean up and navigate
            setGeneratingUnit(null);

            if (assessmentData.resumed) {
                toast.success('Resuming your active assessment', { icon: '🔄' });
            }

            navigate('/assessment/attempt', {
                state: {
                    subjectId,
                    unitId: unit._id,
                    unitTitle: unit.title,
                    questions: assessmentData.questions, // Pre-load questions
                    attemptId: assessmentData.attemptId
                }
            });
        } catch (error) {
            setGeneratingUnit(null);
            console.error(error);

            // Handle quota/capacity errors (503)
            if (error?.response?.status === 503) {
                toast.error('We are experiencing high demand. Please try again in a few minutes.', {
                    duration: 5000,
                    icon: '⏳'
                });
            } else {
                toast.error(extractErrorMessage(error, 'Failed to generate assessment. Please try again.'));
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <p className="text-xl font-bold text-gray-900">No data received</p>
                <button onClick={() => navigate(0)} className="text-indigo-600 hover:underline">Retry</button>
            </div>
        );
    }

    if (units.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <ListChecks className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No Units Available</h3>
                <p className="text-slate-500 max-w-xs mx-auto mt-2">
                    Start by selecting a different subject or check back later for content updates.
                </p>
            </div>
        );
    }

    return (
        <div className="py-8 bg-slate-50/50 min-h-screen">
            <Container>
                <button
                    onClick={() => navigate('/syllabus/subjects')}
                    className="flex items-center text-sm font-bold text-slate-400 hover:text-indigo-600 mb-8 transition-colors uppercase tracking-widest"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Curriculum
                </button>

                <div className="mb-10">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Unit Selection</h1>
                    <p className="text-gray-500 font-medium">Choose a learning module to initiate your AI-generated assessment.</p>
                </div>

                <div className="max-w-4xl mx-auto">
                    <Accordion>
                        {units.map((unit) => (
                            <AccordionItem
                                key={unit._id}
                                isOpen={openUnitId === unit._id}
                                onToggle={() => setOpenUnitId(openUnitId === unit._id ? null : unit._id)}
                                icon={ListChecks}
                                title={`Unit ${unit.unitNumber}: ${unit.name}`}
                                subtitle={
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-3 h-3 text-amber-500" />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                            {unit.topics?.length || 0} Performance Topics
                                        </p>
                                    </div>
                                }
                                action={
                                    <button
                                        onClick={() => handleStartTest(unit)}
                                        disabled={generatingUnit !== null}
                                        className={`
                                            px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center gap-2
                                            ${generatingUnit === unit._id
                                                ? 'bg-indigo-600 text-white cursor-wait opacity-80'
                                                : 'bg-indigo-600 text-white hover:bg-slate-900 shadow-indigo-100 hover:shadow-xl'
                                            }
                                        `}
                                    >
                                        {generatingUnit === unit._id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Play className="w-3 h-3 fill-current" />
                                        )}
                                        <span className="hidden sm:inline">Start</span>
                                    </button>
                                }
                            >
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Unit Topics</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {unit.topics && unit.topics.length > 0 ? (
                                            unit.topics.map((topic, idx) => (
                                                <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-100">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0"></div>
                                                    <span className="text-sm font-medium text-slate-600">
                                                        {typeof topic === 'object' ? topic.name : topic}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-slate-400 italic col-span-2">No topics detailed for this unit.</p>
                                        )}
                                    </div>
                                </div>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>

                {generatingUnit && (
                    <div className="mt-12 p-8 bg-white border border-indigo-100 rounded-3xl shadow-xl shadow-indigo-50 flex flex-col items-center text-center max-w-2xl mx-auto border-t-4 border-t-indigo-600 animate-in fade-in slide-in-from-bottom-4">
                        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                            <Sparkles className="w-8 h-8 text-indigo-600 animate-pulse" />
                        </div>
                        <h4 className="text-xl font-black text-gray-900 mb-2">AI Engine Busy</h4>
                        <p className="text-gray-500 font-medium leading-relaxed">
                            We are analyzing the unit topics and generating unique MCQs based on your recent performance gaps. Please wait...
                        </p>
                    </div>
                )}
            </Container>
        </div>
    );
};

export default UnitSelectionView;
