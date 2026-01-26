import React from 'react';
import { ChevronDown } from 'lucide-react';

export const Accordion = ({ children, className = '' }) => {
    return <div className={`space-y-4 ${className}`}>{children}</div>;
};

export const AccordionItem = ({ title, subtitle, children, isOpen, onToggle, icon: Icon, action }) => {
    return (
        <div
            className={`
                bg-white rounded-3xl border transition-all duration-300 overflow-hidden
                ${isOpen
                    ? 'border-indigo-200 shadow-xl shadow-indigo-50 ring-4 ring-indigo-50/50'
                    : 'border-slate-100 shadow-sm hover:border-indigo-100 hover:shadow-lg'
                }
            `}
        >
            <div
                onClick={onToggle}
                className="w-full px-6 py-5 flex items-center justify-between gap-4 cursor-pointer select-none"
            >
                <div className="flex items-center gap-5 flex-1 min-w-0">
                    {Icon && (
                        <div className={`
                            p-3 rounded-2xl transition-colors shrink-0
                            ${isOpen ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:text-indigo-600'}
                        `}>
                            <Icon className="w-6 h-6" />
                        </div>
                    )}
                    <div className="text-left">
                        <h3 className={`text-lg font-bold transition-colors ${isOpen ? 'text-indigo-900' : 'text-gray-900'}`}>
                            {title}
                        </h3>
                        {subtitle && (
                            <div className="mt-1">{subtitle}</div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {action && <div onClick={e => e.stopPropagation()}>{action}</div>}
                    <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border
                        ${isOpen
                            ? 'bg-indigo-50 text-indigo-600 border-indigo-100 rotate-180'
                            : 'bg-white text-slate-400 border-slate-100'
                        }
                    `}>
                        <ChevronDown className="w-5 h-5" />
                    </div>
                </div>
            </div>

            <div
                className={`
                    transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden
                    ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                `}
            >
                <div className="p-6 pt-0 border-t border-slate-50 bg-slate-50/30">
                    <div className="pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};
