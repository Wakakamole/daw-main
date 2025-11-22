// Crear botones según la situación actual
document.addEventListener("DOMContentLoaded", () => {
    const decision = getCookie("cookie_aceptada");
    const contenedor = document.getElementById("botones-politica");
    const mensaje = document.getElementById("mensaje");

    if (decision === "sí") {
        contenedor.innerHTML = `
            <button id="rechazar">Rechazar cookies</button>
        `;

        document.getElementById("rechazar").addEventListener("click", () => {
            setCookie("cookie_aceptada", "no", 90);
            setCookie("estilo", "", -1); // borrar estilo guardado
            mensaje.style.display = "block";
        });

    } else if (decision === "no") {
        contenedor.innerHTML = `
            <button id="aceptar">Aceptar cookies</button>
        `;

        document.getElementById("aceptar").addEventListener("click", () => {
            setCookie("cookie_aceptada", "sí", 90);
            mensaje.style.display = "block";
        });

    } else {
        // Nunca ha tomado decisión
        contenedor.innerHTML = `
            <button id="aceptar">Aceptar cookies</button>
            <button id="rechazar">Rechazar cookies</button>
        `;

        document.getElementById("aceptar").addEventListener("click", () => {
            setCookie("cookie_aceptada", "sí", 90);
            mensaje.style.display = "block";
        });

        document.getElementById("rechazar").addEventListener("click", () => {
            setCookie("cookie_aceptada", "no", 90);
            mensaje.style.display = "block";
        });
    }
});