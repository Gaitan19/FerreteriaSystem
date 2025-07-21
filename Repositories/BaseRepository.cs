using Microsoft.EntityFrameworkCore;
using ReactVentas.Interfaces;
using ReactVentas.Models;
using System.Linq.Expressions;
using System.Reflection;

namespace ReactVentas.Repositories
{
    /// <summary>
    /// Base repository implementation that provides common operations for entities with soft delete support
    /// </summary>
    /// <typeparam name="T">Entity type</typeparam>
    public class BaseRepository<T> : IBaseRepository<T> where T : class
    {
        protected readonly DBREACT_VENTAContext _context;
        protected readonly DbSet<T> _dbSet;

        public BaseRepository(DBREACT_VENTAContext context)
        {
            _context = context;
            _dbSet = context.Set<T>();
        }

        /// <summary>
        /// Gets all entities (both active and inactive)
        /// </summary>
        public virtual async Task<List<T>> GetAllAsync()
        {
            // Return all entities regardless of EsActivo status to maintain original API behavior
            return await _dbSet.OrderByDescending(GetIdProperty()).ToListAsync();
        }

        /// <summary>
        /// Gets only active entities (where EsActivo = true)
        /// </summary>
        public virtual async Task<List<T>> GetActiveAsync()
        {
            // Check if entity has EsActivo property for soft delete filtering
            var esActivoProperty = typeof(T).GetProperty("EsActivo");
            if (esActivoProperty != null)
            {
                // Create expression: entity => entity.EsActivo == true
                var parameter = Expression.Parameter(typeof(T), "entity");
                var property = Expression.Property(parameter, "EsActivo");
                var constant = Expression.Constant(true, typeof(bool?));
                var equal = Expression.Equal(property, constant);
                var lambda = Expression.Lambda<Func<T, bool>>(equal, parameter);

                return await _dbSet.Where(lambda).OrderByDescending(GetIdProperty()).ToListAsync();
            }

            // If no EsActivo property, return all entities
            return await _dbSet.OrderByDescending(GetIdProperty()).ToListAsync();
        }

        /// <summary>
        /// Gets entity by id, only if active
        /// </summary>
        public virtual async Task<T?> GetByIdAsync(int id)
        {
            var entity = await _dbSet.FindAsync(id);
            
            if (entity == null) return null;

            // Check if entity is active
            var esActivoProperty = typeof(T).GetProperty("EsActivo");
            if (esActivoProperty != null)
            {
                var isActive = (bool?)esActivoProperty.GetValue(entity);
                if (isActive != true) return null;
            }

            return entity;
        }

        /// <summary>
        /// Gets entities based on a condition, filtered by active status
        /// </summary>
        public virtual async Task<List<T>> GetWhereAsync(Expression<Func<T, bool>> predicate)
        {
            var query = _dbSet.Where(predicate);

            // Add active filter if entity has EsActivo property
            var esActivoProperty = typeof(T).GetProperty("EsActivo");
            if (esActivoProperty != null)
            {
                var parameter = Expression.Parameter(typeof(T), "entity");
                var property = Expression.Property(parameter, "EsActivo");
                var constant = Expression.Constant(true, typeof(bool?));
                var equal = Expression.Equal(property, constant);
                var activeFilter = Expression.Lambda<Func<T, bool>>(equal, parameter);
                
                query = query.Where(activeFilter);
            }

            return await query.ToListAsync();
        }

        /// <summary>
        /// Adds a new entity with EsActivo = true and FechaRegistro = now
        /// </summary>
        public virtual async Task<T> AddAsync(T entity)
        {
            // Set default values for common properties
            var esActivoProperty = typeof(T).GetProperty("EsActivo");
            if (esActivoProperty != null && esActivoProperty.GetValue(entity) == null)
            {
                esActivoProperty.SetValue(entity, true);
            }

            var fechaRegistroProperty = typeof(T).GetProperty("FechaRegistro");
            if (fechaRegistroProperty != null && fechaRegistroProperty.GetValue(entity) == null)
            {
                fechaRegistroProperty.SetValue(entity, DateTime.Now);
            }

            await _dbSet.AddAsync(entity);
            return entity;
        }

        /// <summary>
        /// Updates an existing entity
        /// </summary>
        public virtual async Task<T> UpdateAsync(T entity)
        {
            _dbSet.Update(entity);
            return entity;
        }

        /// <summary>
        /// Performs soft delete by setting EsActivo to false
        /// </summary>
        public virtual async Task<bool> SoftDeleteAsync(int id)
        {
            var entity = await _dbSet.FindAsync(id);
            if (entity == null) return false;

            var esActivoProperty = typeof(T).GetProperty("EsActivo");
            if (esActivoProperty != null)
            {
                esActivoProperty.SetValue(entity, false);
                _dbSet.Update(entity);
                return true;
            }

            // If entity doesn't have EsActivo property, cannot perform soft delete
            return false;
        }

        /// <summary>
        /// Saves changes to the database
        /// </summary>
        public virtual async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }

        /// <summary>
        /// Gets the ID property expression for ordering
        /// </summary>
        private Expression<Func<T, object>> GetIdProperty()
        {
            var parameter = Expression.Parameter(typeof(T), "entity");
            
            // Try common ID property names
            var idPropertyNames = new[] { $"Id{typeof(T).Name}", "Id" };
            PropertyInfo? idProperty = null;

            foreach (var propName in idPropertyNames)
            {
                idProperty = typeof(T).GetProperty(propName);
                if (idProperty != null) break;
            }

            if (idProperty == null)
            {
                // Fallback to first property if no ID found
                idProperty = typeof(T).GetProperties().FirstOrDefault();
            }

            if (idProperty != null)
            {
                var property = Expression.Property(parameter, idProperty);
                var convert = Expression.Convert(property, typeof(object));
                return Expression.Lambda<Func<T, object>>(convert, parameter);
            }

            // Fallback expression
            var constantExpression = Expression.Constant(0, typeof(object));
            return Expression.Lambda<Func<T, object>>(constantExpression, parameter);
        }
    }
}