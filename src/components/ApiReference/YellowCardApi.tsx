"use client";

import { useEffect, useState, useCallback } from "react";
import yaml from "js-yaml";
import axios from "axios";
import SchemaRenderer from "./SchemaRenderer";
import { generateCode } from "./GenerateLanguage";
import DropDown from "./DropDown";
import "./YellowCardApi.css";
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
    <button className="yc-copy-btn" onClick={handleCopy}>
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
    <div className="yc-container">
      {/* MAIN */}
      <div className="yc-main">
        {/* LEFT DOCS (Section 2) */}
        <div className="yc-docs">
          <div className="yc-header">
            <span className={`yc-method yc-${currentMethod}`}>
              {currentMethod}
            </span>
            <span className="yc-path">{currentPath}</span>
          </div>

          <p className="yc-summary">{endpoint.summary}</p>

          {/* PARAMETERS SECTION (DOCS) */}
          {(endpoint.parameters || spec.paths[currentPath].parameters) && (
            <>
              <div className="yc-section-header" style={{ borderBottom: '1px solid var(--yc-border)', paddingBottom: '12px', marginBottom: '16px' }}>
                <div className="yc-body-title" style={{ fontSize: '14px', color: 'var(--yc-purple)' }}>Parameters</div>
              </div>
              <div className="yc-schema-properties">
                {[...(endpoint.parameters || []), ...(spec.paths[currentPath].parameters || [])].map((p: any, i: number) => {
                  const resolved = resolveRef(p, spec);
                  return (
                    <div key={i} className="yc-schema-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                        <div className="yc-schema-meta" style={{ marginBottom: 0 }}>
                          <span className="yc-schema-name">{resolved.name}</span>
                          <span className="yc-schema-type yc-type-any">{resolved.in}</span>
                          {resolved.required && <span className="yc-required">*</span>}
                        </div>

                        {((resolved.in === 'path' && pathParams[resolved.name]) || (resolved.in === 'query' && queryParams[resolved.name])) && (
                          <div style={{ display: 'flex', gap: '12px', textAlign: 'right', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            <div className="yc-schema-info-item" style={{ alignItems: 'flex-end' }}>
                              <span className="yc-schema-info-value">{resolved.in === 'path' ? pathParams[resolved.name] : queryParams[resolved.name]}</span>
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
              <div className="yc-section-header" style={{ borderBottom: '1px solid var(--yc-border)', paddingBottom: '12px', marginBottom: '16px', marginTop: 24 }}>
                <div className="yc-body-title" style={{ fontSize: '14px', color: 'var(--yc-purple)' }}>Request Body JSON</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="yc-schema-type">application/json</span>
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
              <div className="yc-section-header" style={{ marginTop: 40, borderBottom: '1px solid var(--yc-border)', paddingBottom: '12px', marginBottom: '16px' }}>
                <div className="yc-body-title" style={{ fontSize: '14px', color: 'var(--yc-purple)' }}>Example Response JSON</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="yc-schema-type">application/json</span>
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
        <div className="yc-playground">
          <div className="yc-topbar">
            <DropDown
              options={spec.servers.map((s: any) => ({ label: s.url, value: s.url }))}
              value={server}
              onChange={setServer}
            />

            <input
              placeholder="Authorization"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </div>

          {/* PARAMETER INPUTS (PLAYGROUND) */}
          {(Object.keys(pathParams).length > 0 || Object.keys(queryParams).length > 0) && (
            <div style={{ marginBottom: 20 }}>
              <div className="yc-section-header" style={{ borderBottom: '1px solid var(--yc-border)', paddingBottom: '8px', marginBottom: '12px' }}>
                <div className="yc-body-title" style={{ fontSize: '13px', color: 'var(--yc-purple)', fontWeight: 700 }}>Parameters</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Object.entries(pathParams).map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: 12, width: 100, fontWeight: 600 }}>{key} (path)</span>
                    <input
                      style={{ flex: 1, padding: '6px 10px', borderRadius: 6, border: '1px solid var(--yc-border)' }}
                      value={val}
                      onChange={(e) => setPathParams({ ...pathParams, [key]: e.target.value })}
                    />
                  </div>
                ))}
                {Object.entries(queryParams).map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: 12, width: 100, fontWeight: 600 }}>{key} (query)</span>
                    <input
                      style={{ flex: 1, padding: '6px 10px', borderRadius: 6, border: '1px solid var(--yc-border)' }}
                      value={val}
                      onChange={(e) => setQueryParams({ ...queryParams, [key]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="api-container">
            <div className="api-header">
              <span className={`method ${currentMethod.toLowerCase()}`}>{currentMethod}</span>
              <span className="endpoint">{currentPath}</span>

              <div className="header-actions">
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

            <div className="api-body">
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

            <div className="api-footer">
              <button
                onClick={execute}
                className="try-btn"
                disabled={loading}
                style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                {loading ? 'Executing...' : '▶ Try it'}
              </button>
            </div>
          </div>

          {response && (
            <>
              <div className="api-container">
                <div className="api-header">
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="yc-response-title" style={{ fontSize: '14px', color: 'var(--yc-purple)', fontWeight: 700, marginTop: 0, marginRight: '8px' }}>Actual Response</span>
                    <span className={`actual-response ${String(statusCode || 200).startsWith('2') ? 'success' : 'error'}`}>{statusCode || '200'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span>application/json</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', height: '100%', justifyContent: 'center' }}>
                      <CopyButton text={JSON.stringify(response, null, 2)} />
                    </div>
                  </div>
                </div>

                <pre className="yc-code" style={{ maxHeight: '200px', margin: 0 }}>
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            </>
          )}

          <div className="yc-playground-grid" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="api-container">
              <div className="api-header">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span className="yc-response-title" style={{ fontSize: '14px', color: 'var(--yc-purple)', fontWeight: 700, marginTop: 0, marginRight: '8px' }}>Example Response</span>
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
                    <span className={`actual-response ${String(exampleStatus).startsWith('2') ? 'success' : 'error'}`}>{exampleStatus}</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="yc-schema-type">application/json</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', height: '100%', justifyContent: 'center' }}>
                    <CopyButton text={exampleResponse} />
                  </div>
                </div>
              </div>
              <textarea
                className="yc-textarea-dark"
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
