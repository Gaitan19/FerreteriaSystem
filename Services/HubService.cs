using Microsoft.AspNetCore.SignalR;
using ReactVentas.Hubs;
using ReactVentas.Interfaces;

namespace ReactVentas.Services
{
    public class HubService : IHubService
    {
        private readonly IHubContext<DataSyncHub> _hubContext;

        public HubService(IHubContext<DataSyncHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task NotifyEntityChanged(string entityType, string action, object? entityData = null, int? entityId = null)
        {
            var notification = new
            {
                EntityType = entityType,
                Action = action, // "created", "updated", "deleted"
                EntityId = entityId,
                EntityData = entityData,
                Timestamp = DateTime.UtcNow
            };

            await _hubContext.Clients.Group("DataSync").SendAsync("EntityChanged", notification);
        }
    }
}