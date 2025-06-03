var dir = "http://localhost:52063/api/";
// var oTabla = $("#tablaDatos").DataTable(); // Comentado, ya que no se usa la tabla principal por ahora
var rpta;
var f = new Date();

jQuery(function () {
    // Carga el menú y verificación de sesión
    $("#dvMenu").load("../Paginas/Menu.html", function () {
        const nombreUsuario = sessionStorage.getItem('nombreUsu');
        const codigoUsuario = sessionStorage.getItem('codUsu');

        if (!nombreUsuario || !codigoUsuario) {
            sessionStorage.clear();
            window.location.href = "frmLogin.html";
            return;
        }

        $("#lblNombreEmpleado").text(nombreUsuario);
        $("#lblCodigoEmpleado").text(codigoUsuario);
        $("#lblFechaActual").text(new Date().toLocaleDateString('es-ES', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        }));

        $("#Name").empty().append('<h4>' + nombreUsuario + '</h4>');
        $("#cierreSesion").on("click", function () {
            sessionStorage.clear();
            let rptaConfirm = window.confirm(nombreUsuario + " ¿Estás seguro de cerrar sesión?");
            if (rptaConfirm == true) {
                window.location.href = "frmLogin.html";
            }
        });
    });

    // --- Configuración de Datepickers (Fecha de Venta) ---
    $('#dtmFechaVenta').datetimepicker({
        format: 'DD/MM/YYYY',
        locale: 'es'
    });
    $('#dtmFechaVenta').data("TempusDominusBootstrap4").date(moment());

    // --- Inicialización de Select2 para los combos ---
    $('.select2').select2({
        theme: 'bootstrap4',
        language: {
            noResults: function () { return "No hay resultados"; }
        }
    });

    // --- Búsqueda de Cliente por Número de Documento (mantenida por si la necesitas para testing) ---
    $("#txtNroDoc").on("change", function () {
        let doc = $("#txtNroDoc").val();
        let url = dir + "cliente?nrDoc=" + doc;
        let socio = document.getElementById("txtNombreCliente");

        if (!doc.trim()) {
            mensajeInfo("Ingrese un número de documento para buscar el cliente.");
            $(socio).val("").data("id", "");
            return;
        }

        fetch(url, {
            method: "GET",
            mode: "cors",
            headers: { "content-type": "application/json", }
        })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 404) {
                        mensajeInfo("Cliente no encontrado para el documento proporcionado.");
                        $(socio).val("").data("id", "");
                        return;
                    }
                    throw new Error(`Error HTTP! estado: ${response.status}`);
                }
                return response.json();
            })
            .then(Rpta => {
                if (Rpta && Rpta.length > 0) {
                    socio.dataset.id = Rpta[0].Codigo;
                    socio.value = Rpta[0].Nombre;
                    mensajeOk(`Cliente encontrado: ${Rpta[0].Nombre}`);
                } else {
                    mensajeInfo("Cliente no encontrado para el documento proporcionado.");
                    $(socio).val("").data("id", "");
                }
            })
            .catch(error => {
                console.error("Error al buscar cliente:", error);
                mensajeError("Error al buscar el cliente. Intente nuevamente.");
                $(socio).val("").data("id", "");
            });
    });

    // --- Carga Inicial de Combos ---
    llenarComboTipDoc();
    llenarComboFormaPago();

    // Las siguientes funciones y event handlers han sido comentadas/removidas
    // ya que su propósito va más allá de solo cargar los combos iniciales
    // (Ej. btnAgre, btnModi, btnBusc, btnCanc, btnImpr, lógica de tablaDatos,
    //  lógica de agregar/eliminar productos, etc.)

}); // Fin de jQuery(function() { ... });


// --- FUERA de jQuery(function) ---

// --- Funciones de Mensaje ---

function mensajeError(texto) {
    $("#dvMensaje").removeClass().addClass("alert alert-danger").html(texto);
}
function mensajeInfo(texto) {
    $("#dvMensaje").removeClass().addClass("alert alert-info").html(texto);
}
function mensajeOk(texto) {
    $("#dvMensaje").removeClass().addClass("alert alert-success").html(texto);
}




// Funciones específicas para llenado de combos
async function llenarComboTipDoc(doc) {
    let url = dir + "tipoDoc";
    let rpta = await llenarComboGral(url, "#cboTipoDoc");
    if (doc != undefined && rpta == "Termino");
    $("#cboTipoDoc").val(doc);
}
}

async function llenarComboFormaPago() {
    let url = dir + "fromapago";
    await llenarComboGral(url, "#cboFormaPago");
}

// Las siguientes funciones han sido comentadas/removidas
// ya que no son necesarias para solo cargar los combos
// function Cancelar() { ... }
// function Limpiar() { ... }
// function LimpiarCamposProducto() { ... }
// function validacion(accion) { ... }
// function calcularSubtotalProducto() { ... }
// function calcularTotales() { ... }
// function agregarFilaDetalle(idDetalle, producto, cantidad, precioUnitario, subtotal, idProducto) { ... }
// function editarFila(datosFila) { ... }
// function ConsultarVentaPorId() { ... }
// function cargarDetallesVenta(idVenta) { ... }
// function EliminarVenta(idVenta) { ... }
// function EliminarDetalleVenta(idDetalle) { ... }
// function llenarTabla() { ... }
// function grabarVentaEncabezado() { ... }
// function grabarDetalleVentaExistente() { ... }
// function ModificarVenta() { ... }
// function Imprimir() { ... }