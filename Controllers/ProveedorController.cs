using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ReactVentas.Models;
using ReactVentas.Interfaces;

namespace ReactVentas.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProveedorController : ControllerBase
    {
        private readonly IProveedorRepository _proveedorRepository;
        private readonly ISignalRNotificationService _signalRService;

        public ProveedorController(IProveedorRepository proveedorRepository, ISignalRNotificationService signalRService)
        {
            _proveedorRepository = proveedorRepository;
            _signalRService = signalRService;
        }

        [HttpGet]
        [Route("Lista")]
        public async Task<IActionResult> Lista()
        {
            // Retrieves a list of active suppliers ordered by supplier ID in descending order.
            try
            {
                var lista = await _proveedorRepository.GetAllAsync();
                return StatusCode(StatusCodes.Status200OK, lista);
            }
            catch (Exception ex)
            {
                // Returns a 500 Internal Server Error status if an exception occurs.
                return StatusCode(StatusCodes.Status500InternalServerError, new List<Proveedor>());
            }
        }

        [HttpPost]
        [Route("Guardar")]
        public async Task<IActionResult> Guardar([FromBody] Proveedor request)
        {
            // Adds a new supplier to the database.
            try
            {
                await _proveedorRepository.AddAsync(request);
                await _proveedorRepository.SaveChangesAsync();
                
                // Notify all clients about the new supplier
                await _signalRService.NotifyEntityCreatedAsync("Proveedor", request);
                
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
        public async Task<IActionResult> Editar([FromBody] Proveedor request)
        {
            // Updates an existing supplier in the database.
            try
            {
                await _proveedorRepository.UpdateAsync(request);
                await _proveedorRepository.SaveChangesAsync();
                
                // Notify all clients about the updated supplier
                await _signalRService.NotifyEntityUpdatedAsync("Proveedor", request);
                
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
                var result = await _proveedorRepository.SoftDeleteAsync(id);
                if (result)
                {
                    await _proveedorRepository.SaveChangesAsync();
                    
                    // Notify all clients about the deleted supplier
                    await _signalRService.NotifyEntityDeletedAsync("Proveedor", id);
                    
                    return StatusCode(StatusCodes.Status200OK, "ok");
                }
                else
                {
                    return StatusCode(StatusCodes.Status404NotFound, "Proveedor not found");
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
