using Microsoft.EntityFrameworkCore;
using ReactVentas.Interfaces;
using ReactVentas.Models;

namespace ReactVentas.Repositories
{
    /// <summary>
    /// Implementación del repositorio para la entidad Ingreso
    /// </summary>
    public class IngresoRepository : BaseRepository<Ingreso>, IIngresoRepository
    {
        public IngresoRepository(DBREACT_VENTAContext context) : base(context)
        {
        }

        /// <summary>
        /// Obtiene ingresos con su información de usuario (todos los registros)
        /// </summary>
        public async Task<List<Ingreso>> GetIngresosWithRelatedDataAsync()
        {
            return await _dbSet
                .Include(i => i.IdUsuarioNavigation)
                .OrderByDescending(i => i.IdIngreso)
                .ToListAsync();
        }

        /// <summary>
        /// Obtiene ingresos activos con su información de usuario
        /// </summary>
        public async Task<List<Ingreso>> GetActiveIngresosWithRelatedDataAsync()
        {
            return await _dbSet
                .Include(i => i.IdUsuarioNavigation)
                .Where(i => i.EsActivo == true)
                .OrderByDescending(i => i.IdIngreso)
                .ToListAsync();
        }

        /// <summary>
        /// Obtiene ingresos por usuario
        /// </summary>
        public async Task<List<Ingreso>> GetIngresosByUserAsync(int usuarioId)
        {
            return await _dbSet
                .Include(i => i.IdUsuarioNavigation)
                .Where(i => i.IdUsuario == usuarioId && i.EsActivo == true)
                .OrderByDescending(i => i.IdIngreso)
                .ToListAsync();
        }

        /// <summary>
        /// Obtiene ingresos por rango de fechas
        /// </summary>
        public async Task<List<Ingreso>> GetIngresosByDateRangeAsync(DateTime fechaInicio, DateTime fechaFin)
        {
            return await _dbSet
                .Include(i => i.IdUsuarioNavigation)
                .Where(i => i.FechaRegistro >= fechaInicio && i.FechaRegistro <= fechaFin && i.EsActivo == true)
                .OrderByDescending(i => i.IdIngreso)
                .ToListAsync();
        }

        /// <summary>
        /// Sobrescribe GetAllAsync para incluir datos relacionados y ordenamiento apropiado
        /// </summary>
        public override async Task<List<Ingreso>> GetAllAsync()
        {
            return await GetIngresosWithRelatedDataAsync();
        }

        /// <summary>
        /// Obtiene un ingreso con sus relaciones
        /// </summary>
        public async Task<Ingreso> GetIngresoWithRelatedDataByIdAsync(int id)
        {
            return await _dbSet
                .Include(i => i.IdUsuarioNavigation)
                .FirstOrDefaultAsync(i => i.IdIngreso == id);
        }
    }
}