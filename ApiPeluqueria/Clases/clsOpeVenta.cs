﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using apiPeluqueria.Models;

namespace apiPeluqueria.Clases
{
    public class clsOpeVenta
    {
        //Atributo
        public readonly bd_tienda_belleza_finalEntities oEFR = new bd_tienda_belleza_finalEntities();

        //Tabla
        public venta tblventa { get; set; }

        public IQueryable consultarVenta(int cod)
        {
          
            return from tM in oEFR.ventas
                   join tS in oEFR.clientes
                        on tM.id_cliente equals tS.id_cliente
                   join tD in oEFR.detalleventas
                        on tM.id_venta equals tD.id_venta
                   join tE in oEFR.empleadoes
                      on tM.id_empleado equals tE.id_empleado
                   join tP in oEFR.formapagoes
                     on tM.id_formapago equals tP.id_formapago
                   where tM.id_venta == cod
                        select new
                        {
                            tM.id_venta,
                            tS.id_tipodocumento,
                            tS.numerodocumento,
                            tS.id_cliente,
                            Socio = tS.nombre + " " + tS.apellido,
                            tM.id_empleado,
                            nombreEmpleado = tE.nombre + " " + tE.apellido,
                            tM.comentarios,
                            tM.total,
                            tM.fechaventa,
                            tM.domicilio,
                            tM.impuestos,
                            tM.descuento,
                            tM.subtotal,
                            tM.id_formapago,
                            tP.descripcion,

                            
                        };

            
        }

        public venta agregarVenta()
        {
            
            int nro = (oEFR.ventas.Any() ? oEFR.ventas.Max(x => x.id_venta) + 1 : 1);
            if (nro > 0)
            {
                tblventa.id_venta = nro;
                oEFR.ventas.Add(tblventa);
                oEFR.SaveChanges();
                return tblventa;
            }
            else
            {
                return tblventa;
            }
        }


        public string Modificar()
        {

            try
            {
                venta tInsc = oEFR.ventas.FirstOrDefault(s => s.id_venta == tblventa.id_venta);
                tInsc.comentarios = tblventa.comentarios;
                tInsc.id_empleado = tblventa.id_empleado;
                tInsc.id_cliente = tblventa.id_cliente;
                tInsc.total = tblventa.total;
                tInsc.id_formapago = tblventa.id_formapago;
                tInsc.fechaventa = tblventa.fechaventa;
                tInsc.descuento = tblventa.descuento;
                tInsc.domicilio = tblventa.domicilio;
                tInsc.impuestos = tblventa.impuestos;
                tInsc.impuestos = tblventa.impuestos;
                oEFR.SaveChanges();
                return "Se actualizo el registro de: " + tInsc.id_venta;
            }
            catch
            {

                return "Error, hubo fallo al actualizar registro: " + tblventa.id_venta + ", reintente por favor";
            }


        }
    }
}