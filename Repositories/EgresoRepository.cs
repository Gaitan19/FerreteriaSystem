using Microsoft.EntityFrameworkCore;
using ReactVentas.Interfaces;
using ReactVentas.Models;

namespace ReactVentas.Repositories
{
    /// <summary>
    /// Implementación del repositorio para la entidad Egreso
    /// </summary>
    public class EgresoRepository : BaseRepository<Egreso>, IEgresoRepository
    {
        public EgresoRepository(DBREACT_VENTAContext context) : base(context)
        {
        }

        /// <summary>
        /// Obtiene egresos con su información de usuario (todos los registros)
        /// </summary>
        public async Task<List<Egreso>> GetEgresosWithRelatedDataAsync()
        {
            return await _dbSet
                .Include(e => e.IdUsuarioNavigation)
                .OrderByDescending(e => e.IdEgreso)
                .ToListAsync();
        }

        /// <summary>
        /// Obtiene egresos activos con su información de usuario
        /// </summary>
        public async Task<List<Egreso>> GetActiveEgresosWithRelatedDataAsync()
        {
            return await _dbSet
                .Include(e => e.IdUsuarioNavigation)
                .Where(e => e.EsActivo == true)
                .OrderByDescending(e => e.IdEgreso)
                .ToListAsync();
        }

        /// <summary>
        /// Obtiene egresos por usuario
        /// </summary>
        public async Task<List<Egreso>> GetEgresosByUserAsync(int usuarioId)
        {
            return await _dbSet
                .Include(e => e.IdUsuarioNavigation)
                .Where(e => e.IdUsuario == usuarioId && e.EsActivo == true)
                .OrderByDescending(e => e.IdEgreso)
                .ToListAsync();
        }

        /// <summary>
        /// Obtiene egresos por rango de fechas
        /// </summary>
        public async Task<List<Egreso>> GetEgresosByDateRangeAsync(DateTime fechaInicio, DateTime fechaFin)
        {
            return await _dbSet
                .Include(e => e.IdUsuarioNavigation)
                .Where(e => e.FechaRegistro >= fechaInicio && e.FechaRegistro <= fechaFin && e.EsActivo == true)
                .OrderByDescending(e => e.IdEgreso)
                .ToListAsync();
        }

        /// <summary>
        /// Sobrescribe GetAllAsync para incluir datos relacionados y ordenamiento apropiado
        /// </summary>
        public override async Task<List<Egreso>> GetAllAsync()
        {
            return await GetEgresosWithRelatedDataAsync();
        }

        /// <summary>
        /// Obtiene un egreso con sus relaciones
        /// </summary>
        public async Task<Egreso> GetEgresoWithRelatedDataByIdAsync(int id)
        {
            return await _dbSet
                .Include(e => e.IdUsuarioNavigation)
                .FirstOrDefaultAsync(e => e.IdEgreso == id);
        }
    }
}