using Microsoft.AspNetCore.SignalR;

namespace ReactVentas.Hubs
{
    public class NotificationHub : Hub
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
            // Join all clients to a general notifications group
            await Groups.AddToGroupAsync(Context.ConnectionId, "NotificationGroup");
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, "NotificationGroup");
            await base.OnDisconnectedAsync(exception);
        }
    }
}