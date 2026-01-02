import Settings from "../models/Settings.js";

class SettingsController {
  /**
   * Get all settings (admin only)
   */
  static async getAllSettings(req, res) {
    try {
      const settings = await Settings.getAll();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  }

  /**
   * Get a specific setting
   */
  static async getSetting(req, res) {
    try {
      const { key } = req.params;
      const setting = await Settings.getByKey(key);

      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }

      res.json(setting);
    } catch (error) {
      console.error("Error fetching setting:", error);
      res.status(500).json({ message: "Failed to fetch setting" });
    }
  }

  /**
   * Update a setting (admin only)
   */
  static async updateSetting(req, res) {
    try {
      const { key } = req.params;
      const { value } = req.body;

      if (value === undefined || value === null) {
        return res.status(400).json({ message: "Value is required" });
      }

      const updatedSetting = await Settings.update(key, value.toString());

      if (!updatedSetting) {
        return res.status(404).json({ message: "Setting not found" });
      }

      res.json({
        message: "Setting updated successfully",
        setting: updatedSetting,
      });
    } catch (error) {
      console.error("Error updating setting:", error);
      res.status(500).json({ message: "Failed to update setting" });
    }
  }

  /**
   * Get auto-extend settings (public - needed for bid logic)
   */
  static async getAutoExtendSettings(req, res) {
    try {
      const settings = await Settings.getAutoExtendSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching auto-extend settings:", error);
      res.status(500).json({ message: "Failed to fetch auto-extend settings" });
    }
  }

  /**
   * Initialize default settings (run once)
   */
  static async initializeDefaults(req, res) {
    try {
      const results = await Settings.initializeDefaults();
      res.json({
        message: "Default settings initialized",
        settings: results,
      });
    } catch (error) {
      console.error("Error initializing settings:", error);
      res.status(500).json({ message: "Failed to initialize settings" });
    }
  }
}

export default SettingsController;
