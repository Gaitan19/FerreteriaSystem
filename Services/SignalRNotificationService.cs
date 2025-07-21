using Microsoft.AspNetCore.SignalR;
using ReactVentas.Hubs;
using ReactVentas.Interfaces;

namespace ReactVentas.Services
{
    /// <summary>
    /// Service for sending real-time notifications via SignalR to all connected clients.
    /// </summary>
    public class SignalRNotificationService : ISignalRNotificationService
    {
        private readonly IHubContext<DataSyncHub> _hubContext;

        public SignalRNotificationService(IHubContext<DataSyncHub> hubContext)
        {
            _hubContext = hubContext;
        }

        /// <summary>
        /// Notifies all clients when an entity is created.
        /// </summary>
        /// <param name="entityType">The type of entity (e.g., "Producto", "Categoria")</param>
        /// <param name="entity">The created entity data</param>
        /// <returns>Task representing the asynchronous operation</returns>
        public async Task NotifyEntityCreatedAsync(string entityType, object entity)
        {
            await _hubContext.Clients.All.SendAsync("EntityCreated", new
            {
                EntityType = entityType,
                Data = entity,
                Timestamp = DateTime.UtcNow
            });
        }

        /// <summary>
        /// Notifies all clients when an entity is updated.
        /// </summary>
        /// <param name="entityType">The type of entity (e.g., "Producto", "Categoria")</param>
        /// <param name="entity">The updated entity data</param>
        /// <returns>Task representing the asynchronous operation</returns>
        public async Task NotifyEntityUpdatedAsync(string entityType, object entity)
        {
            await _hubContext.Clients.All.SendAsync("EntityUpdated", new
            {
                EntityType = entityType,
                Data = entity,
                Timestamp = DateTime.UtcNow
            });
        }

        /// <summary>
        /// Notifies all clients when an entity is deleted (soft deleted).
        /// </summary>
        /// <param name="entityType">The type of entity (e.g., "Producto", "Categoria")</param>
        /// <param name="entityId">The ID of the deleted entity</param>
        /// <returns>Task representing the asynchronous operation</returns>
        public async Task NotifyEntityDeletedAsync(string entityType, int entityId)
        {
            await _hubContext.Clients.All.SendAsync("EntityDeleted", new
            {
                EntityType = entityType,
                Id = entityId,
                Timestamp = DateTime.UtcNow
            });
        }
    }
}