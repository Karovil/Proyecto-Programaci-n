using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;
using apiPeluqueria.Models;
using apiPeluqueria.Clases;   

namespace apiPeluqueria.Controllers
{
    [EnableCors(origins: "http://localhost:60877", headers: "*", methods: "*")]
    public class ventaController : ApiController
    {
        // GET api/<controller>/5
        public IQueryable Get(int codVent)
        {
            clsOpeVenta opeVent = new clsOpeVenta();
            return opeVent.consultarVenta(codVent);
        }


        // POST api/<controller>
        public venta Post([FromBody] venta objIn, int cmdo)
        {
            clsOpeVenta opeVent = new clsOpeVenta();
            opeVent.tblventa = objIn;
            switch (cmdo)
            {

                case 1:
                    return opeVent.agregarVenta();
                default:
                    return objIn;

            }
        }

        // PUT api/<controller>/5
        public string Put([FromBody] venta datIn)
        {
            clsOpeVenta opeVent = new clsOpeVenta();
            opeVent.tblventa = datIn;
            return opeVent.Modificar();
           
           
        }


    }
}