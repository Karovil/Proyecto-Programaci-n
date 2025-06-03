using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using apiPeluqueria.Models;
namespace apiPeluqueria.Clases
{
    public class clsOpeCliente
    {
        //Atributo
        private readonly bd_tienda_belleza_finalEntities oEFR = new bd_tienda_belleza_finalEntities();


        public IQueryable listarXCliente(string nroD)
        {
            return from tS in oEFR.Set<cliente>()
                   where tS.activo == true && tS.numerodocumento == nroD
                   orderby tS.id_cliente
                   select new
                   {
                       Codigo = tS.id_cliente,
                       Nombre = tS.nombre + " " + tS.apellido

                   };
        }

    }
}