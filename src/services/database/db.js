// src/services/database/db.js
/**
 * Local SQLite database for the driver app.
 *
 * Privacy guarantee: raw trip data NEVER leaves this device.
 * Only model gradients (with DP noise) are sent to the FL server.
 *
 * Schema:
 *   trips        — completed trip features for local FL training
 *   fl_state     — current global model version + last training time
 *   fl_metrics   — local training metrics per round
 */

import * as SQLite from 'expo-sqlite';

const DB_NAME = 'swiftdrive_local.db';
let db = null;

export const getDB = async () => {
  if (db) return db;
  db = await SQLite.openDatabaseAsync(DB_NAME);
  await initSchema(db);
  return db;
};

const initSchema = async (database) => {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;

    -- Local trip history (features for FL training)
    -- Raw data stays here, never sent to server
    CREATE TABLE IF NOT EXISTS trips (
      id                TEXT PRIMARY KEY,
      service_type      TEXT DEFAULT 'ride',

      -- Time features
      hour_of_day       INTEGER NOT NULL,
      day_of_week       INTEGER NOT NULL,
      is_weekend        INTEGER DEFAULT 0,
      is_holiday        INTEGER DEFAULT 0,

      -- Location features (quantised zones, not exact coords)
      pickup_zone_lat   REAL,
      pickup_zone_lng   REAL,
      dest_zone         REAL,

      -- Route features
      distance_km       REAL,
      straight_line_km  REAL,
      duration_minutes  INTEGER,
      num_turns         INTEGER DEFAULT 0,

      -- Outcome features (labels for training)
      actual_fare       REAL,
      surge_at_time     REAL DEFAULT 1.0,
      wait_time_mins    REAL DEFAULT 0,
      accepted          INTEGER DEFAULT 1,
      weather_code      INTEGER DEFAULT 0,

      -- Metadata
      completed_at      TEXT,
      synced_to_fl      INTEGER DEFAULT 0,
      created_at        TEXT DEFAULT (datetime('now'))
    );

    -- FL model state
    CREATE TABLE IF NOT EXISTS fl_state (
      id                INTEGER PRIMARY KEY DEFAULT 1,
      model_version     INTEGER DEFAULT 0,
      last_trained_at   TEXT,
      last_download_at  TEXT,
      surge_model_path  TEXT,
      eta_model_path    TEXT,
      demand_model_path TEXT,
      total_rounds      INTEGER DEFAULT 0
    );

    -- Insert default fl_state row if not exists
    INSERT OR IGNORE INTO fl_state (id) VALUES (1);

    -- Local FL metrics per round
    CREATE TABLE IF NOT EXISTS fl_metrics (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      round_number    INTEGER,
      model_type      TEXT,
      local_loss      REAL,
      epsilon         REAL,
      samples_used    INTEGER,
      bytes_sent      INTEGER,
      trained_at      TEXT DEFAULT (datetime('now'))
    );
  `);

  console.log('[DB] Schema initialised');
};

export default { getDB };
