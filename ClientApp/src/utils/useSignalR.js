import { useEffect, useCallback, useRef } from 'react';
import signalRService from '../utils/signalRService';

export const useSignalR = (entityTypes, onEntityChanged) => {
    const unsubscribeRefs = useRef([]);

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
                
                if (entityTypes && handleEntityChange) {
                    // Support both single entity type and array of entity types
                    const typesToSubscribe = Array.isArray(entityTypes) ? entityTypes : [entityTypes];
                    
                    // Subscribe to all entity types
                    typesToSubscribe.forEach(entityType => {
                        if (entityType) {
                            const unsubscribe = signalRService.subscribe(entityType, handleEntityChange);
                            unsubscribeRefs.current.push(unsubscribe);
                        }
                    });
                    
                    // Also subscribe to a general handler that listens to all types
                    const unsubscribeAll = signalRService.subscribe('*', handleEntityChange);
                    unsubscribeRefs.current.push(unsubscribeAll);
                }
            } catch (error) {
                console.error('Failed to setup SignalR:', error);
            }
        };

        setupSignalR();

        // Cleanup function
        return () => {
            unsubscribeRefs.current.forEach(unsubscribe => {
                if (unsubscribe) {
                    unsubscribe();
                }
            });
            unsubscribeRefs.current = [];
        };
    }, [entityTypes, handleEntityChange]);

    const connectionState = signalRService.getConnectionState();
    const isConnected = signalRService.isConnectionActive();

    return {
        isConnected,
        connectionState
    };
};

export default useSignalR;