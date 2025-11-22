function setCookie(nombre, valor, dias) {
    const d = new Date();
    d.setTime(d.getTime() + dias * 24 * 60 * 60 * 1000);    //para segundos dejo solo el 1000
    document.cookie = `${nombre}=${encodeURIComponent(valor)}; expires=${d.toUTCString()}; path=/`;
}

function getCookie(nombre) {
    const cookies = document.cookie.split(";").map(c => c.trim());
    for (const c of cookies) {
        if (c.startsWith(nombre + "=")) {
            return decodeURIComponent(c.substring(nombre.length + 1));
        }
    }
    return null;
}


//Aplicar estilo
function aplicarEstilo(nombreEstilo) {
    const estilos = document.querySelectorAll('link[rel="alternate stylesheet"]');
    estilos.forEach(link => {
        link.disabled = true; //deshabilitamos todos
        if (link.title === nombreEstilo) link.disabled = false; //activamos el elegido
    });
}


//Inicializar estilo
(function() {

    //Saber si el usuario ha aceptado las cookies
    const decisionCookies = getCookie("cookie_aceptada");

    //Solo cargar el estilo guardado si aceptó cookies
    let estiloGuardado = null;
    if (decisionCookies === "sí") {
        estiloGuardado = getCookie("estilo");
    }

    //Aplicar estilo guardado
    if (estiloGuardado) {
        aplicarEstilo(estiloGuardado);
        const select = document.getElementById("estilo-select");
        if (select) select.value = estiloGuardado;
    }

    //cambio lo que pone en el selector de estilos
    const select = document.getElementById("estilo-select");
    if (select) {
        select.addEventListener("change", () => {
            const valor = select.value;
            aplicarEstilo(valor);

            //solo se guarda si aceptó cookies
            if (decisionCookies === "sí") {
                setCookie("estilo", valor, 45);
            }
        });
    }

})();
