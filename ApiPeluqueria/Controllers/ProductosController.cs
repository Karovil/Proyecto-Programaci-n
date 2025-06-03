using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;
using apiPeluqueria.Clases;


namespace apiPeluqueria.Controllers
{
    [EnableCors(origins: "http://localhost:60877", headers: "*", methods: "*")]
    public class ProductosController : ApiController
    {
        // GET api/<controller>
        public IQueryable Get()
        {
            clsOpeProducto opeProdu = new clsOpeProducto();
            return opeProdu.listarProductos();
            
        }

        // GET api/<controller>/5
        public IQueryable Get(int idProd)
        {
            clsOpeProducto opeProdu = new clsOpeProducto();
            return opeProdu.listarXCodigo(idProd);
           
        }

        
    }
}