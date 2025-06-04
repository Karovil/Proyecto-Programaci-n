// En Scripts/Comunes/Combos.js
async function llenarComboGral(url, combo, textField = "Nombre") // Agregamos textField con un valor predeterminado de "Nombre"
{
    try {
        const Respuesta = await fetch(url,
            {
                method: "GET",
                mode: "cors",
                headers: { "content-type": "application/json", }
            }
        );
        const Rpta = await Respuesta.json();

        $(combo).empty();

        // Recorremos la respuesta
        for (i = 0; i < Rpta.length; i++) {
            // Usamos el parámetro textField para obtener el texto correcto
            $(combo).append('<option value=' + Rpta[i].Codigo + '>' + Rpta[i][textField] + '</option>');
        }

        return "Termino";
    }
    catch (error) {
        console.error("Error al llenar el combo desde " + url + ":", error);
        return error;
    }
}