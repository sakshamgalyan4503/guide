import React, { useState } from 'react';

interface AccordionProps {
    title: React.ReactNode;
    children: React.ReactNode;
    initialExpanded?: boolean;
}

export const Accordion: React.FC<AccordionProps> = ({
    title,
    children,
    initialExpanded = false
}) => {
    const [isExpanded, setIsExpanded] = useState(initialExpanded);

    return (
        <div className={`border border-solid border-slate-200 rounded-lg bg-white mt-2 overflow-hidden ${isExpanded ? 'expanded' : ''}`}>
            <div
                className="flex justify-between items-center px-[14px] py-[10px] bg-slate-50 cursor-pointer select-none transition-colors duration-200 hover:bg-slate-100"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="text-[13px] font-semibold text-purple-900">{title}</div>
                <div className={`transition-transform duration-200 text-slate-500 ${isExpanded ? 'rotate-180' : ''}`}>
                    <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>
            </div>
            {isExpanded && (
                <div className="p-3 border-t border-solid border-slate-200 bg-white">
                    {children}
                </div>
            )}
        </div>
    );
};

export default Accordion;
