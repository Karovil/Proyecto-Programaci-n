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
        let socio = $("#txtNombreCliente");

        if (!doc.trim()) {
            mensajeInfo("Ingrese un número de documento para buscar el cliente.");
            socio.val("").data("id", "");
            return;
        }

        fetch(url, {
            method: "GET",
            mode: "cors",
            headers: { "content-type": "application/json" }
        })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 404) {
                        mensajeInfo("Cliente no encontrado para el documento proporcionado.");
                        socio.val("").data("id", "");
                        return;
                    }
                    throw new Error(`Error HTTP! estado: ${response.status}`);
                }
                return response.json();
            })
            .then(Rpta => {
                if (Rpta && Rpta.length > 0) {
                    socio.val(Rpta[0].Nombre);
                    socio.data("id", Rpta[0].Codigo);  // 👈 Usa 'Codigo' que devuelve tu API
                    mensajeOk(`Cliente encontrado: ${Rpta[0].Nombre}`);
                } else {
                    mensajeInfo("Cliente no encontrado para el documento proporcionado.");
                    socio.val("").data("id", "");
                }
            })
            .catch(error => {
                console.error("Error al buscar cliente:", error);
                mensajeError("Error al buscar el cliente. Intente nuevamente.");
                socio.val("").data("id", "");
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
        const idProductoSeleccionado = $(this).val(); // Ahora esto contendrá el ID numérico (ej. "1", "2", "3")
        const precioUnitarioInput = itemActual.find(".txtPrecioUnitarioDetalle");

        if (idProductoSeleccionado) {
            // *** CAMBIO CLAVE AQUÍ: Buscar por 'id' y asegurarse de que la comparación sea numérica ***
            const productoSeleccionado = productosCargados.find(prod => prod.id == idProductoSeleccionado);
            // Usamos '==' para comparación flexible (string "1" con number 1)
            // o 'parseInt(idProductoSeleccionado, 10)' si prefieres estricto.
            // Si ya estás seguro de que `$(this).val()` te devuelve un número, puedes usar '==='.

            if (productoSeleccionado) {
                precioUnitarioInput.val(productoSeleccionado.PrecioB.toFixed(2));
            } else {
                precioUnitarioInput.val("0.00");
                mensajeInfo("No se encontró el precio para el producto seleccionado.");
                console.warn(`Error: Producto con ID ${idProductoSeleccionado} no encontrado en 'productosCargados'. Verifique la coherencia de los datos.`);
            }
        } else {
            // Si se selecciona la opción vacía (ej. "Seleccione un producto")
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
        $(comboElement).append('<option value="' + productosCargados[i].id + '">' + productosCargados[i].Nombre + '</option>');
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


function Imprimir(idVenta) {
    // Obtener fecha y hora actual para el nombre del archivo
    const fechaActual = new Date();
    const nomFile = `Venta_${fechaActual.getDate()}_${fechaActual.getMonth() + 1}_${fechaActual.getFullYear()}_${fechaActual.getHours()}_${fechaActual.getMinutes()}.pdf`;

    // === Obtener los valores del formulario de venta ===
    ;
    const fechaVenta = $("#dtmFechaVenta").find("input").val();
    const tipoDoc = $("#cboTipoDoc").find('option:selected').text();
    const nroDoc = $("#txtNroDoc").val();
    const nombreCliente = $("#txtNombreCliente").val();
    const formaPago = $("#cboFormaPago").find('option:selected').text();
    const subtotal = $("#lblSubtotalGeneral").text();
    const descuento = $("#lblDescuentoGeneral").text();
    const impuestos = $("#lblImpuestosMonto").text();
    const total = $("#lblTotalPagar").text();
    const domicilio = $("#chkDomicilio").is(":checked") ? "Sí" : "No";
    const comentarios = $("#txtComentarios").val();

    // Obtener información del empleado
    const empleado = $("#lblNombreEmpleado").text();
    const codigoEmpleado = $("#lblCodigoEmpleado").text();

    // Obtener detalles de productos
    const productos = [];
    $(".producto-item:not(#productoTemplate)").each(function () {
        const producto = $(this).find(".cboProductoDetalle").find('option:selected').text();
        const cantidad = $(this).find(".txtCantidad").val();
        const precio = $(this).find(".txtPrecioUnitarioDetalle").val();
        const descuento = $(this).find(".txtPorcentajeDescuento").val();
        const subtotal = $(this).find(".txtSubtotalFila").val();

        productos.push({
            producto,
            cantidad,
            precio,
            descuento,
            subtotal
        });
    });

    // === Crear un nuevo documento PDF ===
    var doc = new jsPDF('p', 'mm', 'letter');
    var ancho = doc.internal.pageSize.width;
    var alto = doc.internal.pageSize.height;

    // === Estilos del documento ===
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(33, 37, 41); // Color oscuro

    // === Encabezado del recibo ===
    doc.setFontSize(18);
    const tituloPrincipal = "RECIBO DE VENTA";
    const anchoTituloPrincipal = doc.getTextWidth(tituloPrincipal);
    doc.text(tituloPrincipal, (ancho - anchoTituloPrincipal) / 2, 20);

    // Logo o información de la empresa
    doc.setFontSize(12);
    doc.text("Sistema de Ventas", 20, 30);
    doc.text("Teléfono: (123) 456-7890", 20, 36);
    doc.text("Email: ventas@empresa.com", 20, 42);

    // Línea divisoria
    doc.setLineWidth(0.5);
    doc.setDrawColor(122, 109, 93);
    doc.line(20, 48, ancho - 20, 48);

    // === Información de la venta ===
    let y = 60;
    doc.setFontSize(12);

    // Función para agregar campos con formato
    const addField = (label, value, x = 20) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, x, y);
        doc.setFont('helvetica', 'normal');
        doc.text(value, x + 40, y);
        y += 7;
    };

    addField("N° Venta:", idVenta.toString());
    addField("Fecha:", fechaVenta);
    addField("Empleado:", `${empleado} (${codigoEmpleado})`);
    y += 5; // Espacio adicional

    // Información del cliente
    doc.setFont('helvetica', 'bold');
    doc.text("DATOS DEL CLIENTE", 20, y);
    y += 7;

    addField("Tipo Doc:", tipoDoc);
    addField("N° Documento:", nroDoc);
    addField("Nombre:", nombreCliente);
    y += 5; // Espacio adicional

    // Detalles de pago
    doc.setFont('helvetica', 'bold');
    doc.text("DETALLES DE PAGO", 20, y);
    y += 7;

    addField("Forma de Pago:", formaPago);
    addField("Servicio a domicilio:", domicilio);
    y += 10; // Espacio antes de la tabla

    // === Tabla de productos ===
    doc.setFont('helvetica', 'bold');
    doc.text("DETALLE DE PRODUCTOS", 20, y);
    y += 10;

    // Encabezados de la tabla
    const encabezados = ["Producto", "Cant.", "P. Unit.", "Desc.", "Subtotal"];
    const anchosColumnas = [80, 20, 30, 20, 30];
    let x = 20;

    // Dibujar encabezados
    encabezados.forEach((texto, i) => {
        doc.text(texto, x, y);
        x += anchosColumnas[i];
    });
    y += 5;

    // Línea bajo encabezados
    doc.setLineWidth(0.2);
    doc.line(20, y, ancho - 20, y);
    y += 5;

    // Contenido de la tabla
    doc.setFont('helvetica', 'normal');
    productos.forEach(prod => {
        x = 20;
        doc.text(prod.producto.substring(0, 30), x, y); // Limitar longitud del nombre
        x += anchosColumnas[0];
        doc.text(prod.cantidad, x, y);
        x += anchosColumnas[1];
        doc.text("$" + prod.precio, x, y);
        x += anchosColumnas[2];
        doc.text(prod.descuento + "%", x, y);
        x += anchosColumnas[3];
        doc.text("$" + prod.subtotal, x, y);
        y += 7;

        // Si nos acercamos al final de la página, agregar nueva página
        if (y > alto - 50) {
            doc.addPage();
            y = 20;
        }
    });

    // Línea bajo la tabla
    doc.setLineWidth(0.5);
    doc.line(20, y, ancho - 20, y);
    y += 10;

    // === Totales ===
    doc.setFont('helvetica', 'bold');
    addField("Subtotal:", subtotal, ancho - 100);
    addField("Descuento:", descuento, ancho - 100);
    addField("Impuestos:", impuestos, ancho - 100);

    doc.setFontSize(14);
    doc.setTextColor(40, 167, 69); // Verde para el total
    addField("TOTAL:", total, ancho - 100);
    y += 10;

    // Comentarios si existen
    if (comentarios) {
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Comentarios:", 20, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.text(comentarios, 20, y, { maxWidth: ancho - 40 });
        y += 15;
    }

    // === Pie de página ===
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text("Documento generado automáticamente", 20, alto - 20);
    doc.text(`Fecha: ${fechaActual.toLocaleDateString()} Hora: ${fechaActual.toLocaleTimeString()}`, ancho - 70, alto - 20, { align: "right" });

    // === Guardar el archivo PDF ===
    doc.save(nomFile);
    alert("Recibo generado: " + nomFile);
}

// Asignar la función al botón de imprimir
$("#btnImprimir").click(Imprimir);

$("#btnGuardar").on("click", function () {
    grabarEncabezadoVenta();
});

$("#btnModificar").on("click", function () {
    alert("Modificar Venta");
    if (validacionVenta("PUT")) {
        if (rpta == true) {
            ModificarVenta();
        } else {
            mensajeInfo("Acción de modificar cancelada.");
        }
    }
});

$("#btnBuscar").on("click", function () {
    alert("Buscar Venta");
    ConsultarVenta();
});



async function grabarEncabezadoVenta() {
    
    let fechaVenta = $("#dtmFechaVenta").find("input").val();
    let idEmpleado = sessionStorage.getItem('codUsu');
    let idCliente = $("#txtNombreCliente").data("id");
    let idFormaPago = $("#cboFormaPago").val();
    let comentarios = $("#txtComentarios").val();
    let domicilio = $("#chkDomicilio").is(":checked") ? 1 : 0;

    let subtotal = parseFloat($("#lblSubtotalGeneral").text().replace('$', '')) || 0;
    let descuento = parseFloat($("#lblDescuentoGeneral").text().replace('$', '')) || 0;
    let impuestos = parseFloat($("#lblImpuestosMonto").text().replace('$', '')) || 0;
    let total = parseFloat($("#lblTotalPagar").text().replace('$', '')) || 0;
    console.log("ID del cliente recuperado:", idCliente);

    // Validaciones
    if (!idCliente) {
        mensajeError("Debe seleccionar un cliente válido antes de guardar la venta.");
        return;
    }
    if (!idFormaPago) {
        mensajeError("Debe seleccionar una forma de pago.");
        return;
    }

    let datosVenta = {
        id_venta: 0,
        id_cliente: parseInt(idCliente),
        id_empleado: parseInt(idEmpleado),
        id_formapago: parseInt(idFormaPago),
        fechaventa: moment(fechaVenta, 'DD/MM/YYYY').format('YYYY-MM-DD'),
        subtotal: subtotal,
        descuento: descuento,
        impuestos: impuestos,
        total: total,
        comentarios: comentarios,
        domicilio: domicilio,
        id_detalleventa: 0
    };

    try {
        let url = dir + "venta?cmdo=1";
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datosVenta)
        });
        const rpta = await response.json();
        if (response.ok) {
            $("#txtIdVenta").val(rpta.id_venta);
            grabarDetalleVenta(rpta.id_venta);
        } else {
            mensajeError("Error al grabar la venta: " + rpta);
        }
    } catch (error) {
        mensajeError("Error al grabar la venta: " + error);
    }
}


