import { useEffect, useCallback, useRef } from 'react';
import signalRService from '../utils/signalRService';

export const useSignalR = (entityType, onEntityChanged) => {
    const unsubscribeRef = useRef(null);

    const handleEntityChange = useCallback((notification) => {
        if (onEntityChanged) {
            onEntityChanged(notification);
        }
    }, [onEntityChanged]);

    useEffect(() => {
        // Start SignalR connection and subscribe to entity changes
        const setupSignalR = async () => {
            try {
                await signalRService.startConnection();
                
                if (entityType && handleEntityChange) {
                    unsubscribeRef.current = signalRService.subscribe(entityType, handleEntityChange);
                }
            } catch (error) {
                console.error('Failed to setup SignalR:', error);
            }
        };

        setupSignalR();

        // Cleanup function
        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = null;
            }
        };
    }, [entityType, handleEntityChange]);

    const connectionState = signalRService.getConnectionState();
    const isConnected = signalRService.isConnectionActive();

    return {
        isConnected,
        connectionState
    };
};

export default useSignalR;