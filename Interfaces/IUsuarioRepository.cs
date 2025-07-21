using ReactVentas.Models;

namespace ReactVentas.Interfaces
{
    /// <summary>
    /// Repository interface for Usuario entity operations
    /// </summary>
    public interface IUsuarioRepository : IBaseRepository<Usuario>
    {
        /// <summary>
        /// Gets users with their role information
        /// </summary>
        /// <returns>List of users with role data</returns>
        Task<List<Usuario>> GetUsersWithRoleAsync();

        /// <summary>
        /// Gets user by email
        /// </summary>
        /// <param name="email">User email</param>
        /// <returns>User if found, null otherwise</returns>
        Task<Usuario?> GetByEmailAsync(string email);

        /// <summary>
        /// Gets users by role
        /// </summary>
        /// <param name="rolId">Role identifier</param>
        /// <returns>List of users with the specified role</returns>
        Task<List<Usuario>> GetUsersByRoleAsync(int rolId);
    }
}