/**
 * Generates an API request snippet in the specified language.
 */
export function generateCode(
    method: string,
    url: string,
    token: string,
    body: string,
    language: string
): string {
    const samples: Record<string, string> = {
        curl: `curl -X ${method.toUpperCase()} "${url}" \\
  -H "Authorization: ${token}" \\
  -H "Content-Type: application/json" \\
  -d '${body}'`,

        node: `import axios from "axios";

axios.${method}("${url}", ${body}, {
  headers: { Authorization: "${token}" }
}).then(res => console.log(res.data));`,

        python: `import requests

res = requests.${method}(
  "${url}",
  headers={"Authorization": "${token}"},
  json=${body}
)
print(res.json())`,
    };

    return samples[language] || "";
}
