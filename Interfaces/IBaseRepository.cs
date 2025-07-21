using System.Linq.Expressions;

namespace ReactVentas.Interfaces
{
    /// <summary>
    /// Base repository interface that defines common operations for entities
    /// </summary>
    /// <typeparam name="T">Entity type</typeparam>
    public interface IBaseRepository<T> where T : class
    {
        /// <summary>
        /// Gets all entities (both active and inactive)
        /// </summary>
        /// <returns>List of all entities</returns>
        Task<List<T>> GetAllAsync();

        /// <summary>
        /// Gets only active entities (where EsActivo = true)
        /// </summary>
        /// <returns>List of active entities</returns>
        Task<List<T>> GetActiveAsync();

        /// <summary>
        /// Gets entity by id
        /// </summary>
        /// <param name="id">Entity identifier</param>
        /// <returns>Entity if found, null otherwise</returns>
        Task<T?> GetByIdAsync(int id);

        /// <summary>
        /// Gets entities based on a condition
        /// </summary>
        /// <param name="predicate">Filter condition</param>
        /// <returns>Filtered list of entities</returns>
        Task<List<T>> GetWhereAsync(Expression<Func<T, bool>> predicate);

        /// <summary>
        /// Adds a new entity
        /// </summary>
        /// <param name="entity">Entity to add</param>
        /// <returns>Added entity</returns>
        Task<T> AddAsync(T entity);

        /// <summary>
        /// Updates an existing entity
        /// </summary>
        /// <param name="entity">Entity to update</param>
        /// <returns>Updated entity</returns>
        Task<T> UpdateAsync(T entity);

        /// <summary>
        /// Performs soft delete by setting IsActive to false
        /// </summary>
        /// <param name="id">Entity identifier</param>
        /// <returns>True if deletion was successful, false otherwise</returns>
        Task<bool> SoftDeleteAsync(int id);

        /// <summary>
        /// Saves changes to the database
        /// </summary>
        /// <returns>Number of affected rows</returns>
        Task<int> SaveChangesAsync();
    }
}