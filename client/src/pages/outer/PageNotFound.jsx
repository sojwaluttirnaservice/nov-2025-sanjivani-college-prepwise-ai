import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import Container from '../../components/utils/Container';

const PageNotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-slate-50/50 py-20">
            <Container>
                <div className="max-w-2xl mx-auto text-center">
                    {/* Visual Element */}
                    <div className="relative mb-12">
                        <div className="text-[12rem] font-black text-slate-100 leading-none select-none">
                            404
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-24 h-24 bg-indigo-600 rounded-3xl rotate-12 shadow-2xl shadow-indigo-200 flex items-center justify-center animate-bounce">
                                <Search className="w-10 h-10 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Text Content */}
                    <div className="space-y-4 mb-12">
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                            Lost in the Syllabus?
                        </h1>
                        <p className="text-xl text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
                            The page you're looking for has been moved, deleted, or never existed in the curriculum.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-slate-200 text-slate-600 font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-3"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Go Back
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full sm:w-auto px-10 py-4 bg-indigo-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3"
                        >
                            <Home className="w-5 h-5" />
                            Back to Home
                        </button>
                    </div>

                    {/* Subtle Hint */}
                    <div className="mt-20 pt-10 border-t border-slate-100 italic text-slate-400 text-sm">
                        "Not all who wander are lost, but some routes definitely are."
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default PageNotFound;
