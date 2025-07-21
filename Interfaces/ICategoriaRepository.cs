using ReactVentas.Models;

namespace ReactVentas.Interfaces
{
    /// <summary>
    /// Repository interface for Categoria entity operations
    /// </summary>
    public interface ICategoriaRepository : IBaseRepository<Categoria>
    {
        /// <summary>
        /// Gets categories with their related products
        /// </summary>
        /// <returns>List of categories with products</returns>
        Task<List<Categoria>> GetCategoriasWithProductsAsync();
    }
}