using apiPeluqueria.Clases;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;

namespace apiPeluqueria.Controllers
{
    [EnableCors(origins: "http://localhost:60877", headers: "*", methods: "*")]
    public class domicilioController : ApiController
    {
        // GET api/<controller>
        public IQueryable Get()
        {
            clsOpeDomicilio opeDomicilio = new clsOpeDomicilio();
            return opeDomicilio.listarDomicilios();
        }
    }
}