using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactVentas.Models;

namespace ReactVentas.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProveedorController : ControllerBase
    {
        private readonly DBREACT_VENTAContext _context;

        public ProveedorController(DBREACT_VENTAContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Route("Lista")]
        public async Task<IActionResult> Lista()
        {
            // Retrieves a list of suppliers ordered by supplier ID in descending order.
            List<Proveedor> lista = new List<Proveedor>();
            try
            {
                lista = await _context.Proveedores.OrderByDescending(p => p.IdProveedor).ToListAsync();
                return StatusCode(StatusCodes.Status200OK, lista);
            }
            catch (Exception ex)
            {
                // Returns a 500 Internal Server Error status if an exception occurs.
                return StatusCode(StatusCodes.Status500InternalServerError, lista);
            }
        }

        [HttpPost]
        [Route("Guardar")]
        public async Task<IActionResult> Guardar([FromBody] Proveedor request)
        {
            // Adds a new supplier to the database.
            try
            {
                await _context.Proveedores.AddAsync(request);
                await _context.SaveChangesAsync();
                
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
                _context.Proveedores.Update(request);
                await _context.SaveChangesAsync();
                
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
            // Deletes a supplier by its ID.
            try
            {
                Proveedor proveedor = _context.Proveedores.Find(id);
                _context.Proveedores.Remove(proveedor);
                await _context.SaveChangesAsync();
                
                // Returns a 200 OK status on successful deletion.
                return StatusCode(StatusCodes.Status200OK, "ok");
            }
            catch (Exception ex)
            {
                // Returns a 500 Internal Server Error status if an exception occurs during deletion.
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }
    }
}