async function grabarDetalleVenta(idVenta) {
    let filas = $(".producto-item:visible");
    if (filas.length === 0) {
        mensajeInfo("No hay detalles para guardar.");
        return;
    }

    let errores = 0;
    for (const fila of filas) {
        let idProducto = $(fila).find(".cboProductoDetalle").val();
        let cantidad = parseInt($(fila).find(".txtCantidad").val()) || 0;
        let precioUnitario = parseFloat($(fila).find(".txtPrecioUnitarioDetalle").val()) || 0;
        let descuentoUnitario = parseFloat($(fila).find(".txtPorcentajeDescuento").val()) || 0;
        let subtotalFila = parseFloat($(fila).find(".txtSubtotalFila").val()) || 0;

        let datosDetalle = {
            id_detalleventa: 0,
            id_venta: parseInt(idVenta),
            id_producto: parseInt(idProducto),
            cantidad: cantidad,
            preciounitario: precioUnitario,
            descuentounitario: descuentoUnitario,
            subtotal: subtotalFila,
            id_descuento: null
        };

        try {
            let url = dir + "detVent";
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datosDetalle)
            });
            const rpta = await response.json();
            if (!response.ok) {
                errores++;
                mensajeError("Error al grabar el detalle: " + rpta);
            }
        } catch (error) {
            errores++;
            mensajeError("Error al grabar el detalle: " + error);
        }
    }

    if (errores === 0) {
        mensajeOk("Venta y detalles grabados correctamente.");
        Imprimir(idVenta);  // 👈 Aquí llamas a la impresión con el ID real de la base de datos.
        LimpiarVenta();
        LimpiarVenta();
    } else {
        mensajeInfo("Algunos detalles no se grabaron. Verifique la consola.");
    }
}

