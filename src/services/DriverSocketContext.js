// driver-app/src/services/DriverSocketContext.js
import React, { createContext, useContext, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { Vibration } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import {
  setIncomingRide, clearIncomingRide,
  setRideStatus, setCurrentLocation,
} from '@/features/driver/driverSlice';

const DriverSocketContext = createContext(null);

// Android emulator → 10.0.2.2 | Physical device → your LAN IP
const SOCKET_URL = 'http://10.0.2.2:8000';

export const DriverSocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const dispatch = useDispatch();

  const connect = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token || socketRef.current?.connected) return;

    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      // Use polling first, then upgrade — more reliable on emulator/mobile
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionDelay: 3000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: 10,
      timeout: 30000,          // connection timeout 30s
      pingTimeout: 60000,      // must match server ping_timeout
      pingInterval: 25000,     // must match server ping_interval
    });

    socketRef.current.on('connect', () => {
      setConnected(true);
      console.log('[Socket] Driver connected:', socketRef.current.id);
    });

    socketRef.current.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message);
    });

    socketRef.current.on('disconnect', (reason) => {
      setConnected(false);
      console.log('[Socket] Disconnected:', reason);
      // Auto reconnect unless manually closed
      if (reason === 'io server disconnect') {
        socketRef.current.connect();
      }
    });

    // Handle both old and new event names
    const handleNewRequest = (data) => {
      console.log('[Socket] ride:new_request received:', JSON.stringify(data));
      dispatch(setIncomingRide(data));
      Vibration.vibrate([0, 400, 200, 400, 200, 400]);
    };

    socketRef.current.on('ride:new_request', handleNewRequest);
    socketRef.current.on('order:new_request', handleNewRequest);

    socketRef.current.on('ride:request_expired', () => dispatch(clearIncomingRide()));
    socketRef.current.on('ride:passenger_cancelled', () => {
      dispatch(setRideStatus('idle'));
      dispatch(clearIncomingRide());
    });
  };

  const disconnect = () => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setConnected(false);
  };

  const emit = (event, data) => socketRef.current?.emit(event, data);
  const updateLocation = (coords) => { dispatch(setCurrentLocation(coords)); emit('driver:location_update', coords); };
  //const goOnline       = ()            => emit('driver:go_online');
  //const goOffline      = ()            => emit('driver:go_offline');
  const goOnline = () => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('driver:go_online');
    } else {
      console.warn('[Socket] Not connected — skipping go_online emit');
    }
  };

  const goOffline = () => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('driver:go_offline');
    }
  };
  const arrivedAtPickup = (rideId) => { emit('driver:arrived_at_pickup', { rideId }); dispatch(setRideStatus('arrived')); };

  return (
    <DriverSocketContext.Provider value={{
      connected, connect, disconnect, emit,
      updateLocation, goOnline, goOffline, arrivedAtPickup,
      socket: socketRef,
    }}>
      {children}
    </DriverSocketContext.Provider>
  );
};

export const useDriverSocket = () => useContext(DriverSocketContext);