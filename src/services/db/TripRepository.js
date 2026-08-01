// src/services/db/TripRepository.js
/**
 * Trip data repository.
 * Handles saving completed trips and reading them for FL training.
 */

import { getDB, quantiseCoord, getHourOfDay, getDayOfWeek, isWeekend } from './LocalDB';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

// ── Save a completed trip ─────────────────────────────────────────────────────

export const saveTripToLocal = async (orderData, driverId) => {
  try {
    const db   = await getDB();
    const now  = new Date();
    const hour = now.getHours();
    const dow  = now.getDay();

    // Quantise coordinates to 2dp for privacy
    const pickup_lat_z = quantiseCoord(orderData.pickup?.latitude  || 0);
    const pickup_lng_z = quantiseCoord(orderData.pickup?.longitude || 0);
    const dest_lat_z   = quantiseCoord(orderData.destination?.latitude  || 0);
    const dest_lng_z   = quantiseCoord(orderData.destination?.longitude || 0);

    // Parse distance and duration
    const distance_km = parseFloat(orderData.distance) || 0;
    const duration_min = parseInt(orderData.duration)  || 0;

    // Estimate straight-line distance (Haversine approx)
    const sl_km = distance_km * 0.75;

    // Calculate demand score (simple heuristic — in production from server)
    const demand_score = hour >= 7 && hour <= 9 || hour >= 17 && hour <= 19
      ? 0.8 : 0.4;

    await db.runAsync(
      `INSERT OR REPLACE INTO trips (
        id, driver_id,
        hour_of_day, day_of_week, is_weekend, is_holiday,
        pickup_lat_zone, pickup_lng_zone, dest_lat_zone, dest_lng_zone,
        distance_km, straight_line_km, duration_min, num_turns,
        actual_surge, actual_eta_min, demand_score,
        online_drivers, active_orders, weather_code,
        service_type, order_id, fare, tip, accepted, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uuidv4(), driverId,
        hour, dow, isWeekend(), 0,
        pickup_lat_z, pickup_lng_z, dest_lat_z, dest_lng_z,
        distance_km, sl_km, duration_min, Math.floor(distance_km * 2),
        orderData.surgeMultiplier || 1.0,
        duration_min,
        demand_score,
        0, 0, 0,
        orderData.serviceType || 'ride',
        orderData.id,
        orderData.estimatedTotal || 0,
        orderData.tip || 0,
        1,
        now.toISOString(),
      ],
    );

    console.log(`[TripRepo] Saved trip ${orderData.id} to local SQLite`);
    return true;
  } catch (e) {
    console.error('[TripRepo] Failed to save trip:', e.message);
    return false;
  }
};

// ── Save a declined request ───────────────────────────────────────────────────

export const saveDeclinedTrip = async (orderData, driverId) => {
  try {
    const db  = await getDB();
    const now = new Date();

    await db.runAsync(
      `INSERT INTO trips (
        id, driver_id,
        hour_of_day, day_of_week, is_weekend, is_holiday,
        pickup_lat_zone, pickup_lng_zone, dest_lat_zone, dest_lng_zone,
        distance_km, straight_line_km, duration_min,
        actual_surge, actual_eta_min, demand_score,
        service_type, order_id, accepted, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uuidv4(), driverId,
        now.getHours(), now.getDay(), isWeekend(), 0,
        quantiseCoord(orderData.pickup?.latitude  || 0),
        quantiseCoord(orderData.pickup?.longitude || 0),
        quantiseCoord(orderData.destination?.latitude  || 0),
        quantiseCoord(orderData.destination?.longitude || 0),
        parseFloat(orderData.distance) || 0,
        (parseFloat(orderData.distance) || 0) * 0.75,
        parseInt(orderData.duration) || 0,
        orderData.surgeMultiplier || 1.0,
        parseInt(orderData.duration) || 0,
        0.3,
        orderData.serviceType || 'ride',
        orderData.id,
        0,  // accepted = 0 (declined)
        now.toISOString(),
      ],
    );
    return true;
  } catch (e) {
    console.error('[TripRepo] Failed to save declined trip:', e.message);
    return false;
  }
};

// ── Read trips for FL training ────────────────────────────────────────────────

export const getTripsForTraining = async (driverId, days = 30) => {
  try {
    const db      = await getDB();
    const cutoff  = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const trips = await db.getAllAsync(
      `SELECT * FROM trips
       WHERE driver_id = ? AND created_at >= ? AND accepted = 1
       ORDER BY created_at DESC
       LIMIT 500`,
      [driverId, cutoff],
    );

    console.log(`[TripRepo] Loaded ${trips.length} trips for training`);
    return trips;
  } catch (e) {
    console.error('[TripRepo] Failed to read trips:', e.message);
    return [];
  }
};

// ── Trip statistics ───────────────────────────────────────────────────────────

export const getTripStats = async (driverId) => {
  try {
    const db    = await getDB();
    const stats = await db.getFirstAsync(
      `SELECT
        COUNT(*)                          AS total_trips,
        COUNT(CASE WHEN accepted=1 END)   AS completed,
        COUNT(CASE WHEN accepted=0 END)   AS declined,
        AVG(distance_km)                  AS avg_distance,
        AVG(duration_min)                 AS avg_duration,
        AVG(actual_surge)                 AS avg_surge,
        MIN(created_at)                   AS first_trip,
        MAX(created_at)                   AS last_trip
       FROM trips WHERE driver_id = ?`,
      [driverId],
    );
    return stats;
  } catch (e) {
    return null;
  }
};

// ── FL state ──────────────────────────────────────────────────────────────────

export const getFLState = async () => {
  try {
    const db    = await getDB();
    return await db.getFirstAsync('SELECT * FROM fl_state WHERE id = 1');
  } catch (e) {
    return null;
  }
};

export const updateFLState = async (updates) => {
  try {
    const db   = await getDB();
    const keys = Object.keys(updates);
    const sets = keys.map((k) => `${k} = ?`).join(', ');
    await db.runAsync(
      `UPDATE fl_state SET ${sets} WHERE id = 1`,
      Object.values(updates),
    );
  } catch (e) {
    console.error('[TripRepo] Failed to update FL state:', e.message);
  }
};

// ── Save local FL metrics ─────────────────────────────────────────────────────

export const saveLocalFLMetrics = async (metrics) => {
  try {
    const db = await getDB();
    await db.runAsync(
      `INSERT INTO fl_metrics
       (round_number, model_type, local_loss, local_mae, epsilon, bytes_sent, n_samples, trained_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        metrics.round_number,
        metrics.model_type,
        metrics.local_loss,
        metrics.local_mae,
        metrics.epsilon,
        metrics.bytes_sent,
        metrics.n_samples,
        new Date().toISOString(),
      ],
    );
  } catch (e) {
    console.error('[TripRepo] Failed to save FL metrics:', e.message);
  }
};

export const getLocalFLMetrics = async () => {
  try {
    const db = await getDB();
    return await db.getAllAsync(
      'SELECT * FROM fl_metrics ORDER BY trained_at DESC LIMIT 50'
    );
  } catch (e) {
    return [];
  }
};
