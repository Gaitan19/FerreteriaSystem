using Microsoft.AspNetCore.SignalR;

namespace ReactVentas.Hubs
{
    /// <summary>
    /// SignalR Hub for real-time data synchronization across connected clients.
    /// Handles broadcasting of entity changes for immediate UI updates.
    /// </summary>
    public class DataSyncHub : Hub
    {
        /// <summary>
        /// Called when a client connects to the hub.
        /// </summary>
        /// <returns>Task representing the asynchronous operation</returns>
        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
        }

        /// <summary>
        /// Called when a client disconnects from the hub.
        /// </summary>
        /// <param name="exception">Exception that caused the disconnect, if any</param>
        /// <returns>Task representing the asynchronous operation</returns>
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            await base.OnDisconnectedAsync(exception);
        }
    }
}