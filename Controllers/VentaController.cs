using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using ReactVentas.Models;
using ReactVentas.Models.DTO;
using System.Data;
using System.Globalization;
using System.Xml.Linq;

namespace ReactVentas.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VentaController : ControllerBase
    {
        private readonly DBREACT_VENTAContext _context;

        public VentaController(DBREACT_VENTAContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Searches for products based on the search string.
        /// </summary>
        /// <param name="busqueda">The search string to filter products.</param>
        /// <returns>A list of products matching the search criteria.</returns>
        [HttpGet]
        [Route("Productos/{busqueda}")]
        public async Task<IActionResult> Productos(string busqueda)
        {
            List<DtoProducto> lista = new List<DtoProducto>();
            try
            {
                lista = await _context.Productos
                .Where(p => string.Concat(p.Codigo.ToLower(), p.Marca.ToLower(), p.Descripcion.ToLower()).Contains(busqueda.ToLower()))
                .Select(p => new DtoProducto()
                {
                    IdProducto = p.IdProducto,
                    Codigo = p.Codigo,
                    Marca = p.Marca,
                    Descripcion = p.Descripcion,
                    Precio = p.Precio
                }).ToListAsync();

                return StatusCode(StatusCodes.Status200OK, lista);
            }
            catch (Exception ex)
            {
                // Log exception details here if necessary
                return StatusCode(StatusCodes.Status500InternalServerError, lista);
            }
        }

        /// <summary>
        /// Registers a new sale.
        /// </summary>
        /// <param name="request">The sale data to register.</param>
        /// <returns>The document number of the registered sale.</returns>
        [HttpPost]
        [Route("Registrar")]
        public IActionResult Registrar([FromBody] DtoVenta request)
        {
            try
            {
                string numeroDocumento = "";
                XElement productos = new XElement("Productos");

                // Construct XML from the product list
                foreach (DtoProducto item in request.listaProductos)
                {
                    productos.Add(new XElement("Item",
                        new XElement("IdProducto", item.IdProducto),
                        new XElement("Cantidad", item.Cantidad),
                        new XElement("Precio", item.Precio),
                        new XElement("Total", item.Total)
                    ));
                }

                using (SqlConnection con = new SqlConnection(_context.Database.GetConnectionString()))
                {
                    con.Open();
                    SqlCommand cmd = new SqlCommand("sp_RegistrarVenta", con)
                    {
                        CommandType = CommandType.StoredProcedure
                    };
                    cmd.Parameters.Add("documentoCliente", SqlDbType.VarChar, 40).Value = request.documentoCliente;
                    cmd.Parameters.Add("nombreCliente", SqlDbType.VarChar, 40).Value = request.nombreCliente;
                    cmd.Parameters.Add("tipoDocumento", SqlDbType.VarChar, 50).Value = request.tipoDocumento;
                    cmd.Parameters.Add("idUsuario", SqlDbType.Int).Value = request.idUsuario;
                    cmd.Parameters.Add("subTotal", SqlDbType.Decimal).Value = request.subTotal;
                    cmd.Parameters.Add("impuestoTotal", SqlDbType.Decimal).Value = request.igv;
                    cmd.Parameters.Add("total", SqlDbType.Decimal).Value = request.total;
                    cmd.Parameters.Add("productos", SqlDbType.Xml).Value = productos.ToString();
                    cmd.Parameters.Add("nroDocumento", SqlDbType.VarChar, 6).Direction = ParameterDirection.Output;
                    cmd.ExecuteNonQuery();
                    numeroDocumento = cmd.Parameters["nroDocumento"].Value.ToString();
                }

                return StatusCode(StatusCodes.Status200OK, new { numeroDocumento = numeroDocumento });
            }
            catch (Exception ex)
            {
                // Log exception details here if necessary
                return StatusCode(StatusCodes.Status500InternalServerError, new { numeroDocumento = "" });
            }
        }

        /// <summary>
        /// Lists sales based on filter criteria.
        /// </summary>
        /// <returns>A list of sales matching the filter criteria.</returns>
        [HttpGet]
        [Route("Listar")]
        public async Task<IActionResult> Listar()
        {
            string buscarPor = HttpContext.Request.Query["buscarPor"];
            string numeroVenta = HttpContext.Request.Query["numeroVenta"];
            string fechaInicio = HttpContext.Request.Query["fechaInicio"];
            string fechaFin = HttpContext.Request.Query["fechaFin"];

            DateTime _fechainicio = DateTime.ParseExact(fechaInicio, "dd/MM/yyyy", CultureInfo.CreateSpecificCulture("es-PE"));
            DateTime _fechafin = DateTime.ParseExact(fechaFin, "dd/MM/yyyy", CultureInfo.CreateSpecificCulture("es-PE"));

            List<DtoHistorialVenta> lista_venta = new List<DtoHistorialVenta>();
            try
            {
                if (buscarPor == "fecha")
                {
                    // Filter sales by date range
                    lista_venta = await _context.Venta
                        .Include(u => u.IdUsuarioNavigation)
                        .Include(d => d.DetalleVenta)
                        .ThenInclude(p => p.IdProductoNavigation)
                        .Where(v => v.FechaRegistro.Value.Date >= _fechainicio.Date && v.FechaRegistro.Value.Date <= _fechafin.Date)
                        .Select(v => new DtoHistorialVenta()
                        {
                            FechaRegistro = v.FechaRegistro.Value.ToString("dd/MM/yyyy"),
                            NumeroDocumento = v.NumeroDocumento,
                            TipoDocumento = v.TipoDocumento,
                            DocumentoCliente = v.DocumentoCliente,
                            NombreCliente = v.NombreCliente,
                            UsuarioRegistro = v.IdUsuarioNavigation.Nombre,
                            SubTotal = v.SubTotal.ToString(),
                            Impuesto = v.ImpuestoTotal.ToString(),
                            Total = v.Total.ToString(),
                            Detalle = v.DetalleVenta.Select(d => new DtoDetalleVenta()
                            {
                                Producto = d.IdProductoNavigation.Descripcion,
                                Cantidad = d.Cantidad.ToString(),
                                Precio = d.Precio.ToString(),
                                Total = d.Total.ToString()
                            }).ToList()
                        })
                        .ToListAsync();
                }
                else
                {
                    // Filter sales by document number
                    lista_venta = await _context.Venta
                        .Include(u => u.IdUsuarioNavigation)
                        .Include(d => d.DetalleVenta)
                        .ThenInclude(p => p.IdProductoNavigation)
                        .Where(v => v.NumeroDocumento == numeroVenta)
                        .Select(v => new DtoHistorialVenta()
                        {
                            FechaRegistro = v.FechaRegistro.Value.ToString("dd/MM/yyyy"),
                            NumeroDocumento = v.NumeroDocumento,
                            TipoDocumento = v.TipoDocumento,
                            DocumentoCliente = v.DocumentoCliente,
                            NombreCliente = v.NombreCliente,
                            UsuarioRegistro = v.IdUsuarioNavigation.Nombre,
                            SubTotal = v.SubTotal.ToString(),
                            Impuesto = v.ImpuestoTotal.ToString(),
                            Total = v.Total.ToString(),
                            Detalle = v.DetalleVenta.Select(d => new DtoDetalleVenta()
                            {
                                Producto = d.IdProductoNavigation.Descripcion,
                                Cantidad = d.Cantidad.ToString(),
                                Precio = d.Precio.ToString(),
                                Total = d.Total.ToString()
                            }).ToList()
                        }).ToListAsync();
                }

                return StatusCode(StatusCodes.Status200OK, lista_venta);
            }
            catch (Exception ex)
            {
                // Log exception details here if necessary
                return StatusCode(StatusCodes.Status500InternalServerError, lista_venta);
            }
        }

        /// <summary>
        /// Generates a sales report for a specified date range.
        /// </summary>
        /// <returns>A report of sales within the specified date range.</returns>
        [HttpGet]
        [Route("Reporte")]
        public async Task<IActionResult> Reporte()
        {
            string fechaInicio = HttpContext.Request.Query["fechaInicio"];
            string fechaFin = HttpContext.Request.Query["fechaFin"];

            DateTime _fechainicio = DateTime.ParseExact(fechaInicio, "dd/MM/yyyy", CultureInfo.CreateSpecificCulture("es-PE"));
            DateTime _fechafin = DateTime.ParseExact(fechaFin, "dd/MM/yyyy", CultureInfo.CreateSpecificCulture("es-PE"));

            List<DtoReporteVenta> lista_venta = new List<DtoReporteVenta>();
            try
            {
                lista_venta = (from v in _context.Venta
                               join d in _context.DetalleVenta on v.IdVenta equals d.IdVenta
                               join p in _context.Productos on d.IdProducto equals p.IdProducto
                               where v.FechaRegistro.Value.Date >= _fechainicio.Date && v.FechaRegistro.Value.Date <= _fechafin.Date
                               select new DtoReporteVenta()
                               {
                                   FechaRegistro = v.FechaRegistro.Value.ToString("dd/MM/yyyy"),
                                   NumeroDocumento = v.NumeroDocumento,
                                   TipoDocumento = v.TipoDocumento,
                                   DocumentoCliente = v.DocumentoCliente,
                                   NombreCliente = v.NombreCliente,
                                   SubTotalVenta = v.SubTotal.ToString(),
                                   ImpuestoTotalVenta = v.ImpuestoTotal.ToString(),
                                   TotalVenta = v.Total.ToString(),
                                   Producto = p.Descripcion,
                                   Cantidad = d.Cantidad.ToString(),
                                   Precio = d.Precio.ToString(),
                                   Total = d.Total.ToString()
                               }).ToList();

                return StatusCode(StatusCodes.Status200OK, lista_venta);
            }
            catch (Exception ex)
            {
                // Log exception details here if necessary
                return StatusCode(StatusCodes.Status500InternalServerError, lista_venta);
            }
        }
    }
}
