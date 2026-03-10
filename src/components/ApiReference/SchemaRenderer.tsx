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
            <div className="flex flex-col mb-4">
                <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider mb-2">One Of:</div>
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
            <div className="flex flex-col gap-3">
                {Object.entries(resolvedSchema.properties).map(([key, value]: [string, any]) => {
                    const resolvedValue = resolveRef(value, spec);
                    const type = resolvedValue.type || (resolvedValue.properties ? "object" : "any");
                    const typeClasses = {
                        string: "bg-sky-100 text-sky-700 border-sky-200",
                        number: "bg-amber-100 text-amber-700 border-amber-200",
                        integer: "bg-amber-100 text-amber-700 border-amber-200",
                        boolean: "bg-green-100 text-green-700 border-green-200",
                        object: "bg-purple-100 text-purple-700 border-purple-200",
                        array: "bg-orange-100 text-orange-700 border-orange-200",
                        any: "bg-slate-100 text-slate-600 border-slate-200"
                    }[type as string] || "bg-slate-100 text-slate-600 border-slate-200";

                    return (
                        <div key={key} className="bg-white border-2 border-solid border-slate-200 rounded-[9px] px-[14px] py-[10px] transition-all duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-teal-600 hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex items-center gap-2 mb-0">
                                    <span className="font-semibold">{key}</span>
                                    <span className={`text-[10px] font-bold uppercase px-2 py-[2px] rounded-full tracking-wide border ${typeClasses}`}>
                                        {type}
                                    </span>
                                    {(resolvedSchema.required || []).includes(key) && (
                                        <span className="text-red-500 font-bold">*</span>
                                    )}
                                </div>

                                {(resolvedValue.example !== undefined || resolvedValue.default !== undefined || resolvedValue.enum) && (
                                    <div className="flex gap-3 text-right flex-wrap justify-end">
                                        {resolvedValue.example !== undefined && (
                                            <div className="flex flex-col gap-[2px] items-end">
                                                {/* <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Example</span> */}
                                                <span className="font-mono text-[11px] text-purple-900 break-all whitespace-pre-wrap">{JSON.stringify(resolvedValue.example)}</span>
                                            </div>
                                        )}
                                        {resolvedValue.default !== undefined && (
                                            <div className="flex flex-col gap-[2px] items-end">
                                                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Default</span>
                                                <span className="font-mono text-[11px] text-purple-900 break-all whitespace-pre-wrap">{String(resolvedValue.default)}</span>
                                            </div>
                                        )}
                                        {resolvedValue.enum && (
                                            <div className="flex flex-col gap-[2px] items-end">
                                                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Enum</span>
                                                <span className="font-mono text-[11px] text-purple-900 break-all whitespace-pre-wrap">{resolvedValue.enum.join(", ")}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {resolvedValue.description && (
                                <div className="text-slate-500 text-[11px] mt-[7px] mb-[7px]">
                                    {resolvedValue.description}
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
            <div className="bg-white border-2 border-solid border-slate-200 rounded-[9px] px-[14px] py-[10px] transition-all duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-teal-600 hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">Items</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-[2px] rounded-full tracking-wide border bg-orange-100 text-orange-700 border-orange-200">array</span>
                </div>
                <SchemaRenderer schema={resolvedSchema.items} level={level + 1} spec={spec} />
            </div>
        );
    }

    return null;
}
