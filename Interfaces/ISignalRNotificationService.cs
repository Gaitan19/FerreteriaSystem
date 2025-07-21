namespace ReactVentas.Interfaces
{
    /// <summary>
    /// Interface for SignalR notification service to broadcast real-time updates to connected clients.
    /// </summary>
    public interface ISignalRNotificationService
    {
        /// <summary>
        /// Notifies all clients when an entity is created.
        /// </summary>
        /// <param name="entityType">The type of entity (e.g., "Producto", "Categoria")</param>
        /// <param name="entity">The created entity data</param>
        /// <returns>Task representing the asynchronous operation</returns>
        Task NotifyEntityCreatedAsync(string entityType, object entity);

        /// <summary>
        /// Notifies all clients when an entity is updated.
        /// </summary>
        /// <param name="entityType">The type of entity (e.g., "Producto", "Categoria")</param>
        /// <param name="entity">The updated entity data</param>
        /// <returns>Task representing the asynchronous operation</returns>
        Task NotifyEntityUpdatedAsync(string entityType, object entity);

        /// <summary>
        /// Notifies all clients when an entity is deleted (soft deleted).
        /// </summary>
        /// <param name="entityType">The type of entity (e.g., "Producto", "Categoria")</param>
        /// <param name="entityId">The ID of the deleted entity</param>
        /// <returns>Task representing the asynchronous operation</returns>
        Task NotifyEntityDeletedAsync(string entityType, int entityId);
    }
}