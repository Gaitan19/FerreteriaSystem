import * as signalR from '@microsoft/signalr';

class SignalRService {
    constructor() {
        this.connection = null;
        this.listeners = new Map();
    }

    /**
     * Initialize SignalR connection
     */
    async start() {
        if (this.connection) {
            return;
        }

        // Create connection
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl("/dataSyncHub", {
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect()
            .build();

        // Set up event handlers
        this.connection.on("EntityCreated", (data) => {
            this.notifyListeners("EntityCreated", data);
        });

        this.connection.on("EntityUpdated", (data) => {
            this.notifyListeners("EntityUpdated", data);
        });

        this.connection.on("EntityDeleted", (data) => {
            this.notifyListeners("EntityDeleted", data);
        });

        // Handle connection state changes
        this.connection.onreconnecting(() => {
            console.log("SignalR: Reconnecting...");
        });

        this.connection.onreconnected(() => {
            console.log("SignalR: Reconnected");
        });

        this.connection.onclose(() => {
            console.log("SignalR: Connection closed");
        });

        try {
            await this.connection.start();
            console.log("SignalR: Connected successfully");
        } catch (error) {
            console.error("SignalR: Connection failed:", error);
            // Retry connection after a delay
            setTimeout(() => this.start(), 5000);
        }
    }

    /**
     * Stop SignalR connection
     */
    async stop() {
        if (this.connection) {
            await this.connection.stop();
            this.connection = null;
        }
    }

    /**
     * Add event listener for entity changes
     * @param {string} entityType - Type of entity (e.g., "Producto", "Categoria")
     * @param {function} callback - Callback function to handle the event
     * @returns {function} Unsubscribe function
     */
    addListener(entityType, callback) {
        if (!this.listeners.has(entityType)) {
            this.listeners.set(entityType, new Set());
        }
        
        this.listeners.get(entityType).add(callback);

        // Return unsubscribe function
        return () => {
            const callbacks = this.listeners.get(entityType);
            if (callbacks) {
                callbacks.delete(callback);
                if (callbacks.size === 0) {
                    this.listeners.delete(entityType);
                }
            }
        };
    }

    /**
     * Notify all listeners for a specific entity type
     * @param {string} eventType - Type of event (EntityCreated, EntityUpdated, EntityDeleted)
     * @param {object} data - Event data
     */
    notifyListeners(eventType, data) {
        const entityType = data.EntityType;
        const callbacks = this.listeners.get(entityType);
        
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(eventType, data);
                } catch (error) {
                    console.error(`Error in SignalR listener for ${entityType}:`, error);
                }
            });
        }

        // Also notify general listeners (listening to all entities)
        const generalCallbacks = this.listeners.get('*');
        if (generalCallbacks) {
            generalCallbacks.forEach(callback => {
                try {
                    callback(eventType, data);
                } catch (error) {
                    console.error(`Error in general SignalR listener:`, error);
                }
            });
        }
    }

    /**
     * Get connection state
     */
    getConnectionState() {
        return this.connection ? this.connection.state : 'Disconnected';
    }

    /**
     * Check if connected
     */
    isConnected() {
        return this.connection && this.connection.state === signalR.HubConnectionState.Connected;
    }
}

// Create singleton instance
const signalRService = new SignalRService();

export default signalRService;