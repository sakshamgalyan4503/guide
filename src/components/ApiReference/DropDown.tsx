import React, { useState, useRef, useEffect } from 'react';

export interface Option<T> {
    label: string;
    value: T;
    icon?: React.ReactNode;
}

interface DropDownProps<T> {
    options: Option<T>[];
    value: T;
    onChange: (value: T) => void;
    className?: string;
    style?: React.CSSProperties;
    placeholder?: string;
    label?: string;
    disabled?: boolean;
    variant?: 'default' | 'response' | 'dark';
}

export function DropDown<T>({
    options,
    value,
    onChange,
    className = "",
    style,
    placeholder = "Select...",
    label,
    disabled = false,
    variant = 'default'
}: DropDownProps<T>) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (option: Option<T>) => {
        if (disabled) return;
        onChange(option.value);
        setIsOpen(false);
    };

    return (
        <div
            className={`relative w-full font-sans flex flex-col gap-1 ${disabled ? 'opacity-60 pointer-events-none' : ''} ${variant === 'response' ? 'w-auto inline-block' : ''} ${className}`}
            style={style}
            ref={containerRef}
        >
            {label && (
                <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                    {label}
                </label>
            )}

            <div
                className={`flex items-center justify-between cursor-pointer select-none transition-all duration-200 
                ${variant === 'response' 
                    ? `px-4 py-2 rounded-lg text-[11px] font-bold border border-transparent 
                        ${String(value).startsWith('2') ? 'bg-green-100 text-teal-700 border-teal-700/20' : 'bg-red-50 text-red-500 border-red-500/20'}`
                    : variant === 'dark'
                    ? `bg-[#f0f0f0] border-none px-3 py-1.5 rounded-[4px] shadow-sm ${isOpen ? 'ring-2 ring-purple-900/20' : ''}`
                    : `bg-white border border-solid border-slate-200 px-3 py-2.5 rounded-lg hover:border-slate-300 shadow-sm ${isOpen ? 'border-purple-900 ring-4 ring-purple-900/10' : ''}`
                }`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <span className={`text-[13px] font-medium whitespace-nowrap overflow-hidden text-ellipsis ${variant === 'response' ? 'text-[11px] m-0 mr-1' : variant === 'dark' ? 'mr-3 text-[#2d2f32] font-semibold' : 'ml-1 mr-2 text-slate-800'} ${!selectedOption ? 'text-slate-500' : ''}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <span className={`flex items-center transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${variant === 'response' ? '-mt-[1px] text-slate-500' : variant === 'dark' ? 'text-[#2d2f32]' : 'text-slate-500'}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </span>
            </div>

            {isOpen && (
                <div className={`absolute left-0 mt-1 bg-white border border-solid border-slate-200 rounded-lg shadow-lg z-50 min-w-full overflow-y-auto p-1 animate-[yc-slide-down_0.15s_ease-out] ${variant === 'response' ? 'top-[calc(100%+4px)] w-[100px]' : variant === 'dark' ? 'top-[calc(100%+4px)] w-full rounded-md shadow-xl' : 'top-full w-full'}`}>
                    {options.map((option, index) => (
                        <div
                            key={index}
                            className={`flex items-center justify-between px-3 py-2 text-[13px] text-slate-800 cursor-pointer rounded-md transition-colors duration-100 hover:bg-slate-50 
                            ${variant === 'response' ? 'py-1.5 px-2.5 text-[11px]' : ''} 
                            ${value === option.value ? 'bg-purple-100 text-purple-900 font-semibold' : ''}`}
                            onClick={() => handleSelect(option)}
                        >
                            {option.label}
                            {value === option.value && (
                                <span className="flex items-center text-purple-900">
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default DropDown;

