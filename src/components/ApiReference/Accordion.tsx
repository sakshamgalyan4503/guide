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
        <div className={`yc-accordion ${isExpanded ? 'expanded' : ''}`}>
            <div
                className="yc-accordion-header"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="yc-accordion-title">{title}</div>
                <div className="yc-accordion-icon">
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
                <div className="yc-accordion-content">
                    {children}
                </div>
            )}
        </div>
    );
};

export default Accordion;
