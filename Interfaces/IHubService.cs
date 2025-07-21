namespace ReactVentas.Interfaces
{
    public interface IHubService
    {
        Task NotifyEntityChanged(string entityType, string action, object? entityData = null, int? entityId = null);
    }
}