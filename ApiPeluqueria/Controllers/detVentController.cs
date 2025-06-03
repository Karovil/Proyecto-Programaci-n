using apiPeluqueria.Clases;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;
using apiPeluqueria.Models;

namespace apiPeluqueria.Controllers
{
    [EnableCors(origins: "http://localhost:60877", headers: "*", methods: "*")]
    public class detVentController : ApiController
    {

        // GET api/<controller>
        public IQueryable Get(int dato)
        {
            clsOpeDetVent opeDet = new clsOpeDetVent();
            return opeDet.llenarTabla(dato);

        }


        // POST api/<controller>
        public detalleventa Post([FromBody] detalleventa tblDet)
        {
            clsOpeDetVent opeDetInsc = new clsOpeDetVent();
            opeDetInsc.tblDetVent = tblDet;
            return opeDetInsc.Agregar();
        }


        // DELETE api/<controller>/5
        public string Delete(int idDetI)
        {
            clsOpeDetVent opeDetInsc = new clsOpeDetVent();
            return opeDetInsc.Eliminar(idDetI);
        }
    }
}