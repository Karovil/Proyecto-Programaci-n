using apiPeluqueria.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace apiPeluqueria.Clases
{
    public class clsOpeTipoCliente
    {
        //Atributo 
        private readonly bd_tienda_belleza_finalEntities oEFR = new bd_tienda_belleza_finalEntities();

        public IQueryable listarTipoCliente()
        {
            return from tH in oEFR.Set<tipocliente>()
                   orderby tH.id_tipocliente
                   select new
                   {
                       Codigo = tH.id_tipocliente,
                       Descripcion = tH.descripcion
                   };
        }
    }
}