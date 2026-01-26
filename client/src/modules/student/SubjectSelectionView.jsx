import { useState, useEffect } from 'react';
import { extractErrorMessage } from '../../utils/errorHandler';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Book, ChevronRight, Filter, Loader2, RefreshCw } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../redux/slices/authSlice';
import { resourceService } from '../../services/resourceService';
import Container from '../../components/utils/Container';
import Dropdown from '../../components/ui/Dropdown';

const SubjectSelectionView = () => {
    const navigate = useNavigate();
    const user = useSelector(selectCurrentUser);

    // Initial state based on localStorage, user profile, or defaults
    const [selectedSemester, setSelectedSemester] = useState(() => {
        return localStorage.getItem('filter_semester') || user?.semester || '';
    });
    const [selectedBranch, setSelectedBranch] = useState(() => {
        return localStorage.getItem('filter_branch') || user?.branchId || '';
    });

    // Persist filters to localStorage
    useEffect(() => {
        if (selectedSemester) localStorage.setItem('filter_semester', selectedSemester);
        else localStorage.removeItem('filter_semester');
    }, [selectedSemester]);

    useEffect(() => {
        if (selectedBranch) localStorage.setItem('filter_branch', selectedBranch);
        else localStorage.removeItem('filter_branch');
    }, [selectedBranch]);

    // Fetch branches for dropdown
    const { data: branchesData } = useQuery({
        queryKey: ['branches'],
        queryFn: resourceService.getBranches
    });

    const branches = branchesData?.branches || [];

    // Fetch subjects with filters - using placeholderData for smooth transitions
    const { data, isLoading, isError, error, isFetching } = useQuery({
        queryKey: ['subjects', selectedBranch, selectedSemester],
        queryFn: () => resourceService.getSubjects({ branchId: selectedBranch, semester: selectedSemester }),
        placeholderData: keepPreviousData
    });

    const subjects = data?.subjects || [];

    // Prepare dropdown options
    const semesterOptions = Array.from({ length: 8 }, (_, i) => ({
        value: String(i + 1),
        label: `Semester ${i + 1}`
    }));

    const branchOptions = branches.map(branch => ({
        value: branch._id,
        label: branch.name
    }));

    const resetFilters = () => {
        setSelectedSemester('');
        setSelectedBranch('');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-12 h-12 text-red-500" /> {/* Using Loader2 as placeholder or Alert */}
                <p className="text-xl font-bold text-gray-900">Failed to load subjects</p>
                <p className="text-slate-500">{extractErrorMessage(error)}</p>
                <button
                    onClick={() => navigate(0)}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="py-10 bg-slate-50/50 min-h-screen">
            <Container>
                {/* Header Section */}
                <div className="relative mb-12 bg-indigo-900 rounded-3xl p-10 overflow-hidden shadow-2xl shadow-indigo-200">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                    <div className="relative z-10 max-w-2xl">
                        <span className="text-indigo-300 font-bold uppercase tracking-widest text-xs mb-4 block">
                            {selectedSemester ? `Semester ${selectedSemester} Curriculum` : 'Full Curriculum Catalog'}
                        </span>
                        <h1 className="text-4xl font-black text-white mb-4 leading-tight">Master Your Syllabus</h1>
                        <p className="text-indigo-100/80 text-lg">
                            AI-curated topics and adaptive assessments tailored to your academic department's MSBTE standards.
                        </p>
                    </div>
                </div>

                {/* Premium Filter Controls */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            Subject Catalog
                            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-sm font-bold">
                                {subjects.length}
                            </span>
                        </h2>
                        <p className="text-slate-500 mt-1">
                            {selectedSemester || selectedBranch
                                ? 'Filtered results'
                                : 'Showing all available subjects'}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-end gap-4">
                        <Dropdown
                            label="Semester"
                            value={selectedSemester}
                            onChange={setSelectedSemester}
                            options={semesterOptions}
                            placeholder="All Semesters"
                            allowClear={true}
                            className="w-48"
                        />

                        <Dropdown
                            label="Branch"
                            value={selectedBranch}
                            onChange={setSelectedBranch}
                            options={branchOptions}
                            placeholder="All Branches"
                            allowClear={true}
                            className="w-56"
                        />

                        {(selectedSemester || selectedBranch) && (
                            <button
                                onClick={resetFilters}
                                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center gap-2"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                Reset
                            </button>
                        )}
                    </div>
                </div>

                {/* Catalog Grid */}
                {subjects.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
                        <Book className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900">No Subjects Found</h3>
                        <p className="text-slate-500 max-w-md mx-auto mt-2">
                            We couldn't find any subjects matching your filters. Try adjusting or clearing them.
                        </p>
                        <button
                            onClick={resetFilters}
                            className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                        >
                            Clear All Filters
                        </button>
                    </div>
                ) : (
                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 transition-opacity duration-300 ${isFetching ? 'opacity-50' : 'opacity-100'}`}>
                        {subjects.map((sub) => (
                            <div
                                key={sub._id}
                                onClick={() => navigate(`/syllabus/subjects/${sub._id}`)}
                                className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-500 cursor-pointer flex flex-col sm:flex-row overflow-hidden"
                            >
                                {/* Visual Side */}
                                <div className="sm:w-48 bg-slate-50 flex flex-col items-center justify-center p-8 transition-colors group-hover:bg-indigo-50/50 border-r border-slate-50">
                                    <div className="bg-white p-5 rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-500">
                                        <Book className="w-8 h-8 text-indigo-600" />
                                    </div>
                                    <span className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{sub.code}</span>
                                </div>

                                {/* Text Side */}
                                <div className="flex-1 p-8 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{sub.name}</h3>
                                        <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                                            Comprehensive coverage across {sub.units} learning units with practice MCQs.
                                        </p>
                                    </div>
                                    <div className="mt-6 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="flex -space-x-2">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white"></div>
                                                ))}
                                            </div>
                                            <div className="flex gap-2">
                                                <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-500 uppercase tracking-wide">Sem {sub.semester}</span>
                                                {sub.branchId && <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-500 uppercase tracking-wide">Branch Specific</span>}
                                            </div>
                                        </div>
                                        <div className="flex items-center text-indigo-600 text-sm font-black uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                            Enroll
                                            <ChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Container>
        </div>
    );
};

export default SubjectSelectionView;
