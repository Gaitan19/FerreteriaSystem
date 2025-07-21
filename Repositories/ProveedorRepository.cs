using Microsoft.EntityFrameworkCore;
using ReactVentas.Interfaces;
using ReactVentas.Models;

namespace ReactVentas.Repositories
{
    /// <summary>
    /// Repository implementation for Proveedor entity
    /// </summary>
    public class ProveedorRepository : BaseRepository<Proveedor>, IProveedorRepository
    {
        public ProveedorRepository(DBREACT_VENTAContext context) : base(context)
        {
        }

        /// <summary>
        /// Gets suppliers with their products
        /// </summary>
        public async Task<List<Proveedor>> GetSuppliersWithProductsAsync()
        {
            return await _dbSet
                .Include(p => p.Productos.Where(prod => prod.EsActivo == true))
                .Where(p => p.EsActivo == true)
                .OrderByDescending(p => p.IdProveedor)
                .ToListAsync();
        }

        /// <summary>
        /// Gets supplier by email
        /// </summary>
        public async Task<Proveedor?> GetByEmailAsync(string email)
        {
            return await _dbSet
                .FirstOrDefaultAsync(p => p.Correo == email && p.EsActivo == true);
        }

        /// <summary>
        /// Override GetAllAsync to order by IdProveedor descending
        /// </summary>
        public override async Task<List<Proveedor>> GetAllAsync()
        {
            return await _dbSet
                .Where(p => p.EsActivo == true)
                .OrderByDescending(p => p.IdProveedor)
                .ToListAsync();
        }
    }
}