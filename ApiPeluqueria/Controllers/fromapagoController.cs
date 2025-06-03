using apiGimnasio.Clases;
using apiPeluqueria.Clases;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace apiGimnasio.Controllers
{
    public class fromapagoController : ApiController
    {
        // GET api/<controller>
        public IQueryable Get()
        {
            clsOpeFormaPago opeFormaPago = new clsOpeFormaPago();
            return opeFormaPago.listarFormaPago();
        }
    }
}