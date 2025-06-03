using apiPeluqueria.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace apiPeluqueria.Clases
{
    public class clsOpeDomicilio
    {
        //Atributo 
        private readonly bd_tienda_belleza_finalEntities oEFR = new bd_tienda_belleza_finalEntities();

        public IQueryable listarDomicilios()
        {
            return from tD in oEFR.Set<serviciodomicilio>()
                   join tC in oEFR.Set<cliente>()
                   on tD.id_cliente equals tC.id_cliente
                   join tV in oEFR.Set<venta>()
                   on tD.id_venta equals tV.id_venta
                   join tB in oEFR.Set<direccion>()
                   on tD.id_direccionentrega equals tB.id_direccion
                   orderby tD.id_servicio
                   select new
                   {
                       Codigo_Servicio = tD.id_servicio,
                       Codigo_Venta = tD.id_venta,
                       DireccionE = tB.id_ciudad + " "+tB.direccion1,
                       NombreC = tC.nombre + " " + tC.apellido,
                       FechaE = tD.fechaentrega,
                       FechaS = tD.fechasolicitud,
                      


                   };
        }
    }
}