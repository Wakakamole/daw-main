window.addEventListener("DOMContentLoaded", () => {

    const selectOrden = document.getElementById("select-orden");
    //obtengo el filtro que elige el usuario
    selectOrden.addEventListener("change", () => {
        const valor = selectOrden.value;
        if (valor === "") return;
        //separo en campo y modo (titulo-asc por ejemplo)
        const [campo, modo] = valor.split("-");
        ordenarAnuncios(campo, modo);
    });

});

//Ordenar los anuncios del <ul> usando DOM puro
function ordenarAnuncios(campo, modo) {

    //obtengo todos los anuncios
    const lista = document.getElementById("lista-anuncios");
    const elementos = Array.from(lista.querySelectorAll("li"));

    //FUNCIONES para obtener cada campo de un anuncio
    const obtenerTitulo = (li) =>
        li.querySelector("h3").textContent.trim();


    const obtenerFecha = (li) => {
        const p = Array.from(li.querySelectorAll("footer p"))
                       .find(p => p.textContent.includes("Fecha"));
        if (!p) return null;

        const texto = p.textContent.replace("Fecha:", "").trim();
        const [dia, mes, anio] = texto.split("/").map(Number);
        if ([dia, mes, anio].some(n => Number.isNaN(n))) return null;
        return new Date(anio, mes - 1, dia);
    };


    const obtenerCiudad = (li) => {
        const p = Array.from(li.querySelectorAll("footer p"))
                       .find(p => p.textContent.includes("Ciudad"));
        if (!p) return "";
        return p.textContent.replace("Ciudad:", "").trim();
    };


    const obtenerPais = (li) => {
        const p = Array.from(li.querySelectorAll("footer p"))
                       .find(p => p.textContent.includes("País"));
        if (!p) return "";
        return p.textContent.replace("País:", "").trim();
    };


    const obtenerPrecio = (li) => {
        const p = Array.from(li.querySelectorAll("footer p"))
                       .find(p => p.textContent.includes("Precio"));
        if (!p) return null;

        const texto = p.textContent.replace("Precio:", "").trim();
        // elimina € y espacios, convierte "1.234.567,89" => "1234567.89"
        const normalizado = texto
            .replace("€", "")
            .replace(/\s/g, "")
            .replace(/\./g, "")
            .replace(",", ".");
        const num = Number(normalizado);
        return Number.isNaN(num) ? null : num;
    };


    const extractores = {
        titulo: obtenerTitulo,
        fecha: obtenerFecha,
        ciudad: obtenerCiudad,
        pais: obtenerPais,
        precio: obtenerPrecio
    };

    const extraer = extractores[campo];

    //ORDENAR
    elementos.sort((a, b) => {
        const A = extraer(a);
        const B = extraer(b);

        //manejar valores nulos/indefinidos
        const aNull = (A === null || A === undefined || A === "");
        const bNull = (B === null || B === undefined || B === "");
        if (aNull && bNull) return 0;
        if (aNull) return 1;
        if (bNull) return -1;

        let cmp = 0;

        // Strings
        if (typeof A === "string" && typeof B === "string") {
            cmp = A.localeCompare(B, "es", { sensitivity: "base" });
        }
        // Dates
        else if (A instanceof Date && B instanceof Date) {
            cmp = A - B;
        }
        // Números
        else if (typeof A === "number" && typeof B === "number") {
            cmp = A - B;
        }

        // Si modo es descendente, invertir
        return modo === "asc" ? cmp : -cmp;
    });

    //APLICAR AL DOM SIN innerHTML (sin recargar la página)
    elementos.forEach(li => lista.appendChild(li));
}
