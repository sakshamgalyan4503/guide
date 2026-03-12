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
import Tabs from "./Tab";

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
  const [activeTab, setActiveTab] = useState<string>("description");

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
          <div className="flex items-center gap-3 mb-3 bg-gray-100 rounded-xl">
            <span
              className={`text-lg pl-4 font-bold m-4 uppercase
                    ${currentMethod.toLowerCase() === 'get' ? 'text-blue-500' :
                  currentMethod.toLowerCase() === 'post' ? 'text-green-700' :
                    currentMethod.toLowerCase() === 'put' ? 'text-amber-500' :
                      currentMethod.toLowerCase() === 'delete' ? 'text-red-500' : 'bg-[#739c27]'}`}
            >
              {currentMethod}
            </span>

            <span className="border-l-2 border-gray-300">
              {server}{currentPath}
            </span>
          </div>
          <Tabs
            tabs={[
              { label: "Description", value: "description" },
              { label: "Request parameters", value: "requestParameters" },
              { label: "Response parameters", value: "responseParameters" },
            ]}
            defaultTab={activeTab}
            onChange={(val) => setActiveTab(String(val))}
          />
          {activeTab === "description" && (
            <div className="mt-4">
              <p className="text-[16px] leading-[1.4] text-slate-500 mb-6">{endpoint.summary}</p>
              {/* PARAMETERS SECTION (DOCS) */}
              {(endpoint.parameters || spec.paths[currentPath].parameters) && (
                <>
                  <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-4">
                    <div className="font-bold uppercase tracking-wider text-[14px] text-[#3b1c5b]">Parameters</div>
                  </div>
                  <div className="flex flex-col gap-3">
                    {[...(endpoint.parameters || []), ...(spec.paths[currentPath].parameters || [])].map((p: any, i: number) => {
                      const resolved = resolveRef(p, spec);
                      return (
                        <div key={i} className="bg-white border-2 border-slate-200 rounded-[9px] px-[14px] py-[10px] transition-all duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-teal-600 hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex items-center gap-2 mb-0">
                              <span className="font-semibold">{resolved.name}</span>
                              <span className="text-[10px] font-bold uppercase px-2 py-[2px] rounded-full tracking-wide border bg-slate-100 text-slate-600 border-slate-200">{resolved.in}</span>
                              {resolved.required && <span className="text-red-500 font-bold">*</span>}
                            </div>

                            {((resolved.in === 'path' && pathParams[resolved.name]) || (resolved.in === 'query' && queryParams[resolved.name])) && (
                              <div className="flex gap-3 text-right flex-wrap justify-end">
                                <div className="flex flex-col gap-[2px] items-end">
                                  <span className="font-mono text-[11px] text-purple-900 break-all whitespace-pre-wrap">{resolved.in === 'path' ? pathParams[resolved.name] : queryParams[resolved.name]}</span>
                                </div>
                              </div>
                            )}
                          </div>
                          {resolved.description && (
                            <div className="text-[11px] my-[7px]">
                              {resolved.description}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "requestParameters" && (
            <div className="">
              {/* REQUEST BODY */}
              {endpoint.requestBody && (
                <>
                  <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-4 mt-6">
                    <div className="font-bold uppercase tracking-wider text-[14px] text-[#3b1c5b]">Request Body JSON</div>
                    <div className="flex items-center gap-3">
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
            </div>
          )}

          {activeTab === "responseParameters" && (
            <div className="mt-4">
              {/* RESPONSE PARAMETERS SECTION (DOCS) */}
              {endpoint.responses && (
                <>
                  <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-4">
                    <div className="font-bold uppercase tracking-wider text-[14px] text-[#3b1c5b]">Response Parameters</div>
                  </div>
                  <div className="flex flex-col gap-3">
                    {Object.entries(endpoint.responses).map(([code, res]: [string, any], i: number) => {
                      const resolved = resolveRef(res, spec);
                      const schema = resolved.content?.["application/json"]?.schema;
                      if (!schema) return null;

                      const example = generateExampleFromSchema(schema, spec);

                      return (
                        <div key={i} className="bg-white border-2 border-slate-200 rounded-[9px] px-[14px] py-[10px] transition-all duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-teal-600 hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex items-center gap-2 mb-0">
                              <span className="font-semibold">{code}</span>
                              <span className="text-[10px] font-bold uppercase px-2 py-[2px] rounded-full tracking-wide border bg-slate-100 text-slate-600 border-slate-200">{resolved.in}</span>
                              {resolved.required && <span className="text-red-500 font-bold">*</span>}
                            </div>

                            {((resolved.in === 'path' && pathParams[resolved.name]) || (resolved.in === 'query' && queryParams[resolved.name])) && (
                              <div className="flex gap-3 text-right flex-wrap justify-end">
                                <div className="flex flex-col gap-[2px] items-end">
                                  <span className="font-mono text-[11px] text-purple-900 break-all whitespace-pre-wrap">{resolved.in === 'path' ? pathParams[resolved.name] : queryParams[resolved.name]}</span>
                                </div>
                              </div>
                            )}
                          </div>
                          {resolved.description && (
                            <div className="text-[11px] my-[7px]">
                              <span className="font-bold">
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
            </div>
          )}

          {/* RESPONSE */}
          {/* {endpoint.responses && (
            <>
              <div className="flex justify-between items-center mt-10 border-b border-slate-200 pb-3 mb-4">
                <div className="font-bold uppercase tracking-wider text-[14px] text-[#3b1c5b]">Example Response JSON</div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase px-2 py-[2px] rounded-full tracking-wide border">application/json</span>
                </div>
              </div>

              {Object.keys(endpoint.responses).filter(c => c.startsWith("2")).map(code => (
                <div key={code} className="mb-5">
                  <div className="text-xs font-bold text-teal-600 mb-2">Status {code}</div>
                  <SchemaRenderer
                    spec={spec}
                    schema={endpoint.responses[code].content?.["application/json"]?.schema}
                  />
                </div>
              ))}
            </>
          )} */}
        </div>

        {/* RIGHT PLAYGROUND (Section 3) */}
        <div className="flex-1 min-w-[320px] bg-slate-50 text-slate-800 p-8 flex flex-col gap-5 lg:rounded-xl border border-slate-200 box-border lg:overflow-x-hidden w-full lg:m-0 m-0 max-w-none">
          <div className="flex flex-col">
            <div className="mt-3 ">Server</div>
            <DropDown
              options={spec.servers.map((s: any) => ({ label: s.url, value: s.url }))}
              value={server}
              onChange={setServer}
            />

            <div className="mt-3 ">Authorization</div>
            <input
              placeholder="Enter Auth Key"
              className="bg-white border border-solid border-slate-200 text-slate-800 p-3 rounded-lg text-[13px] outline-none transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.05)] focus:border-purple-900 focus:shadow-[0_0_0_2px_rgba(59,28,91,0.1)]"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </div>

          {/* PARAMETER INPUTS (PLAYGROUND) */}
          {(Object.keys(pathParams).length > 0 || Object.keys(queryParams).length > 0) && (
            <div className="mb-5">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-3">
                <div className="font-bold uppercase tracking-wider text-[13px] text-[#3b1c5b]">Parameters</div>
              </div>
              <div className="flex flex-col gap-3">
                {Object.entries(pathParams).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-xs w-[100px] font-semibold">{key} (path)</span>
                    <input
                      className="flex-1 px-2.5 py-1.5 rounded-md border border-solid border-slate-200"
                      value={val}
                      onChange={(e) => setPathParams({ ...pathParams, [key]: e.target.value })}
                    />
                  </div>
                ))}
                {Object.entries(queryParams).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-xs w-[100px] font-semibold">{key} (query)</span>
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

          <div className="rounded-xl bg-[#282a2e] mb-5 overflow-hidden">
            <div className="flex items-center justify-between bg-[#282a2e] py-3 px-4 border-b border-[#3e4043]">

              <div className="w-[100px]">
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
                  variant="dark"
                />
              </div>

              <div className="flex items-center justify-end gap-3 shrink-0">
                <button
                  onClick={execute}
                  className={`bg-white text-slate-800 border-none py-1.5 px-3 flex items-center gap-2 rounded-md transition-colors hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed ${loading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  disabled={loading}
                >
                  <span className="text-[10px]">▶</span> {loading ? 'Running...' : 'Run'}
                </button>
                <div className="text-gray-400 hover:text-white transition-colors flex items-center justify-center">
                  <CopyButton text={generatedCode} />
                </div>
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
                  borderRadius: '0 0 12px 12px'
                }}
                codeTagProps={{ style: { fontFamily: 'monospace' } }}
              >
                {generatedCode}
              </SyntaxHighlighter>
            </div>
          </div>

          {response && (
            <>
              <div className="border border-solid border-slate-200 rounded-xl bg-white mb-5">
                <div className="flex items-center justify-between bg-slate-50 py-3 px-4 border-b border-solid border-slate-200 rounded-t-xl">
                  <div className="flex items-center">
                    <span className="text-[14px] font-bold uppercase text-[#3b1c5b] tracking-wider mt-0 mr-2">Actual Response</span>
                    <span className={`px-2 py-[2px] rounded-md font-bold mr-2.5 uppercase text-[11px] text-white ${String(statusCode || 200).startsWith('2') ? 'bg-emerald-500' : 'bg-red-500'}`}>{statusCode || '200'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>application/json</span>
                    <div className="flex items-center gap-3 h-full justify-center">
                      <CopyButton text={JSON.stringify(response, null, 2)} />
                    </div>
                  </div>
                </div>

                <SyntaxHighlighter
                  language="bash"
                  style={oneDark}
                  customStyle={{
                    maxHeight: '300px',
                    minHeight: '100px',
                    margin: 0,
                    padding: '16px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    borderRadius: '0 0 12px 12px'
                  }}
                  codeTagProps={{ style: { fontFamily: 'monospace' } }}
                >
                  {JSON.stringify(response, null, 2)}
                </SyntaxHighlighter>
              </div>
            </>
          )}

          <div className="flex flex-col gap-4">
            <div className="border border-solid border-slate-200 rounded-xl bg-white mb-5">
              <div className="flex items-center justify-between bg-slate-50 py-3 px-4 border-b border-solid border-slate-200 rounded-t-xl">
                <div className="flex items-center">
                  <span className="text-[14px] font-bold uppercase text-[#3b1c5b] tracking-wider mt-0 mr-2">Example Response</span>
                  {endpoint.responses && Object.keys(endpoint.responses).length > 1 ? (
                    <div className="w-[80px]">
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
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase px-4 py-2 rounded-lg tracking-wide border bg-slate-100 text-slate-600 border-slate-200">application/json</span>
                  <div className="flex items-center gap-3 h-full justify-center">
                    <CopyButton text={exampleResponse} />
                  </div>
                </div>
              </div>
              <SyntaxHighlighter
                  language="bash"
                  style={oneDark}
                  customStyle={{
                    maxHeight: '300px',
                    minHeight: '100px',
                    margin: 0,
                    padding: '16px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    borderRadius: '0 0 12px 12px'
                  }}
                  codeTagProps={{ style: { fontFamily: 'monospace' } }}
                >
                  {exampleResponse}
                </SyntaxHighlighter>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}
