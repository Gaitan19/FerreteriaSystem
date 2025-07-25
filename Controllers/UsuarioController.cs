﻿using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ReactVentas.Models;
using ReactVentas.Models.DTO;
using ReactVentas.Services;
using ReactVentas.Interfaces;

namespace ReactVentas.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsuarioController : ControllerBase
    {
        private readonly IUsuarioRepository _usuarioRepository;
        private readonly IPasswordService _passwordService;

        public UsuarioController(IUsuarioRepository usuarioRepository, IPasswordService passwordService)
        {
            _usuarioRepository = usuarioRepository;
            _passwordService = passwordService;
        }

        [HttpGet]
        [Route("Lista")]
        public async Task<IActionResult> Lista()
        {
            // Retrieve the list of active users from the database, including role information.
            try
            {
                var lista = await _usuarioRepository.GetUsersWithRoleAsync();
                return StatusCode(StatusCodes.Status200OK, lista);
            }
            catch (Exception ex)
            {
                // Return a 500 Internal Server Error status if an exception occurs.
                return StatusCode(StatusCodes.Status500InternalServerError, new List<Usuario>());
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
                await _usuarioRepository.AddAsync(request);
                await _usuarioRepository.SaveChangesAsync();

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
                var usuario = await _usuarioRepository.GetByIdAsync(request.IdUsuario);
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

                await _usuarioRepository.UpdateAsync(usuario);
                await _usuarioRepository.SaveChangesAsync();

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
            // Performs soft delete by setting EsActivo to false instead of removing the record.
            try
            {
                var result = await _usuarioRepository.SoftDeleteAsync(id);
                if (result)
                {
                    await _usuarioRepository.SaveChangesAsync();
                    return StatusCode(StatusCodes.Status200OK, "ok");
                }
                else
                {
                    return StatusCode(StatusCodes.Status404NotFound, "Usuario not found");
                }
            }
            catch (Exception ex)
            {
                // Return a 500 Internal Server Error status if an exception occurs.
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }
    }
}
