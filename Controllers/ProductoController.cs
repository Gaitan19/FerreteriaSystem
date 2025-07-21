using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ReactVentas.Models;
using ReactVentas.Interfaces;

namespace ReactVentas.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductoController : ControllerBase
    {
        private readonly IProductoRepository _productoRepository;
        private readonly ISignalRNotificationService _signalRService;

        public ProductoController(IProductoRepository productoRepository, ISignalRNotificationService signalRService)
        {
            _productoRepository = productoRepository;
            _signalRService = signalRService;
        }

        [HttpGet]
        [Route("Lista")]
        public async Task<IActionResult> Lista()
        {
            // Retrieves a list of active products including their category and supplier information, ordered by product ID in descending order.
            try
            {
                var lista = await _productoRepository.GetProductsWithRelatedDataAsync();
                return StatusCode(StatusCodes.Status200OK, lista);
            }
            catch (Exception ex)
            {
                // Returns a 500 Internal Server Error status if an exception occurs.
                return StatusCode(StatusCodes.Status500InternalServerError, new List<Producto>());
            }
        }

        [HttpPost]
        [Route("Guardar")]
        public async Task<IActionResult> Guardar([FromBody] Producto request)
        {
            // Adds a new product to the database.
            try
            {
                await _productoRepository.AddAsync(request);
                await _productoRepository.SaveChangesAsync();

                // Notify all clients about the new product
                await _signalRService.NotifyEntityCreatedAsync("Producto", request);

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
        public async Task<IActionResult> Editar([FromBody] Producto request)
        {
            // Updates an existing product in the database.
            try
            {
                await _productoRepository.UpdateAsync(request);
                await _productoRepository.SaveChangesAsync();

                // Notify all clients about the updated product
                await _signalRService.NotifyEntityUpdatedAsync("Producto", request);

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
                var result = await _productoRepository.SoftDeleteAsync(id);
                if (result)
                {
                    await _productoRepository.SaveChangesAsync();
                    
                    // Notify all clients about the deleted product
                    await _signalRService.NotifyEntityDeletedAsync("Producto", id);
                    
                    return StatusCode(StatusCodes.Status200OK, "ok");
                }
                else
                {
                    return StatusCode(StatusCodes.Status404NotFound, "Producto not found");
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
