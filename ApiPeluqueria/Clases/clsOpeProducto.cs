using apiPeluqueria.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace apiPeluqueria.Clases
{
    public class clsOpeProducto
    {

        //Atributo 
        private readonly bd_tienda_belleza_finalEntities oEFR = new bd_tienda_belleza_finalEntities();

        public IQueryable listarProductos()
        {
            return from tC in oEFR.Set<producto>()
                   where tC.activo == true
                   orderby tC.codigo
                   select new
                   {   id = tC.id_producto,
                       Codigo = tC.codigo,
                       Nombre = tC.nombre,
                       Stock = tC.stock,
                       PrecioB = tC.preciobase,
                       Descripcion = tC.descripcion,
                   };
        }


        public IQueryable listarXCodigo(int cod)
        {
            return from tC in oEFR.Set<producto>()
                   join tM in oEFR.Set<categoriaproducto>()
                     on tC.id_categoria equals tM.id_categoria
                   where tC.id_producto == cod
                   select new
                   {
                       Codigo = tC.id_producto,
                       Descripcion = tC.descripcion,
                       Categoria = tM.nombrecategoria,
                       DescripcionCat = tM.descripcion,
                       Costo = tC.costo,
                   };

        }
    }
}