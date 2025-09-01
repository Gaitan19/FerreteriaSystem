using System;
using System.Collections.Generic;

namespace ReactVentas.Models
{
    public partial class Ingreso
    {
        public int IdIngreso { get; set; }
        public string? Descripcion { get; set; }
        public DateTime? FechaRegistro { get; set; }
        public decimal? Monto { get; set; }
        public string? TipoDinero { get; set; }
        public int? IdUsuario { get; set; }
        public int? ActualizadoPor { get; set; }
        public bool? Activo { get; set; }

        public virtual Usuario? IdUsuarioNavigation { get; set; }
        public virtual Usuario? ActualizadoPorNavigation { get; set; }
    }
}