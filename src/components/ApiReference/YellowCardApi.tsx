"use client";

import { useEffect, useState, useCallback } from "react";
import yaml from "js-yaml";
import axios from "axios";
import SchemaRenderer from "./SchemaRenderer";
import { generateCode } from "./GenerateLanguage";
import DropDown from "./DropDown";
import "./YellowCardApi.css";

interface Props {
  yamlUrl: string;
}

/** Utility to generate an example JSON object from an OpenAPI schema */
const generateExampleFromSchema = (schema: any): any => {
  if (!schema) return {};

  if (schema.example) return schema.example;
  if (schema.default !== undefined) return schema.default;

  if (schema.type === "object" && schema.properties) {
    const obj: any = {};
    for (const [key, value] of Object.entries(schema.properties)) {
      obj[key] = generateExampleFromSchema(value);
    }
    return obj;
  }

  if (schema.type === "array" && schema.items) {
    return [generateExampleFromSchema(schema.items)];
  }

  // Fallbacks based on type
  const fallbacks: any = {
    string: "string",
    number: 0,
    integer: 0,
    boolean: false,
  };

  return fallbacks[schema.type] !== undefined ? fallbacks[schema.type] : null;
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
      {copied ? "COPIED!" : "COPY"}
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
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("curl");

  const updateExamplesFromSpec = useCallback((parsedSpec: any, path: string, method: string) => {
    const endpoint = parsedSpec.paths[path][method];

    // Request Example
    const reqSchema = endpoint.requestBody?.content?.["application/json"]?.schema;
    if (reqSchema) {
      const example = generateExampleFromSchema(reqSchema);
      setBody(JSON.stringify(example, null, 2));
    } else {
      setBody("{}");
    }

    // Response Example
    const resSchema = (endpoint.responses?.["200"] || endpoint.responses?.["201"])
      ?.content?.["application/json"]?.schema;
    if (resSchema) {
      const example = generateExampleFromSchema(resSchema);
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
        url: `${server}${currentPath}`,
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        data: data,
      });

      setResponse(res.data);
    } catch (err: any) {
      setResponse(err.response?.data || err.message);
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

          {/* REQUEST BODY */}
          {endpoint.requestBody && (
            <>
              <div className="yc-section-header" style={{ borderBottom: '1px solid var(--yc-border)', paddingBottom: '12px', marginBottom: '16px' }}>
                <div className="yc-body-title" style={{ fontSize: '14px', color: 'var(--yc-purple)' }}>Request Body JSON</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="yc-schema-type">application/json</span>
                </div>
              </div>

              <SchemaRenderer
                schema={
                  endpoint.requestBody.content["application/json"]
                    .schema
                }
              />
            </>
          )}

          {/* RESPONSE */}
          {endpoint.responses?.["200"] && (
            <>
              <div className="yc-section-header" style={{ marginTop: 40, borderBottom: '1px solid var(--yc-border)', paddingBottom: '12px', marginBottom: '16px' }}>
                <div className="yc-body-title" style={{ fontSize: '14px', color: 'var(--yc-purple)' }}>Example Response JSON</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="yc-schema-type">application/json</span>
                </div>
              </div>

              <SchemaRenderer
                schema={
                  endpoint.responses["200"].content[
                    "application/json"
                  ].schema
                }
              />
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

          <div className="yc-playground-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            <div>
              <div className="yc-section-header" style={{ borderBottom: '1px solid var(--yc-border)', paddingBottom: '12px', marginBottom: '16px' }}>
                <div className="yc-body-title" style={{ fontSize: '14px', color: 'var(--yc-purple)', fontWeight: 700 }}>Request Body JSON</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CopyButton text={body} />
                  <span className="yc-schema-type">application/json</span>
                </div>
              </div>
              <textarea
                className="yc-textarea-dark"
                placeholder="Request Body JSON"
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>

            <div>
              <div className="yc-section-header" style={{ borderBottom: '1px solid var(--yc-border)', paddingBottom: '12px', marginBottom: '16px' }}>
                <div className="yc-body-title" style={{ fontSize: '14px', color: 'var(--yc-purple)', fontWeight: 700 }}>Example Response JSON</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CopyButton text={exampleResponse} />
                  <span className="yc-schema-type">application/json</span>
                </div>
              </div>
              <pre className="yc-code" style={{ maxHeight: '200px', margin: 0 }}>
                {exampleResponse}
              </pre>
            </div>
          </div>

          <button
            className="yc-button"
            onClick={execute}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send API Request"}
          </button>

          <div style={{ marginTop: '20px' }}>
            <div className="yc-section-header" style={{ borderBottom: '1px solid var(--yc-border)', paddingBottom: '12px', marginBottom: '16px' }}>
              <DropDown
                options={[
                  { label: 'cURL', value: 'curl' },
                  { label: 'Node.js', value: 'node' },
                  { label: 'Python', value: 'python' }
                ]}
                value={language}
                onChange={setLanguage}
              />
            </div>
          </div>

          <div className="yc-section-header" style={{ marginTop: '32px', borderBottom: '1px solid var(--yc-border)', paddingBottom: '12px', marginBottom: '16px' }}>
            <div className="yc-body-title" style={{ fontSize: '14px', color: 'var(--yc-purple)', fontWeight: 700 }}>Generated Code</div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <CopyButton text={generateCode(currentMethod, `${server}${currentPath}`, token, body, language)} />
            </div>
          </div>
          <pre className="yc-code" style={{ maxHeight: '200px', margin: 0 }}>
            {generateCode(currentMethod, `${server}${currentPath}`, token, body, language)}
          </pre>

          {response && (
            <>
              <div className="yc-section-header" style={{ marginTop: '40px', borderBottom: '1px solid var(--yc-border)', paddingBottom: '12px', marginBottom: '16px' }}>
                <div className="yc-response-title" style={{ fontSize: '14px', color: 'var(--yc-purple)', fontWeight: 700, marginTop: 0 }}>Actual Response</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CopyButton text={JSON.stringify(response, null, 2)} />
                  <span className="yc-schema-type">application/json</span>
                </div>
              </div>
              <pre className="yc-code" style={{ maxHeight: '200px', margin: 0 }}>
                {JSON.stringify(response, null, 2)}
              </pre>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
