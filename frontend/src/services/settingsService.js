import api from "./api";

export const settingsService = {
  // Get all settings
  getAllSettings: async () => {
    const response = await api.get("/settings");
    return response.data;
  },

  // Get auto-extend settings
  getAutoExtendSettings: async () => {
    const response = await api.get("/settings/auto-extend");
    return response.data;
  },

  // Update a setting
  updateSetting: async (key, value) => {
    const response = await api.put(`/settings/${key}`, { value });
    return response.data;
  },

  // Initialize default settings
  initializeDefaults: async () => {
    const response = await api.post("/settings/initialize");
    return response.data;
  },
};

export default settingsService;
