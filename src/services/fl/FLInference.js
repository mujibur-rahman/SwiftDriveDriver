// src/services/fl/FLInference.js
/**
 * On-device inference using locally stored model weights.
 *
 * When a ride request arrives:
 *   1. Server sends context (time, location, demand)
 *   2. This module runs inference using local model
 *   3. Returns predictions to server
 *
 * The server uses these predictions to rank and assign drivers.
 * This implements the SC (Spatial Crowdsourcing) + FL pattern.
 */

import { loadModelWeights } from './ModelManager';

// ── Forward pass helpers ──────────────────────────────────────────────────────

const relu     = (v) => Math.max(0, v);
const sigmoid  = (v) => 1 / (1 + Math.exp(-v));
const softplus = (v) => Math.log(1 + Math.exp(v));

const denseLayer = (input, weights, biases) => {
  return weights.map((row, i) => {
    const sum = row.reduce((acc, w, j) => acc + w * input[j], 0);
    return sum + biases[i];
  });
};


// ── Surge inference ───────────────────────────────────────────────────────────

const inferenceSurge = (weights, features) => {
  const keys = Object.keys(weights);

  let h = denseLayer(features, weights[keys[0]], weights[keys[1]]);
  h = h.map(relu);
  h = denseLayer(h, weights[keys[2]], weights[keys[3]]);
  h = h.map(relu);
  h = denseLayer(h, weights[keys[4]], weights[keys[5]]);
  h = h.map(softplus);
  return h[0] + 1.0;
};


// ── ETA inference ─────────────────────────────────────────────────────────────

const inferenceETA = (weights, features) => {
  const keys = Object.keys(weights);

  let h = denseLayer(features, weights[keys[0]], weights[keys[1]]);
  h = h.map(relu);
  h = denseLayer(h, weights[keys[2]], weights[keys[3]]);
  h = h.map(relu);
  h = denseLayer(h, weights[keys[4]], weights[keys[5]]);
  h = h.map(relu);
  h = denseLayer(h, weights[keys[6]], weights[keys[7]]);
  h = h.map((v) => Math.max(0, v));
  return h[0] + 1.0;
};


// ── Demand inference ──────────────────────────────────────────────────────────

const inferenceDemand = (weights, features) => {
  const keys = Object.keys(weights);

  let h = denseLayer(features, weights[keys[0]], weights[keys[1]]);
  h = h.map(relu);
  h = denseLayer(h, weights[keys[2]], weights[keys[3]]);
  h = h.map(relu);
  h = denseLayer(h, weights[keys[4]], weights[keys[5]]);
  h = h.map(sigmoid);
  return h[0];
};


// ── Feature preparation ───────────────────────────────────────────────────────

const prepareContext = (context) => {
  const now        = new Date();
  const hour       = context.hour       ?? now.getHours();
  const dow        = context.day_of_week ?? now.getDay();
  const isWeekend  = dow === 0 || dow === 6 ? 1.0 : 0.0;
  const lat        = context.pickup_lat ?? 0;
  const lng        = context.pickup_lng ?? 0;
  const onlineDrvs = context.online_drivers ?? 10;
  const activeOrds = context.active_orders  ?? 5;
  const distKm     = context.distance_km    ?? 5;

  const surgeFeatures = [
    hour / 23.0,
    dow  / 6.0,
    isWeekend,
    0.0,   // is_holiday (unknown locally)
    (lat + 90)  / 180.0,
    (lng + 180) / 360.0,
    Math.min(onlineDrvs / 100.0, 1.0),
    Math.min(activeOrds / 50.0,  1.0),
  ];

  const etaFeatures = [
    Math.min(distKm / 50.0, 1.0),
    Math.min(distKm * 0.75 / 50.0, 1.0),
    Math.min(distKm * 2 / 30.0, 1.0),
    hour / 23.0,
    dow  / 6.0,
    (lat + 90)  / 180.0,
    (lng + 180) / 360.0,
    Math.min(distKm / 10.0, 1.0),
  ];

  const demandFeatures = [
    (lat + 90)  / 180.0,
    (lng + 180) / 360.0,
    hour / 23.0,
    dow  / 6.0,
    isWeekend,
    (context.weather_code ?? 0) / 3.0,
  ];

  return { surgeFeatures, etaFeatures, demandFeatures };
};


// ── Main inference function ───────────────────────────────────────────────────

export const runInference = async (context) => {
  const { surgeFeatures, etaFeatures, demandFeatures } = prepareContext(context);

  // Load model weights from local storage
  const [surgeWeights, etaWeights, demandWeights] = await Promise.all([
    loadModelWeights('surge'),
    loadModelWeights('eta'),
    loadModelWeights('demand'),
  ]);

  let surgePred  = 1.0;
  let etaPred    = 10.0;
  let demandPred = 0.5;

  if (surgeWeights) {
    try { surgePred = inferenceSurge(surgeWeights, surgeFeatures); }
    catch (e) { console.warn('[Inference] Surge failed:', e.message); }
  }

  if (etaWeights) {
    try { etaPred = inferenceETA(etaWeights, etaFeatures); }
    catch (e) { console.warn('[Inference] ETA failed:', e.message); }
  }

  if (demandWeights) {
    try { demandPred = inferenceDemand(demandWeights, demandFeatures); }
    catch (e) { console.warn('[Inference] Demand failed:', e.message); }
  }

  // Compute driver score (used by SC allocator on server)
  // Higher score = better match for this request
  const score = (demandPred * 0.4) +
                (1 / Math.max(etaPred, 1) * 0.4) +
                (1 / Math.max(surgePred, 1) * 0.2);

  return {
    surge:      parseFloat(surgePred.toFixed(3)),
    eta_minutes: parseFloat(etaPred.toFixed(1)),
    demand:     parseFloat(demandPred.toFixed(3)),
    score:      parseFloat(score.toFixed(4)),
    model_used: surgeWeights ? 'local_fl' : 'fallback',
  };
};


// ── Quick inference without full model (fallback) ─────────────────────────────

export const quickInferenceFallback = (context) => {
  const hour     = context.hour ?? new Date().getHours();
  const isRush   = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
  const isLateNight = hour >= 22 || hour <= 2;

  const surge  = isRush ? 1.6 : isLateNight ? 1.4 : 1.0;
  const eta    = (context.distance_km ?? 5) / 25 * 60 + 5;
  const demand = isRush ? 0.8 : 0.4;
  const score  = (demand * 0.4) + (1 / Math.max(eta, 1) * 0.4) + (1 / surge * 0.2);

  return {
    surge,
    eta_minutes: Math.round(eta),
    demand,
    score:      parseFloat(score.toFixed(4)),
    model_used: 'fallback',
  };
};
