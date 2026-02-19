import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { Plus, Edit2, Trash2, Search, X, Check, BookOpen, Layers, Loader2 } from 'lucide-react';
import message from '../../utils/message';
import { handleError } from '../../utils/errorHandler';

const AcademicManagementView = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('branches');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const queryClient = useQueryClient();

    // --- DATA FETCHING ---
    const { data: branchesData, isLoading: isLoadingBranches } = useQuery({
        queryKey: ['branches'],
        queryFn: adminService.getBranches,
    });
    const branches = branchesData?.branches || [];

    const { data: subjectsData, isLoading: isLoadingSubjects } = useQuery({
        queryKey: ['subjects'],
        queryFn: () => adminService.getSubjects({}),
    });
    const subjects = subjectsData?.subjects || [];

    // --- MUTATIONS ---
    const branchMutation = useMutation({
        mutationFn: (data) => editingItem ? adminService.updateBranch(editingItem._id, data) : adminService.createBranch(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['branches']);
            message.success(`Branch ${editingItem ? 'updated' : 'created'} successfully`);
            closeModal();
        },
        onError: (err) => handleError(err, 'Operation failed'),
    });

    const subjectMutation = useMutation({
        mutationFn: (data) => editingItem ? adminService.updateSubject(editingItem._id, data) : adminService.createSubject(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['subjects']);
            message.success(`Subject ${editingItem ? 'updated' : 'created'} successfully`);
            closeModal();
        },
        onError: (err) => handleError(err, 'Operation failed'),
    });

    const deleteBranchMutation = useMutation({
        mutationFn: (id) => adminService.deleteBranch(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['branches']);
            message.success('Branch deleted');
        },
        onError: (err) => handleError(err, 'Failed to delete branch'),
    });

    const deleteSubjectMutation = useMutation({
        mutationFn: (id) => adminService.deleteSubject(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['subjects']);
            message.success('Subject deleted');
        },
        onError: (err) => handleError(err, 'Failed to delete subject'),
    });

    // --- HANDLERS ---
    const handleSave = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        if (activeTab === 'subjects') {
            // Handle multiple branches checkboxes
            const branches = formData.getAll('branches');
            data.branches = branches;
            // Coerce numeric fields (FormData always returns strings)
            data.semester = Number(data.semester);
            data.credits = Number(data.credits) || 0;
        }

        if (activeTab === 'branches') {
            branchMutation.mutate(data);
        } else {
            subjectMutation.mutate(data);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
            if (activeTab === 'branches') {
                deleteBranchMutation.mutate(id);
            } else {
                deleteSubjectMutation.mutate(id);
            }
        }
    };

    const openModal = (item = null) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const [selectedBranchFilter, setSelectedBranchFilter] = useState('ALL');

    // --- FILTERING ---
    const filteredBranches = branches.filter(b =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredSubjects = subjects.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.code?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesBranch = selectedBranchFilter === 'ALL' ||
            (s.branches && s.branches.map(String).includes(String(selectedBranchFilter)));

        return matchesSearch && matchesBranch;
    });

    return (
        <div className="animate-fadeIn pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-1 md:mb-2">
                        Academics <span className="text-indigo-600">.</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-sm md:text-base">Manage branches, subjects and curriculum.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="w-full md:w-auto bg-slate-900 text-white px-6 py-3 md:py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add {activeTab === 'branches' ? 'Branch' : 'Subject'}
                </button>
            </div>

            {/* Tabs */}
            <div className=" bg-white p-1.5 rounded-xl border border-slate-200 grid grid-cols-2 md:inline-flex mb-8 shadow-sm">
                <button
                    onClick={() => setActiveTab('branches')}
                    className={`px-4 md:px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'branches' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Layers className="w-4 h-4" />
                    Branches
                </button>
                <button
                    onClick={() => setActiveTab('subjects')}
                    className={`px-4 md:px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'subjects' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <BookOpen className="w-4 h-4" />
                    Subjects
                </button>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder={`Search ${activeTab}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                    />
                </div>
                {activeTab === 'subjects' && (
                    <select
                        value={selectedBranchFilter}
                        onChange={(e) => setSelectedBranchFilter(e.target.value)}
                        className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 outline-none shadow-sm text-slate-700 font-medium"
                    >
                        <option value="ALL">All Branches</option>
                        {branches.map(b => (
                            <option key={b._id} value={b._id}>{b.name}</option>
                        ))}
                    </select>
                )}
            </div>

            {/* Content */}
            {activeTab === 'branches' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoadingBranches ? (
                        <div className="col-span-full flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
                    ) : filteredBranches.length > 0 ? (
                        filteredBranches.map((branch) => (
                            <div key={branch._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all group w-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                                        <Layers className="w-6 h-6" />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => openModal(branch)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-all">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(branch._id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1 break-all">{branch.name}</h3>
                                <p className="text-sm text-slate-500 font-medium">Code: <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">{branch.code || 'N/A'}</span></p>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 text-slate-400">No branches found.</div>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full max-w-[calc(100vw-3rem)] md:max-w-full">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left min-w-[800px] md:min-w-full">
                            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                                <tr>
                                    <th className="px-4 md:px-6 py-4">Subject Name</th>
                                    <th className="px-4 md:px-6 py-4">Code</th>
                                    <th className="px-4 md:px-6 py-4">Branch</th>
                                    <th className="px-4 md:px-6 py-4">Semester</th>
                                    <th className="px-4 md:px-6 py-4">Credits</th>
                                    <th className="px-4 md:px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isLoadingSubjects ? (
                                    <tr><td colSpan="6" className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" /></td></tr>
                                ) : filteredSubjects.length > 0 ? (
                                    filteredSubjects.map((subject) => (
                                        <tr key={subject._id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-4 md:px-6 py-4 font-bold text-slate-700 whitespace-nowrap md:whitespace-normal max-w-[200px] truncate">{subject.name}</td>
                                            <td className="px-4 md:px-6 py-4 text-sm font-mono text-slate-500 whitespace-nowrap">{subject.code}</td>
                                            <td className="px-4 md:px-6 py-4 text-sm text-slate-600 max-w-[250px]">
                                                <div className="flex flex-wrap gap-1">
                                                    {subject.branches?.map(bId => {
                                                        const branch = branches.find(b => b._id === bId);
                                                        return branch ? (
                                                            <span key={branch._id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 whitespace-nowrap">
                                                                {branch.name}
                                                            </span>
                                                        ) : null;
                                                    })}
                                                    {(!subject.branches || subject.branches.length === 0) && <span className="text-slate-400 italic">No branch</span>}
                                                </div>
                                            </td>
                                            <td className="px-4 md:px-6 py-4 text-sm text-slate-600 whitespace-nowrap">Sem {subject.semester}</td>
                                            <td className="px-4 md:px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{subject.credits || '-'}</td>
                                            <td className="px-4 md:px-6 py-4 text-right whitespace-nowrap">
                                                <div className="flex justify-end gap-2 opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => navigate(`/admin/academics/subjects/${subject._id}`)}
                                                        className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-all flex items-center gap-1"
                                                    >
                                                        <BookOpen className="w-3 h-3" />
                                                        Manage
                                                    </button>
                                                    <button onClick={() => openModal(subject)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(subject._id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-all">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="6" className="text-center py-12 text-slate-400">No subjects found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Edit/Add Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h2 className="text-xl font-bold text-slate-900">
                                {editingItem ? 'Edit' : 'Add New'} {activeTab === 'branches' ? 'Branch' : 'Subject'}
                            </h2>
                            <button onClick={closeModal} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <form id="academic-form" onSubmit={handleSave} className="space-y-4">
                                {activeTab === 'branches' ? (
                                    <>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Branch Name</label>
                                            <input
                                                name="name"
                                                defaultValue={editingItem?.name}
                                                required
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none transition-all"
                                                placeholder="e.g. Computer Engineering"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Code</label>
                                            <input
                                                name="code"
                                                defaultValue={editingItem?.code}
                                                required
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none transition-all"
                                                placeholder="e.g. COMP"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Subject Name</label>
                                            <input
                                                name="name"
                                                defaultValue={editingItem?.name}
                                                required
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none transition-all"
                                                placeholder="e.g. Data Structures"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-1">Code</label>
                                                <input
                                                    name="code"
                                                    defaultValue={editingItem?.code}
                                                    required
                                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none transition-all"
                                                    placeholder="e.g. CS201"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-1">Credits</label>
                                                <input
                                                    name="credits"
                                                    type="number"
                                                    defaultValue={editingItem?.credits || 0}
                                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none transition-all"
                                                    placeholder="0"
                                                    min="0"
                                                />
                                            </div>
                                        </div>
                                        {/* Branches multi-select */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Branches <span className="text-xs font-normal text-slate-400">(select all that apply)</span></label>
                                            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 bg-slate-50 rounded-xl border border-slate-200">
                                                {branches.map(b => (
                                                    <label key={b._id} className="flex items-center gap-2 p-2 hover:bg-white rounded-lg transition-colors cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            value={b._id}
                                                            defaultChecked={editingItem?.branches?.map(String).includes(String(b._id))}
                                                            name="branches"
                                                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                                                        />
                                                        <span className="text-sm text-slate-700">{b.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1 ml-1">For First Year common subjects, select all relevant branches.</p>
                                        </div>
                                        {/* Semester */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Semester</label>
                                            <select
                                                name="semester"
                                                defaultValue={editingItem?.semester}
                                                required
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none transition-all"
                                            >
                                                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                                    <option key={s} value={s}>Sem {s}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                )}
                            </form>
                        </div>
                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button onClick={closeModal} className="px-4 py-2 font-bold text-slate-500 hover:text-slate-700 transition-colors">
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="academic-form"
                                disabled={branchMutation.isPending || subjectMutation.isPending}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {branchMutation.isPending || subjectMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AcademicManagementView;
