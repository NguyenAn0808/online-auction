import pool from "../config/database.js";

class Settings {
  /**
   * Get all settings
   */
  static async getAll() {
    const query = `
      SELECT key, value, description, updated_at
      FROM settings
      ORDER BY key
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Get a specific setting by key
   */
  static async getByKey(key) {
    const query = `
      SELECT key, value, description, updated_at
      FROM settings
      WHERE key = $1
    `;
    const result = await pool.query(query, [key]);
    return result.rows[0];
  }

  /**
   * Update a setting value
   */
  static async update(key, value) {
    const query = `
      UPDATE settings
      SET value = $2, updated_at = CURRENT_TIMESTAMP
      WHERE key = $1
      RETURNING key, value, description, updated_at
    `;
    const result = await pool.query(query, [key, value]);
    return result.rows[0];
  }

  /**
   * Get auto-extend settings
   */
  static async getAutoExtendSettings() {
    const query = `
      SELECT key, value
      FROM settings
      WHERE key IN ('auto_extend_threshold_minutes', 'auto_extend_duration_minutes')
    `;
    const result = await pool.query(query);

    const settings = {};
    result.rows.forEach((row) => {
      settings[row.key] = parseInt(row.value);
    });

    return {
      threshold_minutes: settings.auto_extend_threshold_minutes || 5,
      extension_minutes: settings.auto_extend_duration_minutes || 10,
    };
  }

  /**
   * Initialize default settings (run this once)
   */
  static async initializeDefaults() {
    const defaults = [
      {
        key: "auto_extend_threshold_minutes",
        value: "5",
        description:
          "Minutes before auction end to trigger auto-extend when new bid placed",
      },
      {
        key: "auto_extend_duration_minutes",
        value: "10",
        description:
          "Number of minutes to extend auction when auto-extend is triggered",
      },
    ];

    const query = `
      INSERT INTO settings (key, value, description)
      VALUES ($1, $2, $3)
      ON CONFLICT (key) DO NOTHING
      RETURNING *
    `;

    const results = [];
    for (const setting of defaults) {
      const result = await pool.query(query, [
        setting.key,
        setting.value,
        setting.description,
      ]);
      results.push(result.rows[0]);
    }

    return results;
  }

  /**
   * Initialize settings table
   */
  static async initSettingsTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL,
        description TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await pool.query(query);
    console.log("✅ Settings table initialized");

    // Initialize default settings
    await this.initializeDefaults();
    console.log("✅ Default settings initialized");
  }
}

export default Settings;
