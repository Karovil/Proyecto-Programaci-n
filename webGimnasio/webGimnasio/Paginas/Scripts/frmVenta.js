var dir = "http://localhost:52063/api/";

// oTabla is not used in this specific scenario, so it can be removed or kept if needed elsewhere
// var oTabla = $("#tablaDatos").DataTable();

// rpta and f are not used globally in the provided snippet
// var rpta;
// var f = new Date();
var productosCargados = []; 
var productoIdCounter = 0;


jQuery(function () {
    // ===== [1. VERIFICACIÓN DE SESIÓN Y CARGA DE DATOS DEL EMPLEADO] =====
    const codigoUsuario = sessionStorage.getItem('codUsu');
    const nombreUsuario = sessionStorage.getItem('nombreUsu');

    // Redirigir si no hay sesión
    if (!codigoUsuario || !nombreUsuario) {
        sessionStorage.clear();
        window.location.href = "frmLogin.html";
        return;
    }

    // Mostrar datos en el formulario
    $("#lblNombreEmpleado").text(nombreUsuario);
    $("#lblCodigoEmpleado").text(codigoUsuario);
    $("#lblFechaActual").text(new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }));

    // Carga el menú
    $("#dvMenu").load("../Paginas/Menu.html", function () {
        if (nombreUsuario == null) {
            sessionStorage.clear();
            window.location.href = "frmSplash.html";
            return;
        }
        // Selecciona el div
        $("#Name").empty().append('<h4>' + nombreUsuario + '</h4>');

        $("#cierreSesion").on("click", function () {
            // Limpia el sessionStorage
            sessionStorage.clear();
            let rpta = window.confirm(nombreUsuario + " ¿Estás seguro de cerrar sesión?");
            if (rpta == true) {
                // Redirige a la página anterior y reemplaza la actual en el historial
                window.location.href = "frmLogin.html";
            }
        });
    });


    // Paso 1: Inicializar el datepicker en el contenedor DIV
    $('#dtmFechaVenta').datetimepicker({
        format: 'DD/MM/YYYY HH:mm', // Es buena práctica incluir HH:mm si la hora puede ser relevante, aunque solo muestres DD/MM/YYYY
        locale: 'es',
        // Aquí puedes añadir los iconos si los necesitas para que se muestren correctamente
        icons: {
            time: 'far fa-clock',
            date: 'far fa-calendar',
            up: 'fas fa-arrow-up',
            down: 'fas fa-arrow-down',
            previous: 'fas fa-chevron-left',
            next: 'fas fa-chevron-right',
            today: 'fas fa-calendar-check',
            clear: 'fas fa-trash',
            close: 'fas fa-times'
        }
    });

    // Paso 2: Obtener la instancia del datepicker y establecer la fecha.
    // La clave correcta para .data() para Tempus Dominus es 'datetimepicker'
    const datepickerInstance = $('#dtmFechaVenta').data('datetimepicker');

    // Verifica que la instancia exista antes de intentar usarla
    if (datepickerInstance) {
        datepickerInstance.date(moment()); // Establece la fecha y hora actual
        console.log("Fecha de venta establecida a:", moment().format('DD/MM/YYYY HH:mm')); // Para depuración
    } else {
        console.error("ERROR: No se pudo obtener la instancia de Tempus Dominus para #dtmFechaVenta. ¿Están todos los scripts cargados correctamente?");
    }
    // --- Inicialización de Select2 para los combos ---
    $('.select2').select2({
        theme: 'bootstrap4',
        language: {
            noResults: function () { return "No hay resultados"; }
        }
    });

    // --- Búsqueda de Cliente por Número de Documento ---
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
    // --- Cargar productos y agregar la primera fila ---
    cargarProductosYLlenarCombo(function () {
        agregarNuevaFilaProducto(); // Agrega la primera fila de producto real al cargar la página
        actualizarTotalesGenerales(); // Calcular los totales al inicio
    });

    // --- Eventos de cambio para .cboProductoDetalle, .txtCantidad, etc. (Delegación) ---
    // Estos eventos ya estaban bien y deben seguir así
    $("#productosContainer").on("change", ".cboProductoDetalle", function () {
        const itemActual = $(this).closest('.producto-item');
        const codigoProductoSeleccionado = $(this).val();
        const precioUnitarioInput = itemActual.find(".txtPrecioUnitarioDetalle");

        if (codigoProductoSeleccionado) {
            const productoSeleccionado = productosCargados.find(prod => prod.Codigo === codigoProductoSeleccionado);
            if (productoSeleccionado) {
                precioUnitarioInput.val(productoSeleccionado.PrecioB.toFixed(2));
            } else {
                precioUnitarioInput.val("0.00");
                mensajeInfo("No se encontró el precio para el producto seleccionado.");
            }
        } else {
            precioUnitarioInput.val("0.00");
        }
        calcularSubtotalItem(itemActual);
        actualizarTotalesGenerales();
    });

    $("#productosContainer").on("input", ".txtCantidad, .txtPrecioUnitarioDetalle, .txtPorcentajeDescuento", function () {
        const itemActual = $(this).closest('.producto-item');
        calcularSubtotalItem(itemActual);
        actualizarTotalesGenerales();
    });

    // --- Evento para el porcentaje de impuestos global ---
    $("#txtPorcentajeImpuestos").on("input", function () {
        actualizarTotalesGenerales();
    });

    // --- Evento para el botón "Agregar otro producto" ---
    $("#btnAgregarProducto").on("click", function () {
        agregarNuevaFilaProducto();
    });

    // --- Evento para eliminar fila de producto ---
    $("#productosContainer").on("click", ".btn-eliminar-producto", function () {
        const itemAEliminar = $(this).closest('.producto-item');
        itemAEliminar.remove();
        actualizarTotalesGenerales();

        if ($("#productosContainer .producto-item").length === 0) {
            agregarNuevaFilaProducto(); // Asegura que siempre haya al menos una fila
            actualizarTotalesGenerales();
        }
    });

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
// En frmVenta.js

