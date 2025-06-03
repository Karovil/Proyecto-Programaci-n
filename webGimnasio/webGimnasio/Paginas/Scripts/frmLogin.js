var dir = "http://localhost:52063/api/";
jQuery(function () {

    $("#btnIngresar").on("click", function () {
        alert("logearse");
        let user = $("#user_clave").val();
        let contra = $("#user_password").val();

        if (user.trim() == "" || parseInt(user) <= 0) {
            mensajeError("Clave o Contraseña erroneos");
            $("#user_clave").Focus();
            return;
        }
        if (contra == undefined || contra.trim() == "") {
            mensajeError("Clave o Contraseña erroneos");
            $("#user_password").Focus();
            return;
        }
        logearse(user, contra);

    });

});

function mensajeError(texto) {
    $("#dvMensaje").removeClass("alert alert-success");
    $("#dvMensaje").addClass("alert alert-danger");
    $("#dvMensaje").html(texto);
}
function mensajeInfo(texto) {
    $("#dvMensaje").removeClass("alert alert-success");
    $("#dvMensaje").addClass("alert alert-info");
    $("#dvMensaje").html(texto);
}
function mensajeOk(texto) {
    $("#dvMensaje").removeClass("alert alert-success");
    $("#dvMensaje").addClass("alert alert-success");
    $("#dvMensaje").html(texto);
}
async function logearse(user, contra) {
    try {


        const datosOut = await fetch(dir + "usuario?user=" + user + "&contra=" + contra,
            {
                method: "GET",
                mode: "cors",
                headers: {
                    "content-type": "application/json",

                }

            }
        );
        const datosIn = await datosOut.json();
        if (datosIn == "" || datosIn[0].Activo == false) {
            mensajeError("Clave o Contraseña erroneos");
            return;
        }

        sessionStorage.setItem('codUsu', datosIn[0].Codigo);
        sessionStorage.setItem('nombreUsu', datosIn[0].Nombre + " " + datosIn[0].Apellido);
        window.location.href = "frmInicio.html";
        return;
    } catch (error) {
        mensajeError("Error: " + error);
        return;
    }
}
