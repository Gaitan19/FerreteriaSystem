using ReactVentas.Models;

namespace ReactVentas.Interfaces
{
    /// <summary>
    /// Repository interface for Rol entity operations
    /// </summary>
    public interface IRolRepository : IBaseRepository<Rol>
    {
        /// <summary>
        /// Gets roles with their users
        /// </summary>
        /// <returns>List of roles with users</returns>
        Task<List<Rol>> GetRolesWithUsersAsync();
    }
}