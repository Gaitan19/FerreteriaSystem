using Microsoft.EntityFrameworkCore;
using ReactVentas.Interfaces;
using ReactVentas.Models;

namespace ReactVentas.Repositories
{
    /// <summary>
    /// Repository implementation for Producto entity
    /// </summary>
    public class ProductoRepository : BaseRepository<Producto>, IProductoRepository
    {
        public ProductoRepository(DBREACT_VENTAContext context) : base(context)
        {
        }

        /// <summary>
        /// Gets products with their category and supplier information (all records)
        /// </summary>
        public async Task<List<Producto>> GetProductsWithRelatedDataAsync()
        {
            return await _dbSet
                .Include(p => p.IdCategoriaNavigation)
                .Include(p => p.IdProveedorNavigation)
                .OrderByDescending(p => p.IdProducto)
                .ToListAsync();
        }

        /// <summary>
        /// Gets active products with their category and supplier information
        /// </summary>
        public async Task<List<Producto>> GetActiveProductsWithRelatedDataAsync()
        {
            return await _dbSet
                .Include(p => p.IdCategoriaNavigation)
                .Include(p => p.IdProveedorNavigation)
                .Where(p => p.EsActivo == true)
                .OrderByDescending(p => p.IdProducto)
                .ToListAsync();
        }

        /// <summary>
        /// Gets products by category
        /// </summary>
        public async Task<List<Producto>> GetProductsByCategoryAsync(int categoriaId)
        {
            return await _dbSet
                .Include(p => p.IdCategoriaNavigation)
                .Include(p => p.IdProveedorNavigation)
                .Where(p => p.IdCategoria == categoriaId && p.EsActivo == true)
                .OrderByDescending(p => p.IdProducto)
                .ToListAsync();
        }

        /// <summary>
        /// Gets products by supplier
        /// </summary>
        public async Task<List<Producto>> GetProductsBySupplierAsync(int proveedorId)
        {
            return await _dbSet
                .Include(p => p.IdCategoriaNavigation)
                .Include(p => p.IdProveedorNavigation)
                .Where(p => p.IdProveedor == proveedorId && p.EsActivo == true)
                .OrderByDescending(p => p.IdProducto)
                .ToListAsync();
        }

        /// <summary>
        /// Override GetAllAsync to include related data and proper ordering
        /// </summary>
        public override async Task<List<Producto>> GetAllAsync()
        {
            return await GetProductsWithRelatedDataAsync();
        }
    }
}