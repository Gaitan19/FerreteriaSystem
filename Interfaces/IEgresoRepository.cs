using ReactVentas.Models;
using ReactVentas.Models.DTO;

namespace ReactVentas.Interfaces
{
    /// <summary>
    /// Interfaz del repositorio para operaciones de la entidad Egreso
    /// </summary>
    public interface IEgresoRepository : IBaseRepository<Egreso>
    {
        /// <summary>
        /// Obtiene egresos con información del usuario que registró
        /// </summary>
        /// <returns>Lista de egresos con usuario</returns>
        Task<List<DtoEgreso>> GetEgresosWithUserAsync();
    }
}