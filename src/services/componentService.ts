import apiClient from "./api";

export const componentService = {
  // General method to fetch components
  getComponents: async (endpoint: string) => {
    const response = await apiClient.get(endpoint);
    return response.data.result.data || response.data.result || [];
  },

  // Categories metadata (like sockets, ram-types)
  getMetadata: async (endpoint: string) => {
    const response = await apiClient.get(endpoint);
    return response.data.result.data || response.data.result || [];
  },
  
  // Games for bottleneck analysis
  getGames: async () => {
    const response = await apiClient.get("/games");
    return response.data.result.data || response.data.result || [];
  }
};
