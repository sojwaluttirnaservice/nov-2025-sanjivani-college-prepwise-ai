import React from 'react';
import { AlertCircle, X, Trash2 } from 'lucide-react';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmLabel = 'Delete',
    cancelLabel = 'Cancel',
    isDestructive = true,
    isLoading = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
                <div className="p-6 text-center">
                    <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDestructive ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}`}>
                        {isDestructive ? <Trash2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
                    <p className="text-slate-500 text-sm mb-6">{message}</p>

                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {cancelLabel}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`px-4 py-2 text-white font-medium rounded-lg shadow-sm transition-all disabled:opacity-70 flex items-center gap-2 ${isDestructive
                                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
                                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                                }`}
                        >
                            {isLoading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
