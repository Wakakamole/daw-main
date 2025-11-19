/*
  validaccion.js
  ----------------
  Este archivo contiene las funciones necesarias para validar los formularios de inicio de sesión y registro.

  - No se utilizan expresiones regulares ni la API de validación de restricciones (requisito de la práctica).
  - Las validaciones se realizan manualmente para cada campo: nombre de usuario, contraseña, correo electrónico, sexo, ciudad/país, foto y fecha de nacimiento (mínimo 18 años).
*/

(function(){
  // FUNCIONES COMPARTIDAS (utilizadas tanto en login como en registro)
  function $(id){ return document.querySelector('#'+id); }

  // Crear y gestionar mensajes de error
  // Esta función genera un elemento <span> con la clase "error-msg" justo después del input correspondiente.
  // Aquí se mostrarán los mensajes de error para facilitar el estilo y la localización con CSS.
  function crearElementoError(input) {
    // Buscar el siguiente elemento con la clase "error-msg"
    var next = input.nextElementSibling;
    while (next && !next.classList.contains('error-msg')) {
      next = next.nextElementSibling;
    }

    // Si ya existe un elemento de error, reutilizarlo
    if (next) return next;

    // Crear un nuevo elemento <span> para el mensaje de error
    var span = document.createElement('span');
    span.className = 'error-msg';
    span.textContent = '';

    // Insertar el mensaje de error después del texto informativo (si existe)
    var infoText = input.nextElementSibling;
    while (infoText && infoText.tagName === 'SMALL') {
      infoText = infoText.nextElementSibling;
    }

    input.parentNode.insertBefore(span, infoText);
    return span;
  }

  // Añadir un mensaje de error visual al input y aplicar la clase `.input-error`.
  // También se registra un aviso en la consola para facilitar la depuración durante el desarrollo.
  function marcarError(input, mensaje){
    var span = crearElementoError(input);
    span.textContent = mensaje;
    input.classList.add('input-error');
    span.style.color = 'red';
    span.style.marginLeft = '0.5em';
    try{ console.warn('[VALIDACIÓN] Error en', input && input.id, mensaje); }catch(e){}
  }

  // --- gestión de errores para grupos (p. ej. radios) ---
  // Para conjuntos de radios/checkboxes que comparten una etiqueta visual,
  // insertamos el mensaje fuera del label (después del contenedor .radio-group)
  // para no romper la accesibilidad ni la estructura del formulario.
  function marcarErrorGroup(inputInsideGroup, mensaje){
    var group = inputInsideGroup.closest('.radio-group');
    if(!group) group = inputInsideGroup.parentNode;
    var next = group.nextElementSibling;
    if(next && next.classList && next.classList.contains('error-msg')){
      next.textContent = mensaje;
    } else {
      var span = document.createElement('span');
      span.className = 'error-msg';
      span.textContent = mensaje;
      span.style.color = 'red';
      span.style.marginLeft = '0.5em';
      group.parentNode.insertBefore(span, group.nextSibling);
    }
    group.classList.add('group-error');
  }

  // Quita el mensaje de error asociado a un grupo (si existe) y elimina la
  // clase de error del grupo.
  function quitarErrorGroup(inputInsideGroup){
    var group = inputInsideGroup.closest('.radio-group');
    if(!group) group = inputInsideGroup.parentNode;
    var next = group.nextElementSibling;
    if(next && next.classList && next.classList.contains('error-msg')){
      next.parentNode.removeChild(next);
    }
    group.classList.remove('group-error');
  }

  // Quita el mensaje de error del input y remueve la clase .input-error.
  // Usada en la validación en tiempo real (evento 'input').
  function quitarError(input){
    var next = input.nextElementSibling;
    if(next && next.classList && next.classList.contains('error-msg')) next.textContent = '';
    input.classList.remove('input-error');
  }

  // --- comprobaciones de cadenas / caracteres ---
  // Esta función considera vacía cualquier cadena que solo contenga
  // espacios en blanco (incluye tabulador y saltos de línea).
  function estaVacioOEspacios(s){
    if(s === null || s === undefined) return true;
    for(var i=0;i<s.length;i++){
      var ch = s.charAt(i);
      if(ch !== ' ' && ch !== '\t' && ch !== '\n' && ch !== '\r' && ch !== '\f' && ch !== '\v') return false;
    }
    return true;
  }

  function esLetra(c){
    var code = c.charCodeAt(0);
    return (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
  }
  function esNumero(c){
    var code = c.charCodeAt(0);
    return (code >= 48 && code <= 57);
  }
  function esGuionOMinus(c){
    return c === '-' || c === '_';
  }

  // --- caracteres permitidos en la parte local del email ---
  // Versión simplificada: permite letras, números y un subconjunto de símbolos
  // que suelen aceptarse en la parte local. El tratamiento especial del punto
  // (no inicio/fin, no consecutivos) se hace desde la validación del email.
  function esCaracterPermitidoParteLocal(c){
    if(esLetra(c) || esNumero(c)) return true;
    var allowed = "!#$%&'*+-/=?^_`{|}~";
    if(allowed.indexOf(c) !== -1) return true;
    if(c === '.') return true;
    return false;
  }

  //************************************************************************
  // LOGIN - validaciones específicas para la pantalla de inicio de sesión
  //************************************************************************
  function validaLogin(event){
    var ok = true;
    var usuario = $('usuario');
    var password = $('contrasena');
    if(!usuario || !password) return true;

    quitarError(usuario); quitarError(password);

    if(estaVacioOEspacios(usuario.value)){
      marcarError(usuario, 'El usuario no puede estar vacío ni contener solo espacios.');
      ok = false;
    }
    if(estaVacioOEspacios(password.value)){
      marcarError(password, 'La contraseña no puede estar vacía ni contener solo espacios.');
      ok = false;
    }

    if(!ok){
      event.preventDefault();
      var primero = document.querySelector('.input-error');
      if(primero) primero.focus();
    }
    return ok;
  }

  //***********************************************************************
  // REGISTRO - validaciones específicas para el formulario de registro
  // - Username: 3-15 caracteres, no empezar por número, solo letras y números
  // - Password: 6-15 caracteres, al menos una mayúscula, una minúscula y un número
  // - Email: validación manual 
  // - Sexo: al menos una opción marcada 
  // - Fecha de nacimiento: comprobación YYYY-MM-DD y edad >= 18
  //***********************************************************************
  function validaRegistro(event){
    var ok = true;
    var form = $('registerForm');
    if(!form) return true;

    var username = $('usuario');
    var password = $('contrasena');
    var confirm_password = $('confirmar_contrasena');
    var email = $('email');
    var sexo_h = $('sexo_hombre');
    var sexo_m = $('sexo_mujer');
    var sexo_o = $('sexo_otro');
    var birthdate = $('fecha_nacimiento');

    [username,password,confirm_password,email,birthdate].forEach(function(f){ if(f) quitarError(f); });
    if(sexo_h) quitarErrorGroup(sexo_h);

    if(!username){
    } else {
      var u = username.value || '';
      if(typeof u.trim === 'function') u = u.trim();
      if(u.length < 3 || u.length > 15){
        marcarError(username, 'Usuario debe tener entre 3 y 15 caracteres.'); ok = false;
      } else {
        var first = u.charAt(0);
        if(esNumero(first)) { marcarError(username, 'El usuario no puede comenzar por un número.'); ok = false; }
        for(var i=0;i<u.length;i++){
          var ch = u.charAt(i);
          if(!(esLetra(ch) || esNumero(ch))){
            marcarError(username, 'El usuario solo puede contener letras y números.'); ok = false; break;
          }
        }
      }
    }

    if(!password){
    } else {
      var p = password.value || '';
      if(p.length < 6 || p.length > 15){ marcarError(password, 'La contraseña debe tener entre 6 y 15 caracteres.'); ok = false;
      } else {
        var tieneMay = false, tieneMin = false, tieneNum = false;
        for(var i=0;i<p.length;i++){
          var ch = p.charAt(i);
          if(esLetra(ch)){
            if(ch === ch.toUpperCase() && ch !== ch.toLowerCase()) tieneMay = true;
            if(ch === ch.toLowerCase() && ch !== ch.toUpperCase()) tieneMin = true;
          } else if(esNumero(ch)){
            tieneNum = true;
          } else if(esGuionOMinus(ch)){
          } else {
            marcarError(password, 'Caracteres no permitidos en la contraseña.'); ok = false; break;
          }
        }
        if(ok){
          if(!tieneMay) { marcarError(password, 'La contraseña debe contener al menos una letra mayúscula.'); ok = false; }
          if(!tieneMin) { marcarError(password, 'La contraseña debe contener al menos una letra minúscula.'); ok = false; }
          if(!tieneNum) { marcarError(password, 'La contraseña debe contener al menos un número.'); ok = false; }
        }
      }
    }

    if(confirm_password && password){
      if(confirm_password.value !== password.value){ marcarError(confirm_password, 'Las contraseñas no coinciden.'); ok = false; }
    }

    // --- Validación del campo email (registro) ---
    // 1 Debe contener exactamente un '@'
    // 2 Parte local (antes de @): 1-64 chars, no empezar/terminar con '.', no '..'
    //y solo caracteres permitidos por esCaracterPermitidoParteLocal
    // 3 Dominio (después de @): no empezar/terminar con '.', dividido por '.',
    //cada etiqueta 1-63 chars, solo letras/números/guion y sin guion al inicio/fin
    // 4 Longitud total <= 254
    if(email){
      var e = email.value || '';
      if(typeof e.trim === 'function') e = e.trim();
      var emailValid = true;
      if(estaVacioOEspacios(e)){ marcarError(email, 'El correo no puede estar vacío.'); emailValid = false; }
      else {
        var atFirst = e.indexOf('@');
        var atLast = e.lastIndexOf('@');
        if(atFirst === -1 || atFirst !== atLast){ marcarError(email, 'El correo debe contener exactamente un "@".'); emailValid = false; }
        else {
          var parteLocal = e.substring(0, atFirst);
          var dominio = e.substring(atFirst+1);
          if(parteLocal.length < 1 || parteLocal.length > 64){ marcarError(email, 'La parte local del correo debe tener entre 1 y 64 caracteres.'); emailValid = false; }
          else if(dominio.length < 1 || dominio.length > 255){ marcarError(email, 'El dominio del correo tiene longitud no válida.'); emailValid = false; }
          else if(e.length > 254){ marcarError(email, 'La dirección de correo excede la longitud máxima de 254 caracteres.'); emailValid = false; }
          else {
            if(parteLocal.charAt(0) === '.' || parteLocal.charAt(parteLocal.length-1) === '.') { marcarError(email, 'Parte local no puede empezar o terminar con punto.'); emailValid = false; }
            for(var ii=0; ii<parteLocal.length && emailValid; ii++){
              var chLocal = parteLocal.charAt(ii);
              if(chLocal === '.' && ii+1 < parteLocal.length && parteLocal.charAt(ii+1) === '.') { marcarError(email, 'Parte local no puede tener dos puntos seguidos.'); emailValid = false; break; }
              if(!esCaracterPermitidoParteLocal(chLocal)){
                marcarError(email, 'Caracter no permitido en la parte local del correo.'); emailValid = false; break;
              }
            }
            if(emailValid){
              if(dominio.charAt(0) === '.' || dominio.charAt(dominio.length-1) === '.') { marcarError(email, 'Dominio no válido.'); emailValid = false; }
              else {
                var partes = dominio.split('.');
                if(partes.length === 0){ marcarError(email, 'Dominio no válido.'); emailValid = false; }
                for(var pIndex=0; pIndex<partes.length && emailValid; pIndex++){
                  var sub = partes[pIndex];
                  if(sub.length < 1 || sub.length > 63){ marcarError(email, 'Cada subdominio debe tener entre 1 y 63 caracteres.'); emailValid = false; break; }
                  if(sub.charAt(0) === '-' || sub.charAt(sub.length-1) === '-'){ marcarError(email, 'Subdominio no puede empezar ni terminar con guion.'); emailValid = false; break; }
                  for(var jj=0; jj<sub.length; jj++){
                    var chDom = sub.charAt(jj);
                    if(!(esLetra(chDom) || esNumero(chDom) || chDom === '-')){ marcarError(email, 'Caracter no permitido en el dominio del correo.'); emailValid = false; break; }
                  }
                }
              }
            }
          }
        }
      }
      if(!emailValid){
        // DEBUG indicaa por consola que el email fue considerado inválido.
        try{ console.warn('[VALIDATION] email inválido ->', e); }catch(ex){}
        ok = false;
      }
    }

    if(sexo_h || sexo_m || sexo_o){
      var elegido = false;
      if(sexo_h && sexo_h.checked) elegido = true;
      if(sexo_m && sexo_m.checked) elegido = true;
      if(sexo_o && sexo_o.checked) elegido = true;
      if(!elegido){
        if(sexo_h) marcarErrorGroup(sexo_h, 'Debes seleccionar una opción de sexo.');
        ok = false;
      }
    }

    /*  var city = $('city') || $('ciudad');
    var country = $('country') || $('pais');
    if(city) { quitarError(city); var cityVal = city.value || ''; if(typeof cityVal.trim === 'function') cityVal = cityVal.trim(); if(estaVacioOEspacios(cityVal)) { marcarError(city, 'La ciudad no puede estar vacía.'); ok = false; } }
    if(country) { quitarError(country); var countryVal = country.value || ''; if(typeof countryVal.trim === 'function') countryVal = countryVal.trim(); if(estaVacioOEspacios(countryVal)) { marcarError(country, 'El país no puede estar vacío.'); ok = false; } }

    var photo = $('photo') || $('foto');
    if(photo){
      quitarError(photo);
      try{
        if(!photo.files || photo.files.length === 0){ marcarError(photo, 'Debes seleccionar una foto.'); ok = false; }
      } catch(ex){
        if(!photo.value || estaVacioOEspacios(photo.value)){ marcarError(photo, 'Debes seleccionar una foto.'); ok = false; }
      }
    }
    */

    // --- Validación de fecha de nacimiento ---
    // Se espera que un control externo (selects) haya rellenado 'fecha_nacimiento'
    // en formato YYYY-MM-DD. Aquí comprobamos formato, existencia real de la
    // fecha y que la edad sea al menos 18 años.
    if(birthdate){
      var b = birthdate.value || '';
      if(estaVacioOEspacios(b)){ marcarError(birthdate, 'La fecha de nacimiento no puede estar vacía.'); ok = false; }
        else {
          var partes = b.split('-');
          if(partes.length !== 3){ marcarError(birthdate, 'Formato de fecha incorrecto (usar YYYY-MM-DD).'); ok = false; }
          else {
            var y = parseInt(partes[0],10);
            var m = parseInt(partes[1],10);
            var d = parseInt(partes[2],10);
            if(isNaN(y) || isNaN(m) || isNaN(d)) { marcarError(birthdate, 'Fecha no válida.'); ok = false; }
            else {
              if(m < 1 || m > 12 || d < 1 || d > 31) { marcarError(birthdate, 'Fecha no válida.'); ok = false; }
              else {
                var fecha = new Date(y, m-1, d);
                if(fecha.getFullYear() !== y || fecha.getMonth() !== (m-1) || fecha.getDate() !== d){ marcarError(birthdate, 'Fecha inexistente.'); ok = false; }
                else {
                  var ahora = new Date();
                  var edad = ahora.getFullYear() - y;
                  var mesAhora = ahora.getMonth() + 1;
                  var diaAhora = ahora.getDate();
                  if(mesAhora < m || (mesAhora === m && diaAhora < d)) edad--;
                  if(edad < 18){ marcarError(birthdate, 'Debes tener al menos 18 años para registrarte.'); ok = false; }
                }
              }
            }
          }
        }
      }

      if(!ok){
        event.preventDefault();
        var primero = document.querySelector('.input-error');
        if(primero) primero.focus();
      }

      return ok;
    }

    // Añadir mensajes informativos debajo de cada campo del formulario de registro
    function agregarMensajesInformativosRegistro() {
      const mensajes = {
        usuario: 'El nombre de usuario debe tener entre 3 y 15 caracteres y no puede comenzar con un número.',
        contrasena: 'La contraseña debe tener entre 6 y 15 caracteres, incluyendo al menos una mayúscula, una minúscula y un número.',
        confirmar_contrasena: 'Repite la contraseña para confirmar que coincide.',
        email: 'Introduce un correo electrónico válido, por ejemplo: usuario@dominio.com.',
        fecha_nacimiento: 'Debes tener al menos 18 años.',
      };

      Object.keys(mensajes).forEach(id => {
        const campo = $(id);
        if (campo && !campo.nextElementSibling?.classList.contains('info-msg')) {
          const mensaje = document.createElement('small');
          mensaje.textContent = mensajes[id];
          mensaje.classList.add('info-msg');
          mensaje.style.display = 'block';
          mensaje.style.color = '#555';
          mensaje.style.fontSize = '0.9em';
          mensaje.style.marginTop = '0.3em';
          campo.parentNode.insertBefore(mensaje, campo.nextSibling);
        }
      });
    }

    // Llamar a la función para agregar mensajes informativos al cargar la página
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', agregarMensajesInformativosRegistro, false);
    } else {
      agregarMensajesInformativosRegistro();
    }

    // Inicialización: se asocian los eventos de submit y se configuran los eventos de input
    // para limpiar errores en tiempo real. También se inicializan los selectores de fecha
    // y se sincroniza el campo oculto 'birthdate'.
    function init(){
      var loginForm = $('loginForm');
      if(loginForm) loginForm.addEventListener('submit', validaLogin);

      var registerForm = $('registerForm');
      if(registerForm) registerForm.addEventListener('submit', validaRegistro);

      document.addEventListener('input', function(e){
        var t = e.target;
        if(!t) return;
        if(t.classList && t.classList.contains('input-error')){
          if(!estaVacioOEspacios(t.value)) quitarError(t);
        }
      });

      var bd = $('dia_nacimiento');
      var bm = $('mes_nacimiento');
      var by = $('anio_nacimiento');
      var hidden = $('fecha_nacimiento');
      if(bd && bm && by && hidden){
        var meses = ['Enero','Febrero',
          'Marzo','Abril','Mayo','Junio',
          'Julio','Agosto','Septiembre',
          'Octubre','Noviembre','Diciembre'];
        for(var i=0;i<12;i++){
          var opt = document.createElement('option');
          var val = (i+1<10? '0'+(i+1) : ''+(i+1));
          opt.value = val; opt.textContent = meses[i];
          bm.appendChild(opt);
        }

        function diasEnMesNumber(year, monthNumber){ return new Date(year, monthNumber, 0).getDate(); }

        function actualizarHiddenDesdeControles(){
          var d = parseInt(bd.value,10);
          var m = bm.value;
          var y = parseInt(by.value,10);
          if(!isNaN(d) && m && !isNaN(y)){
            var max = diasEnMesNumber(y, parseInt(m,10));
            if(d >= 1 && d <= max){
              var dd = (d<10? '0'+d : ''+d);
              hidden.value = y + '-' + m + '-' + dd;
              quitarError(hidden);
              return true;
            } else {
              hidden.value = '';
              // Mostrar el mensaje de error junto al campo oculto 'birthdate'
              // para que aparezca debajo de los controles de día/mes/año en lugar
              // de entre los controles (evita que el mensaje rompa la fila).
              marcarError(hidden, 'Día no válido para el mes/año seleccionado.');
              return false;
            }
          } else {
            hidden.value = '';
            return false;
          }
        }

        bd.addEventListener('change', actualizarHiddenDesdeControles);
        bm.addEventListener('change', actualizarHiddenDesdeControles);
        by.addEventListener('change', actualizarHiddenDesdeControles);

        // Limitar el input del día a 1..31 en tiempo real
        bd.setAttribute('min', '1'); bd.setAttribute('max', '31'); bd.setAttribute('step', '1');
        bd.addEventListener('input', function(){
          var v = parseInt(bd.value, 10);
          if(isNaN(v)) return;
          if(v < 1) bd.value = '1';
          if(v > 31) bd.value = '31';
        });

        // Limitar el input del año a un rango razonable (1900..2100) y avisar si
        // el usuario introduce un valor absurdo (por ejemplo 351353). Mostramos el
        // mensaje de error en el campo oculto 'birthdate' para mantener la
        // posición consistente con otros mensajes de fecha.
        by.setAttribute('min', '1900'); by.setAttribute('max', '2100'); by.setAttribute('step', '1');
        by.addEventListener('input', function(){
          var v = parseInt(by.value, 10);
          if(isNaN(v)) return;
          if(v < 1900){
            by.value = '1900';
            marcarError(hidden, 'El año es demasiado antiguo.');
          } else if(v > 2100){
            by.value = '2100';
            marcarError(hidden, 'El año introducido excede el máximo permitido.');
          } else {
            // quitar posible error si ahora está en rango
            quitarError(hidden);
          }
        });

        var ahora = new Date();
        var maxYear = ahora.getFullYear() - 18;
        by.min = 1900;
        by.max = 2100;
        if(!by.value) by.value = maxYear;
        actualizarHiddenDesdeControles();
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init, false);
    } else {
      init();
    }
  })();
