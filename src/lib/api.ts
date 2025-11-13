const API_BASE_URL = "http://localhost:3000";

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
  size?: number;
  createdAt: string;
  updatedAt: string;
  parentId?: string;
  children?: FileItem[];
}

class ApiClient {
  private accessToken: string | null = null;

  constructor() {
    this.accessToken = localStorage.getItem("accessToken");
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
    localStorage.setItem("accessToken", token);
  }

  clearAccessToken() {
    this.accessToken = null;
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: this.getHeaders(false),
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Registration failed");
    }

    return response.json();
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
    localStorage.setItem("refreshToken", data.refreshToken);
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

  async getFileTree(folderId?: string): Promise<FileItem[]> {
    const url = folderId 
      ? `${API_BASE_URL}/api/tree/${folderId}`
      : `${API_BASE_URL}/api/tree`;
    
    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

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
      throw new Error("Failed to upload file");
    }

    return response.json();
  }

  async createFolder(name: string, parentId?: string): Promise<FileItem> {
    const response = await fetch(`${API_BASE_URL}/api/create`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ name, parentId }),
    });

    if (!response.ok) {
      throw new Error("Failed to create folder");
    }

    return response.json();
  }

  async deleteItem(fileId?: string, folderId?: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/delete`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ fileId, folderId }),
    });

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

  async downloadFolderAsZip(folderId: string, folderName: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/zip/${folderId}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to download folder");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${folderName}.zip`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

export const apiClient = new ApiClient();
