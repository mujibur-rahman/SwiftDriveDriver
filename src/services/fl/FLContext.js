// src/services/fl/FLContext.js
/**
 * FL Context — manages FL lifecycle in the driver app.
 *
 * Responsibilities:
 *   - Listen for fl:train_round from server (Socket.IO)
 *   - Schedule nightly training (background task)
 *   - Download model on app startup
 *   - Provide FL status to UI
 */

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { AppState } from 'react-native';
import { useSelector } from 'react-redux';
import { runFLRound } from './FLClient';
import { checkForModelUpdates, downloadModels, hasLocalModels } from './ModelManager';
import { getLocalTripStats, getFLState } from '../database/tripStore';

const BACKGROUND_FL_TASK = 'background-fl-training';
const FLContext = createContext(null);

// ── Background task registration ──────────────────────────────────────────────

TaskManager.defineTask(BACKGROUND_FL_TASK, async () => {
  try {
    console.log('[FL Background] Nightly training triggered');
    const state    = await getFLState();
    const round    = (state.total_rounds || 0) + 1;
    await runFLRound(round);
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (e) {
    console.warn('[FL Background] Training failed:', e.message);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});


// ── FL Provider ───────────────────────────────────────────────────────────────

export const FLProvider = ({ children, socket }) => {
  const { isAuthenticated } = useSelector((s) => s.auth);

  const [flStatus, setFlStatus] = useState({
    isTraining:    false,
    lastTrainedAt: null,
    modelVersion:  0,
    totalRounds:   0,
    currentModel:  null,
    progress:      null,
    tripCount:     0,
    hasModels:     false,
  });

  const trainingRef = useRef(false);

  // ── On app start ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isAuthenticated) {
      initFL();
      registerBackgroundTask();
    }
  }, [isAuthenticated]);

  // ── Listen for Socket.IO FL events ─────────────────────────────────────────
  useEffect(() => {
    if (!socket?.current) return;

    // Server triggers training round
    socket.current.on('fl:train_round', async (data) => {
      console.log('[FL] Server triggered training round:', data.round_number);
      if (!trainingRef.current) {
        await startTrainingRound(data.round_number);
      }
    });

    // Server sends inference request
    socket.current.on('fl:infer_request', async (data) => {
      await handleInferenceRequest(data);
    });

    return () => {
      socket.current?.off('fl:train_round');
      socket.current?.off('fl:infer_request');
    };
  }, [socket?.current]);

  // ── AppState — check for updates when app comes to foreground ──────────────
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextState) => {
      if (nextState === 'active') {
        const { hasUpdate } = await checkForModelUpdates();
        if (hasUpdate) {
          await downloadModels();
          await refreshStatus();
        }
      }
    });
    return () => subscription.remove();
  }, []);

  // ── Init ────────────────────────────────────────────────────────────────────

  const initFL = async () => {
    await refreshStatus();

    // Download models if not available
    const modelsExist = await hasLocalModels();
    if (!modelsExist) {
      console.log('[FL] No local models — downloading from server');
      try {
        await downloadModels();
        await refreshStatus();
      } catch (e) {
        console.warn('[FL] Could not download models on startup:', e.message);
      }
    } else {
      console.log('[FL] Local models available');
    }
  };

  const refreshStatus = async () => {
    const state = await getFLState();
    const stats = await getLocalTripStats();
    const has   = await hasLocalModels();

    setFlStatus((prev) => ({
      ...prev,
      lastTrainedAt: state.last_trained_at,
      modelVersion:  state.model_version || 0,
      totalRounds:   state.total_rounds  || 0,
      tripCount:     stats.totalTrips    || 0,
      hasModels:     has,
    }));
  };

  // ── Training round ──────────────────────────────────────────────────────────

  const startTrainingRound = async (roundNumber) => {
    if (trainingRef.current) return;
    trainingRef.current = true;
    setFlStatus((prev) => ({ ...prev, isTraining: true, progress: null }));

    try {
      const results = await runFLRound(roundNumber, (progress) => {
        setFlStatus((prev) => ({ ...prev, progress }));
      });

      console.log('[FL] Round complete:', results);
      await refreshStatus();
    } catch (e) {
      console.warn('[FL] Round failed:', e.message);
    } finally {
      trainingRef.current = false;
      setFlStatus((prev) => ({ ...prev, isTraining: false, progress: null }));
    }
  };

  // ── On-device inference ─────────────────────────────────────────────────────

  const handleInferenceRequest = async (data) => {
    const { context, order_id, request_id } = data;
    if (!context) return;

    try {
      const { runInference } = await import('./FLInference');
      const predictions = await runInference(context);

      // Send predictions back to server
      socket.current?.emit('fl:infer_response', {
        request_id,
        order_id,
        predictions,
        timestamp: new Date().toISOString(),
      });

      console.log('[FL] Inference sent:', predictions);
    } catch (e) {
      console.warn('[FL] Inference failed:', e.message);
    }
  };

  // ── Background task registration ────────────────────────────────────────────

  const registerBackgroundTask = async () => {
    try {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_FL_TASK, {
        minimumInterval: 60 * 60 * 8,  // every 8 hours minimum
        stopOnTerminate: false,
        startOnBoot:     true,
      });
      console.log('[FL] Background task registered');
    } catch (e) {
      console.warn('[FL] Background task registration failed:', e.message);
    }
  };

  // ── Manual trigger (for testing) ─────────────────────────────────────────────

  const triggerManualTraining = async () => {
    const state = await getFLState();
    const round = (state.total_rounds || 0) + 1;
    await startTrainingRound(round);
  };

  return (
    <FLContext.Provider value={{
      flStatus,
      triggerManualTraining,
      refreshStatus,
    }}>
      {children}
    </FLContext.Provider>
  );
};

export const useFL = () => useContext(FLContext);
