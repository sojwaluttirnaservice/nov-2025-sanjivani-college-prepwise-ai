import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * Premium Custom Dropdown Component
 * @param {Object} props
 * @param {string} props.value - Currently selected value
 * @param {Function} props.onChange - Callback when value changes
 * @param {Array} props.options - Array of {value, label} objects
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.label - Label for the dropdown
 * @param {boolean} props.allowClear - Show clear button
 */
const Dropdown = ({
    value,
    onChange,
    options = [],
    placeholder = 'Select...',
    label,
    allowClear = true,
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);
    const displayText = selectedOption ? selectedOption.label : placeholder;

    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange('');
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {label && (
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-widest">
                    {label}
                </label>
            )}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full flex items-center justify-between gap-3 px-4 py-2.5 
                    bg-white rounded-xl border-2 transition-all
                    ${isOpen ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-slate-200 hover:border-slate-300'}
                    ${value ? 'text-slate-900 font-semibold' : 'text-slate-500'}
                `}
            >
                <span className="text-sm truncate">{displayText}</span>
                <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-xl border border-slate-200 shadow-2xl shadow-slate-200/50 py-2 max-h-64 overflow-y-auto">
                    {allowClear && value && (
                        <button
                            onClick={handleClear}
                            className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors border-b border-slate-100"
                        >
                            Clear Selection
                        </button>
                    )}

                    {options.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-slate-400 text-center">
                            No options available
                        </div>
                    ) : (
                        options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleSelect(option.value)}
                                className={`
                                    w-full px-4 py-2.5 text-left text-sm font-medium
                                    transition-all flex items-center justify-between
                                    ${value === option.value
                                        ? 'bg-indigo-50 text-indigo-900'
                                        : 'text-slate-700 hover:bg-slate-50'
                                    }
                                `}
                            >
                                <span>{option.label}</span>
                                {value === option.value && (
                                    <Check className="w-4 h-4 text-indigo-600" />
                                )}
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default Dropdown;
