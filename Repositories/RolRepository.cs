using Microsoft.EntityFrameworkCore;
using ReactVentas.Interfaces;
using ReactVentas.Models;

namespace ReactVentas.Repositories
{
    /// <summary>
    /// Repository implementation for Rol entity
    /// </summary>
    public class RolRepository : BaseRepository<Rol>, IRolRepository
    {
        public RolRepository(DBREACT_VENTAContext context) : base(context)
        {
        }

        /// <summary>
        /// Gets roles with their users
        /// </summary>
        public async Task<List<Rol>> GetRolesWithUsersAsync()
        {
            return await _dbSet
                .Include(r => r.Usuarios.Where(u => u.EsActivo == true))
                .Where(r => r.EsActivo == true)
                .OrderByDescending(r => r.IdRol)
                .ToListAsync();
        }

        /// <summary>
        /// Override GetAllAsync to order by IdRol descending and include all records
        /// </summary>
        public override async Task<List<Rol>> GetAllAsync()
        {
            return await _dbSet
                .OrderByDescending(r => r.IdRol)
                .ToListAsync();
        }

        /// <summary>
        /// Gets only active roles
        /// </summary>
        public override async Task<List<Rol>> GetActiveAsync()
        {
            return await _dbSet
                .Where(r => r.EsActivo == true)
                .OrderByDescending(r => r.IdRol)
                .ToListAsync();
        }
    }
}