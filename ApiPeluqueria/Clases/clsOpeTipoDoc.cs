using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using apiPeluqueria.Models;
namespace apiPeluqueria.Clases
{
    public class clsOpeTipoDoc
    {
        //Atributo 
        private readonly bd_tienda_belleza_finalEntities oEFR = new bd_tienda_belleza_finalEntities();

        public IQueryable listarTipDocs()
        {
            return from tDoc in oEFR.Set<tipodocumento>()
                   .OrderBy(x => x.descripcion)
                   select new
                   {
                       Codigo = tDoc.id_tipodocumento,
                       Nombre = tDoc.descripcion
                   };
        }
    }
}