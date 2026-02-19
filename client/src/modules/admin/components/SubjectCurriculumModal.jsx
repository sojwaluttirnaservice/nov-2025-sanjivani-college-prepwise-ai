import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../../services/adminService';
import { ChevronDown, ChevronUp, Plus, Trash2, Edit2, Book, FileText, X, Save, AlertCircle, Loader2, Check } from 'lucide-react';
import message from '../../../utils/message';
import { handleError } from '../../../utils/errorHandler';
import ConfirmationModal from '../../../components/ui/ConfirmationModal';

const SubjectCurriculumModal = ({ subject, onClose }) => {
    const queryClient = useQueryClient();
    const [expandedUnit, setExpandedUnit] = useState(null);
    const [editingUnitId, setEditingUnitId] = useState(null);
    const [editingTopicId, setEditingTopicId] = useState(null);

    // Form states for adding new items
    const [newTopicName, setNewTopicName] = useState('');
    const [newUnitName, setNewUnitName] = useState('');
    const [newUnitNumber, setNewUnitNumber] = useState('');

    // Edit states
    const [editUnitName, setEditUnitName] = useState('');
    const [editUnitNumber, setEditUnitNumber] = useState('');
    const [editTopicName, setEditTopicName] = useState('');

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        isLoading: false
    });

    // --- QUERIES ---
    const { data: unitsData, isLoading: isLoadingUnits } = useQuery({
        queryKey: ['units', subject._id],
        queryFn: () => adminService.getUnits(subject._id),
    });
    const units = unitsData?.units || [];

    // --- MUTATIONS ---
    const createUnitMutation = useMutation({
        mutationFn: (data) => adminService.createUnit(subject._id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['units', subject._id]);
            message.success('Unit added');
            setNewUnitName('');
            setNewUnitNumber('');
        },
        onError: (err) => handleError(err, 'Failed to add unit'),
    });

    const deleteUnitMutation = useMutation({
        mutationFn: (id) => adminService.deleteUnit(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['units', subject._id]);
            message.success('Unit deleted');
            closeConfirmModal();
        },
        onError: (err) => handleError(err, 'Failed to delete unit'),
    });

    const updateUnitMutation = useMutation({
        mutationFn: ({ id, data }) => adminService.updateUnit(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['units', subject._id]);
            message.success('Unit updated');
            setEditingUnitId(null);
        },
        onError: (err) => handleError(err, 'Failed to update unit'),
    });

    const createTopicMutation = useMutation({
        mutationFn: ({ unitId, name }) => adminService.createTopic(unitId, { name }),
        onSuccess: () => {
            queryClient.invalidateQueries(['units', subject._id]);
            message.success('Topic added');
            setNewTopicName('');
        },
        onError: (err) => handleError(err, 'Failed to add topic'),
    });

    const deleteTopicMutation = useMutation({
        mutationFn: (id) => adminService.deleteTopic(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['units', subject._id]);
            message.success('Topic deleted');
            closeConfirmModal();
        },
        onError: (err) => handleError(err, 'Failed to delete topic'),
    });

    const updateTopicMutation = useMutation({
        mutationFn: ({ id, name }) => adminService.updateTopic(id, { name }),
        onSuccess: () => {
            queryClient.invalidateQueries(['units', subject._id]);
            message.success('Topic updated');
            setEditingTopicId(null);
        },
        onError: (err) => handleError(err, 'Failed to update topic'),
    });

    // --- HANDLERS ---
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

    // Edit Unit Handlers
    const startEditUnit = (e, unit) => {
        e.stopPropagation();
        setEditingUnitId(unit._id);
        setEditUnitName(unit.name);
        setEditUnitNumber(unit.unitNumber);
    };

    const saveEditUnit = (e, unitId) => {
        e.stopPropagation();
        if (!editUnitName || !editUnitNumber) return;
        updateUnitMutation.mutate({
            id: unitId,
            data: { name: editUnitName, unitNumber: Number(editUnitNumber) }
        });
    };

    const cancelEditUnit = (e) => {
        e.stopPropagation();
        setEditingUnitId(null);
    };

    // Edit Topic Handlers
    const startEditTopic = (topic) => {
        setEditingTopicId(topic._id);
        setEditTopicName(topic.name);
    };

    const saveEditTopic = (topicId) => {
        if (!editTopicName) return;
        updateTopicMutation.mutate({ id: topicId, name: editTopicName });
    };

    const cancelEditTopic = () => {
        setEditingTopicId(null);
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
            message: 'Are you sure you want to delete this unit? All topics inside it will also be deleted. This action cannot be undone.',
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 bg-white z-10 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase tracking-wide">
                                {subject.code}
                            </span>
                            <span className="text-sm text-slate-500 font-medium">Curriculum Management</span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{subject.name}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50">

                    {isLoadingUnits ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                        </div>
                    ) : units.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                <Book className="w-8 h-8" />
                            </div>
                            <h3 className="text-slate-900 font-bold text-lg mb-1">No Curriculum Yet</h3>
                            <p className="text-slate-500 max-w-xs mx-auto">Start by adding the first unit to structure this subject's syllabus.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {units.map((unit) => (
                                <div key={unit._id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
                                    {/* Unit Header (Accordion Trigger) */}
                                    <div
                                        className={`p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors ${expandedUnit === unit._id ? 'bg-slate-50' : ''}`}
                                        onClick={() => toggleUnit(unit._id)}
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            {editingUnitId === unit._id ? (
                                                // Edit Mode for Unit
                                                <div className="flex items-center gap-2 flex-1" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="number"
                                                        value={editUnitNumber}
                                                        onChange={(e) => setEditUnitNumber(e.target.value)}
                                                        className="w-16 px-2 py-1 border border-slate-300 rounded text-center font-bold text-sm"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={editUnitName}
                                                        onChange={(e) => setEditUnitName(e.target.value)}
                                                        className="flex-1 px-3 py-1 border border-slate-300 rounded font-bold text-lg"
                                                    />
                                                    <button onClick={(e) => saveEditUnit(e, unit._id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded">
                                                        <Check className="w-5 h-5" />
                                                    </button>
                                                    <button onClick={cancelEditUnit} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded">
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                // View Mode for Unit
                                                <>
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                                        {unit.unitNumber}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-slate-800 text-lg">{unit.name}</h3>
                                                        <div className="text-xs font-medium text-slate-500 flex items-center gap-1">
                                                            <FileText className="w-3 h-3" />
                                                            {unit.topics?.length || 0} Topics
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {/* Actions (Only show when not editing) */}
                                        {editingUnitId !== unit._id && (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => startEditUnit(e, unit)}
                                                    className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeleteUnit(e, unit._id)}
                                                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <div className="text-slate-400">
                                                    {expandedUnit === unit._id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Expanded Content (Topics) */}
                                    {expandedUnit === unit._id && (
                                        <div className="border-t border-slate-100 bg-slate-50/50 p-4 animate-in slide-in-from-top-2 duration-200">

                                            {/* Topics List */}
                                            <div className="space-y-2 mb-4">
                                                {unit.topics && unit.topics.length > 0 ? (
                                                    unit.topics.map((topic) => (
                                                        <div key={topic._id} className="group flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200/60 shadow-sm hover:border-indigo-200 transition-all">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>

                                                            {editingTopicId === topic._id ? (
                                                                // Edit Mode for Topic
                                                                <div className="flex flex-1 items-center gap-2">
                                                                    <input
                                                                        type="text"
                                                                        value={editTopicName}
                                                                        onChange={(e) => setEditTopicName(e.target.value)}
                                                                        className="flex-1 px-2 py-1 border border-slate-300 rounded text-sm"
                                                                        autoFocus
                                                                    />
                                                                    <button onClick={() => saveEditTopic(topic._id)} className="text-green-600 hover:bg-green-50 p-1 rounded">
                                                                        <Check className="w-4 h-4" />
                                                                    </button>
                                                                    <button onClick={cancelEditTopic} className="text-slate-400 hover:bg-slate-100 p-1 rounded">
                                                                        <X className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                // View Mode for Topic
                                                                <>
                                                                    <span className="flex-1 font-medium text-slate-700 text-sm">{topic.name}</span>
                                                                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all">
                                                                        <button
                                                                            onClick={() => startEditTopic(topic)}
                                                                            className="p-1.5 text-slate-400 hover:text-indigo-600 transition-all"
                                                                        >
                                                                            <Edit2 className="w-3.5 h-3.5" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteTopic(topic._id)}
                                                                            className="p-1.5 text-slate-400 hover:text-rose-500 transition-all"
                                                                        >
                                                                            <X className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-4 text-slate-400 text-sm italic">No topics added yet.</div>
                                                )}
                                            </div>

                                            {/* Add Topic Input */}
                                            <form onSubmit={(e) => handleAddTopic(e, unit._id)} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Add a new topic..."
                                                    className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                                    value={newTopicName}
                                                    onChange={(e) => setNewTopicName(e.target.value)}
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={!newTopicName || createTopicMutation.isPending}
                                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm shadow-sm hover:bg-indigo-700 transition-all disabled:opacity-50"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer - Add Unit */}
                <div className="p-4 bg-white border-t border-slate-100 z-10">
                    <form onSubmit={handleAddUnit} className="flex flex-col md:flex-row gap-3">
                        <div className="w-20">
                            <input
                                type="number"
                                placeholder="No."
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none transition-all font-bold text-center"
                                value={newUnitNumber}
                                onChange={(e) => setNewUnitNumber(e.target.value)}
                                required
                            />
                        </div>
                        <input
                            type="text"
                            placeholder="New Unit Name (e.g. Introduction to Programming)"
                            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none transition-all"
                            value={newUnitName}
                            onChange={(e) => setNewUnitName(e.target.value)}
                            required
                        />
                        <button
                            type="submit"
                            disabled={createUnitMutation.isPending}
                            className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Add Unit
                        </button>
                    </form>
                </div>

                <ConfirmationModal
                    isOpen={confirmModal.isOpen}
                    onClose={closeConfirmModal}
                    onConfirm={confirmModal.onConfirm}
                    title={confirmModal.title}
                    message={confirmModal.message}
                    isLoading={confirmModal.isLoading}
                />

            </div>
        </div>
    );
};

export default SubjectCurriculumModal;
