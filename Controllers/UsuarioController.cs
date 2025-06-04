using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactVentas.Models;
using ReactVentas.Models.DTO;
using ReactVentas.Services;

namespace ReactVentas.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsuarioController : ControllerBase
    {
        private readonly DBREACT_VENTAContext _context;
        private readonly IPasswordService _passwordService;

        public UsuarioController(DBREACT_VENTAContext context, IPasswordService passwordService)
        {
            _context = context;
            _passwordService = passwordService;
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
                // Hashear la contraseña antes de guardar
                request.Clave = _passwordService.HashPassword(request.Clave);

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

        [HttpPatch]
        [Route("Editar")]
        public async Task<IActionResult> Editar([FromBody] DtoUsuarioUpdate request)
        {
            try
            {
                var usuario = await _context.Usuarios.FindAsync(request.IdUsuario);
                if (usuario == null)
                    return StatusCode(StatusCodes.Status404NotFound, "Usuario no encontrado");

                // Actualizar campos básicos
                usuario.Nombre = request.Nombre ?? usuario.Nombre;
                usuario.Correo = request.Correo ?? usuario.Correo;
                usuario.Telefono = request.Telefono ?? usuario.Telefono;
                usuario.IdRol = request.IdRol ?? usuario.IdRol;
                usuario.EsActivo = request.EsActivo ?? usuario.EsActivo;

                // Cambio de contraseña (solo si se proporcionan ambos campos)
                if (!string.IsNullOrEmpty(request.ClaveNueva) &&
                    !string.IsNullOrEmpty(request.ClaveActual))
                {
                    if (!_passwordService.VerifyPassword(request.ClaveActual, usuario.Clave))
                        return StatusCode(StatusCodes.Status400BadRequest, "Contraseña actual incorrecta");

                    usuario.Clave = _passwordService.HashPassword(request.ClaveNueva);
                }

                _context.Usuarios.Update(usuario);
                await _context.SaveChangesAsync();

                return StatusCode(StatusCodes.Status200OK, "ok");
            }
            catch (Exception ex)
            {
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
