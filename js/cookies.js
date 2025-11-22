
function setCookie(nombre, valor, dias) {
    const d = new Date();
    d.setTime(d.getTime() + (dias*24*60*60*1000));  //para segundos dejo solo el 1000
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


// Mostrar aviso si no hay cookie
document.addEventListener("DOMContentLoaded", () => {
    const aviso = document.getElementById("aviso-cookies");
    const mensaje = document.getElementById("mensaje-cookies");
    if (!aviso || !mensaje) return;

    const decision = getCookie("cookie_aceptada");

    if (!decision) {
        // Mostrar aviso la primera vez
        aviso.style.display = "block";
    }

    document.getElementById("aceptar-cookies").addEventListener("click", () => {
        setCookie("cookie_aceptada", "sí", 90);
        aviso.style.display = "none";
        mensaje.style.display = "block";
        setTimeout(() => mensaje.style.display = "none", 5000);
    });

    document.getElementById("rechazar-cookies").addEventListener("click", () => {
        setCookie("cookie_aceptada", "no", 90);
        aviso.style.display = "none";
        mensaje.style.display = "block";
        mensaje.textContent = "Has rechazado el uso de cookies.";
        setTimeout(() => mensaje.style.display = "none", 5000);
    });
});