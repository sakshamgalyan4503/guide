import React from "react";
import Accordion from "./Accordion";

interface Props {
    schema: any;
    level?: number;
    spec: any;
}

/** Utility to resolve $ref in schema */
const resolveRef = (schema: any, spec: any): any => {
    if (!schema || !schema.$ref) return schema;
    const refPath = schema.$ref.replace("#/", "").split("/");
    let current = spec;
    for (const part of refPath) {
        current = current?.[part];
    }
    return current;
};

export default function SchemaRenderer({
    schema,
    level = 0,
    spec,
}: Props) {
    if (!schema) return null;

    // Resolve ref if present at this level
    const resolvedSchema = resolveRef(schema, spec);

    // Handles nested object rendering in accordions
    const renderNested = (key: string, value: any) => {
        return (
            <Accordion title={`Properties of ${key}`}>
                <SchemaRenderer schema={value} level={level + 1} spec={spec} />
            </Accordion>
        );
    };

    // Handle oneOf
    if (resolvedSchema.oneOf) {
        return (
            <div className="yc-schema-oneof">
                <div className="yc-schema-info-label" style={{ marginBottom: 8 }}>One Of:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {resolvedSchema.oneOf.map((s: any, i: number) => (
                        <div key={i} style={{ borderLeft: '2px solid var(--yc-teal)', paddingLeft: 12 }}>
                            <SchemaRenderer schema={s} level={level + 1} spec={spec} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // OBJECT
    if ((resolvedSchema.type === "object" || resolvedSchema.properties) && resolvedSchema.properties) {
        return (
            <div className="yc-schema-properties">
                {Object.entries(resolvedSchema.properties).map(([key, value]: [string, any]) => {
                    const resolvedValue = resolveRef(value, spec);
                    const type = resolvedValue.type || (resolvedValue.properties ? "object" : "any");

                    return (
                        <div key={key} className="yc-schema-card">
                            <div className="yc-schema-meta">
                                <span className="yc-schema-name">{key}</span>
                                <span className={`yc-schema-type yc-type-${type}`}>
                                    {type}
                                </span>
                                {(resolvedSchema.required || []).includes(key) && (
                                    <span className="yc-required">*</span>
                                )}
                            </div>

                            {resolvedValue.description && (
                                <div className="yc-schema-desc">{resolvedValue.description}</div>
                            )}

                            {(resolvedValue.example !== undefined || resolvedValue.default !== undefined || resolvedValue.enum) && (
                                <div className="yc-schema-info-grid">
                                    {resolvedValue.example !== undefined && (
                                        <div className="yc-schema-info-item">
                                            <span className="yc-schema-info-label">Example</span>
                                            <span className="yc-schema-info-value">{JSON.stringify(resolvedValue.example)}</span>
                                        </div>
                                    )}
                                    {resolvedValue.default !== undefined && (
                                        <div className="yc-schema-info-item">
                                            <span className="yc-schema-info-label">Default</span>
                                            <span className="yc-schema-info-value">{String(resolvedValue.default)}</span>
                                        </div>
                                    )}
                                    {resolvedValue.enum && (
                                        <div className="yc-schema-info-item">
                                            <span className="yc-schema-info-label">Enum</span>
                                            <span className="yc-schema-info-value">{resolvedValue.enum.join(", ")}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Nested Structures */}
                            {(resolvedValue.type === "object" || resolvedValue.properties || resolvedValue.oneOf) && renderNested(key, resolvedValue)}
                            {resolvedValue.type === "array" && resolvedValue.items && (
                                <Accordion title={`Items in ${key}`}>
                                    <SchemaRenderer schema={resolvedValue.items} level={level + 1} spec={spec} />
                                </Accordion>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    // ARRAY ROOT
    if (resolvedSchema.type === "array" && resolvedSchema.items) {
        return (
            <div className="yc-schema-card">
                <div className="yc-schema-meta">
                    <span className="yc-schema-name">Items</span>
                    <span className="yc-schema-type yc-type-array">array</span>
                </div>
                <SchemaRenderer schema={resolvedSchema.items} level={level + 1} spec={spec} />
            </div>
        );
    }

    return null;
}
