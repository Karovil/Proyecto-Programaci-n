using apiPeluqueria.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Web;

namespace apiPeluqueria.Clases
{
    public class clsOpeEmpleado
    {
        //Atributo 
        private readonly bd_tienda_belleza_finalEntities oEFR = new bd_tienda_belleza_finalEntities();

        public empleado tblempleado { get; set; }

        public IQueryable ListarEmpleados()
        {
            return from tE in oEFR.Set<empleado>()
                   join tDoc in oEFR.Set<tipodocumento>()
                   on tE.id_tipodocumento equals tDoc.id_tipodocumento
                   join tEr in oEFR.Set<empleado>()
                   on tE.registrado_por equals tEr.id_empleado
                   orderby tE.numerodocumento
                   select new
                   {
                       Editar = "<a class='btn btn-info btn-sm' href=''><i class='fas fa-pencil-alt'></i>Editar</a>",
                       Codigo = tE.id_empleado,
                       Nombre = tE.nombre,
                       Apellido = tE.apellido,
                       idTd = tE.id_tipodocumento,
                       Tipo_Doc = tDoc.descripcion,
                       Nro_doc = tE.numerodocumento,
                       Salario = tE.salario,
                       FechaIng = tE.fechacontratacion.ToString(),
                       FechaN = tE.fechanacimiento.ToString(),
                       Empleado = tE.registrado_por,
                       Activo = tE.activo


                   };

        }
        public IQueryable listarXEmpleado(string nroCod)
        {
            return from tE in oEFR.Set<empleado>()
                   join tDoc in oEFR.Set<tipodocumento>()
                    on tE.id_tipodocumento equals tDoc.id_tipodocumento
                   join tEr in oEFR.Set<empleado>()
                   on tE.registrado_por equals tEr.id_empleado

                   where tE.numerodocumento == nroCod
                   select new
                   {

                       Codigo = tE.id_empleado,
                       Nombre = tE.nombre,
                       Apellido = tE.apellido,
                       idTd = tE.id_tipodocumento,
                       Nro_doc = tE.numerodocumento,
                       Salario = tE.salario,
                       FechaIng = tE.fechacontratacion.ToString(),
                       FechaN = tE.fechanacimiento.ToString(),
                       Empleado = tE.registrado_por,
                       Activo = tE.activo


                   };


        }

        public string Agregar()
        {

            var idmax = 0;
            try
            {
                idmax = oEFR.empleadoes.DefaultIfEmpty().Max(r => r == null ? 1 : r.id_empleado + 1);
            }
            catch
            {

                return $"Error, Hubo un fallo al grabar en el registro: {tblempleado.nombre}, con nroDoc: {tblempleado.numerodocumento} ";
            }

            tblempleado.id_empleado = idmax;
            try
            {
                oEFR.empleadoes.Add(tblempleado);
                oEFR.SaveChanges();
                return $"Registro grabado con éxito: {tblempleado.nombre} , con nroDoc: {tblempleado.numerodocumento}";

            }
            catch
            {
                return $"Error, hubo fallo al grabar el registro: {tblempleado.id_empleado}, con nroDoc: {tblempleado.numerodocumento}";

            }


        }
        public string Modificar()
        {
            try
            {
                empleado tbEmp = oEFR.empleadoes.FirstOrDefault(s => s.numerodocumento == tblempleado.numerodocumento);
                tbEmp.id_empleado = tblempleado.id_empleado;
                tbEmp.nombre = tblempleado.nombre;
                tbEmp.apellido = tblempleado.apellido;
                tbEmp.id_tipodocumento = tblempleado.id_tipodocumento;
                tbEmp.numerodocumento = tblempleado.numerodocumento; 
                tbEmp.salario = tblempleado.salario;
                tbEmp.fechacontratacion = tblempleado.fechacontratacion;
                tbEmp.fechanacimiento = tblempleado.fechanacimiento;
                tbEmp.registrado_por = tblempleado.registrado_por;
                tbEmp.activo = tblempleado.activo;

                oEFR.SaveChanges();
                return $"Se actualizo el registro de {tbEmp.numerodocumento}";


            }
            catch
            {

                return $"Error, hubo fallo al actualizar registro: {tblempleado.id_empleado}, reintente porfavor";
            }



        }

        public string Eliminar(int codEmp)
        {
            try
            {
                empleado oEmp = oEFR.empleadoes.FirstOrDefault(x => x.id_empleado == codEmp);
                if (oEmp == null)
                {
                    return "Error: No se encontró el registro en la base de datos";
                }
                oEFR.empleadoes.Remove(oEmp);
                oEFR.SaveChanges();
                return "Se elimino el registro del artista de la inscripción";
            }
            catch (Exception ex)
            {

                return "Error: " + ex.Message;
            }
        }


    }
}