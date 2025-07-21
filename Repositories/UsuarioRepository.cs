using Microsoft.EntityFrameworkCore;
using ReactVentas.Interfaces;
using ReactVentas.Models;

namespace ReactVentas.Repositories
{
    /// <summary>
    /// Repository implementation for Usuario entity
    /// </summary>
    public class UsuarioRepository : BaseRepository<Usuario>, IUsuarioRepository
    {
        public UsuarioRepository(DBREACT_VENTAContext context) : base(context)
        {
        }

        /// <summary>
        /// Gets users with their role information (all records)
        /// </summary>
        public async Task<List<Usuario>> GetUsersWithRoleAsync()
        {
            return await _dbSet
                .Include(u => u.IdRolNavigation)
                .OrderByDescending(u => u.IdUsuario)
                .ToListAsync();
        }

        /// <summary>
        /// Gets active users with their role information
        /// </summary>
        public async Task<List<Usuario>> GetActiveUsersWithRoleAsync()
        {
            return await _dbSet
                .Include(u => u.IdRolNavigation)
                .Where(u => u.EsActivo == true)
                .OrderByDescending(u => u.IdUsuario)
                .ToListAsync();
        }

        /// <summary>
        /// Gets user by email
        /// </summary>
        public async Task<Usuario?> GetByEmailAsync(string email)
        {
            return await _dbSet
                .Include(u => u.IdRolNavigation)
                .FirstOrDefaultAsync(u => u.Correo == email && u.EsActivo == true);
        }

        /// <summary>
        /// Gets users by role
        /// </summary>
        public async Task<List<Usuario>> GetUsersByRoleAsync(int rolId)
        {
            return await _dbSet
                .Include(u => u.IdRolNavigation)
                .Where(u => u.IdRol == rolId && u.EsActivo == true)
                .OrderByDescending(u => u.IdUsuario)
                .ToListAsync();
        }

        /// <summary>
        /// Override GetAllAsync to include role information
        /// </summary>
        public override async Task<List<Usuario>> GetAllAsync()
        {
            return await GetUsersWithRoleAsync();
        }
    }
}