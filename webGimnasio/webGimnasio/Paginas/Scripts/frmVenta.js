var dir = "http://localhost:52063/api/";

// oTabla is not used in this specific scenario, so it can be removed or kept if needed elsewhere
// var oTabla = $("#tablaDatos").DataTable();

// rpta and f are not used globally in the provided snippet
// var rpta;
// var f = new Date();
var productosCargados = []; 
var productoIdCounter = 0;


function generarIdVentaSimple() {
    // Esto es solo para demostración - en producción deberías obtener este valor de tu base de datos
    const ultimoId = 5; // Reemplaza esto con una consulta a tu BD
    return ultimoId + 1;
}

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

    const nuevoId = generarIdVentaSimple;
    $("#txtIdVenta").val(nuevoId);

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


function Imprimir() {
    // Obtener fecha y hora actual para el nombre del archivo
    const fechaActual = new Date();
    const nomFile = `Venta_${fechaActual.getDate()}_${fechaActual.getMonth() + 1}_${fechaActual.getFullYear()}_${fechaActual.getHours()}_${fechaActual.getMinutes()}.pdf`;

    // === Obtener los valores del formulario de venta ===
    const idVenta = $("#txtIdVenta").val();
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

    addField("N° Venta:", idVenta);
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
    
        agregarVentaCompleta();
    
});

    // ... function validarFormularioVenta() {
    // ... (otras validaciones)

        // ... et productosValidos = true;
      // ...   const productosEnPantalla = $("#productosContainer .producto-item:not(.d-none)");
    // ...     productosEnPantalla.each(function () {
    // ...         const idProductoStr = $(this).find(".cboProductoDetalle").val();
       // ...      const idProducto = parseInt(idProductoStr, 10);
        // ... (otras variables de cantidad, precio)

        // **AQUÍ VA EL LOG PARA VALIDACIÓN**
        // ...     console.log("Validando producto:", {
       // ...          id_producto_del_combo_string: idProductoStr,
    // ... id_producto_parseado_a_int: idProducto
       // ...      });
// ...
       // ...      if (isNaN(idProducto) || idProducto <= 0) {
        // ...         mensajeInfo("Hay un producto sin seleccionar o con un ID inválido en el detalle.");
        // ...         productosValidos = false;
          // ...       return false;
       // ...      }
        // ... (resto de validaciones)
     // ...    });

    // ... (retorno)
// ... 
async function agregarVentaCompleta() {
    try {
        // Primero grabamos el encabezado de la venta
        const idVentaGenerado = await grabarEncabezadoVenta();

        if (idVentaGenerado && idVentaGenerado > 0) {
            // 3. Grabar los detalles usando este ID
            await grabarDetallesVenta(idVentaGenerado);

            // Mostrar mensaje de éxito
            mensajeOk(`Venta registrada correctamente con ID: ${idVentaGenerado}`);

            // 5. Opcional: Actualizar interfaz o realizar otras acciones
            console.log("ID de venta generado:", idVentaGenerado);

            // Puedes usar este ID para:
            // - Mostrar un comprobante
            // - Redirigir a una página de detalles
            // - Actualizar listados
        } else {
            throw new Error("No se recibió un ID de venta válido");
        }
    } catch (error) {
        console.error("Error en el proceso completo:", error);
        mensajeError("No se pudo completar el registro de la venta");
    }
}

