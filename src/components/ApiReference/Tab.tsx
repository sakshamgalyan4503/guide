import React, { useState } from "react";

export interface TabItem {
  label: string;
  value: string;
}

interface TabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  onChange?: (value: string) => void;
  variant?: "default" | "boxed";
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  onChange,
  variant = "default",
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.value);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const handleChange = (value: string) => {
    setActiveTab(value);
    onChange?.(value);
  };

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          ...(variant === "boxed"
            ? { backgroundColor: "#e5e7eb", padding: "0.25rem" }
            : { borderBottom: "1px solid #d1d5db" }),
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;
          const isHovered = hoveredTab === tab.value;

          return (
            <button
              key={tab.value}
              onClick={() => handleChange(tab.value)}
              onMouseEnter={() => setHoveredTab(tab.value)}
              onMouseLeave={() => setHoveredTab(null)}
              style={{
                padding: "0.75rem 0.5rem",
                fontSize: "0.8rem",
                lineHeight: "1rem",
                fontWeight: 500,
                transitionProperty: "all",
                transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                transitionDuration: "150ms",
                cursor: "pointer",
                background: "transparent",
                border: "none",
                ...(variant === "default"
                  ? isActive
                    ? {
                        borderBottom: "2px solid #9333ea",
                        color: "#9333ea",
                      }
                    : {
                        borderBottom: "2px solid transparent",
                        color: isHovered ? "#374151" : "#6b7280",
                      }
                  : {}),
                ...(variant === "boxed"
                  ? isActive
                    ? {
                        backgroundColor: "#ffffff",
                        border: "1px solid #9333ea",
                        color: "#9333ea",
                      }
                    : {
                        color: isHovered ? "#1f2937" : "#4b5563",
                      }
                  : {}),
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Tabs;