//------------------------------------------------------------------------------
// <auto-generated>
//     Este código se generó a partir de una plantilla.
//
//     Los cambios manuales en este archivo pueden causar un comportamiento inesperado de la aplicación.
//     Los cambios manuales en este archivo se sobrescribirán si se regenera el código.
// </auto-generated>
//------------------------------------------------------------------------------

namespace apiPeluqueria.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class detalleventa
    {
        public int id_detalleventa { get; set; }
        public int id_venta { get; set; }
        public int id_producto { get; set; }
        public int cantidad { get; set; }
        public decimal preciounitario { get; set; }
        public Nullable<decimal> descuentounitario { get; set; }
        public decimal subtotal { get; set; }
        public Nullable<int> id_descuento { get; set; }
    
        public virtual descuentomayorista descuentomayorista { get; set; }
        public virtual producto producto { get; set; }
        public virtual venta venta { get; set; }
    }
}
