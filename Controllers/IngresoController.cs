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
    public class IngresoController : ControllerBase
    {
        private readonly IIngresoRepository _ingresoRepository;
        private readonly IHubContext<NotificationHub> _hubContext;

        public IngresoController(IIngresoRepository ingresoRepository, IHubContext<NotificationHub> hubContext)
        {
            _ingresoRepository = ingresoRepository;
            _hubContext = hubContext;
        }

        [HttpGet]
        [Route("Lista")]
        public async Task<IActionResult> Lista()
        {
            // Retrieves a list of income records including their user information, ordered by income ID in descending order.
            try
            {
                var lista = await _ingresoRepository.GetIngresosWithRelatedDataAsync();
                return StatusCode(StatusCodes.Status200OK, lista);
            }
            catch (Exception ex)
            {
                // Returns a 500 Internal Server Error status if an exception occurs.
                return StatusCode(StatusCodes.Status500InternalServerError, new List<Ingreso>());
            }
        }

        [HttpPost]
        [Route("Guardar")]
        public async Task<IActionResult> Guardar([FromBody] Ingreso request)
        {
            // Adds a new income record to the database.
            try
            {
                var newIngreso = await _ingresoRepository.AddAsync(request);
                await _ingresoRepository.SaveChangesAsync();

                // Obtener el ingreso con relaciones después de guardar
                var ingresoConRelaciones = await _ingresoRepository.GetIngresoWithRelatedDataByIdAsync(newIngreso.IdIngreso);

                // Notificar con el objeto completo incluyendo relaciones
                await _hubContext.Clients.Group("FerreteriaSistema").SendAsync("IngresoCreated", ingresoConRelaciones);

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
        public async Task<IActionResult> Editar([FromBody] Ingreso request)
        {
            // Updates an existing income record in the database.
            try
            {
                await _ingresoRepository.UpdateAsync(request);
                await _ingresoRepository.SaveChangesAsync();

                // Obtener el ingreso con relaciones después de actualizar
                var ingresoConRelaciones = await _ingresoRepository.GetIngresoWithRelatedDataByIdAsync(request.IdIngreso);

                // Notificar con el objeto completo incluyendo relaciones
                await _hubContext.Clients.Group("FerreteriaSistema").SendAsync("IngresoUpdated", ingresoConRelaciones);

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
                var result = await _ingresoRepository.SoftDeleteAsync(id);
                if (result)
                {
                    await _ingresoRepository.SaveChangesAsync();
                    
                    // Notify all clients about the deleted income record
                    await _hubContext.Clients.Group("FerreteriaSistema").SendAsync("IngresoDeleted", id);
                    
                    return StatusCode(StatusCodes.Status200OK, "ok");
                }
                else
                {
                    return StatusCode(StatusCodes.Status404NotFound, "Ingreso not found");
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