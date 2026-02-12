import { HTTPSnippet } from "httpsnippet-lite";

/**
 * Generates an API request snippet in the specified language using HTTPSnippet.
 */
export async function generateCode(
  method: string,
  url: string,
  token: string,
  body: string,
  language: string
): Promise<string> {
  try {
    const urlObj = new URL(url);

    const harRequest = {
      method: method.toUpperCase(),
      url: url,
      httpVersion: "HTTP/1.1",
      queryString: Array.from(urlObj.searchParams.entries()).map(([name, value]) => ({ name, value })),
      headers: [
        { name: "Authorization", value: token },
        { name: "Content-Type", value: "application/json" },
      ],
      cookies: [],
      postData: body && body !== "{}" ? {
        mimeType: "application/json",
        text: body,
      } : undefined,
      headersSize: -1,
      bodySize: -1,
    };

    const snippet = new HTTPSnippet(harRequest as any);

    // Map the simplified language name to HTTPSnippet target/client
    const languageMap: Record<string, { target: string; client: string }> = {
      curl: { target: "shell", client: "curl" },
      node: { target: "node", client: "axios" },
      python: { target: "python", client: "requests" },
      go: { target: "go", client: "native" },
      php: { target: "php", client: "curl" },
      ruby: { target: "ruby", client: "native" },
      java: { target: "java", client: "okhttp" },
      csharp: { target: "csharp", client: "restsharp" }
    };

    const target = languageMap[language] || { target: "shell", client: "curl" };
    const result = await snippet.convert(target.target as any, target.client);

    return Array.isArray(result) ? result[0] : (result || "");
  } catch (err) {
    console.error("Error generating code snippet:", err);
    return "/* Error generating snippet */";
  }
}
