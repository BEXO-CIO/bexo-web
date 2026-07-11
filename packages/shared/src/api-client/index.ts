import { User, Profile, ProfileSection, Asset, Portfolio } from "../schemas";

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

  setToken(token: string | undefined) {
    this.token = token;
  }

  public async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers);
    if (this.token) {
      headers.set("Authorization", `Bearer ${this.token}`);
    }
    
    // Don't set Content-Type if we're sending FormData (e.g. file upload)
    if (!(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `BEXO API Error: ${response.statusText} (${response.status})`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.message) {
          errorMessage = typeof errorData.message === 'string' 
            ? errorData.message 
            : errorData.message.join(', ');
        }
      } catch (e) {
        // Fallback to generic status text
      }
      throw new Error(errorMessage);
    }

    return response.json() as Promise<T>;
  }

  async getHealth(): Promise<{ status: string }> {
    return this.request<{ status: string }>("/health");
  }

  // --- Auth Module ---
  async sendOtp(phone: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>("/auth/phone/otp", {
      method: "POST",
      body: JSON.stringify({ phone }),
    });
  }

  async verifyOtp(phone: string, otp: string): Promise<{ accessToken: string; user: User }> {
    return this.request<{ accessToken: string; user: User }>("/auth/phone/otp/verify", {
      method: "POST",
      body: JSON.stringify({ phone, otp }),
    });
  }

  async googleAuth(token: string): Promise<{ accessToken: string; user: User }> {
    return this.request<{ accessToken: string; user: User }>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  }

  async refreshSession(): Promise<{ accessToken: string }> {
    return this.request<{ accessToken: string }>("/auth/refresh", {
      method: "POST",
    });
  }

  async logout(): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>("/auth/logout", {
      method: "POST",
    });
  }

  // --- Profiles Module ---
  async getProfile(): Promise<Profile> {
    return this.request<Profile>("/profile");
  }

  async patchProfile(data: { headline?: string; career_goal?: string; bio?: string; name?: string; dob?: string; profile_photo_asset_id?: string | null }): Promise<any> {
    return this.request<any>("/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async getProfileSection(type: string): Promise<ProfileSection> {
    return this.request<ProfileSection>(`/profile/sections/${type}`);
  }

  async patchProfileSection(type: string, data: { entries: any[]; reviewed_at?: string | null }): Promise<ProfileSection> {
    return this.request<ProfileSection>(`/profile/sections/${type}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async getCompletionScore(): Promise<{ score: number }> {
    return this.request<{ score: number }>("/profile/completion");
  }

  // --- Assets Module ---
  async uploadAsset(sectionType: string, file: File, entryId?: string): Promise<Asset> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("section_type", sectionType);
    if (entryId) {
      formData.append("entry_id", entryId);
    }

    return this.request<Asset>("/assets/upload", {
      method: "POST",
      body: formData,
    });
  }

  async deleteAsset(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/assets/${id}`, {
      method: "DELETE",
    });
  }

  // --- Resume Parser Module ---
  async uploadResume(file: File): Promise<{ cached: boolean; data?: any; jobId?: string }> {
    const formData = new FormData();
    formData.append("file", file);
    return this.request<{ cached: boolean; data?: any; jobId?: string }>("/resume/upload", {
      method: "POST",
      body: formData,
    });
  }

  // --- Activation Keys ---
  async redeemActivationKey(code: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>("/activation/redeem", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
  }

  // --- Portfolio & Publishing ---
  async publishPortfolio(data: { handle: string; selected_template_id: string; selected_theme_id: string }): Promise<{ success: boolean; portfolio: Portfolio }> {
    return this.request<{ success: boolean; portfolio: Portfolio }>("/portfolio/publish", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // --- Admin Module ---
  async adminSearchUsers(query: string = '', page: number = 1, limit: number = 10): Promise<{
    users: any[];
    pagination: { total: number; page: number; limit: number; pages: number };
    metrics: {
      totalStorageUsedBytes: number;
      totalUsersOverall: number;
      totalRevenueOverall: number;
      activeAnnualSubscriptions: number;
      activeLifetimeSubscriptions: number;
      computedMrr: number;
    };
  }> {
    return this.request<any>(`/admin/users/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
  }

  async adminImpersonate(targetUserId: string): Promise<{ token: string; user: any }> {
    return this.request<{ token: string; user: any }>(`/admin/users/${targetUserId}/impersonate`, {
      method: "POST",
    });
  }

  async adminRefund(paymentId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>("/admin/billing/refund", {
      method: "POST",
      body: JSON.stringify({ paymentId }),
    });
  }

  async adminListOrganizations(): Promise<any[]> {
    return this.request<any[]>("/admin/organizations");
  }

  // --- Activation Module ---
  async adminGenerateKeys(orgId: string, count: number): Promise<{ batchId: string; keys: string[] }> {
    return this.request<{ batchId: string; keys: string[] }>("/activation/generate", {
      method: "POST",
      body: JSON.stringify({ orgId, count }),
    });
  }
}