// Funciones específicas para llenado de combos
async function llenarComboTipDoc(doc) {
    let url = dir + "tipoDoc";
    // Para tipoDoc, el campo es "Nombre". Podemos dejarlo por defecto o pasarlo explícitamente.
    let rpta = await llenarComboGral(url, "#cboTipoDoc", "Nombre");
    if (doc !== undefined && rpta === "Termino") {
        $("#cboTipoDoc").val(doc);
    }
}

async function llenarComboFormaPago() {
    let url = dir + "fromapago";
    // Para fromapago, el campo es "Descripcion". ¡Aquí está la clave!
    await llenarComboGral(url, "#cboFormaPago", "Descripcion");
}


// --- Función para cargar productos y llenar los combos (SIN CAMBIOS GRANDES) ---
async function cargarProductosYLlenarCombo(callback) {
    let url = dir + "Productos"; 
    
    try {
        const Respuesta = await fetch(url, {
            method: "GET",
            mode: "cors",
            headers: { "content-type": "application/json" }
        });

        if (!Respuesta.ok) {
            throw new Error(`Error HTTP! estado: ${Respuesta.status}`);
        }

        const Rpta = await Respuesta.json();
        
        productosCargados = Rpta; 
        console.log("Productos cargados:", productosCargados);

        if (typeof callback === 'function') {
            callback(); 
        }
        
    } catch (error) {
        console.error("Error al cargar y llenar el combo de productos:", error);
        mensajeError("Error al cargar los productos. Intente de nuevo.");
    }
}

// --- Función auxiliar para llenar un combo específico en un item de producto (SIN CAMBIOS) ---
function llenarComboEnItem(comboElement) {
    $(comboElement).empty().append('<option value="">Seleccione un producto</option>');
    for (let i = 0; i < productosCargados.length; i++) {
        $(comboElement).append('<option value="' + productosCargados[i].Codigo + '">' + productosCargados[i].Nombre + '</option>');
    }
}


