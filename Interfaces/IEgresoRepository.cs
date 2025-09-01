using ReactVentas.Models;

namespace ReactVentas.Interfaces
{
    /// <summary>
    /// Interfaz del repositorio para operaciones de la entidad Egreso
    /// </summary>
    public interface IEgresoRepository : IBaseRepository<Egreso>
    {
        /// <summary>
        /// Obtiene egresos con su información de usuario
        /// </summary>
        /// <returns>Lista de egresos con datos relacionados</returns>
        Task<List<Egreso>> GetEgresosWithRelatedDataAsync();

        /// <summary>
        /// Obtiene egresos por usuario
        /// </summary>
        /// <param name="usuarioId">Identificador del usuario</param>
        /// <returns>Lista de egresos del usuario especificado</returns>
        Task<List<Egreso>> GetEgresosByUserAsync(int usuarioId);

        /// <summary>
        /// Obtiene un egreso con su información de usuario por su identificador
        /// </summary>
        /// <param name="id">Identificador del egreso</param>
        /// <returns>Egreso con datos relacionados</returns>
        Task<Egreso> GetEgresoWithRelatedDataByIdAsync(int id);

        /// <summary>
        /// Obtiene egresos por rango de fechas
        /// </summary>
        /// <param name="fechaInicio">Fecha de inicio</param>
        /// <param name="fechaFin">Fecha de fin</param>
        /// <returns>Lista de egresos en el rango de fechas</returns>
        Task<List<Egreso>> GetEgresosByDateRangeAsync(DateTime fechaInicio, DateTime fechaFin);
    }
}