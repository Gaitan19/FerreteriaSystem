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
    const [initialized, setInitialized] = useState(false);
    const { subscribe } = useSignalR();

    // Update data when initialData changes, but only if not yet initialized or if initial data is being reset
    useEffect(() => {
        if (!initialized && initialData.length > 0) {
            setData(initialData);
            setInitialized(true);
        } else if (initialized && initialData.length === 0) {
            // Reset case - when component reinitializes
            setData(initialData);
            setInitialized(false);
        } else if (!initialized) {
            setData(initialData);
        }
    }, [initialData, initialized]);

    useEffect(() => {
        if (!entityType) return;

        const handleEntityChange = (eventType, eventData) => {
            const { EntityType, Data, Id } = eventData;
            
            if (EntityType !== entityType) return;

            console.log(`SignalR received ${eventType} for ${EntityType}:`, eventData);

            // Helper function to get entity ID, handling both PascalCase and camelCase for all entity types
            const getEntityId = (item) => {
                return item.IdProducto || item.idProducto ||
                       item.IdCategoria || item.idCategoria ||
                       item.IdProveedor || item.idProveedor ||
                       item.IdUsuario || item.idUsuario ||
                       item.IdVenta || item.idVenta ||
                       item.Id || item.id;
            };

            setData(currentData => {
                let newData;
                switch (eventType) {
                    case 'EntityCreated':
                        // Add new entity if not already present
                        const newEntityId = getEntityId(Data);
                        const existsInCreate = currentData.some(item => 
                            getEntityId(item) === newEntityId
                        );
                        newData = existsInCreate ? [...currentData] : [...currentData, Data];
                        console.log(`SignalR: ${entityType} created`, { newEntityId, exists: existsInCreate, currentCount: currentData.length, newCount: newData.length });
                        return newData;

                    case 'EntityUpdated':
                        // Update existing entity
                        const updateEntityId = getEntityId(Data);
                        newData = currentData.map(item => {
                            const itemId = getEntityId(item);
                            return itemId === updateEntityId ? { ...item, ...Data } : item;
                        });
                        console.log(`SignalR: ${entityType} updated`, { updateEntityId, updated: newData.length });
                        return newData;

                    case 'EntityDeleted':
                        // Remove deleted entity (soft delete - could also update EsActivo flag)
                        newData = currentData.filter(item => {
                            const itemId = getEntityId(item);
                            return itemId !== Id;
                        });
                        console.log(`SignalR: ${entityType} deleted`, { deletedId: Id, currentCount: currentData.length, newCount: newData.length });
                        return newData;

                    default:
                        console.log(`SignalR: Unknown event type ${eventType} for ${entityType}`);
                        return currentData;
                }
            });
        };

        const unsubscribe = subscribe(entityType, handleEntityChange);
        return unsubscribe;
    }, [entityType, subscribe]);

    return data;
};