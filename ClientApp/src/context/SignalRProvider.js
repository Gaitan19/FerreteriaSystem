import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import signalRService from '../utils/signalRService';

const SignalRContext = createContext();

/**
 * SignalR Provider component that manages the SignalR connection and provides
 * real-time functionality to child components.
 */
export const SignalRProvider = ({ children }) => {
    const [connectionState, setConnectionState] = useState('Disconnected');
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Start SignalR connection when the provider mounts
        const initializeConnection = async () => {
            try {
                await signalRService.start();
                setConnectionState(signalRService.getConnectionState());
                setIsConnected(signalRService.isConnected());
            } catch (error) {
                console.error('Failed to initialize SignalR connection:', error);
            }
        };

        initializeConnection();

        // Set up a periodic check for connection state
        const interval = setInterval(() => {
            const currentState = signalRService.getConnectionState();
            const currentConnected = signalRService.isConnected();
            
            setConnectionState(currentState);
            setIsConnected(currentConnected);
        }, 2000);

        // Clean up on unmount
        return () => {
            clearInterval(interval);
            signalRService.stop();
        };
    }, []);

    /**
     * Subscribe to entity changes
     * @param {string} entityType - Type of entity to listen for changes
     * @param {function} callback - Callback function to handle changes
     * @returns {function} Unsubscribe function
     */
    const subscribe = useCallback((entityType, callback) => {
        return signalRService.addListener(entityType, callback);
    }, []);

    /**
     * Subscribe to all entity changes
     * @param {function} callback - Callback function to handle all changes
     * @returns {function} Unsubscribe function
     */
    const subscribeToAll = useCallback((callback) => {
        return signalRService.addListener('*', callback);
    }, []);

    const value = {
        connectionState,
        isConnected,
        subscribe,
        subscribeToAll
    };

    return (
        <SignalRContext.Provider value={value}>
            {children}
        </SignalRContext.Provider>
    );
};

/**
 * Hook to use SignalR context
 */
export const useSignalR = () => {
    const context = useContext(SignalRContext);
    if (!context) {
        throw new Error('useSignalR must be used within a SignalRProvider');
    }
    return context;
};

/**
 * Hook to subscribe to specific entity changes
 * @param {string} entityType - Type of entity to listen for changes
 * @param {function} onEntityChange - Callback function to handle changes
 */
export const useEntitySubscription = (entityType, onEntityChange) => {
    const { subscribe } = useSignalR();

    useEffect(() => {
        if (!entityType || !onEntityChange) return;

        const unsubscribe = subscribe(entityType, onEntityChange);
        return unsubscribe;
    }, [entityType, onEntityChange, subscribe]);
};

/**
 * Hook to get real-time data updates for a specific entity type
 * @param {string} entityType - Type of entity to monitor
 * @param {array} initialData - Initial data array
 * @returns {array} Updated data array
 */
export const useRealTimeData = (entityType, initialData = []) => {
    const [data, setData] = useState(initialData);
    const { subscribe } = useSignalR();

    useEffect(() => {
        setData(initialData);
    }, [initialData]);

    useEffect(() => {
        if (!entityType) return;

        const handleEntityChange = (eventType, eventData) => {
            const { EntityType, Data, Id } = eventData;
            
            if (EntityType !== entityType) return;

            setData(currentData => {
                switch (eventType) {
                    case 'EntityCreated':
                        // Add new entity if not already present
                        const existsInCreate = currentData.some(item => 
                            item.IdProducto === Data.IdProducto ||
                            item.IdCategoria === Data.IdCategoria ||
                            item.IdProveedor === Data.IdProveedor ||
                            item.IdUsuario === Data.IdUsuario
                        );
                        return existsInCreate ? currentData : [...currentData, Data];

                    case 'EntityUpdated':
                        // Update existing entity
                        return currentData.map(item => {
                            const itemId = item.IdProducto || item.IdCategoria || item.IdProveedor || item.IdUsuario;
                            const dataId = Data.IdProducto || Data.IdCategoria || Data.IdProveedor || Data.IdUsuario;
                            return itemId === dataId ? { ...item, ...Data } : item;
                        });

                    case 'EntityDeleted':
                        // Remove deleted entity (soft delete - could also update EsActivo flag)
                        return currentData.filter(item => {
                            const itemId = item.IdProducto || item.IdCategoria || item.IdProveedor || item.IdUsuario;
                            return itemId !== Id;
                        });

                    default:
                        return currentData;
                }
            });
        };

        const unsubscribe = subscribe(entityType, handleEntityChange);
        return unsubscribe;
    }, [entityType, subscribe]);

    return data;
};