import * as signalR from '@microsoft/signalr';

class SignalRService {
    constructor() {
        this.connection = null;
        this.isConnected = false;
        this.listeners = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    async startConnection() {
        try {
            if (this.connection && this.isConnected) {
                return this.connection;
            }

            // Get the base URL dynamically
            const baseUrl = window.location.origin;
            
            this.connection = new signalR.HubConnectionBuilder()
                .withUrl(`${baseUrl}/dataSyncHub`, {
                    withCredentials: false
                })
                .withAutomaticReconnect([0, 2000, 10000, 30000])
                .configureLogging(signalR.LogLevel.Information)
                .build();

            // Set up event handlers
            this.connection.onreconnecting(() => {
                console.log('SignalR connection lost. Attempting to reconnect...');
                this.isConnected = false;
            });

            this.connection.onreconnected(() => {
                console.log('SignalR connection reestablished.');
                this.isConnected = true;
                this.reconnectAttempts = 0;
            });

            this.connection.onclose((error) => {
                console.log('SignalR connection closed.', error);
                this.isConnected = false;
                
                // Attempt manual reconnection if automatic reconnection failed
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    setTimeout(() => {
                        this.reconnectAttempts++;
                        this.startConnection();
                    }, 5000);
                }
            });

            // Start the connection
            await this.connection.start();
            this.isConnected = true;
            console.log('SignalR connection established.');

            // Join the DataSync group
            await this.connection.invoke('JoinGroup', 'DataSync');

            // Set up the main entity change listener
            this.connection.on('EntityChanged', (notification) => {
                console.log('Entity changed:', notification);
                this.notifyListeners(notification);
            });

            return this.connection;
        } catch (error) {
            console.error('Failed to start SignalR connection:', error);
            this.isConnected = false;
            
            // Retry connection
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                setTimeout(() => {
                    this.reconnectAttempts++;
                    this.startConnection();
                }, 5000);
            }
            throw error;
        }
    }

    async stopConnection() {
        if (this.connection && this.isConnected) {
            await this.connection.stop();
            this.isConnected = false;
            console.log('SignalR connection stopped.');
        }
    }

    // Subscribe to entity changes
    subscribe(entityType, callback) {
        if (!this.listeners.has(entityType)) {
            this.listeners.set(entityType, new Set());
        }
        this.listeners.get(entityType).add(callback);

        // Return unsubscribe function
        return () => {
            const entityListeners = this.listeners.get(entityType);
            if (entityListeners) {
                entityListeners.delete(callback);
                if (entityListeners.size === 0) {
                    this.listeners.delete(entityType);
                }
            }
        };
    }

    // Notify all listeners for a specific entity type
    notifyListeners(notification) {
        const { EntityType, Action, EntityData, EntityId } = notification;
        const entityListeners = this.listeners.get(EntityType);
        
        if (entityListeners) {
            entityListeners.forEach(callback => {
                try {
                    callback({
                        action: Action,
                        data: EntityData,
                        id: EntityId,
                        entityType: EntityType,
                        timestamp: notification.Timestamp
                    });
                } catch (error) {
                    console.error('Error in SignalR listener callback:', error);
                }
            });
        }
    }

    // Check if connection is active
    isConnectionActive() {
        return this.isConnected && this.connection?.state === signalR.HubConnectionState.Connected;
    }

    // Get connection state
    getConnectionState() {
        return this.connection ? this.connection.state : 'Disconnected';
    }
}

// Create a singleton instance
const signalRService = new SignalRService();
export default signalRService;