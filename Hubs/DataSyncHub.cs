using Microsoft.AspNetCore.SignalR;

namespace ReactVentas.Hubs
{
    public class DataSyncHub : Hub
    {
        public async Task JoinGroup(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        }

        public async Task LeaveGroup(string groupName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        }

        public override async Task OnConnectedAsync()
        {
            // Auto-join all clients to the main data sync group
            await Groups.AddToGroupAsync(Context.ConnectionId, "DataSync");
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, "DataSync");
            await base.OnDisconnectedAsync(exception);
        }
    }
}