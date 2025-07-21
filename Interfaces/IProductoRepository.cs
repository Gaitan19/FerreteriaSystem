using ReactVentas.Models;

namespace ReactVentas.Interfaces
{
    /// <summary>
    /// Repository interface for Producto entity operations
    /// </summary>
    public interface IProductoRepository : IBaseRepository<Producto>
    {
        /// <summary>
        /// Gets products with their category and supplier information
        /// </summary>
        /// <returns>List of products with related data</returns>
        Task<List<Producto>> GetProductsWithRelatedDataAsync();

        /// <summary>
        /// Gets products by category
        /// </summary>
        /// <param name="categoriaId">Category identifier</param>
        /// <returns>List of products in the specified category</returns>
        Task<List<Producto>> GetProductsByCategoryAsync(int categoriaId);

        /// <summary>
        /// Gets products by supplier
        /// </summary>
        /// <param name="proveedorId">Supplier identifier</param>
        /// <returns>List of products from the specified supplier</returns>
        Task<List<Producto>> GetProductsBySupplierAsync(int proveedorId);
    }
}