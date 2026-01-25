import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { ListChecks, Play, Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import { resourceService } from '../../services/resourceService';
import { assessmentService } from '../../services/assessmentService';
import Container from '../../components/utils/Container';
import toast from 'react-hot-toast';

const UnitSelectionView = () => {
    const { subjectId } = useParams();
    const navigate = useNavigate();
    const [generatingUnit, setGeneratingUnit] = useState(null);

    const { data, isLoading } = useQuery({
        queryKey: ['units', subjectId],
        queryFn: () => resourceService.getUnits(subjectId),
        enabled: !!subjectId
    });

    const units = data?.units || [];

    const handleStartTest = async (unit) => {
        setGeneratingUnit(unit.id);
        try {
            // Mandated Flow: Wait for API to return questions before navigating
            const assessmentData = await assessmentService.startAssessment(unit.id);

            // Success: Clean up and navigate
            setGeneratingUnit(null);
            navigate('/assessment/attempt', {
                state: {
                    subjectId,
                    unitId: unit.id,
                    unitTitle: unit.title,
                    questions: assessmentData.questions, // Pre-load questions
                    attemptId: assessmentData.attemptId
                }
            });
        } catch (error) {
            setGeneratingUnit(null);
            console.error(error);
            toast.error('Failed to generate assessment. Please try again.');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
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

                <div className="grid grid-cols-1 gap-6 max-w-4xl">
                    {units.map((unit) => (
                        <div
                            key={unit.id}
                            className={`bg-white p-8 rounded-4xl shadow-sm border transition-all duration-300 flex flex-col sm:flex-row items-center justify-between gap-6 group ${generatingUnit === unit.id ? 'border-indigo-300 ring-4 ring-indigo-50' : 'border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/50'
                                }`}
                        >
                            <div className="flex items-center gap-6 w-full sm:w-auto">
                                <div className={`p-5 rounded-2xl transition-colors ${generatingUnit === unit.id ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                                    }`}>
                                    <ListChecks className="w-8 h-8" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">{unit.title}</h3>
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-3 h-3 text-amber-500" />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{unit.topics?.length || 0} Performance Topics</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleStartTest(unit)}
                                disabled={generatingUnit !== null}
                                className={`w-full sm:w-auto px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 ${generatingUnit === unit.id
                                    ? 'bg-indigo-600 text-white animate-pulse cursor-wait'
                                    : 'bg-indigo-600 text-white hover:bg-slate-900 shadow-indigo-100 disabled:opacity-50'
                                    }`}
                            >
                                {generatingUnit === unit.id ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Generating Questions...
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-4 h-4 fill-current" />
                                        Begin Training
                                    </>
                                )}
                            </button>
                        </div>
                    ))}
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
