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
    public class SessionController : ControllerBase
    {
        private readonly DBREACT_VENTAContext _context;
        private readonly IPasswordService _passwordService;

        public SessionController(DBREACT_VENTAContext context, IPasswordService passwordService)
        {
            _context = context;
            _passwordService = passwordService;
        }

        [HttpPost]
        [Route("Login")]
        public async Task<IActionResult> Login([FromBody] Dtosesion request)
        {
            Usuario usuario = new Usuario();
            try
            {
                usuario = await _context.Usuarios
                    .Include(u => u.IdRolNavigation)
                    .FirstOrDefaultAsync(u => u.Correo == request.correo);

                if (usuario == null ||
                    !_passwordService.VerifyPassword(request.clave, usuario.Clave))
                {
                    usuario = new Usuario();
                    return StatusCode(StatusCodes.Status401Unauthorized, usuario);
                }

                return StatusCode(StatusCodes.Status200OK, usuario);
            }
            catch
            {
                return StatusCode(StatusCodes.Status500InternalServerError, usuario);
            }
        }
    }
}