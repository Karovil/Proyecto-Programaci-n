using apiPeluqueria.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace apiGimnasio.Clases
{
    public class clsOpeFormaPago
    {

        //Atributo 
        private readonly bd_tienda_belleza_finalEntities oEFR = new bd_tienda_belleza_finalEntities();

        public IQueryable listarFormaPago()
        {
            return from tFor in oEFR.Set<formapago>()
                   .OrderBy(x => x.id_formapago)
                   select new
                   {
                       Codigo = tFor.id_formapago,
                       Descripcion = tFor.descripcion
                   };
        }
    }
}
