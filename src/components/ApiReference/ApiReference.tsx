"use client";

import { useState } from "react";
import axios from "axios";

interface Props {
  spec: any;
  path: string;
  method: string;
}

export default function CompactApiReference({
  spec,
  path,
  method,
}: Props) {
  const endpoint = spec.paths[path][method];
  const baseUrl = spec.servers?.[0]?.url;

  const [params, setParams] = useState<any>({});
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("curl");

  const execute = async () => {
    setLoading(true);
    try {
      const res = await axios({
        method,
        url: `${baseUrl}${path}`,
        params,
      });

      setResponse(res.data);
    } catch (err: any) {
      setResponse(err.response?.data || err.message);
    }
    setLoading(false);
  };

  const codeSamples: any = {
    curl: `curl -X ${method.toUpperCase()} "${baseUrl}${path}"`,
    node: `import axios from "axios";

axios.${method}("${baseUrl}${path}")
  .then(res => console.log(res.data));`,
    python: `import requests

res = requests.${method}("${baseUrl}${path}")
print(res.json())`,
    go: `resp, _ := http.Get("${baseUrl}${path}")`,
    java: `HttpResponse<String> response = HttpClient.newHttpClient()
  .send(request, HttpResponse.BodyHandlers.ofString());`,
  };

  return (
    <div className="grid grid-cols-12 gap-8 text-sm">
      {/* LEFT PANEL */}
      <div className="col-span-7">
        {/* Sticky Header */}
        <div className="flex items-center gap-3 mb-4">
          <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-md">
            {method.toUpperCase()}
          </span>
          <span className="font-mono text-gray-700">{path}</span>
        </div>

        <p className="text-gray-500 mb-6 leading-relaxed">
          {endpoint.description}
        </p>

        {/* Query Params */}
        {endpoint.parameters?.length > 0 && (
          <>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Query Parameters
            </h3>

            <div className="space-y-4">
              {endpoint.parameters.map((param: any) => (
                <div key={param.name}>
                  <label className="block font-mono text-xs mb-1">
                    {param.name}
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-200 rounded-md px-3 py-2 focus:ring-1 focus:ring-blue-500 outline-none"
                    onChange={(e) =>
                      setParams({
                        ...params,
                        [param.name]: e.target.value,
                      })
                    }
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {param.description}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* RIGHT PANEL (Playground) */}
      <div className="col-span-5">
        <div className="bg-slate-900 rounded-xl p-5 text-white shadow-lg">
          {/* Execute Button */}
          <button
            onClick={execute}
            className="bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded-md text-xs font-semibold mb-4"
          >
            {loading ? "Sending..." : "Send API Request"}
          </button>

          {/* Language Tabs */}
          <div className="flex gap-4 text-xs mb-3">
            {Object.keys(codeSamples).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`${
                  language === lang
                    ? "text-blue-400"
                    : "text-gray-400"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Code */}
          <pre className="bg-slate-800 rounded-md p-4 overflow-auto text-xs">
            {codeSamples[language]}
          </pre>

          {/* Response */}
          {response && (
            <>
              <h4 className="text-xs mt-5 mb-2 text-gray-400 uppercase tracking-wide">
                Response
              </h4>
              <pre className="bg-slate-800 rounded-md p-4 overflow-auto text-xs">
                {JSON.stringify(response, null, 2)}
              </pre>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
