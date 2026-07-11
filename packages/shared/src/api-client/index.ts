export interface ApiClientConfig {
  baseUrl: string;
  token?: string;
}

export class BexoApiClient {
  private baseUrl: string;
  private token?: string;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl;
    this.token = config.token;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers);
    if (this.token) {
      headers.set("Authorization", `Bearer ${this.token}`);
    }
    headers.set("Content-Type", "application/json");

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`BEXO API Error: ${response.statusText} (${response.status})`);
    }

    return response.json() as Promise<T>;
  }

  async getHealth(): Promise<{ status: string }> {
    return this.request<{ status: string }>("/health");
  }
}
