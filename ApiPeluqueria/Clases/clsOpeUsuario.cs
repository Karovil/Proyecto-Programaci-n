using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http.Cors;
using apiPeluqueria.Models;

namespace apiPeluqueria.Clases
{
    
    public class clsOpeUsuario
    {
        //Atributo 
        private readonly bd_tienda_belleza_finalEntities oEFR = new bd_tienda_belleza_finalEntities();
        public IQueryable buscarUsuario(string user, string contra)
        {
            return from ts in oEFR.Set <usuario> ()
                   join tE in oEFR.Set<empleado>()
                   on ts.id_empleado equals tE.id_empleado

                   where ts.usuario1.Trim() == user.Trim() && ts.contrasena.Trim() == contra.Trim()

                   select new
                   {
                      
                        Codigo = tE.id_empleado,
                        Nombre = tE.nombre,
                        Apellido = tE.apellido,
                        Activo = tE.activo

                   };

        }
    }
}