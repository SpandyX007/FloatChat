const BACKEND_URL = "http://localhost:8000";

export interface QueryRequest {
  query: string;
}

export interface QueryResponse {
  response: string;
  chart_data?: any[];
  error?: string;
}

export interface MapCoordinates {
  [profileName: string]: {
    latitude: number;
    longitude: number;
  };
}

class APIService {
  private async request<T>(
    endpoint: string,
    method: "GET" | "POST" = "GET",
    data?: any
  ): Promise<T> {
    try {
      const url = `${BACKEND_URL}${endpoint}`;
      const options: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (method === "POST" && data) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      if (error.message.includes("fetch")) {
        throw new Error(
          "Connection error. Please make sure the backend server is running on port 8000."
        );
      }
      throw error;
    }
  }

  async processQuery(query: string): Promise<QueryResponse> {
    return this.request<QueryResponse>("/parameters/user-query", "POST", { query });
  }

  async getMapCoordinates(): Promise<MapCoordinates> {
    return this.request<MapCoordinates>("/parameters/get-maps", "GET");
  }
}

export const apiService = new APIService();
