using apiPeluqueria.Clases;
using apiPeluqueria.Models;
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
    public class empleadoController : ApiController
    {
        // GET api/<controller>
        public IQueryable Get()
        {
            clsOpeEmpleado opeEmpleado = new clsOpeEmpleado();
            return opeEmpleado.ListarEmpleados();
        }

        // GET api/<controller>/5
        public IQueryable Get(string codEmp)
        {
            clsOpeEmpleado opeEmpleado = new clsOpeEmpleado();
            return opeEmpleado.listarXEmpleado(codEmp);
        }

        // POST api/<controller>
        public string Post([FromBody] empleado tblEmp)
        {
            clsOpeEmpleado opeEmpleado = new clsOpeEmpleado();
            opeEmpleado.tblempleado = tblEmp;
            return opeEmpleado.Agregar();
        }

        // PUT api/<controller>/5
        public string Put([FromBody] empleado tblEmp)
        {
            clsOpeEmpleado opeEmpleado = new clsOpeEmpleado();
            opeEmpleado.tblempleado = tblEmp;
            return opeEmpleado.Modificar();
        }

        // DELETE api/<controller>/5
        public string Delete(int codEmp)
        {
            clsOpeEmpleado opeEmpleado = new clsOpeEmpleado();
            return opeEmpleado.Eliminar(codEmp);
        }
    }
}