// src/services/fl/FLClient.js
/**
 * FL Client — runs on the driver's mobile device.
 *
 * FL Round (triggered nightly via Socket.IO):
 *   1. Load local trips from SQLite
 *   2. Train 3 models locally (JS neural net)
 *   3. Add differential privacy noise to gradients
 *   4. POST gradients to FL server (NOT raw data)
 *   5. Download updated global model
 *
 * Privacy: raw trip data NEVER leaves this device.
 * Only gradient updates (with DP noise) are sent.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getTripsForTraining,
  getFLState,
  updateFLState,
  saveFLMetric,
} from '../database/tripStore';
import { downloadModels, loadModelWeights } from './ModelManager';

const FL_SERVER_URL = 'http://10.0.2.2:8001';

// ── Simple neural network in JavaScript ──────────────────────────────────────
// Mirrors the PyTorch architecture on server side

class LinearLayer {
  constructor(inFeatures, outFeatures) {
    // Xavier initialisation
    const scale = Math.sqrt(2.0 / (inFeatures + outFeatures));
    this.weights = Array.from({ length: outFeatures }, () =>
      Array.from({ length: inFeatures }, () => (Math.random() - 0.5) * scale * 2)
    );
    this.biases = Array(outFeatures).fill(0);
  }

  forward(x) {
    return this.weights.map((row, i) => {
      const sum = row.reduce((acc, w, j) => acc + w * x[j], 0);
      return sum + this.biases[i];
    });
  }
}

const relu  = (x) => x.map((v) => Math.max(0, v));
const sigmoid = (x) => x.map((v) => 1 / (1 + Math.exp(-v)));
const softplus = (x) => x.map((v) => Math.log(1 + Math.exp(v)));


// ── Load weights from JSON into layers ───────────────────────────────────────

const loadWeightsIntoLayers = (layers, weights) => {
  if (!weights) return;

  const keys = Object.keys(weights);
  let layerIdx = 0;

  for (let i = 0; i < keys.length; i += 2) {
    if (layerIdx >= layers.length) break;
    const wKey = keys[i];
    const bKey = keys[i + 1];

    if (weights[wKey]) layers[layerIdx].weights = weights[wKey];
    if (weights[bKey]) layers[layerIdx].biases  = weights[bKey];
    layerIdx++;
  }
};


// ── JS model forward pass ─────────────────────────────────────────────────────

const surgForward = (layers, x) => {
  let h = layers[0].forward(x);
  h = relu(h);
  h = layers[1].forward(h);
  h = relu(h);
  h = layers[2].forward(h);
  h = softplus(h);
  return h[0] + 1.0;  // minimum surge = 1.0
};

const etaForward = (layers, x) => {
  let h = layers[0].forward(x);
  h = relu(h);
  h = layers[1].forward(h);
  h = relu(h);
  h = layers[2].forward(h);
  h = relu(h);
  h = layers[3].forward(h);
  h = relu(h);
  return h[0] + 1.0;
};

const demandForward = (layers, x) => {
  let h = layers[0].forward(x);
  h = relu(h);
  h = layers[1].forward(h);
  h = relu(h);
  h = layers[2].forward(h);
  h = sigmoid(h);
  return h[0];
};


// ── Gradient computation (finite differences) ────────────────────────────────
// Simple numerical gradient estimation for JS
// Not as efficient as autograd but works without PyTorch on mobile

const computeNumericGradient = (forwardFn, layers, x, yTrue, eps = 1e-4) => {
  const gradients = layers.map((layer) => ({
    weights: layer.weights.map((row) => row.map(() => 0)),
    biases:  layer.biases.map(() => 0),
  }));

  const loss = (yPred, yTrue) => Math.pow(yPred - yTrue, 2);
  const basePred = forwardFn(layers, x);
  const baseLoss = loss(basePred, yTrue);

  // Compute gradient for each weight (finite differences)
  for (let l = 0; l < layers.length; l++) {
    for (let i = 0; i < layers[l].weights.length; i++) {
      for (let j = 0; j < layers[l].weights[i].length; j++) {
        const orig = layers[l].weights[i][j];
        layers[l].weights[i][j] = orig + eps;
        const newPred = forwardFn(layers, x);
        const newLoss = loss(newPred, yTrue);
        gradients[l].weights[i][j] = (newLoss - baseLoss) / eps;
        layers[l].weights[i][j] = orig;
      }
    }
    for (let i = 0; i < layers[l].biases.length; i++) {
      const orig = layers[l].biases[i];
      layers[l].biases[i] = orig + eps;
      const newPred = forwardFn(layers, x);
      const newLoss = loss(newPred, yTrue);
      gradients[l].biases[i] = (newLoss - baseLoss) / eps;
      layers[l].biases[i] = orig;
    }
  }

  return { gradients, loss: baseLoss };
};


// ── Differential Privacy: add Gaussian noise ─────────────────────────────────

const addDPNoise = (gradients, noiseMult = 1.1, clipNorm = 1.0) => {
  const noisy = gradients.map((layerGrad) => ({
    weights: layerGrad.weights.map((row) =>
      row.map((g) => {
        const clipped = Math.max(-clipNorm, Math.min(clipNorm, g));
        const noise   = gaussianRandom(0, noiseMult * clipNorm);
        return clipped + noise;
      })
    ),
    biases: layerGrad.biases.map((g) => {
      const clipped = Math.max(-clipNorm, Math.min(clipNorm, g));
      const noise   = gaussianRandom(0, noiseMult * clipNorm);
      return clipped + noise;
    }),
  }));
  return noisy;
};

const gaussianRandom = (mean = 0, std = 1) => {
  // Box-Muller transform
  const u1 = Math.random();
  const u2 = Math.random();
  return mean + std * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
};


// ── Estimate privacy budget (simplified RDP accountant) ──────────────────────

const estimateEpsilon = (nSamples, batchSize, nSteps, noiseMult, delta = 1e-5) => {
  // Simplified DP budget estimate
  // For accurate values use python-dp library or Opacus
  const q   = batchSize / nSamples;       // sampling rate
  const renyiDiv = q * q / (2 * noiseMult * noiseMult);
  const eps = renyiDiv * nSteps + Math.sqrt(2 * renyiDiv * Math.log(1 / delta));
  return Math.max(0.01, eps);
};


// ── Main FL training function ─────────────────────────────────────────────────

export const runLocalTraining = async (modelType, roundNumber) => {
  console.log(`[FLClient] Starting local training — ${modelType} round ${roundNumber}`);

  // 1. Load local trip data
  const { features, labels, count } = await getTripsForTraining(modelType, 500, 30);

  if (count < 10) {
    console.warn(`[FLClient] Not enough data for ${modelType}: ${count} trips (need 10+)`);
    return { success: false, reason: 'insufficient_data', count };
  }

  // 2. Load current global model weights
  const globalWeights = await loadModelWeights(modelType);

  // 3. Build layers with global weights
  let layers, forwardFn;

  if (modelType === 'surge') {
    layers = [
      new LinearLayer(8, 32),
      new LinearLayer(32, 16),
      new LinearLayer(16, 1),
    ];
    forwardFn = surgForward;
  } else if (modelType === 'eta') {
    layers = [
      new LinearLayer(8, 64),
      new LinearLayer(64, 32),
      new LinearLayer(32, 16),
      new LinearLayer(16, 1),
    ];
    forwardFn = etaForward;
  } else {
    layers = [
      new LinearLayer(6, 32),
      new LinearLayer(32, 16),
      new LinearLayer(16, 1),
    ];
    forwardFn = demandForward;
  }

  // Load global weights if available
  if (globalWeights) {
    loadWeightsIntoLayers(layers, globalWeights);
  }

  // 4. Local training (5 epochs, SGD)
  const lr       = 0.001;
  const epochs   = 5;
  const batchSize = 16;
  let totalLoss  = 0;
  let nSteps     = 0;

  for (let epoch = 0; epoch < epochs; epoch++) {
    // Shuffle data
    const indices = features.map((_, i) => i).sort(() => Math.random() - 0.5);

    for (let b = 0; b < indices.length; b += batchSize) {
      const batch = indices.slice(b, b + batchSize);

      for (const idx of batch) {
        const x = features[idx];
        const y = labels[idx];

        // Compute gradients
        const { gradients, loss } = computeNumericGradient(forwardFn, layers, x, y);
        totalLoss += loss;
        nSteps++;

        // 5. Add DP noise to gradients
        const noisyGrads = addDPNoise(gradients);

        // 6. Update weights (SGD step)
        for (let l = 0; l < layers.length; l++) {
          for (let i = 0; i < layers[l].weights.length; i++) {
            for (let j = 0; j < layers[l].weights[i].length; j++) {
              layers[l].weights[i][j] -= lr * noisyGrads[l].weights[i][j];
            }
          }
          for (let i = 0; i < layers[l].biases.length; i++) {
            layers[l].biases[i] -= lr * noisyGrads[l].biases[i];
          }
        }
      }
    }
  }

  const avgLoss = totalLoss / Math.max(nSteps, 1);
  const epsilon = estimateEpsilon(count, batchSize, nSteps, 1.1);

  // 7. Package updated weights
  const updatedWeights = {};
  layers.forEach((layer, i) => {
    updatedWeights[`net.${i * 2}.weight`] = layer.weights;
    updatedWeights[`net.${i * 2}.bias`]   = layer.biases;
  });

  // Calculate bytes sent (gradients only)
  const gradientBytes = JSON.stringify(updatedWeights).length;

  console.log(
    `[FLClient] ${modelType} training done — ` +
    `loss=${avgLoss.toFixed(4)} ε=${epsilon.toFixed(3)} ` +
    `samples=${count} bytes=${(gradientBytes/1024).toFixed(1)}KB`
  );

  return {
    success: true,
    modelType,
    roundNumber,
    updatedWeights,
    metrics: {
      localLoss:   avgLoss,
      epsilon,
      samplesUsed: count,
      bytesSent:   gradientBytes,
    },
  };
};


// ── Send gradients to FL server ───────────────────────────────────────────────

export const sendGradientsToServer = async (modelType, updatedWeights, metrics, roundNumber) => {
  const token = await AsyncStorage.getItem('token');

  const payload = {
    model_type:   modelType,
    round_number: roundNumber,
    weights:      updatedWeights,
    n_samples:    metrics.samplesUsed,
    metrics: {
      local_loss: metrics.localLoss,
      epsilon:    metrics.epsilon,
      bytes_sent: metrics.bytesSent,
    },
  };

  const payloadBytes = JSON.stringify(payload).length;

  const res = await fetch(`${FL_SERVER_URL}/fl/gradients`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Server returned ${res.status}`);
  }

  const data = await res.json();
  console.log(`[FLClient] Gradients sent for ${modelType} — round ${roundNumber}`);
  return { success: true, bytesActuallySent: payloadBytes, response: data };
};


// ── Full FL round ─────────────────────────────────────────────────────────────

export const runFLRound = async (roundNumber, onProgress = null) => {
  const modelTypes = ['surge', 'eta', 'demand'];
  const results    = {};

  console.log(`[FLClient] === FL Round ${roundNumber} starting ===`);

  for (const modelType of modelTypes) {
    try {
      if (onProgress) onProgress({ modelType, status: 'training' });

      // Train locally
      const trainResult = await runLocalTraining(modelType, roundNumber);

      if (!trainResult.success) {
        results[modelType] = trainResult;
        continue;
      }

      if (onProgress) onProgress({ modelType, status: 'sending' });

      // Send gradients to server
      const sendResult = await sendGradientsToServer(
        modelType,
        trainResult.updatedWeights,
        trainResult.metrics,
        roundNumber,
      );

      // Save local metric
      await saveFLMetric({
        roundNumber,
        modelType,
        localLoss:   trainResult.metrics.localLoss,
        epsilon:     trainResult.metrics.epsilon,
        samplesUsed: trainResult.metrics.samplesUsed,
        bytesSent:   sendResult.bytesActuallySent,
      });

      results[modelType] = {
        success:  true,
        ...trainResult.metrics,
        bytesSent: sendResult.bytesActuallySent,
      };

    } catch (e) {
      console.warn(`[FLClient] ${modelType} round failed:`, e.message);
      results[modelType] = { success: false, error: e.message };
    }
  }

  // Download updated global model
  if (onProgress) onProgress({ modelType: 'all', status: 'downloading' });
  await downloadModels();

  // Update FL state
  const state = await getFLState();
  await updateFLState({
    total_rounds:   (state.total_rounds || 0) + 1,
    last_trained_at: new Date().toISOString(),
    model_version:  roundNumber,
  });

  console.log(`[FLClient] === FL Round ${roundNumber} complete ===`);
  return results;
};