function LimpiarVenta() {
    $("#txtIdVenta").prop('disabled', false);

    $("#txtNombreCliente").val("").data("id", "");
    $("#txtNroDoc").val("");
    $("#cboFormaPago").val("");
    $("#txtComentarios").val("");
    $("#chkDomicilio").prop("checked", false);
    $("#productosContainer").empty();
    agregarNuevaFilaProducto();
    actualizarTotalesGenerales();
}
function validacionVenta(accion) {
    let nroDoc = $("#txtNroDoc").val();
    let nombreCliente = $("#txtNombreCliente").val();

    if (!nombreCliente || nombreCliente.trim().length < 3) {
        mensajeError("Nombre de cliente inválido o vacío.");
        $("#txtNombreCliente").focus();
        return false;
    }
    if (!nroDoc || nroDoc.trim().length < 4) {
        mensajeError("Número de documento inválido.");
        $("#txtNroDoc").focus();
        return false;
    }

    rpta = window.confirm("¿Está seguro de " + (accion === "PUT" ? "modificar" : "procesar") + " la venta?");
    return true;
}

async function ModificarVenta() {
    let idVenta = $("#txtIdVenta").val();
    let comentarios = $("#txtComentarios").val();
    let idEmpleado = sessionStorage.getItem('codUsu');
    let idCliente = $("#txtNombreCliente").data("id");
    let total = parseFloat($("#lblTotalPagar").text().replace('$', '')) || 0;

    if (idVenta == undefined || idVenta.trim() === "" || parseInt(idVenta, 10) <= 0) {
        mensajeError("No ha definido la acción de modificar. Cancele o limpie antes.");
        $("#txtIdVenta").focus();
        return;
    }
    if (!idCliente || idCliente <= 0) {
        mensajeError("Debe seleccionar un cliente válido.");
        $("#txtNombreCliente").focus();
        return;
    }

    let datosOut = {
        id_venta: idVenta,
        comentarios: comentarios,
        id_empleado: idEmpleado,
        id_cliente: idCliente,
        total: total
    };

    try {
        let url = dir + "venta";
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datosOut)
        });

        const rpta = await response.json();
        mensajeOk(rpta);
    } catch (error) {
        mensajeError("Error: " + error);
    }
}

