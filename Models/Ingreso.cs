using System;
using System.Collections.Generic;

namespace ReactVentas.Models
{
    /// <summary>
    /// Represents an income record in the system, containing details such as description, amount, and money type.
    /// </summary>
    public partial class Ingreso
    {
        /// <summary>
        /// Gets or sets the unique identifier for the income record.
        /// </summary>
        public int IdIngreso { get; set; }

        /// <summary>
        /// Gets or sets the description of the income.
        /// Optional field.
        /// </summary>
        public string? Descripcion { get; set; }

        /// <summary>
        /// Gets or sets the date and time when the income was registered.
        /// Optional field.
        /// </summary>
        public DateTime? FechaRegistro { get; set; }

        /// <summary>
        /// Gets or sets the amount of the income.
        /// Optional field.
        /// </summary>
        public decimal? Monto { get; set; }

        /// <summary>
        /// Gets or sets the type of money (efectivo or transferencia).
        /// Optional field.
        /// </summary>
        public string? TipoMoneda { get; set; }

        /// <summary>
        /// Gets or sets the identifier for the user who registered the income.
        /// Optional field.
        /// </summary>
        public int? IdUsuario { get; set; }

        /// <summary>
        /// Gets or sets the active status of the income record.
        /// Optional field. A value of true indicates the income is active.
        /// </summary>
        public bool? EsActivo { get; set; }

        /// <summary>
        /// Navigation property to the related user entity.
        /// </summary>
        public virtual Usuario? IdUsuarioNavigation { get; set; }
    }
}