async function grabarEncabezadoVenta() {
    const idCliente = $("#txtNombreCliente").data("id");
    const idEmpleado = sessionStorage.getItem('codUsu');
    const idFormaPago = $("#cboFormaPago").val();
    const fechaVenta = $("#dtmFechaVenta").find("input").val(); // Asegura el formato de fecha (YYYY-MM-DD)
    const subtotal = parseFloat($("#lblSubtotalGeneral").text().replace('$', '')) || 0;
    const descuento = parseFloat($("#lblDescuentoGeneral").text().replace('$', '')) || 0;
    const impuestos = parseFloat($("#lblImpuestosMonto").text().replace('$', '')) || 0;
    const total = parseFloat($("#lblTotalPagar").text().replace('$', '')) || 0;
    const domicilio = $("#chkDomicilio").is(":checked") ? true : false; // Cambiado a booleano, si tu DB lo acepta como bit/bool. Si es int, 1:0.
    const comentarios = $("#txtComentarios").val().trim();

    // Objeto de datos que COINCIDE exactamente con tu modelo 'venta' en C#
    const datosVenta = {
        id_venta: 0, // Se generará automáticamente en el servidor
        id_cliente: idCliente,
        id_empleado: idEmpleado,
        id_formapago: idFormaPago,
        // *** IMPORTANTE: id_detalleventa. Tu modelo 'venta' lo tiene.
        // Si siempre esperas un detalle, este valor de 0 es un marcador de posición.
        // Se actualizará después con el ID del primer detalle.
        id_detalleventa: 0, // Según tu modelo C#, esta propiedad existe en 'venta'
        fechaventa: fechaVenta, // Coincide con 'fechaventa'
        subtotal: subtotal,
        descuento: descuento, // Coincide con 'descuento' (nullable)
        impuestos: impuestos, // Coincide con 'impuestos' (nullable)
        total: total,       // Coincide con 'total'
        comentarios: comentarios,
        domicilio: domicilio // Coincide con 'domicilio' (nullable)
    };

    const url = dir + "venta?cmdo=1"; // cmdo=1 para agregar venta principal

    try {
        const response = await fetch(url, {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datosVenta)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Error HTTP ${response.status} al grabar encabezado de venta: ${errorBody}`);
        }

        const ventaGuardada = await response.json();
        const idVentaGenerado = ventaGuardada.id_venta;

        $("#txtIdVenta").val(idVentaGenerado);

        return idVentaGenerado;

    } catch (error) {
        console.error("Error al grabar el encabezado de la venta:", error);
        mensajeError(`No se pudo registrar el encabezado de la venta. Detalles: ${error.message}`);
        throw error;
    }
}

async function grabarDetallesVenta(idVenta) {
    const productosEnPantalla = $("#productosContainer .producto-item:not(.d-none)");
    if (productosEnPantalla.length === 0) {
        console.warn("No hay productos visibles para grabar en el detalle de venta.");
        return;
    }

    const promises = [];

    for (const productoItem of productosEnPantalla) {
        const $item = $(productoItem);
        const idProducto = parseInt($item.find(".cboProductoDetalle").val(), 10); 
        const cantidad = parseInt($item.find(".txtCantidad").val()) || 0; // 'cantidad' es int en C#
        const preciounitario = parseFloat($item.find(".txtPrecioUnitarioDetalle").val()) || 0; // Coincide con 'preciounitario'
        const descuentounitario = parseFloat($item.find(".txtPorcentajeDescuento").val()) || null; // Coincide con 'descuentounitario' (nullable), usa null si no hay descuento
        const subtotal = parseFloat($item.find(".txtSubtotalFila").val()) || 0; // Coincide con 'subtotal'


        // **AQUÍ VA EL LOG CLAVE**
        console.log("Preparando detalle para el producto:", {
            id_venta: idVenta,
            id_producto_del_combo_string: idProductoStr, // El valor TAL CUAL del combo (string)
            id_producto_parseado_a_int: idProducto,     // El valor después de parseInt (número)
            cantidad: cantidad,
            preciounitario: preciounitario,
            descuentounitario: descuentounitario,
            subtotal: subtotal
        });
        // Objeto de datos que COINCIDE exactamente con tu modelo 'detalleventa' en C#
        const detalleVenta = {
            id_detalleventa: 0, // Se generará automáticamente en el servidor
            id_venta: idVenta,
            id_producto: idProducto,
            cantidad: cantidad,
            preciounitario: preciounitario,
            descuentounitario: descuentounitario, // Coincide con 'descuentounitario'
            subtotal: subtotal
            // id_descuento: null // No estás recopilando esto en el frontend, así que se omite o se envía null
        };

        const url = dir + "detVent"; // Endpoint para el detalle de venta

        promises.push(
            fetch(url, {
                method: "POST",
                mode: "cors",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(detalleVenta)
            }).then(response => {
                if (!response.ok) {
                    return response.text().then(errorText => {
                        throw new Error(`Error HTTP ${response.status} al guardar detalle de producto ${idProducto}: ${errorText}`);
                    });
                }
                return response.json();
            })
        );
    }

    try {
        const resultadosDetalles = await Promise.all(promises);
        console.log("Todos los detalles de venta guardados:", resultadosDetalles);

        // Si tu tabla 'venta' aún tiene id_detalleventa y quieres actualizarlo con el primer detalle:
        if (resultadosDetalles.length > 0) {
            const primerDetalleId = resultadosDetalles[0].id_detalleventa;
            await actualizarIdDetalleEnVenta(idVenta, primerDetalleId);
        }

    } catch (error) {
        console.error("Error al grabar uno o más detalles de venta:", error);
        mensajeError(`No se pudieron registrar todos los detalles de la venta. Detalles: ${error.message}`);
        throw error;
    }
}

async function actualizarIdDetalleEnVenta(idVenta, idDetalle) {
    const url = dir + `venta/${idVenta}`;

    // Solo actualizamos el campo id_detalleventa
    const datosActualizacion = {
        id_detalleventa: idDetalle
    };

    const response = await fetch(url, {
        method: "PUT",
        mode: "cors",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(datosActualizacion)
    });

    if (!response.ok) {
        console.warn("No se pudo actualizar el id_detalleventa en el encabezado");
    }
}

function limpiarFormularioVenta() {
    // Limpiar campos de cliente
    $("#txtNroDoc").val("");
    $("#txtNombreCliente").val("").data("id", "");

    // Limpiar productos
    $("#productosContainer").empty();
    agregarNuevaFilaProducto(); // Agregar una fila vacía

    // Resetear totales
    $("#lblSubtotalGeneral").text("$0.00");
    $("#lblDescuentoGeneral").text("$0.00");
    $("#lblImpuestosMonto").text("$0.00");
    $("#lblTotalPagar").text("$0.00");

    // Generar nuevo ID de venta
    const nuevoId = generarIdVentaNumerico();
    $("#txtIdVenta").val(nuevoId);

    // Resetear otros campos
    $("#chkDomicilio").prop("checked", false);
    $("#txtComentarios").val("");
}