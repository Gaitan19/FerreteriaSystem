import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

class SignalRService {
    constructor() {
        this.connection = null;
        this.listeners = new Map();
    }

    async startConnection() {
        try {
            this.connection = new HubConnectionBuilder()
                .withUrl('/notificationHub')
                .withAutomaticReconnect()
                .configureLogging(LogLevel.Information)
                .build();

            await this.connection.start();
            console.log('SignalR connected successfully');
            
            // Setup listeners for all entity types
            this.setupEventListeners();
            
            return true;
        } catch (error) {
            console.error('SignalR connection failed:', error);
            return false;
        }
    }

    setupEventListeners() {
        if (!this.connection) return;

        // Category events
        this.connection.on('CategoriaCreated', (categoria) => {
            this.notifyListeners('categoriaCreated', categoria);
        });

        this.connection.on('CategoriaUpdated', (categoria) => {
            this.notifyListeners('categoriaUpdated', categoria);
        });

        this.connection.on('CategoriaDeleted', (categoria) => {
            this.notifyListeners('categoriaDeleted', categoria);
        });

        // Product events
        this.connection.on('ProductoCreated', (producto) => {
            this.notifyListeners('productoCreated', producto);
        });

        this.connection.on('ProductoUpdated', (producto) => {
            this.notifyListeners('productoUpdated', producto);
        });

        this.connection.on('ProductoDeleted', (producto) => {
            this.notifyListeners('productoDeleted', producto);
        });

        // User events
        this.connection.on('UsuarioCreated', (usuario) => {
            this.notifyListeners('usuarioCreated', usuario);
        });

        this.connection.on('UsuarioUpdated', (usuario) => {
            this.notifyListeners('usuarioUpdated', usuario);
        });

        this.connection.on('UsuarioDeleted', (usuario) => {
            this.notifyListeners('usuarioDeleted', usuario);
        });

        // Supplier events
        this.connection.on('ProveedorCreated', (proveedor) => {
            this.notifyListeners('proveedorCreated', proveedor);
        });

        this.connection.on('ProveedorUpdated', (proveedor) => {
            this.notifyListeners('proveedorUpdated', proveedor);
        });

        this.connection.on('ProveedorDeleted', (proveedor) => {
            this.notifyListeners('proveedorDeleted', proveedor);
        });

        // Sale events
        this.connection.on('VentaCreated', (venta) => {
            this.notifyListeners('ventaCreated', venta);
        });

        this.connection.on('VentaUpdated', (venta) => {
            this.notifyListeners('ventaUpdated', venta);
        });

        this.connection.on('VentaDeleted', (id) => {
            this.notifyListeners('ventaDeleted', id);
        });
    }

    // Subscribe to specific events
    subscribe(eventType, callback) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, new Set());
        }
        this.listeners.get(eventType).add(callback);

        // Return unsubscribe function
        return () => {
            if (this.listeners.has(eventType)) {
                this.listeners.get(eventType).delete(callback);
            }
        };
    }

    // Notify all listeners of an event
    notifyListeners(eventType, data) {
        if (this.listeners.has(eventType)) {
            this.listeners.get(eventType).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in SignalR listener for ${eventType}:`, error);
                }
            });
        }
    }

    // Stop connection
    async stopConnection() {
        if (this.connection) {
            try {
                await this.connection.stop();
                console.log('SignalR disconnected');
            } catch (error) {
                console.error('Error stopping SignalR connection:', error);
            }
        }
    }

    // Get connection state
    getConnectionState() {
        return this.connection ? this.connection.state : 'Disconnected';
    }

    // Check if connected
    isConnected() {
        return this.connection && this.connection.state === 'Connected';
    }
}

// Create singleton instance
const signalRService = new SignalRService();

export default signalRService;