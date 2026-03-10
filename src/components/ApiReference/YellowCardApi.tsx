"use client";

import { useEffect, useState, useCallback } from "react";
import yaml from "js-yaml";
import axios from "axios";
import SchemaRenderer from "./SchemaRenderer";
import { generateCode } from "./GenerateLanguage";
import DropDown from "./DropDown";
import { Check, CopyIcon } from "lucide-react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Props {
  yamlUrl: string;
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

/** Utility to generate an example JSON object from an OpenAPI schema */
const generateExampleFromSchema = (schema: any, spec: any): any => {
  if (!schema) return {};

  const resolved = resolveRef(schema, spec);

  if (resolved.example) return resolved.example;
  if (resolved.default !== undefined) return resolved.default;

  if (resolved.oneOf) {
    return generateExampleFromSchema(resolved.oneOf[0], spec);
  }

  if (resolved.type === "object" || resolved.properties) {
    const obj: any = {};
    const props = resolved.properties || {};
    for (const [key, value] of Object.entries(props)) {
      obj[key] = generateExampleFromSchema(value, spec);
    }
    return obj;
  }

  if (resolved.type === "array" && resolved.items) {
    return [generateExampleFromSchema(resolved.items, spec)];
  }

  // Fallbacks based on type
  const fallbacks: any = {
    string: "string",
    number: 0,
    integer: 0,
    boolean: false,
  };

  return fallbacks[resolved.type] !== undefined ? fallbacks[resolved.type] : null;
};

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  return (
    <button 
      className="bg-white border border-white/40 text-black px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-200 tracking-wider shadow-[0_1px_2px_rgba(26,159,165,0.2)] hover:bg-[#c1caca] hover:-translate-y-[1px] hover:shadow-[0_2px_4px_rgba(26,159,165,0.3)]" 
      onClick={handleCopy}
    >
      {copied ? <Check width={12} height={12} /> : <CopyIcon width={12} height={12} />}
    </button>
  );
};

