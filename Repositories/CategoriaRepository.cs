using Microsoft.EntityFrameworkCore;
using ReactVentas.Interfaces;
using ReactVentas.Models;

namespace ReactVentas.Repositories
{
    /// <summary>
    /// Repository implementation for Categoria entity
    /// </summary>
    public class CategoriaRepository : BaseRepository<Categoria>, ICategoriaRepository
    {
        public CategoriaRepository(DBREACT_VENTAContext context) : base(context)
        {
        }

        /// <summary>
        /// Gets categories with their related products
        /// </summary>
        public async Task<List<Categoria>> GetCategoriasWithProductsAsync()
        {
            return await _dbSet
                .Include(c => c.Productos.Where(p => p.EsActivo == true))
                .Where(c => c.EsActivo == true)
                .OrderByDescending(c => c.IdCategoria)
                .ToListAsync();
        }

        /// <summary>
        /// Override GetAllAsync to order by IdCategoria descending and include all records
        /// </summary>
        public override async Task<List<Categoria>> GetAllAsync()
        {
            return await _dbSet
                .OrderByDescending(c => c.IdCategoria)
                .ToListAsync();
        }

        /// <summary>
        /// Gets only active categories
        /// </summary>
        public override async Task<List<Categoria>> GetActiveAsync()
        {
            return await _dbSet
                .Where(c => c.EsActivo == true)
                .OrderByDescending(c => c.IdCategoria)
                .ToListAsync();
        }
    }
}