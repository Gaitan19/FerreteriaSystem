using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactVentas.Models;
using ReactVentas.Models.DTO;

namespace ReactVentas.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SessionController : ControllerBase
    {
        private readonly DBREACT_VENTAContext _context;

        public SessionController(DBREACT_VENTAContext context)
        {
            _context = context;
        }

        [HttpPost]
        [Route("Login")]
        public async Task<IActionResult> Login([FromBody] Dtosesion request)
        {
            // Initialize a new Usuario object to store the result of the login attempt.
            Usuario usuario = new Usuario();
            try
            {
                // Attempt to find the user in the database based on the provided email and password.
                usuario = _context.Usuarios.Include(u => u.IdRolNavigation)
                    .Where(u => u.Correo == request.correo && u.Clave == request.clave)
                    .FirstOrDefault();

                // If no user is found, initialize a new Usuario object.
                if(usuario == null)
                    usuario = new Usuario();

                // Return a 200 OK status along with the user information.
                return StatusCode(StatusCodes.Status200OK, usuario);
            }
            catch
            {
                // Return a 500 Internal Server Error status if an exception occurs during the process.
                return StatusCode(StatusCodes.Status500InternalServerError, usuario);
            }
        }
    }
}
