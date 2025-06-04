using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactVentas.Models;

namespace ReactVentas.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriaController : ControllerBase
    {
        private readonly DBREACT_VENTAContext _context;

        public CategoriaController(DBREACT_VENTAContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Route("Lista")]
        public async Task<IActionResult> Lista()
        {
            // Retrieves a list of categories ordered by their ID in descending order.
            List<Categoria> lista = new List<Categoria>();
            try
            {
                lista = await _context.Categoria.OrderByDescending(c => c.IdCategoria).ToListAsync();
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
        public async Task<IActionResult> Guardar([FromBody] Categoria request)
        {
            // Adds a new category to the database.
            try
            {
                await _context.Categoria.AddAsync(request);
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
        public async Task<IActionResult> Editar([FromBody] Categoria request)
        {
            // Updates an existing category in the database.
            try
            {
                _context.Categoria.Update(request);
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
            // Deletes a category by its ID.
            try
            {
                Categoria categoria = _context.Categoria.Find(id);
                _context.Categoria.Remove(categoria);
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
