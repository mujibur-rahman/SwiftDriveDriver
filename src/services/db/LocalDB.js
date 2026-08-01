// src/services/db/LocalDB.js
/**
 * Local SQLite database for SwiftRide driver app.
 *
 * Tables:
 *   trips       — completed trip features (never sent to server raw)
 *   fl_state    — current model version, last trained round
 *   fl_metrics  — local training metrics per round
 *
 * Privacy guarantee:
 *   Raw trip data NEVER leaves this device.
 *   Only model gradients (with DP noise) are sent to FL server.
 */

import * as SQLite from 'expo-sqlite';

const DB_NAME = 'swiftride_local.db';
let _db = null;

// ── Open database ─────────────────────────────────────────────────────────────

export const getDB = async () => {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync(DB_NAME);
  await initSchema(_db);
  return _db;
};

// ── Schema ────────────────────────────────────────────────────────────────────

const initSchema = async (db) => {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    -- Completed trips (FL training data)
    CREATE TABLE IF NOT EXISTS trips (
      id                TEXT PRIMARY KEY,
      driver_id         TEXT NOT NULL,

      -- Time features
      hour_of_day       INTEGER NOT NULL,   -- 0-23
      day_of_week       INTEGER NOT NULL,   -- 0=Mon, 6=Sun
      is_weekend        INTEGER DEFAULT 0,  -- 0/1
      is_holiday        INTEGER DEFAULT 0,  -- 0/1

      -- Location features (zone not exact coords — privacy)
      pickup_lat_zone   REAL NOT NULL,      -- quantised to 2dp
      pickup_lng_zone   REAL NOT NULL,
      dest_lat_zone     REAL NOT NULL,
      dest_lng_zone     REAL NOT NULL,

      -- Trip features
      distance_km       REAL NOT NULL,
      straight_line_km  REAL NOT NULL,
      duration_min      INTEGER NOT NULL,
      num_turns         INTEGER DEFAULT 0,

      -- Labels (what we train models to predict)
      actual_surge      REAL DEFAULT 1.0,   -- SurgeModel label
      actual_eta_min    REAL NOT NULL,      -- ETAModel label
      demand_score      REAL DEFAULT 0.5,   -- DemandModel label

      -- Context
      online_drivers    INTEGER DEFAULT 0,
      active_orders     INTEGER DEFAULT 0,
      weather_code      INTEGER DEFAULT 0,  -- 0=clear 1=cloudy 2=rain 3=storm

      -- Service type
      service_type      TEXT DEFAULT 'ride',

      -- Metadata
      order_id          TEXT,
      fare              REAL,
      tip               REAL DEFAULT 0,
      accepted          INTEGER DEFAULT 1,  -- 1=accepted, 0=declined
      created_at        TEXT NOT NULL
    );

    -- FL state tracking
    CREATE TABLE IF NOT EXISTS fl_state (
      id                INTEGER PRIMARY KEY DEFAULT 1,
      current_round     INTEGER DEFAULT 0,
      last_trained_at   TEXT,
      surge_model_v     INTEGER DEFAULT 0,
      eta_model_v       INTEGER DEFAULT 0,
      demand_model_v    INTEGER DEFAULT 0,
      total_trips_used  INTEGER DEFAULT 0,
      CHECK (id = 1)    -- singleton row
    );

    -- Local FL metrics (for PhD evaluation)
    CREATE TABLE IF NOT EXISTS fl_metrics (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      round_number      INTEGER NOT NULL,
      model_type        TEXT NOT NULL,
      local_loss        REAL,
      local_mae         REAL,
      epsilon           REAL,
      bytes_sent        INTEGER,
      n_samples         INTEGER,
      trained_at        TEXT NOT NULL
    );

    -- Insert default fl_state row if not exists
    INSERT OR IGNORE INTO fl_state (id, current_round) VALUES (1, 0);
  `);

  console.log('[LocalDB] Schema initialized');
};

// ── Utilities ─────────────────────────────────────────────────────────────────

export const quantiseCoord = (coord, decimals = 2) => {
  // Reduce precision to protect exact location privacy
  return Math.round(coord * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

export const getHourOfDay = () => new Date().getHours();
export const getDayOfWeek = () => new Date().getDay(); // 0=Sun → remap to 0=Mon
export const isWeekend    = () => { const d = new Date().getDay(); return d === 0 || d === 6 ? 1 : 0; };
