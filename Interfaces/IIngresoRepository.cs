using ReactVentas.Models;

namespace ReactVentas.Interfaces
{
    /// <summary>
    /// Interfaz del repositorio para operaciones de la entidad Ingreso
    /// </summary>
    public interface IIngresoRepository : IBaseRepository<Ingreso>
    {
        /// <summary>
        /// Obtiene ingresos con su información de usuario
        /// </summary>
        /// <returns>Lista de ingresos con datos relacionados</returns>
        Task<List<Ingreso>> GetIngresosWithRelatedDataAsync();

        /// <summary>
        /// Obtiene ingresos por usuario
        /// </summary>
        /// <param name="usuarioId">Identificador del usuario</param>
        /// <returns>Lista de ingresos del usuario especificado</returns>
        Task<List<Ingreso>> GetIngresosByUserAsync(int usuarioId);

        /// <summary>
        /// Obtiene un ingreso con su información de usuario por su identificador
        /// </summary>
        /// <param name="id">Identificador del ingreso</param>
        /// <returns>Ingreso con datos relacionados</returns>
        Task<Ingreso> GetIngresoWithRelatedDataByIdAsync(int id);

        /// <summary>
        /// Obtiene ingresos por rango de fechas
        /// </summary>
        /// <param name="fechaInicio">Fecha de inicio</param>
        /// <param name="fechaFin">Fecha de fin</param>
        /// <returns>Lista de ingresos en el rango de fechas</returns>
        Task<List<Ingreso>> GetIngresosByDateRangeAsync(DateTime fechaInicio, DateTime fechaFin);
    }
}