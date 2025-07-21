using ReactVentas.Models;

namespace ReactVentas.Interfaces
{
    /// <summary>
    /// Repository interface for Proveedor entity operations
    /// </summary>
    public interface IProveedorRepository : IBaseRepository<Proveedor>
    {
        /// <summary>
        /// Gets suppliers with their products
        /// </summary>
        /// <returns>List of suppliers with products</returns>
        Task<List<Proveedor>> GetSuppliersWithProductsAsync();

        /// <summary>
        /// Gets supplier by email
        /// </summary>
        /// <param name="email">Supplier email</param>
        /// <returns>Supplier if found, null otherwise</returns>
        Task<Proveedor?> GetByEmailAsync(string email);
    }
}