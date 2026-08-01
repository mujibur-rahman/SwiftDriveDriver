// src/services/fl/ModelManager.js
/**
 * Model Manager — downloads global model from FL server
 * and stores it locally for on-device inference.
 *
 * FL Server: http://localhost:8001 (or your server IP)
 * Endpoints:
 *   GET /fl/model/{type}/info    — check if new version available
 *   GET /fl/model/{type}/latest  — download model file
 */

import * as FileSystem from 'expo-file-system';
import { updateFLState, getFLState } from '../database/tripStore';

const FL_SERVER_URL = 'http://10.0.2.2:8001';  // Android emulator
// const FL_SERVER_URL = 'http://192.168.1.179:8001';  // Physical device

const MODEL_DIR = `${FileSystem.documentDirectory}fl_models/`;
const MODEL_TYPES = ['surge', 'eta', 'demand'];


// ── Ensure model directory exists ─────────────────────────────────────────────

const ensureModelDir = async () => {
  const info = await FileSystem.getInfoAsync(MODEL_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(MODEL_DIR, { intermediates: true });
  }
};


// ── Check if new model version available ─────────────────────────────────────

export const checkForModelUpdates = async () => {
  const state = await getFLState();
  const currentRound = state.model_version || 0;

  try {
    const res = await fetch(`${FL_SERVER_URL}/fl/status`);
    const data = await res.json();
    const serverRound = data.current_round || 0;

    if (serverRound > currentRound) {
      console.log(`[ModelManager] New model available: round ${serverRound} (have ${currentRound})`);
      return { hasUpdate: true, serverRound, currentRound };
    }

    console.log('[ModelManager] Model is up to date');
    return { hasUpdate: false, serverRound, currentRound };
  } catch (e) {
    console.warn('[ModelManager] Could not check for updates:', e.message);
    return { hasUpdate: false, error: e.message };
  }
};


// ── Download all models ───────────────────────────────────────────────────────

export const downloadModels = async (onProgress = null) => {
  await ensureModelDir();
  const results = {};

  for (let i = 0; i < MODEL_TYPES.length; i++) {
    const modelType = MODEL_TYPES[i];
    if (onProgress) onProgress({ type: modelType, step: i + 1, total: MODEL_TYPES.length });

    try {
      results[modelType] = await downloadModel(modelType);
    } catch (e) {
      console.warn(`[ModelManager] Failed to download ${modelType}:`, e.message);
      results[modelType] = { success: false, error: e.message };
    }
  }

  // Update FL state with download time
  await updateFLState({ last_download_at: new Date().toISOString() });

  const allSuccess = Object.values(results).every((r) => r.success);
  console.log(`[ModelManager] Download complete. All success: ${allSuccess}`);
  return { results, allSuccess };
};


// ── Download single model ─────────────────────────────────────────────────────

export const downloadModel = async (modelType) => {
  const infoRes  = await fetch(`${FL_SERVER_URL}/fl/model/${modelType}/info`);
  const infoData = await infoRes.json();

  if (!infoData.available) {
    console.log(`[ModelManager] ${modelType} model not available yet`);
    return { success: false, reason: 'not_available' };
  }

  const format   = infoData.format || 'weights_json';
  const ext      = format === 'tflite' ? '.tflite' : '_weights.json';
  const localPath = `${MODEL_DIR}${modelType}_latest${ext}`;

  // Download the model file
  const downloadUrl = `${FL_SERVER_URL}/fl/model/${modelType}/latest`;
  const downloadRes = await FileSystem.downloadAsync(downloadUrl, localPath);

  if (downloadRes.status !== 200) {
    throw new Error(`Download failed with status ${downloadRes.status}`);
  }

  const fileInfo = await FileSystem.getInfoAsync(localPath);
  console.log(
    `[ModelManager] Downloaded ${modelType}: ${(fileInfo.size / 1024).toFixed(1)}KB`
  );

  // Save path in FL state
  const stateKey = `${modelType}_model_path`;
  await updateFLState({ [stateKey]: localPath });

  return {
    success:  true,
    format,
    path:     localPath,
    sizeKB:   fileInfo.size / 1024,
  };
};


// ── Load model weights for JS inference ───────────────────────────────────────

export const loadModelWeights = async (modelType) => {
  const path = `${MODEL_DIR}${modelType}_latest_weights.json`;

  const info = await FileSystem.getInfoAsync(path);
  if (!info.exists) {
    console.warn(`[ModelManager] No weights file for ${modelType}`);
    return null;
  }

  const content = await FileSystem.readAsStringAsync(path);
  const data    = JSON.parse(content);
  return data.weights;
};


// ── Get local model paths ─────────────────────────────────────────────────────

export const getLocalModelPaths = async () => {
  const state = await getFLState();
  return {
    surge:  state.surge_model_path  || null,
    eta:    state.eta_model_path    || null,
    demand: state.demand_model_path || null,
  };
};


// ── Check if models exist locally ────────────────────────────────────────────

export const hasLocalModels = async () => {
  for (const modelType of MODEL_TYPES) {
    const jsonPath   = `${MODEL_DIR}${modelType}_latest_weights.json`;
    const tflitePath = `${MODEL_DIR}${modelType}_latest.tflite`;

    const hasJson   = (await FileSystem.getInfoAsync(jsonPath)).exists;
    const hasTflite = (await FileSystem.getInfoAsync(tflitePath)).exists;

    if (!hasJson && !hasTflite) return false;
  }
  return true;
};
