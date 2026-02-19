import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { ChevronDown, ChevronUp, Plus, Trash2, Edit2, Book, FileText, ArrowLeft, Loader2, Save, X, Check } from 'lucide-react';
import message from '../../utils/message';
import { handleError } from '../../utils/errorHandler';
import Container from '../../components/utils/Container';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

const SubjectCurriculumView = () => {
    const { subjectId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [expandedUnit, setExpandedUnit] = useState(null);
    const [editingUnitId, setEditingUnitId] = useState(null);
    const [editingTopicId, setEditingTopicId] = useState(null);
    const [newTopicName, setNewTopicName] = useState('');
    const [newUnitName, setNewUnitName] = useState('');

    // Edit State
    const [editUnitName, setEditUnitName] = useState('');
    const [editTopicName, setEditTopicName] = useState('');

    const [newUnitNumber, setNewUnitNumber] = useState('');

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        isLoading: false
    });

    // --- QUERIES ---
    const { data: subjectData, isLoading: isLoadingSubject } = useQuery({
        queryKey: ['subject', subjectId],
        queryFn: () => adminService.getSubject(subjectId),
    });
    const subject = subjectData?.subject;

    const { data: unitsData, isLoading: isLoadingUnits } = useQuery({
        queryKey: ['units', subjectId],
        queryFn: () => adminService.getUnits(subjectId),
    });
    const units = unitsData?.units || [];

    // --- MUTATIONS ---
    const createUnitMutation = useMutation({
        mutationFn: (data) => adminService.createUnit(subjectId, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['units', subjectId]);
            message.success('Unit added');
            setNewUnitName('');
            setNewUnitNumber('');
        },
        onError: (err) => handleError(err, 'Failed to add unit'),
    });

    const deleteUnitMutation = useMutation({
        mutationFn: (id) => adminService.deleteUnit(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['units', subjectId]);
            message.success('Unit deleted');
            closeConfirmModal();
        },
        onError: (err) => handleError(err, 'Failed to delete unit'),
    });

    const updateUnitMutation = useMutation({
        mutationFn: ({ id, data }) => adminService.updateUnit(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['units', subjectId]);
            message.success('Unit updated');
            setEditingUnitId(null);
        },
        onError: (err) => handleError(err, 'Failed to update unit'),
    });

    const createTopicMutation = useMutation({
        mutationFn: ({ unitId, name }) => adminService.createTopic(unitId, { name }),
        onSuccess: () => {
            queryClient.invalidateQueries(['units', subjectId]);
            message.success('Topic added');
            setNewTopicName('');
        },
        onError: (err) => handleError(err, 'Failed to add topic'),
    });

    const deleteTopicMutation = useMutation({
        mutationFn: (id) => adminService.deleteTopic(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['units', subjectId]);
            message.success('Topic deleted');
            closeConfirmModal();
        },
        onError: (err) => handleError(err, 'Failed to delete topic'),
    });

    const updateTopicMutation = useMutation({
        mutationFn: ({ id, name }) => adminService.updateTopic(id, { name }),
        onSuccess: () => {
            queryClient.invalidateQueries(['units', subjectId]);
            message.success('Topic updated');
            setEditingTopicId(null);
        },
        onError: (err) => handleError(err, 'Failed to update topic'),
    });

    // --- HANDLERS ---
    const startEditUnit = (unit) => {
        setEditingUnitId(unit._id);
        setEditUnitName(unit.name);
    };

    const cancelEditUnit = () => {
        setEditingUnitId(null);
        setEditUnitName('');
    };

    const saveEditUnit = (unitId) => {
        if (!editUnitName.trim()) return;
        updateUnitMutation.mutate({ id: unitId, data: { name: editUnitName } });
    };

    const startEditTopic = (topic) => {
        setEditingTopicId(topic._id);
        setEditTopicName(topic.name);
    };

    const cancelEditTopic = () => {
        setEditingTopicId(null);
        setEditTopicName('');
    };

    const saveEditTopic = (topicId) => {
        if (!editTopicName.trim()) return;
        updateTopicMutation.mutate({ id: topicId, name: editTopicName });
    };

    const handleAddUnit = (e) => {
        e.preventDefault();
        if (!newUnitName || !newUnitNumber) return;
        createUnitMutation.mutate({ name: newUnitName, unitNumber: Number(newUnitNumber) });
    };

    const handleAddTopic = (e, unitId) => {
        e.preventDefault();
        if (!newTopicName) return;
        createTopicMutation.mutate({ unitId, name: newTopicName });
    };

    const toggleUnit = (unitId) => {
        setExpandedUnit(expandedUnit === unitId ? null : unitId);
    };

    // Modal Helpers
    const closeConfirmModal = () => {
        setConfirmModal({ ...confirmModal, isOpen: false, isLoading: false });
    };

    // Delete Handlers with Confirmation Modal
    const handleDeleteUnit = (e, unitId) => {
        e.stopPropagation();
        setConfirmModal({
            isOpen: true,
            title: 'Delete Unit?',
            message: 'Are you sure you want to delete this unit? All topics inside it will deleted. This action cannot be undone.',
            onConfirm: () => {
                setConfirmModal(prev => ({ ...prev, isLoading: true }));
                deleteUnitMutation.mutate(unitId);
            },
            isLoading: false
        });
    };

    const handleDeleteTopic = (topicId) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Topic?',
            message: 'Are you sure you want to delete this topic? This action cannot be undone.',
            onConfirm: () => {
                setConfirmModal(prev => ({ ...prev, isLoading: true }));
                deleteTopicMutation.mutate(topicId);
            },
            isLoading: false
        });
    };

    if (isLoadingSubject) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!subject) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-slate-500">
                <h2 className="text-xl font-bold mb-2">Subject Not Found</h2>
                <button onClick={() => navigate('/admin/academics')} className="text-indigo-600 hover:underline">Go Back</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20 animate-fadeIn">
            <Container>
                {/* Header / Breadcrumb */}
                <div className="pt-8 pb-6">
                    <button
                        onClick={() => navigate('/admin/academics')}
                        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-4 font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Academics
                    </button>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-100 text-indigo-600 border border-indigo-200 uppercase tracking-wide">
                                    {subject.code}
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-200 text-slate-600 border border-slate-300">
                                    Sem {subject.semester}
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight break-words">{subject.name}</h1>
                            <div className="flex items-center gap-4 mt-2">
                                <p className="text-slate-500 text-lg">Curriculum Management</p>
                                <span className="text-slate-300 text-sm">•</span>
                                <p className="text-slate-400 text-sm font-medium">
                                    Last updated {new Date(subject.updatedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                            </div>
                        </div>

                        {/* Stats Cards (Mini) */}
                        <div className="flex gap-4 flex-wrap">
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center min-w-[100px] flex-1 md:flex-none">
                                <span className="text-2xl font-black text-indigo-600">{units.length}</span>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Units</span>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center min-w-[100px] flex-1 md:flex-none">
                                <span className="text-2xl font-black text-emerald-600">
                                    {units.reduce((acc, u) => acc + (u.topics?.length || 0), 0)}
                                </span>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Topics</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Units List */}
                    <div className="lg:col-span-2 space-y-6">
                        {isLoadingUnits ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                            </div>
                        ) : units.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                    <Book className="w-8 h-8" />
                                </div>
                                <h3 className="text-slate-900 font-bold text-xl mb-2">No Curriculum Yet</h3>
                                <p className="text-slate-500 max-w-sm mx-auto">Start by adding the first unit to structure this subject's syllabus.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {units.map((unit) => (
                                    <div key={unit._id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
                                        {/* Unit Header (Accordion Trigger) */}
                                        <div
                                            className={`p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors ${expandedUnit === unit._id ? 'bg-slate-50 border-b border-slate-100' : ''}`}
                                            onClick={() => toggleUnit(unit._id)}
                                        >
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg border border-indigo-100 shrink-0">
                                                    {unit.unitNumber}
                                                </div>
                                                <div className="flex-1" onClick={(e) => e.stopPropagation()}>
                                                    {editingUnitId === unit._id ? (
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="text"
                                                                value={editUnitName}
                                                                onChange={(e) => setEditUnitName(e.target.value)}
                                                                className="flex-1 px-3 py-1.5 bg-white border border-indigo-300 rounded-lg text-lg font-bold text-slate-800 focus:ring-2 focus:ring-indigo-100 outline-none"
                                                                autoFocus
                                                            />
                                                            <button
                                                                onClick={() => saveEditUnit(unit._id)}
                                                                disabled={updateUnitMutation.isPending}
                                                                className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={cancelEditUnit}
                                                                className="p-1.5 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <h3 className="font-bold text-slate-800 text-lg">{unit.name}</h3>
                                                            <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mt-0.5">
                                                                <FileText className="w-3.5 h-3.5" />
                                                                {unit.topics?.length || 0} Topics
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {!editingUnitId && (
                                                    <>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                startEditUnit(unit);
                                                            }}
                                                            className="p-2 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all"
                                                            title="Edit Unit"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleDeleteUnit(e, unit._id)}
                                                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                            title="Delete Unit"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                        <div className="text-slate-400 pl-1">
                                                            {expandedUnit === unit._id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Expanded Content (Topics) */}
                                        {expandedUnit === unit._id && (
                                            <div className="bg-white p-5 animate-in slide-in-from-top-2 duration-200">

                                                {/* Topics List */}
                                                <div className="space-y-2 mb-6">
                                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Topics in this Unit</h4>
                                                    {unit.topics && unit.topics.length > 0 ? (
                                                        unit.topics.map((topic) => (
                                                            <div key={topic._id} className="group flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-indigo-200 hover:shadow-sm transition-all">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0"></div>

                                                                <div className="flex-1">
                                                                    {editingTopicId === topic._id ? (
                                                                        <div className="flex items-center gap-2">
                                                                            <input
                                                                                type="text"
                                                                                value={editTopicName}
                                                                                onChange={(e) => setEditTopicName(e.target.value)}
                                                                                className="flex-1 px-2 py-1 bg-white border border-indigo-300 rounded text-sm font-medium text-slate-700 focus:ring-1 focus:ring-indigo-200 outline-none"
                                                                                autoFocus
                                                                            />
                                                                            <button
                                                                                onClick={() => saveEditTopic(topic._id)}
                                                                                disabled={updateTopicMutation.isPending}
                                                                                className="p-1 text-indigo-600 hover:bg-indigo-100 rounded"
                                                                            >
                                                                                <Check className="w-3.5 h-3.5" />
                                                                            </button>
                                                                            <button
                                                                                onClick={cancelEditTopic}
                                                                                className="p-1 text-slate-500 hover:bg-slate-200 rounded"
                                                                            >
                                                                                <X className="w-3.5 h-3.5" />
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="font-medium text-slate-700">{topic.name}</span>
                                                                    )}
                                                                </div>

                                                                {!editingTopicId && (
                                                                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <button
                                                                            onClick={() => startEditTopic(topic)}
                                                                            className="p-1.5 text-slate-400 hover:text-indigo-500 transition-all"
                                                                            title="Edit Topic"
                                                                        >
                                                                            <Edit2 className="w-3.5 h-3.5" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteTopic(topic._id)}
                                                                            className="p-1.5 text-slate-400 hover:text-rose-500 transition-all"
                                                                            title="Delete Topic"
                                                                        >
                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                                                            <p className="text-slate-400 text-sm font-medium">No topics added yet.</p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Add Topic Input */}
                                                <form onSubmit={(e) => handleAddTopic(e, unit._id)} className="flex gap-3">
                                                    <input
                                                        type="text"
                                                        placeholder="Add a new topic..."
                                                        className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                                                        value={newTopicName}
                                                        onChange={(e) => setNewTopicName(e.target.value)}
                                                    />
                                                    <button
                                                        type="submit"
                                                        disabled={!newTopicName || createTopicMutation.isPending}
                                                        className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                        Add
                                                    </button>
                                                </form>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Add New Unit Form (Always Visible) */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
                                    <Plus className="w-4 h-4" />
                                </div>
                                Add New Unit
                            </h3>
                            <form onSubmit={handleAddUnit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Unit Number</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 1"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none transition-all font-bold"
                                        value={newUnitNumber}
                                        onChange={(e) => setNewUnitNumber(e.target.value)}
                                        required
                                        min="1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Unit Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Introduction to Programming"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none transition-all"
                                        value={newUnitName}
                                        onChange={(e) => setNewUnitName(e.target.value)}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={createUnitMutation.isPending}
                                    className="w-full px-6 py-3.5 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-200 hover:bg-indigo-600 hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2 mt-2"
                                >
                                    {createUnitMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                                    Create Unit
                                </button>
                            </form>

                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    <strong className="text-slate-600">Tip:</strong> Break down the syllabus into logical units. Use consistent naming conventions for better student experience.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>


                <ConfirmationModal
                    isOpen={confirmModal.isOpen}
                    onClose={closeConfirmModal}
                    onConfirm={confirmModal.onConfirm}
                    title={confirmModal.title}
                    message={confirmModal.message}
                    isLoading={confirmModal.isLoading}
                />
            </Container>
        </div>
    );
};

export default SubjectCurriculumView;
