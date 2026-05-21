export function jsonRequest(url: string, body: object): Request {
  return new Request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function responseText(response: Response): Promise<string> {
  return response.text();
}
