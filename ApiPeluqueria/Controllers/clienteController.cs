using apiPeluqueria.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using apiPeluqueria.Clases;
using System.Web.Http.Cors;

namespace apiPeluqueria.Controllers
{
    [EnableCors(origins: "http://localhost:60877", headers: "*", methods: "*")]
    public class clienteController : ApiController
    {
        

        // GET api/<controller>/5
        public IQueryable Get(string nrDoc)
        {
            clsOpeCliente opeCliente = new clsOpeCliente();
            return opeCliente.listarXCliente(nrDoc);
        }

       

        
    }
}