using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ReactVentas.Models;
using ReactVentas.Interfaces;
using Microsoft.AspNetCore.SignalR;
using ReactVentas.Hubs;

namespace ReactVentas.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EgresoController : ControllerBase
    {
        private readonly IEgresoRepository _egresoRepository;
        private readonly IHubContext<NotificationHub> _hubContext;

        public EgresoController(IEgresoRepository egresoRepository, IHubContext<NotificationHub> hubContext)
        {
            _egresoRepository = egresoRepository;
            _hubContext = hubContext;
        }

        [HttpGet]
        [Route("Lista")]
        public async Task<IActionResult> Lista()
        {
            // Retrieves a list of expense records including their user information, ordered by expense ID in descending order.
            try
            {
                var lista = await _egresoRepository.GetEgresosWithRelatedDataAsync();
                return StatusCode(StatusCodes.Status200OK, lista);
            }
            catch (Exception ex)
            {
                // Returns a 500 Internal Server Error status if an exception occurs.
                return StatusCode(StatusCodes.Status500InternalServerError, new List<Egreso>());
            }
        }

        [HttpPost]
        [Route("Guardar")]
        public async Task<IActionResult> Guardar([FromBody] Egreso request)
        {
            // Adds a new expense record to the database.
            try
            {
                var newEgreso = await _egresoRepository.AddAsync(request);
                await _egresoRepository.SaveChangesAsync();

                // Obtener el egreso con relaciones después de guardar
                var egresoConRelaciones = await _egresoRepository.GetEgresoWithRelatedDataByIdAsync(newEgreso.IdEgreso);

                // Notificar con el objeto completo incluyendo relaciones
                await _hubContext.Clients.Group("FerreteriaSistema").SendAsync("EgresoCreated", egresoConRelaciones);

                // Returns a 200 OK status on successful save.
                return StatusCode(StatusCodes.Status200OK, "ok");
            }
            catch (Exception ex)
            {
                // Returns a 500 Internal Server Error status if an exception occurs during saving.
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPut]
        [Route("Editar")]
        public async Task<IActionResult> Editar([FromBody] Egreso request)
        {
            // Updates an existing expense record in the database.
            try
            {
                await _egresoRepository.UpdateAsync(request);
                await _egresoRepository.SaveChangesAsync();

                // Obtener el egreso con relaciones después de actualizar
                var egresoConRelaciones = await _egresoRepository.GetEgresoWithRelatedDataByIdAsync(request.IdEgreso);

                // Notificar con el objeto completo incluyendo relaciones
                await _hubContext.Clients.Group("FerreteriaSistema").SendAsync("EgresoUpdated", egresoConRelaciones);

                // Returns a 200 OK status on successful update.
                return StatusCode(StatusCodes.Status200OK, "ok");
            }
            catch (Exception ex)
            {
                // Returns a 500 Internal Server Error status if an exception occurs during update.
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpDelete]
        [Route("Eliminar/{id:int}")]
        public async Task<IActionResult> Eliminar(int id)
        {
            // Performs soft delete by setting EsActivo to false instead of removing the record.
            try
            {
                var result = await _egresoRepository.SoftDeleteAsync(id);
                if (result)
                {
                    await _egresoRepository.SaveChangesAsync();
                    
                    // Notify all clients about the deleted expense record
                    await _hubContext.Clients.Group("FerreteriaSistema").SendAsync("EgresoDeleted", id);
                    
                    return StatusCode(StatusCodes.Status200OK, "ok");
                }
                else
                {
                    return StatusCode(StatusCodes.Status404NotFound, "Egreso not found");
                }
            }
            catch (Exception ex)
            {
                // Returns a 500 Internal Server Error status if an exception occurs during deletion.
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }
    }
}