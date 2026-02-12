import React from "react";
import Accordion from "./Accordion";

interface Props {
    schema: any;
    level?: number;
}

export default function SchemaRenderer({
    schema,
    level = 0,
}: Props) {
    if (!schema) return null;

    // Handles nested object rendering in accordions
    const renderNested = (key: string, value: any) => {
        return (
            <Accordion title={`Properties of ${key}`}>
                <SchemaRenderer schema={value} level={level + 1} />
            </Accordion>
        );
    };

    // OBJECT
    if (schema.type === "object" && schema.properties) {
        return (
            <div className="yc-schema-properties">
                {Object.entries(schema.properties).map(([key, value]: [string, any]) => (
                    <div key={key} className="yc-schema-card">
                        <div className="yc-schema-meta">
                            <span className="yc-schema-name">{key}</span>
                            <span className={`yc-schema-type yc-type-${value.type || (value.properties ? "object" : "any")}`}>
                                {value.type || (value.properties ? "object" : "any")}
                            </span>
                            {(schema.required || []).includes(key) && (
                                <span className="yc-required">REQUIRED</span>
                            )}
                        </div>

                        {value.description && (
                            <div className="yc-schema-desc">{value.description}</div>
                        )}

                        {(value.example !== undefined || value.default !== undefined || value.enum) && (
                            <div className="yc-schema-info-grid">
                                {value.example !== undefined && (
                                    <div className="yc-schema-info-item">
                                        <span className="yc-schema-info-label">Example</span>
                                        <span className="yc-schema-info-value">{String(value.example)}</span>
                                    </div>
                                )}
                                {value.default !== undefined && (
                                    <div className="yc-schema-info-item">
                                        <span className="yc-schema-info-label">Default</span>
                                        <span className="yc-schema-info-value">{String(value.default)}</span>
                                    </div>
                                )}
                                {value.enum && (
                                    <div className="yc-schema-info-item">
                                        <span className="yc-schema-info-label">Enum</span>
                                        <span className="yc-schema-info-value">{value.enum.join(", ")}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Nested Structures */}
                        {(value.type === "object" || value.properties) && renderNested(key, value)}
                        {value.type === "array" && value.items && (
                            <Accordion title={`Items in ${key}`}>
                                <SchemaRenderer schema={value.items} level={level + 1} />
                            </Accordion>
                        )}
                    </div>
                ))}
            </div>
        );
    }

    // ARRAY ROOT
    if (schema.type === "array" && schema.items) {
        return (
            <div className="yc-schema-card">
                <div className="yc-schema-meta">
                    <span className="yc-schema-name">Items</span>
                    <span className="yc-schema-type yc-type-array">array</span>
                </div>
                <SchemaRenderer schema={schema.items} level={level + 1} />
            </div>
        );
    }

    return null;
}