async function ConsultarVenta() {
    try {
        LimpiarVenta(); // (Ojo: si tienes una función LimpiarVenta() para limpiar campos)
        mensajeInfo("");

        let cod = $("#txtIdVenta").val();
        if (!cod || cod.trim() === "") {
            mensajeInfo("Ingrese el ID de la venta.");
            $("#txtIdVenta").focus();
            return;
        }

        if (isNaN(cod) || parseInt(cod, 10) <= 0) {
            mensajeError("ID de venta inválido. Debe ser un número mayor a cero.");
            $("#txtIdVenta").focus();
            return;
        }

        let url = dir + "venta?codVent=" + cod;
        const response = await fetch(url, {
            method: "GET",
            mode: "cors",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const rpta = await response.json();
        if (!rpta || rpta.length === 0) {
            mensajeInfo("No se encontró ninguna venta con ese ID.");
            $("#txtIdVenta").prop('disabled', false);
            return;
        }

        // Llenar los campos de la venta
        $("#txtIdVenta").val(rpta[0].id_venta);
        $("#cboTipoDoc").val(rpta[0].id_tipodocumento);
        $("#txtNroDoc").val(rpta[0].numerodocumento);
        $("#txtNombreCliente").val(rpta[0].Socio);
        $("#txtNombreCliente").data("id", rpta[0].id_cliente);
        $("#txtComentarios").val(rpta[0].comentarios);
        $("#lblTotalPagar").text("$" + parseFloat(rpta[0].total).toFixed(2));

        // Aquí podrías cargar el detalle de venta (si tienes)
        // Por ejemplo: cargarDetalleVenta(rpta[0].id_venta);

        mensajeOk("Datos de la venta cargados correctamente.");
    } catch (error) {
        mensajeError("Error al consultar la venta: " + error);
    }
}




