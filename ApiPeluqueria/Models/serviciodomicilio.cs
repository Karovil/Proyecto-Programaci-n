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
    
    public partial class serviciodomicilio
    {
        public int id_servicio { get; set; }
        public int id_venta { get; set; }
        public int id_cliente { get; set; }
        public int id_direccionentrega { get; set; }
        public int id_empleado { get; set; }
        public System.DateTime fechasolicitud { get; set; }
        public Nullable<System.DateTime> fechaentrega { get; set; }
        public Nullable<bool> activo { get; set; }
        public string comentarios { get; set; }
    
        public virtual cliente cliente { get; set; }
        public virtual direccion direccion { get; set; }
        public virtual empleado empleado { get; set; }
        public virtual venta venta { get; set; }
    }
}
