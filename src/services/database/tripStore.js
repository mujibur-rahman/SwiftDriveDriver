// src/services/database/tripStore.js
/**
 * Trip data store — saves completed trips to local SQLite.
 *
 * Called after every trip completion (in ActiveRideScreen/RideCompletedScreen).
 * Data is used for local FL model training.
 * Raw data never leaves the device.
 */

import { getDB } from './db';

// ── Save a completed trip ─────────────────────────────────────────────────────

export const saveTripLocally = async (tripData) => {
  const db = await getDB();
  const {
    id, serviceType = 'ride',
    pickupLat, pickupLng,
    destLat, destLng,
    distanceKm, durationMinutes,
    actualFare, surgeAtTime = 1.0,
    waitTimeMins = 0,
    completedAt,
  } = tripData;

  // Extract time features
  const now       = completedAt ? new Date(completedAt) : new Date();
  const hour      = now.getHours();
  const dow       = now.getDay();
  const isWeekend = dow === 0 || dow === 6 ? 1 : 0;

  // Quantise coordinates to zones (0.1 degree grid)
  // This adds location privacy — exact coords are rounded
  const pickupZoneLat = pickupLat ? Math.round(pickupLat * 10) / 10 : null;
  const pickupZoneLng = pickupLng ? Math.round(pickupLng * 10) / 10 : null;

  // Destination zone — single scalar (distance from origin)
  const destZone = (distanceKm || 0) / 10.0;

  // Straight-line distance approx
  const slKm = distanceKm ? distanceKm * 0.75 : null;

  // Estimate turns from distance
  const numTurns = distanceKm ? Math.round(distanceKm * 2) : 0;

  try {
    await db.runAsync(
      `INSERT OR REPLACE INTO trips (
        id, service_type,
        hour_of_day, day_of_week, is_weekend,
        pickup_zone_lat, pickup_zone_lng, dest_zone,
        distance_km, straight_line_km, duration_minutes, num_turns,
        actual_fare, surge_at_time, wait_time_mins, accepted,
        completed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, serviceType,
        hour, dow, isWeekend,
        pickupZoneLat, pickupZoneLng, destZone,
        distanceKm, slKm, durationMinutes, numTurns,
        actualFare, surgeAtTime, waitTimeMins, 1,
        now.toISOString(),
      ]
    );
    console.log(`[TripStore] Saved trip ${id} locally`);
    return true;
  } catch (e) {
    console.warn('[TripStore] Failed to save trip:', e.message);
    return false;
  }
};

// ── Read trips for FL training ────────────────────────────────────────────────

export const getTripsForTraining = async (
  modelType = 'surge',
  limit = 500,
  daysBack = 30,
) => {
  const db   = await getDB();
  const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();

  const rows = await db.getAllAsync(
    `SELECT * FROM trips
     WHERE completed_at >= ?
     ORDER BY completed_at DESC
     LIMIT ?`,
    [since, limit]
  );

  if (!rows || rows.length === 0) return { features: [], labels: [] };

  const features = [];
  const labels   = [];

  for (const row of rows) {
    if (modelType === 'surge') {
      // Features: [hour, dow, is_weekend, is_holiday, lat_zone, lng_zone, 0, 0]
      features.push([
        row.hour_of_day / 23.0,
        row.day_of_week / 6.0,
        row.is_weekend || 0,
        row.is_holiday || 0,
        row.pickup_zone_lat ? (row.pickup_zone_lat + 90)  / 180.0 : 0.5,
        row.pickup_zone_lng ? (row.pickup_zone_lng + 180) / 360.0 : 0.5,
        0.3,  // placeholder: online_drivers (unknown locally)
        0.2,  // placeholder: active_orders (unknown locally)
      ]);
      labels.push(Math.max(1.0, row.surge_at_time || 1.0));

    } else if (modelType === 'eta') {
      // Features: [distance, sl_km, turns, hour, dow, pickup_lat, pickup_lng, dest_zone]
      features.push([
        Math.min((row.distance_km || 0) / 50.0, 1.0),
        Math.min((row.straight_line_km || 0) / 50.0, 1.0),
        Math.min((row.num_turns || 0) / 30.0, 1.0),
        row.hour_of_day / 23.0,
        row.day_of_week / 6.0,
        row.pickup_zone_lat ? (row.pickup_zone_lat + 90) / 180.0 : 0.5,
        row.pickup_zone_lng ? (row.pickup_zone_lng + 180) / 360.0 : 0.5,
        Math.min(row.dest_zone || 0, 1.0),
      ]);
      labels.push(Math.max(1.0, row.duration_minutes || 10));

    } else if (modelType === 'demand') {
      // Features: [zone_lat, zone_lng, hour, dow, is_weekend, weather]
      features.push([
        row.pickup_zone_lat ? (row.pickup_zone_lat + 90) / 180.0 : 0.5,
        row.pickup_zone_lng ? (row.pickup_zone_lng + 180) / 360.0 : 0.5,
        row.hour_of_day / 23.0,
        row.day_of_week / 6.0,
        row.is_weekend || 0,
        (row.weather_code || 0) / 3.0,
      ]);
      // Demand label: 1 = accepted, 0 = busy/declined
      labels.push(row.accepted || 0);
    }
  }

  return { features, labels, count: rows.length };
};

// ── Stats ─────────────────────────────────────────────────────────────────────

export const getLocalTripStats = async () => {
  const db = await getDB();

  const total   = await db.getFirstAsync('SELECT COUNT(*) as n FROM trips');
  const unsynced = await db.getFirstAsync(
    'SELECT COUNT(*) as n FROM trips WHERE synced_to_fl = 0'
  );
  const latest  = await db.getFirstAsync(
    'SELECT completed_at FROM trips ORDER BY completed_at DESC LIMIT 1'
  );

  return {
    totalTrips:    total?.n || 0,
    unsyncedTrips: unsynced?.n || 0,
    latestTripAt:  latest?.completed_at || null,
  };
};

export const markTripsAsSynced = async (tripIds) => {
  const db = await getDB();
  const placeholders = tripIds.map(() => '?').join(',');
  await db.runAsync(
    `UPDATE trips SET synced_to_fl = 1 WHERE id IN (${placeholders})`,
    tripIds
  );
};

// ── FL state ──────────────────────────────────────────────────────────────────

export const getFLState = async () => {
  const db  = await getDB();
  const row = await db.getFirstAsync('SELECT * FROM fl_state WHERE id = 1');
  return row || {};
};

export const updateFLState = async (updates) => {
  const db = await getDB();
  const fields = Object.keys(updates).map((k) => `${k} = ?`).join(', ');
  const values = Object.values(updates);
  await db.runAsync(
    `UPDATE fl_state SET ${fields} WHERE id = 1`,
    values
  );
};

export const saveFLMetric = async (metric) => {
  const db = await getDB();
  await db.runAsync(
    `INSERT INTO fl_metrics
     (round_number, model_type, local_loss, epsilon, samples_used, bytes_sent)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      metric.roundNumber,
      metric.modelType,
      metric.localLoss,
      metric.epsilon,
      metric.samplesUsed,
      metric.bytesSent,
    ]
  );
};
