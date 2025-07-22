using Microsoft.AspNetCore.SignalR;
using ReactVentas.Hubs;

namespace ReactVentas.Services
{
    public interface INotificationService
    {
        Task NotifyCategoriaCreated(object categoria);
        Task NotifyCategoriaUpdated(object categoria);
        Task NotifyCategoriaDeleted(int id);
        
        Task NotifyProductoCreated(object producto);
        Task NotifyProductoUpdated(object producto);
        Task NotifyProductoDeleted(int id);
        
        Task NotifyUsuarioCreated(object usuario);
        Task NotifyUsuarioUpdated(object usuario);
        Task NotifyUsuarioDeleted(int id);
        
        Task NotifyProveedorCreated(object proveedor);
        Task NotifyProveedorUpdated(object proveedor);
        Task NotifyProveedorDeleted(int id);
        
        Task NotifyVentaCreated(object venta);
        Task NotifyVentaUpdated(object venta);
        Task NotifyVentaDeleted(int id);
    }

    public class NotificationService : INotificationService
    {
        private readonly IHubContext<NotificationHub> _hubContext;

        public NotificationService(IHubContext<NotificationHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task NotifyCategoriaCreated(object categoria)
        {
            await _hubContext.Clients.Group("NotificationGroup").SendAsync("CategoriaCreated", categoria);
        }

        public async Task NotifyCategoriaUpdated(object categoria)
        {
            await _hubContext.Clients.Group("NotificationGroup").SendAsync("CategoriaUpdated", categoria);
        }

        public async Task NotifyCategoriaDeleted(int id)
        {
            await _hubContext.Clients.Group("NotificationGroup").SendAsync("CategoriaDeleted", id);
        }

        public async Task NotifyProductoCreated(object producto)
        {
            await _hubContext.Clients.Group("NotificationGroup").SendAsync("ProductoCreated", producto);
        }

        public async Task NotifyProductoUpdated(object producto)
        {
            await _hubContext.Clients.Group("NotificationGroup").SendAsync("ProductoUpdated", producto);
        }

        public async Task NotifyProductoDeleted(int id)
        {
            await _hubContext.Clients.Group("NotificationGroup").SendAsync("ProductoDeleted", id);
        }

        public async Task NotifyUsuarioCreated(object usuario)
        {
            await _hubContext.Clients.Group("NotificationGroup").SendAsync("UsuarioCreated", usuario);
        }

        public async Task NotifyUsuarioUpdated(object usuario)
        {
            await _hubContext.Clients.Group("NotificationGroup").SendAsync("UsuarioUpdated", usuario);
        }

        public async Task NotifyUsuarioDeleted(int id)
        {
            await _hubContext.Clients.Group("NotificationGroup").SendAsync("UsuarioDeleted", id);
        }

        public async Task NotifyProveedorCreated(object proveedor)
        {
            await _hubContext.Clients.Group("NotificationGroup").SendAsync("ProveedorCreated", proveedor);
        }

        public async Task NotifyProveedorUpdated(object proveedor)
        {
            await _hubContext.Clients.Group("NotificationGroup").SendAsync("ProveedorUpdated", proveedor);
        }

        public async Task NotifyProveedorDeleted(int id)
        {
            await _hubContext.Clients.Group("NotificationGroup").SendAsync("ProveedorDeleted", id);
        }

        public async Task NotifyVentaCreated(object venta)
        {
            await _hubContext.Clients.Group("NotificationGroup").SendAsync("VentaCreated", venta);
        }

        public async Task NotifyVentaUpdated(object venta)
        {
            await _hubContext.Clients.Group("NotificationGroup").SendAsync("VentaUpdated", venta);
        }

        public async Task NotifyVentaDeleted(int id)
        {
            await _hubContext.Clients.Group("NotificationGroup").SendAsync("VentaDeleted", id);
        }
    }
}