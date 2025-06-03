using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using apiPeluqueria.Models;

namespace apiPeluqueria.Clases
{
    public class clsOpeDetVent
    {
        //Atributo
        public readonly bd_tienda_belleza_finalEntities oEFR = new bd_tienda_belleza_finalEntities();

        //Tabla
        public detalleventa tblDetVent { get; set; }


        public IQueryable llenarTabla(int cod)
        {
            return from tD in oEFR.Set<detalleventa>()
                   join tC in oEFR.Set<producto>()
                    on tD.id_producto equals tC.id_producto
                   join tM in oEFR.Set<empleado>()
                    on tC.id_empleado equals tM.id_empleado
                   join tMa in oEFR.Set<venta>()
                    on tM.id_empleado equals tMa.id_empleado
                   join tS in oEFR.Set<cliente>()
                    on tMa.id_cliente equals tS.id_cliente
                   join tR in oEFR.Set<descuentomayorista>()
                   on tD.id_descuento equals tR.id_descuento
                   join tL in oEFR.Set<formapago>()
                   on tMa.id_formapago equals tL.id_formapago


                   where tMa.id_venta == cod
                   orderby tD.id_detalleventa
                   select new
                   {
                       Quitar = "<a class='btn btn-info btn-sm' href=''><i class='fas fa-trash-alt'></i>Quitar</a>",
                       Codigo = tD.id_detalleventa,
                       TipoDoc = tS.id_tipodocumento,
                       NroDoc = tS.numerodocumento,
                       NombreC = tS.nombre + " " + tS.apellido,
                       Empleado = tM.nombre,
                       FormaPago = tL.descripcion,
                       Fecha = tMa.fechaventa.ToString(),
                       Comentario = tMa.comentarios,
                       Producto = tC.nombre,
                       Cantidad = tD.cantidad,
                       PrecioU = tD.preciounitario,
                       SubTotal = tD.subtotal,
                       Descuento = tMa.descuento,
                       Impuesto = tMa.impuestos,
                       TotalApag = tMa.total,
                       


                   };


        }


        public detalleventa Agregar()
        {
            int cod = oEFR.detalleventas.DefaultIfEmpty().Max(r => r == null ? 1 : r.id_detalleventa + 1);
            if (cod > 0)
            {
                tblDetVent.id_detalleventa = cod;
                oEFR.detalleventas.Add(tblDetVent);
                oEFR.SaveChanges();
                return tblDetVent;

            }
            else
            {
                return tblDetVent;
            }
        }


        public string Eliminar(int codDetVent)
        {
            try
            {
                detalleventa oDI = oEFR.detalleventas.FirstOrDefault(x => x.id_detalleventa == codDetVent);
                if (oDI == null)
                {
                    return "Error: No se encontró el registro en la base de datos";
                }
                oEFR.detalleventas.Remove(oDI);
                oEFR.SaveChanges();
                return "Se elimino el registro del socio de la matricula";
            }
            catch (Exception ex)
            {

                return "Error: " + ex.Message;
            }
        }


    }
}
