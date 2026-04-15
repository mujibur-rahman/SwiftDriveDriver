// passenger-app/src/services/SocketContext.js
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import {
  updateRideStatus,
  updateDriverLocation,
  setDriver,
  updateETA,
} from '../store/slices/rideSlice';

const SocketContext = createContext(null);

// Android emulator: 10.0.2.2 maps to host machine localhost
// Physical device: use your machine's LAN IP, e.g. 192.168.1.x
const SOCKET_URL = 'http://10.0.2.2:8000';

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const dispatch = useDispatch();

  const connect = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token || socketRef.current?.connected) return;

    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 5,
    });

    socketRef.current.on('connect', () => {
      setConnected(true);
      console.log('[Socket] Passenger connected:', socketRef.current.id);
    });

    socketRef.current.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message);
    });

    socketRef.current.on('disconnect', (reason) => {
      setConnected(false);
      console.log('[Socket] Disconnected:', reason);
    });

    socketRef.current.on('ride:driver_found',        (data) => { dispatch(setDriver(data.driver)); dispatch(updateRideStatus('accepted')); });
    socketRef.current.on('ride:driver_location',     (data) => { dispatch(updateDriverLocation(data.location)); dispatch(updateETA(data.eta)); });
    socketRef.current.on('ride:driver_arrived',      ()     => { dispatch(updateRideStatus('pickup')); });
    socketRef.current.on('ride:started',             ()     => { dispatch(updateRideStatus('ongoing')); });
    socketRef.current.on('ride:completed',           ()     => { dispatch(updateRideStatus('completed')); });
    socketRef.current.on('ride:passenger_cancelled', ()     => { dispatch(updateRideStatus('cancelled')); });
    socketRef.current.on('ride:no_drivers',          ()     => { dispatch(updateRideStatus('no_drivers')); });
  };

  const disconnect = () => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setConnected(false);
  };

  const emit = (event, data) => socketRef.current?.emit(event, data);

  return (
    <SocketContext.Provider value={{ connected, connect, disconnect, emit, socket: socketRef }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