export default function YellowCardApi({ yamlUrl }: Props) {
  const [spec, setSpec] = useState<any>(null);
  const [currentPath, setCurrentPath] = useState("");
  const [currentMethod, setCurrentMethod] = useState("");
  const [server, setServer] = useState("");
  const [token, setToken] = useState("");
  const [body, setBody] = useState("{}");
  const [exampleResponse, setExampleResponse] = useState("{}");
  const [response, setResponse] = useState<any>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("curl");
  const [pathParams, setPathParams] = useState<Record<string, string>>({});
  const [queryParams, setQueryParams] = useState<Record<string, string>>({});
  const [exampleStatus, setExampleStatus] = useState<string>("200");

  const [generatedCode, setGeneratedCode] = useState("");

  const getFullUrl = () => {
    let url = `${server}${currentPath}`;
    // Replace path params
    Object.entries(pathParams).forEach(([key, val]) => {
      url = url.replace(`{${key}}`, val);
    });
    // Append query params
    const q = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, val]) => {
      if (val) q.append(key, val);
    });
    const qs = q.toString();
    return qs ? `${url}?${qs}` : url;
  };

  // Update generated code when inputs change
  useEffect(() => {
    const updateCode = async () => {
      const code = await generateCode(currentMethod, getFullUrl(), token, body, language);
      setGeneratedCode(code);
    };
    updateCode();
  }, [currentMethod, currentPath, server, pathParams, queryParams, token, body, language]);

  const updateExamplesFromSpec = useCallback((parsedSpec: any, path: string, method: string) => {
    const endpoint = parsedSpec.paths[path][method];

    // Extraction of parameters
    const params = [...(endpoint.parameters || []), ...(parsedSpec.paths[path].parameters || [])];
    const newPathParams: Record<string, string> = {};
    const newQueryParams: Record<string, string> = {};

    params.forEach((p: any) => {
      const resolvedParam = resolveRef(p, parsedSpec);
      if (resolvedParam.in === "path") {
        newPathParams[resolvedParam.name] = String(resolvedParam.schema?.example || resolvedParam.schema?.default || `{${resolvedParam.name}}`);
      } else if (resolvedParam.in === "query") {
        newQueryParams[resolvedParam.name] = String(resolvedParam.schema?.example || resolvedParam.schema?.default || "");
      }
    });
    setPathParams(newPathParams);
    setQueryParams(newQueryParams);

    // Request Example
    const reqSchema = endpoint.requestBody?.content?.["application/json"]?.schema;
    if (reqSchema) {
      const example = generateExampleFromSchema(reqSchema, parsedSpec);
      setBody(JSON.stringify(example, null, 2));
    } else {
      setBody("{}");
    }

    // Response Example - scan for any successful response
    const successCode = Object.keys(endpoint.responses || {}).find(code => code.startsWith("2"));
    setExampleStatus(successCode || "200");
    const resSchema = endpoint.responses?.[successCode || "200"]?.content?.["application/json"]?.schema;

    if (resSchema) {
      const example = generateExampleFromSchema(resSchema, parsedSpec);
      setExampleResponse(JSON.stringify(example, null, 2));
    } else {
      setExampleResponse("{}");
    }
  }, []);

  useEffect(() => {
    const loadYaml = async () => {
      try {
        const res = await fetch(yamlUrl);
        const text = await res.text();
        const parsed = yaml.load(text) as any;

        setSpec(parsed);

        const firstPath = Object.keys(parsed.paths)[0];
        const firstMethod = Object.keys(parsed.paths[firstPath])[0];

        setCurrentPath(firstPath);
        setCurrentMethod(firstMethod);
        setServer(parsed.servers?.[0]?.url || "");

        // Populate initial examples
        updateExamplesFromSpec(parsed, firstPath, firstMethod);
      } catch (err) {
        console.error("Error loading YAML:", err);
      }
    };

    loadYaml();
  }, [yamlUrl, updateExamplesFromSpec]);

  if (!spec) return <div>Loading...</div>;

  const endpoint = spec.paths[currentPath][currentMethod];


  const execute = async () => {
    setLoading(true);
    setResponse(null);
    setStatusCode(null);
    try {
      let data = undefined;
      if (body && body !== "{}") {
        try {
          data = JSON.parse(body);
        } catch (e) {
          throw new Error("Invalid JSON in Request Body");
        }
      }

      const res = await axios({
        method: currentMethod,
        url: getFullUrl(),
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        data: data,
      });

      setResponse(res.data);
      setStatusCode(res.status);
    } catch (err: any) {
      setResponse(err.response?.data || err.message);
      setStatusCode(err.response?.status || 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col font-sans text-[14px] text-slate-800 bg-white border border-slate-200 rounded-xl overflow-hidden min-h-[700px] w-full">
      {/* MAIN */}
      <div className="flex-1 flex flex-col lg:flex-row items-start flex-wrap w-full min-w-0">
        {/* LEFT DOCS (Section 2) */}
        <div className="flex-1 p-[24px] lg:p-4 lg:border-r lg:border-b-0 border-b border-slate-200 lg:overflow-y-auto bg-white w-full">
          <div className="flex items-center gap-3 mb-3">
            <span className={`text-[11px] font-extrabold px-2 py-1 rounded-md text-white uppercase tracking-wider ${currentMethod.toLowerCase() === 'get' ? 'bg-emerald-500' : currentMethod.toLowerCase() === 'post' ? 'bg-purple-900' : currentMethod.toLowerCase() === 'put' ? 'bg-amber-500' : currentMethod.toLowerCase() === 'delete' ? 'bg-red-500' : 'bg-[#739c27]'}`}>
              {currentMethod}
            </span>
            <span className="font-mono font-semibold text-[15px] text-purple-900">{currentPath}</span>
          </div>

          <p className="text-[16px] leading-[1.4] text-slate-500 mb-[18px]">{endpoint.summary}</p>

          {/* PARAMETERS SECTION (DOCS) */}
          {(endpoint.parameters || spec.paths[currentPath].parameters) && (
            <>
              <div className="flex justify-between items-center" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
                <div className="text-[11px] font-bold uppercase text-slate-500 tracking-wider" style={{ fontSize: '14px', color: '#3b1c5b' }}>Parameters</div>
              </div>
              <div className="flex flex-col gap-3">
                {[...(endpoint.parameters || []), ...(spec.paths[currentPath].parameters || [])].map((p: any, i: number) => {
                  const resolved = resolveRef(p, spec);
                  return (
                    <div key={i} className="bg-white border-2 border-slate-200 rounded-[9px] px-[14px] py-[10px] transition-all duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-teal-600 hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                        <div className="flex items-center gap-2 mb-2" style={{ marginBottom: 0 }}>
                          <span className="font-semibold">{resolved.name}</span>
                          <span className="text-[10px] font-bold uppercase px-2 py-[2px] rounded-full tracking-wide border bg-slate-100 text-slate-600 border-slate-200">{resolved.in}</span>
                          {resolved.required && <span className="text-red-500 font-bold">*</span>}
                        </div>

                        {((resolved.in === 'path' && pathParams[resolved.name]) || (resolved.in === 'query' && queryParams[resolved.name])) && (
                          <div style={{ display: 'flex', gap: '12px', textAlign: 'right', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            <div className="flex flex-col gap-[2px]" style={{ alignItems: 'flex-end' }}>
                              <span className="font-mono text-[11px] text-purple-900 break-all whitespace-pre-wrap">{resolved.in === 'path' ? pathParams[resolved.name] : queryParams[resolved.name]}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      {resolved.description && (
                        <div style={{ fontSize: '11px', marginBottom: '7px', marginTop: '7px' }}>
                          <span style={{ fontWeight: 'bold' }}>
                            Description: {" "}
                          </span>
                          {resolved.description}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* REQUEST BODY */}
          {endpoint.requestBody && (
            <>
              <div className="flex justify-between items-center" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px', marginTop: 24 }}>
                <div className="text-[11px] font-bold uppercase text-slate-500 tracking-wider" style={{ fontSize: '14px', color: '#3b1c5b' }}>Request Body JSON</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="text-[10px] font-bold uppercase px-2 py-[2px] rounded-full tracking-wide border">application/json</span>
                </div>
              </div>

              <SchemaRenderer
                spec={spec}
                schema={
                  endpoint.requestBody.content["application/json"]
                    .schema
                }
              />
            </>
          )}

          {/* RESPONSE */}
          {endpoint.responses && (
            <>
              <div className="flex justify-between items-center" style={{ marginTop: 40, borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
                <div className="text-[11px] font-bold uppercase text-slate-500 tracking-wider" style={{ fontSize: '14px', color: '#3b1c5b' }}>Example Response JSON</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="text-[10px] font-bold uppercase px-2 py-[2px] rounded-full tracking-wide border">application/json</span>
                </div>
              </div>

              {Object.keys(endpoint.responses).filter(c => c.startsWith("2")).map(code => (
                <div key={code} style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--yc-teal)', marginBottom: 8 }}>Status {code}</div>
                  <SchemaRenderer
                    spec={spec}
                    schema={endpoint.responses[code].content?.["application/json"]?.schema}
                  />
                </div>
              ))}
            </>
          )}
        </div>

        {/* RIGHT PLAYGROUND (Section 3) */}
        <div className="flex-1 min-w-[320px] bg-slate-50 text-slate-800 p-8 flex flex-col gap-5 lg:rounded-xl border border-slate-200 box-border lg:overflow-x-hidden w-full lg:m-0 m-0 max-w-none">
          <div className="flex flex-col gap-3">
            <DropDown
              options={spec.servers.map((s: any) => ({ label: s.url, value: s.url }))}
              value={server}
              onChange={setServer}
            />

            <input
              placeholder="Authorization"
              className="bg-white border border-solid border-slate-200 text-slate-800 p-3 rounded-lg text-[13px] outline-none transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.05)] focus:border-purple-900 focus:shadow-[0_0_0_2px_rgba(59,28,91,0.1)]"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </div>

          {/* PARAMETER INPUTS (PLAYGROUND) */}
          {(Object.keys(pathParams).length > 0 || Object.keys(queryParams).length > 0) && (
            <div style={{ marginBottom: 20 }}>
              <div className="flex justify-between items-center" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '12px' }}>
                <div className="text-[11px] font-bold uppercase text-slate-500 tracking-wider" style={{ fontSize: '13px', color: '#3b1c5b', fontWeight: 700 }}>Parameters</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Object.entries(pathParams).map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: 12, width: 100, fontWeight: 600 }}>{key} (path)</span>
                    <input
                      className="flex-1 px-2.5 py-1.5 rounded-md border border-solid border-slate-200"
                      value={val}
                      onChange={(e) => setPathParams({ ...pathParams, [key]: e.target.value })}
                    />
                  </div>
                ))}
                {Object.entries(queryParams).map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: 12, width: 100, fontWeight: 600 }}>{key} (query)</span>
                    <input
                      className="flex-1 px-2.5 py-1.5 rounded-md border border-solid border-slate-200"
                      value={val}
                      onChange={(e) => setQueryParams({ ...queryParams, [key]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border border-solid border-slate-200 rounded-xl bg-white mb-5">
            <div className="flex items-center justify-between bg-slate-50 py-3 px-4 border-b border-solid border-slate-200 rounded-t-xl">
              <span className={`px-2.5 py-1 rounded-md text-white font-bold mr-2.5 uppercase ${currentMethod.toLowerCase() === 'get' ? 'bg-emerald-500' : currentMethod.toLowerCase() === 'post' ? 'bg-purple-900' : currentMethod.toLowerCase() === 'put' ? 'bg-amber-500' : currentMethod.toLowerCase() === 'delete' ? 'bg-red-500' : 'bg-[#739c27]'}`}>{currentMethod}</span>
              <span className="flex-1 ml-2.5">{currentPath}</span>

              <div className="flex w-[40%] justify-end gap-2">
                <div style={{ width: '100%' }}>
                  <DropDown
                    options={[
                      { label: 'cURL', value: 'curl' },
                      { label: 'Node.js', value: 'node' },
                      { label: 'Python', value: 'python' },
                      { label: 'Go', value: 'go' },
                      { label: 'PHP', value: 'php' },
                      { label: 'Ruby', value: 'ruby' },
                      { label: 'Java', value: 'java' },
                      { label: 'C#', value: 'csharp' }
                    ]}
                    value={language}
                    onChange={setLanguage}
                  />
                </div>
                <CopyButton text={generatedCode} />
              </div>
            </div>

            <div className="font-mono [&_*]:font-mono">
              <SyntaxHighlighter
                language="bash"
                style={oneDark}
                customStyle={{
                  maxHeight: '300px',
                  minHeight: '200px',
                  margin: 0,
                  padding: '16px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  borderRadius: '6px'
                }}
                codeTagProps={{ style: { fontFamily: 'monospace' } }}
              >
                {generatedCode}
              </SyntaxHighlighter>
            </div>

            <div className="flex justify-end bg-slate-50 py-3 px-4 border-t border-slate-200 rounded-b-xl">
              <button
                onClick={execute}
                className="bg-violet-600 text-white border-none py-2 px-[14px] rounded-[20px] font-medium transition-colors hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={loading}
                style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                {loading ? 'Executing...' : '▶ Try it'}
              </button>
            </div>
          </div>

          {response && (
            <>
              <div className="border border-solid border-slate-200 rounded-xl bg-white mb-5">
                <div className="flex items-center justify-between bg-slate-50 py-3 px-4 border-b border-solid border-slate-200 rounded-t-xl">
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="text-[11px] font-bold uppercase text-teal-600 tracking-wider mt-0 mr-2" style={{ fontSize: '14px', color: '#3b1c5b', fontWeight: 700 }}>Actual Response</span>
                    <span className={`px-2 py-[2px] rounded-md font-bold mr-2.5 uppercase text-[11px] text-white ${String(statusCode || 200).startsWith('2') ? 'bg-emerald-500' : 'bg-red-500'}`}>{statusCode || '200'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span>application/json</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', height: '100%', justifyContent: 'center' }}>
                      <CopyButton text={JSON.stringify(response, null, 2)} />
                    </div>
                  </div>
                </div>

                <pre className="bg-white text-slate-800 p-4 rounded-b-xl font-mono text-[13px] leading-[1.4] overflow-auto max-w-full" style={{ maxHeight: '200px', margin: 0 }}>
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            </>
          )}

          <div className="flex flex-col gap-4">
            <div className="border border-solid border-slate-200 rounded-xl bg-white mb-5">
              <div className="flex items-center justify-between bg-slate-50 py-3 px-4 border-b border-solid border-slate-200 rounded-t-xl">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span className="text-[11px] font-bold uppercase text-teal-600 tracking-wider mt-0 mr-2" style={{ fontSize: '14px', color: '#3b1c5b', fontWeight: 700 }}>Example Response</span>
                  {endpoint.responses && Object.keys(endpoint.responses).length > 1 ? (
                    <div style={{ width: '80px' }}>
                      <DropDown
                        options={Object.keys(endpoint.responses).map(code => ({ label: code, value: code }))}
                        value={exampleStatus}
                        variant="response"
                        onChange={(newStatus) => {
                          setExampleStatus(newStatus);
                          const resSchema = endpoint.responses[newStatus]?.content?.["application/json"]?.schema;
                          if (resSchema) {
                            const example = generateExampleFromSchema(resSchema, spec);
                            setExampleResponse(JSON.stringify(example, null, 2));
                          } else {
                            setExampleResponse("{}");
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <span className={`px-2 py-[2px] rounded-md font-bold mr-2.5 uppercase text-[11px] text-white ${String(exampleStatus).startsWith('2') ? 'bg-emerald-500' : 'bg-red-500'}`}>{exampleStatus}</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="text-[10px] font-bold uppercase px-2 py-[2px] rounded-full tracking-wide border bg-slate-100 text-slate-600 border-slate-200">application/json</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', height: '100%', justifyContent: 'center' }}>
                    <CopyButton text={exampleResponse} />
                  </div>
                </div>
              </div>
              <textarea
                className="w-full max-w-full min-h-[200px] max-h-[250px] bg-white text-slate-800 font-mono text-[13px] p-4 rounded-b-xl resize-y border-0 border-l-[3px] border-l-teal-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] overflow-y-auto outline-none focus:ring-0"
                placeholder="Example Response"
                value={exampleResponse}
                onChange={(e) => setExampleResponse(e.target.value)}
                style={{
                  border: 'none',
                  borderTop: 'none',
                  borderTopLeftRadius: 0,
                  borderTopRightRadius: 0,
                  minHeight: '200px',
                  width: '100%',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
