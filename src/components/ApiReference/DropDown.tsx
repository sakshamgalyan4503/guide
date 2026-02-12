import React from 'react';

interface Option {
    label: string;
    value: string;
}

interface DropDownProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    className?: string;
    style?: React.CSSProperties;
}

export const DropDown: React.FC<DropDownProps> = ({
    options,
    value,
    onChange,
    className = "yc-select",
    style
}) => {
    return (
        <select
            className={className}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={style}
        >
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    );
};

export default DropDown;