// --- NUEVA FUNCIÓN para agregar una nueva fila de producto al detalle (REVISADA) ---
function agregarNuevaFilaProducto() {
    productoIdCounter++; 
    const nuevaFilaProducto = $("#productoTemplate").clone(); 
    
    nuevaFilaProducto.attr("id", "producto_item_" + productoIdCounter); 
    nuevaFilaProducto.removeClass("d-none"); // Quitar la clase d-none para hacerla visible
    nuevaFilaProducto.show(); // Asegurarse de que sea visible si la plantilla estaba oculta por style="display:none;"

    // Limpiar valores por defecto
    nuevaFilaProducto.find(".cboProductoDetalle").val(""); 
    nuevaFilaProducto.find(".txtCantidad").val("1"); 
    nuevaFilaProducto.find(".txtPrecioUnitarioDetalle").val("0.00"); 
    nuevaFilaProducto.find(".txtPorcentajeDescuento").val("0"); 
    nuevaFilaProducto.find(".txtSubtotalFila").val("0.00"); 

    // Asegurarse de que el botón de eliminar esté visible
    // Si solo quieres que el botón de eliminar aparezca a partir de la segunda fila:
    // if (productoIdCounter === 1) {
    //     nuevaFilaProducto.find(".btn-eliminar-producto").hide();
    // } else {
    //     nuevaFilaProducto.find(".btn-eliminar-producto").show();
    // }
    nuevaFilaProducto.find(".btn-eliminar-producto").show(); // Siempre visible para todas las filas

    // *** PASO CRÍTICO: AÑADIR AL DOM PRIMERO ***
    $("#productosContainer").append(nuevaFilaProducto); 

    // Destruir y luego reinicializar Select2 en el elemento recién añadido
    // Esto es CRUCIAL para evitar errores de duplicidad o de elementos no encontrados
    const selectElement = nuevaFilaProducto.find(".cboProductoDetalle");
    if (selectElement.data('select2')) { // Comprobar si ya es una instancia de select2
        selectElement.select2('destroy');
    }
    selectElement.select2({
        theme: 'bootstrap4',
        language: {
            noResults: function () { return "No hay resultados"; }
        }
    });

    // *** LLENAR EL COMBO DESPUÉS DE INICIALIZAR SELECT2 Y AÑADIR AL DOM ***
    llenarComboEnItem(selectElement);

    // Recalcular totales
    actualizarTotalesGenerales();
}


// --- Funciones de Cálculo (Correctas, sin cambios) ---
function calcularSubtotalItem(item) {
    const cantidad = parseFloat(item.find(".txtCantidad").val()) || 0;
    const precioUnitario = parseFloat(item.find(".txtPrecioUnitarioDetalle").val()) || 0;
    const porcentajeDescuento = parseFloat(item.find(".txtPorcentajeDescuento").val()) || 0;

    let subtotalSinDescuento = cantidad * precioUnitario;
    let descuentoMontoFila = subtotalSinDescuento * (porcentajeDescuento / 100);
    let subtotalFila = subtotalSinDescuento - descuentoMontoFila;

    item.find(".txtSubtotalFila").val(subtotalFila.toFixed(2));
}

function actualizarTotalesGenerales() {
    let subtotalGeneral = 0;
    let descuentoTotalCalculado = 0;

    $(".producto-item:visible").each(function () {
        const cantidad = parseFloat($(this).find(".txtCantidad").val()) || 0;
        const precioUnitario = parseFloat($(this).find(".txtPrecioUnitarioDetalle").val()) || 0;
        const porcentajeDescuento = parseFloat($(this).find(".txtPorcentajeDescuento").val()) || 0;

        let subtotalSinDescuentoFila = cantidad * precioUnitario;
        descuentoTotalCalculado += subtotalSinDescuentoFila * (porcentajeDescuento / 100);
        let subtotalConDescuentoFila = subtotalSinDescuentoFila - (subtotalSinDescuentoFila * (porcentajeDescuento / 100));
        
        subtotalGeneral += subtotalConDescuentoFila;
    });

    const porcentajeImpuestos = parseFloat($("#txtPorcentajeImpuestos").val()) || 0;
    let impuestosMonto = subtotalGeneral * (porcentajeImpuestos / 100);
    let totalPagar = subtotalGeneral + impuestosMonto;

    $("#lblSubtotalGeneral").text("$" + subtotalGeneral.toFixed(2));
    $("#lblDescuentoGeneral").text("$" + descuentoTotalCalculado.toFixed(2));
    $("#lblImpuestosMonto").text("$" + impuestosMonto.toFixed(2));
    $("#lblTotalPagar").text("$" + totalPagar.toFixed(2));
}
