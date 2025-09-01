using ReactVentas.Models;
using ReactVentas.Models.DTO;

namespace ReactVentas.Interfaces
{
    /// <summary>
    /// Interfaz del repositorio para operaciones de la entidad Ingreso
    /// </summary>
    public interface IIngresoRepository : IBaseRepository<Ingreso>
    {
        /// <summary>
        /// Obtiene ingresos con información del usuario que registró
        /// </summary>
        /// <returns>Lista de ingresos con usuario</returns>
        Task<List<DtoIngreso>> GetIngresosWithUserAsync();
    }
}