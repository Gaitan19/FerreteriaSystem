using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactVentas.Models;

namespace ReactVentas.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsuarioController : ControllerBase
    {
        private readonly DBREACT_VENTAContext _context;

        public UsuarioController(DBREACT_VENTAContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Route("Lista")]
        public async Task<IActionResult> Lista()
        {
            // Initialize a list to store users.
            List<Usuario> lista = new List<Usuario>();
            try
            {
                // Retrieve the list of users from the database, including role information, 
                // and order them by user ID in descending order.
                lista = await _context.Usuarios.Include(r => r.IdRolNavigation)
                    .OrderByDescending(c => c.IdUsuario).ToListAsync();

                // Return the list with a 200 OK status.
                return StatusCode(StatusCodes.Status200OK, lista);
            }
            catch (Exception ex)
            {
                // Return a 500 Internal Server Error status if an exception occurs.
                return StatusCode(StatusCodes.Status500InternalServerError, lista);
            }
        }

        [HttpPost]
        [Route("Guardar")]
        public async Task<IActionResult> Guardar([FromBody] Usuario request)
        {
            try
            {
                // Add a new user to the database and save changes.
                await _context.Usuarios.AddAsync(request);
                await _context.SaveChangesAsync();

                // Return a 200 OK status indicating success.
                return StatusCode(StatusCodes.Status200OK, "ok");
            }
            catch (Exception ex)
            {
                // Return a 500 Internal Server Error status if an exception occurs.
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPut]
        [Route("Editar")]
        public async Task<IActionResult> Editar([FromBody] Usuario request)
        {
            try
            {
                // Update the user information in the database.
                _context.Usuarios.Update(request);
                await _context.SaveChangesAsync();

                // Return a 200 OK status indicating success.
                return StatusCode(StatusCodes.Status200OK, "ok");
            }
            catch (Exception ex)
            {
                // Return a 500 Internal Server Error status if an exception occurs.
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpDelete]
        [Route("Eliminar/{id:int}")]
        public async Task<IActionResult> Eliminar(int id)
        {
            try
            {
                // Find the user by ID and remove them from the database.
                Usuario usuario = _context.Usuarios.Find(id);
                _context.Usuarios.Remove(usuario);
                await _context.SaveChangesAsync();

                // Return a 200 OK status indicating success.
                return StatusCode(StatusCodes.Status200OK, "ok");
            }
            catch (Exception ex)
            {
                // Return a 500 Internal Server Error status if an exception occurs.
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }
    }
}
