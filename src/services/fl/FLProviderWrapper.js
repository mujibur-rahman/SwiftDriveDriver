// src/services/fl/FLProviderWrapper.js
/**
 * Wrapper that connects FLProvider to DriverSocketContext.
 * Placed inside DriverSocketProvider so it has access to the socket.
 */

import React from 'react';
import { useDriverSocket } from '../DriverSocketContext';
import { FLProvider } from './FLContext';

export const FLProviderWrapper = ({ children }) => {
  const { socket } = useDriverSocket();
  return <FLProvider socket={socket}>{children}</FLProvider>;
};
