import React, { createContext, useContext, useEffect, useState } from 'react';
import signalRService from '../services/signalRService';

const SignalRContext = createContext();

export const useSignalR = () => {
    const context = useContext(SignalRContext);
    if (!context) {
        throw new Error('useSignalR must be used within a SignalRProvider');
    }
    return context;
};

export const SignalRProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [connectionState, setConnectionState] = useState('Disconnected');

    useEffect(() => {
        let mounted = true;

        const initializeConnection = async () => {
            try {
                const connected = await signalRService.startConnection();
                if (mounted) {
                    setIsConnected(connected);
                    setConnectionState(signalRService.getConnectionState());
                }
            } catch (error) {
                console.error('Failed to initialize SignalR connection:', error);
                if (mounted) {
                    setIsConnected(false);
                    setConnectionState('Disconnected');
                }
            }
        };

        initializeConnection();

        // Cleanup on unmount
        return () => {
            mounted = false;
            signalRService.stopConnection();
        };
    }, []);

    // Update connection state periodically
    useEffect(() => {
        const interval = setInterval(() => {
            setConnectionState(signalRService.getConnectionState());
            setIsConnected(signalRService.isConnected());
        }, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
    }, []);

    const value = {
        isConnected,
        connectionState,
        signalRService,
        subscribe: (eventType, callback) => signalRService.subscribe(eventType, callback),
    };

    return (
        <SignalRContext.Provider value={value}>
            {children}
        </SignalRContext.Provider>
    );
};