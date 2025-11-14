const API_BASE_URL = "http://52.76.57.239/api";
import axios from "axios";
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface FileItem {
  id: string;
  name: string;
  type: "file" | "folder";
  s3Url?: string;
  size?: number;
  createdAt: string;
  updatedAt: string;
  parentId?: string;
  children?: FileItem[];
}

class ApiClient {
  private accessToken: string | null = null;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor() {
    this.accessToken = sessionStorage.getItem("accessToken");
  }

  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (includeAuth && this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  setAccessToken(token: string) {
    this.accessToken = token;
    sessionStorage.setItem("accessToken", token);
  }

  clearAccessToken() {
    this.accessToken = null;
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
  }

  // Subscribe to token refresh
  private onRefreshed(token: string) {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  // Add subscriber
  private addRefreshSubscriber(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  // Refresh access token using refresh token
  private async refreshAccessToken(): Promise<string | null> {
    if (this.isRefreshing) {
      // Return a promise that resolves when token is refreshed
      return new Promise((resolve) => {
        this.addRefreshSubscriber((token) => {
          resolve(token);
        });
      });
    }

    this.isRefreshing = true;
    const refreshToken = sessionStorage.getItem("refreshToken");

    if (!refreshToken) {
      this.isRefreshing = false;
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: this.getHeaders(false),
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.setAccessToken(data.accessToken);
        this.isRefreshing = false;
        this.onRefreshed(data.accessToken);
        return data.accessToken;
      } else {
        // Refresh failed - clear tokens and redirect to login
        this.clearAccessToken();
        this.isRefreshing = false;
        window.location.href = "/login";
        return null;
      }
    } catch (error) {
      this.clearAccessToken();
      this.isRefreshing = false;
      window.location.href = "/login";
      return null;
    }
  }

  async register(fname: string, email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: this.getHeaders(false),
      body: JSON.stringify({ fname, email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Registration failed");
    }

    return response.json();
  }

  async getUserInfo() {
    let res = await fetch(`${API_BASE_URL}/auth/user`, {
      headers: this.getHeaders(),
      method: "GET"
    });
    
    // If 401, try to refresh token and retry
    if (res.status === 401) {
      const newToken = await this.refreshAccessToken();
      if (newToken) {
        res = await fetch(`${API_BASE_URL}/auth/user`, {
          headers: this.getHeaders(),
          method: "GET"
        });
      }
    }
    
    if (!res.ok) throw new Error("Failed to fetch user info");
    return res.json();
  }


  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: this.getHeaders(false),
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    const data = await response.json();
    this.setAccessToken(data.accessToken);
    sessionStorage.setItem("refreshToken", data.refreshToken);
    return data;
  }

  async logout() {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return;

    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: this.getHeaders(false),
        body: JSON.stringify({ refreshToken }),
      });
    } finally {
      this.clearAccessToken();
    }
  }

  // Wrapper to handle 401 and retry with refreshed token
  private async handleResponse(response: Response): Promise<Response> {
    if (response.status === 401) {
      // Token expired - try to refresh
      const newToken = await this.refreshAccessToken();
      if (newToken) {
        // Token was refreshed, but we can't retry the same request here
        // Caller must retry the request
        return response;
      }
    }
    return response;
  }

  async getFileTree(folderId?: string): Promise<FileItem[]> {
    const url = folderId
      ? `${API_BASE_URL}/api/tree/${folderId}`
      : `${API_BASE_URL}/api/tree`;

    let response = await fetch(url, {
      headers: this.getHeaders(),
    });

    // If 401, try to refresh token and retry
    if (response.status === 401) {
      const newToken = await this.refreshAccessToken();
      if (newToken) {
        response = await fetch(url, {
          headers: this.getHeaders(),
        });
      }
    }

    if (!response.ok) {
      throw new Error("Failed to fetch file tree");
    }

    return response.json();
  }

  async uploadFile(file: File, folderId?: string): Promise<FileItem> {
    const formData = new FormData();
    formData.append("file", file);
    if (folderId) {
      formData.append("folderId", folderId);
    }

    const headers: HeadersInit = {};
    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/upload-to-folder`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      console.log("Upload response status:", response);
      throw new Error("Failed to upload file");
    }

    return response.json();
  }

  async createPayment(amount: number,upStore :number) {
    const res = await fetch(`${API_BASE_URL}/payment/purchase`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ amount, upStore  }),
    });
    return res.json();
  }
async checkPayment(params: any) {
  const res = await axios.get(`${API_BASE_URL}/payment/check-payment`, { params });
  return res.data;
}

async changePassword(oldPassword: string, newPassword: string) {
  const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
    method: "POST",
    headers: this.getHeaders(),
    body: JSON.stringify({ oldPassword, newPassword }),
  });

  if (!res.ok) throw new Error("Password update failed");

  return res.json();
}


  async createFolder(name: string, parentId?: string): Promise<FileItem> {
    let response = await fetch(`${API_BASE_URL}/api/create`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ name, parentId }),
    });

    // If 401, try to refresh token and retry
    if (response.status === 401) {
      const newToken = await this.refreshAccessToken();
      if (newToken) {
        response = await fetch(`${API_BASE_URL}/api/create`, {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify({ name, parentId }),
        });
      }
    }

    if (!response.ok) {
      throw new Error("Failed to create folder");
    }

    return response.json();
  }

  async deleteItem(id: string): Promise<void> {
    let response = await fetch(`${API_BASE_URL}/api/delete`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ id }),
    });

    // If 401, try to refresh token and retry
    if (response.status === 401) {
      const newToken = await this.refreshAccessToken();
      if (newToken) {
        response = await fetch(`${API_BASE_URL}/api/delete`, {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify({ id }),
        });
      }
    }

    if (!response.ok) {
      throw new Error("Failed to delete item");
    }
  }

  async shareFile(
    fileId: string,
    mode: "private" | "shared" | "public",
    access: "view" | "edit",
    emails?: string[]
  ): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/share/files`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ fileId, mode, emails, access }),
    });

    if (!response.ok) {
      throw new Error("Failed to share file");
    }
  }

  async shareFolder(
    folderId: string,
    mode: "private" | "shared" | "public",
    access: "view" | "edit",
    emails?: string[]
  ): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/share/folders`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ folderId, mode, emails, access }),
    });

    if (!response.ok) {
      throw new Error("Failed to share folder");
    }
  }

  async downloadFile(fileId: string, fileName: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/download/${fileId}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to download file");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

async renameItem(id :string, newName: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/rename`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ id , newName }),
    });
    if (!response.ok) {
      throw new Error("Failed to rename item");
    }
    return response.json();
}
}

export const apiClient = new ApiClient();
