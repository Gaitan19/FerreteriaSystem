using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactVentas.Models;
using ReactVentas.Models.DTO;

namespace ReactVentas.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UtilidadController : ControllerBase
    {
        private readonly DBREACT_VENTAContext _context;

        public UtilidadController(DBREACT_VENTAContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Route("Dashboard")]
        public async Task<IActionResult> Dashboard()
        {
            // Initialize a new dashboard configuration object.
            DtoDashboard config = new DtoDashboard();

            // Calculate date ranges for the dashboard statistics.
            DateTime fecha = DateTime.Now.AddDays(-30);
            DateTime fecha2 = DateTime.Now.AddDays(-7);

            try
            {
                // Calculate total sales in the last 30 days.
                config.TotalVentas = _context.Venta
                    .Where(v => v.FechaRegistro >= fecha)
                    .Count()
                    .ToString();

                // Calculate total revenue in the last 30 days.
                config.TotalIngresos = _context.Venta
                    .Where(v => v.FechaRegistro >= fecha)
                    .Sum(v => v.Total)
                    .ToString();

                // Calculate the total number of active products.
                config.TotalProductos = _context.Productos
                    .Where(p => p.EsActivo == true)
                    .Count()
                    .ToString();

                // Calculate the total number of active categories.
                config.TotalCategorias = _context.Categoria
                    .Where(c => c.EsActivo == true)
                    .Count()
                    .ToString();

                // Get the top 4 sold products in the last 30 days.
                //config.ProductosVendidos = (from p in _context.Productos
                //                             join d in _context.DetalleVenta on p.IdProducto equals d.IdProducto
                //                             group p by p.Descripcion into g
                //                             orderby g.Count() ascending
                //                             select new DtoProductoVendidos { Producto = g.Key, Total = g.Count().ToString() })
                //                             .Take(4)
                //                             .ToList();

                // Get the top 4 sold products in the last 30 days.
                config.ProductosVendidos = (from p in _context.Productos
                                            join d in _context.DetalleVenta on p.IdProducto equals d.IdProducto
                                            join v in _context.Venta on d.IdVenta equals v.IdVenta
                                            where v.FechaRegistro >= fecha  // Filtra por las ventas de los últimos 30 días
                                            group p by p.Descripcion into g
                                            orderby g.Count() descending  // Cambiado a 'descending' para obtener los más vendidos
                                            select new DtoProductoVendidos
                                            {
                                                Producto = g.Key,
                                                Total = g.Count().ToString()
                                            })
                                             .Take(4)
                                             .ToList();


                // Get sales count grouped by day for the last 7 days.
                config.VentasporDias = (from v in _context.Venta
                                         where v.FechaRegistro.Value.Date >= fecha2.Date
                                         group v by v.FechaRegistro.Value.Date into g
                                         orderby g.Key ascending
                                         select new DtoVentasDias { Fecha = g.Key.ToString("dd/MM/yyyy"), Total = g.Count().ToString() })
                                         .ToList();

                // Return the dashboard configuration with a 200 OK status.
                return StatusCode(StatusCodes.Status200OK, config);
            }
            catch (Exception ex)
            {
                // Return a 500 Internal Server Error status if an exception occurs.
                return StatusCode(StatusCodes.Status500InternalServerError, config);
            }
        }
    }
}
