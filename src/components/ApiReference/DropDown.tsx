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
}

export function DropDown<T>({
    options,
    value,
    onChange,
    className = "",
    style,
    placeholder = "Select...",
    label,
    disabled = false
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
            className={`yc-dropdown-container ${disabled ? 'yc-disabled' : ''} ${className}`}
            style={style}
            ref={containerRef}
        >
            {label && (
                <label className="yc-dropdown-label">
                    {label}
                </label>
            )}

            <div
                className={`yc-dropdown-trigger ${isOpen ? 'open' : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <span className={`yc-dropdown-value ${!selectedOption ? 'placeholder' : ''}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <span className="yc-dropdown-arrow">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </span>
            </div>

            {isOpen && (
                <div className="yc-dropdown-menu">
                    {options.map((option, index) => (
                        <div
                            key={index}
                            className={`yc-dropdown-item ${value === option.value ? 'selected' : ''}`}
                            onClick={() => handleSelect(option)}
                        >
                            {option.label}
                            {value === option.value && (
                                <span className="yc-check-icon">
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

