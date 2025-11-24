/*
  validaccion.js
  ----------------
  Este archivo contiene las funciones necesarias para validar los formularios de inicio de sesión y registro.

  Requisitos extra:
  - expresiones regulares.
  - NO type="email", pattern, etc.
  - validaciones con JS - 'submit' del formulario.

  Validaciones:
  1. LOGIN: usuario y contraseña no vacíos (sin espacios en blanco solamente)
  2. REGISTRO:
     - Usuario: 3-15 caracteres, solo letras y números, no comienza por número
     - Contraseña: 6-15 caracteres, al menos 1 mayúscula, 1 minúscula, 1 número, - y _
     - Email: patrón completo según especificación
     - Confirmar contraseña: debe coincidir con contraseña
     - Sexo, Fecha nacimiento, Ciudad, País: no vacíos
*/

(function(){
  // FUNCIONES COMPARTIDAS
  function $(id){ return document.querySelector('#'+id); }

  // Crear y gestionar mensajes de error
  function crearElementoError(input) {
    var next = input.nextElementSibling;
    while (next && !next.classList.contains('error-msg')) {
      next = next.nextElementSibling;
    }

    if (next) return next;

    var span = document.createElement('span');
    span.className = 'error-msg';
    span.textContent = '';

    var infoText = input.nextElementSibling;
    while (infoText && infoText.tagName === 'SMALL') {
      infoText = infoText.nextElementSibling;
    }

    input.parentNode.insertBefore(span, infoText);
    return span;
  }

  function marcarError(input, mensaje){
    var span = crearElementoError(input);
    span.textContent = mensaje;
    input.classList.add('input-error');
    span.style.color = 'red';
    span.style.marginLeft = '0.5em';
    try{ console.warn('[VALIDACIÓN] Error en', input && input.id, mensaje); }catch(e){}
  }

  // Gestión de errores para grupos (lo de los radios buttons)
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

  function quitarErrorGroup(inputInsideGroup){
    var group = inputInsideGroup.closest('.radio-group');
    if(!group) group = inputInsideGroup.parentNode;
    var next = group.nextElementSibling;
    if(next && next.classList && next.classList.contains('error-msg')){
      next.parentNode.removeChild(next);
    }
    group.classList.remove('group-error');
  }

  function quitarError(input){
    var next = input.nextElementSibling;
    if(next && next.classList && next.classList.contains('error-msg')) next.textContent = '';
    input.classList.remove('input-error');
  }

  // --- Funciones auxiliares para validación ---
  // Considera vacía cualquier cadena que solo contenga espacios en blanco
  function estaVacioOEspacios(s){
    if(s === null || s === undefined) return true;
    return /^\s*$/.test(s);
  }

  /* validar nombre de usuario
  3-15 caracteres
  Solo letras (a-z, A-Z) y números (0-9)
  No comienza con num*/
  var regexUsuario = /^[A-Za-z\u00D1\u00F1][A-Za-z\u00D1\u00F10-9]{2,14}$/;

  /* validar contraseña
  6-15 caracteres
  letras (a-z, A-Z), números (0-9), guion (-) y guion (_)
  1 mayús, 1 minús y 1 num*/
  var regexContrasena = /^[a-zA-Z0-9_-]{6,15}$/;

  /* validar email 
  antes de @ 1-64 chars, no empieza/termina con punto, no puntos dobles
  subdominios separados por punto, cada uno 1-63 chars, no empieza/termina con guion*/
  var regexEmail = /^[a-zA-Z0-9!#$%&'*+\-/=?^_`{|}~]+(?:\.[a-zA-Z0-9!#$%&'*+\-/=?^_`{|}~]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  // Validar contraseña
  // Retorna un objeto con { válido: boolean, error: string (si no es válido) }
  function validarContrasena(pwd){
    if(!pwd || pwd.length === 0) return { valido: false, error: 'La contraseña no puede estar vacía.' };
    if(pwd.length < 6 || pwd.length > 15) return { valido: false, error: 'La contraseña debe tener entre 6 y 15 caracteres.' };
    if(!regexContrasena.test(pwd)) return { valido: false, error: 'Caracteres no permitidos. Solo se permiten letras, números, guion (-) y guion bajo (_).' };
    
    // Verificar que contiene al menos 1 mayúscula
    if(!/[A-Z]/.test(pwd)) return { valido: false, error: 'La contraseña debe contener al menos una letra mayúscula.' };
    
    // Verificar que contiene al menos 1 minúscula
    if(!/[a-z]/.test(pwd)) return { valido: false, error: 'La contraseña debe contener al menos una letra minúscula.' };
    
    // Verificar que contiene al menos 1 número
    if(!/[0-9]/.test(pwd)) return { valido: false, error: 'La contraseña debe contener al menos un número.' };
    
    return { valido: true, error: null };
  }

  // Validar email
  function validarEmail(email){
    if(!email || email.length === 0) return { valido: false, error: 'El correo no puede estar vacío.' };
    
    email = email.trim();
    
    // Longitud total máxima
    if(email.length > 254) return { valido: false, error: 'La dirección de correo excede la longitud máxima de 254 caracteres.' };
    
    // Debe contener exactamente un @
    var atIndex = email.indexOf('@');
    if(atIndex === -1) return { valido: false, error: 'El correo debe contener el símbolo "@".' };
    if(email.lastIndexOf('@') !== atIndex) return { valido: false, error: 'El correo debe contener exactamente un "@".' };
    
    var parteLocal = email.substring(0, atIndex);
    var dominio = email.substring(atIndex + 1);
    
    // Validar parte local
    if(parteLocal.length < 1 || parteLocal.length > 64) return { valido: false, error: 'La parte local del correo debe tener entre 1 y 64 caracteres.' };
    if(parteLocal.charAt(0) === '.' || parteLocal.charAt(parteLocal.length - 1) === '.') return { valido: false, error: 'La parte local no puede empezar ni terminar con punto.' };
    if(parteLocal.indexOf('..') !== -1) return { valido: false, error: 'La parte local no puede contener puntos consecutivos.' };
    
    // Validar caracteres en parte local
    var regexParteLocal = /^[a-zA-Z0-9!#$%&'*+\-/=?^_`{|}~.]+$/;
    if(!regexParteLocal.test(parteLocal)) return { valido: false, error: 'La parte local contiene caracteres no permitidos.' };
    
    // Validar dominio
    if(dominio.length < 1 || dominio.length > 255) return { valido: false, error: 'El dominio tiene longitud no válida (1-255 caracteres).' };
    if(dominio.charAt(0) === '.' || dominio.charAt(dominio.length - 1) === '.') return { valido: false, error: 'El dominio no puede empezar ni terminar con punto.' };
    if(dominio.indexOf('..') !== -1) return { valido: false, error: 'El dominio no puede contener puntos consecutivos.' };
    
    // Validar cada subdominio
    var subdominios = dominio.split('.');
    if(subdominios.length === 0) return { valido: false, error: 'El dominio no es válido.' };
    
    for(var i = 0; i < subdominios.length; i++){
      var sub = subdominios[i];
      if(sub.length < 1 || sub.length > 63) return { valido: false, error: 'Cada subdominio debe tener entre 1 y 63 caracteres.' };
      if(sub.charAt(0) === '-' || sub.charAt(sub.length - 1) === '-') return { valido: false, error: 'El subdominio no puede empezar ni terminar con guion.' };
      
      // Validar caracteres en subdominio
      var regexSubdominio = /^[a-zA-Z0-9-]+$/;
      if(!regexSubdominio.test(sub)) return { valido: false, error: 'El dominio contiene caracteres no permitidos.' };
    }
    
    return { valido: true, error: null };
  }

  //***********************************************************************
  // LOGIN - Validaciones para el formulario de inicio de sesión
  // usuario y contraseña no deben estar vacíos ni contener solo espacios
  //***********************************************************************
  function validaLogin(event){
    var ok = true;
    var usuario = $('usuario');
    var password = $('contrasena');
    
    if(!usuario || !password) return true;

    quitarError(usuario);
    quitarError(password);

    // Validar usuario
    if(estaVacioOEspacios(usuario.value)){
      marcarError(usuario, 'El usuario no puede estar vacío ni contener solo espacios.');
      ok = false;
    }

    // Validar contraseña
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

  /***********************************************************************
   REGISTRO
   Usuario:3-15 caracteres, solo letras y num, no comienza por num
   Contraseña 6-15 caracteres, mayús, minús, num
   Email:
   Confirmar contraseña:
   Sexo: al menos una opción
   Fecha nacimiento: formato YYYY-MM-DD, edad >= 18
   Ciudad y País: no vacíos
  ***********************************************************************/
  function validaRegistro(event){
    var ok = true;
    var form = $('registerForm');
    if(!form) return true;

    var usuario = $('usuario');
    var password = $('contrasena');
    var confirm_password = $('confirmar_contrasena');
    var email = $('email');
    var sexo_h = $('sexo_hombre');
    var sexo_m = $('sexo_mujer');
    var sexo_o = $('sexo_otro');
    var ciudad = $('ciudad');
    var pais = $('pais');
    var birthdate = $('fecha_nacimiento');

    // Limpiar errores previos
    [usuario, password, confirm_password, email, ciudad, pais, birthdate].forEach(function(f){
      if(f) quitarError(f);
    });
    if(sexo_h) quitarErrorGroup(sexo_h);

    // --- VALIDAR USUARIO ---
    if(usuario){
      var u = usuario.value || '';
      if(u.length === 0){
        marcarError(usuario, 'El usuario no puede estar vacío.');
        ok = false;
      } else if(!regexUsuario.test(u)){
        marcarError(usuario, 'Usuario: 3-15 caracteres, solo letras y números, no puede comenzar con número.');
        ok = false;
      }
    }

    // --- VALIDAR CONTRASEÑA ---
    if(password){
      var p = password.value || '';
      var resultadoContra = validarContrasena(p);
      if(!resultadoContra.valido){
        marcarError(password, resultadoContra.error);
        ok = false;
      }
    }

    // --- VALIDAR CONFIRMAR CONTRASEÑA ---
    if(confirm_password && password){
      if(confirm_password.value !== password.value){
        marcarError(confirm_password, 'Las contraseñas no coinciden.');
        ok = false;
      }
    }

    // --- VALIDAR EMAIL ---
    if(email){
      var e = email.value || '';
      var resultadoEmail = validarEmail(e);
      if(!resultadoEmail.valido){
        marcarError(email, resultadoEmail.error);
        ok = false;
      }
    }

    // --- VALIDAR SEXO ---
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

    // --- VALIDAR CIUDAD ---
    if(ciudad){
      var cityVal = ciudad.value || '';
      if(estaVacioOEspacios(cityVal)){
        marcarError(ciudad, 'La ciudad no puede estar vacía.');
        ok = false;
      }
    }

    // --- VALIDAR PAÍS ---
    if(pais){
      var countryVal = pais.value || '';
      if(estaVacioOEspacios(countryVal)){
        marcarError(pais, 'El país no puede estar vacío.');
        ok = false;
      }
    }

    // --- VALIDAR FECHA DE NACIMIENTO ---
    if(birthdate){
      var b = birthdate.value || '';
      if(estaVacioOEspacios(b)){
        marcarError(birthdate, 'La fecha de nacimiento no puede estar vacía.');
        ok = false;
      } else {
        var partes = b.split('-');
        if(partes.length !== 3){
          marcarError(birthdate, 'Formato de fecha incorrecto (usar YYYY-MM-DD).');
          ok = false;
        } else {
          var y = parseInt(partes[0], 10);
          var m = parseInt(partes[1], 10);
          var d = parseInt(partes[2], 10);
          
          if(isNaN(y) || isNaN(m) || isNaN(d)){
            marcarError(birthdate, 'Fecha no válida.');
            ok = false;
          } else if(m < 1 || m > 12 || d < 1 || d > 31){
            marcarError(birthdate, 'Fecha no válida.');
            ok = false;
          } else {
            var fecha = new Date(y, m - 1, d);
            if(fecha.getFullYear() !== y || fecha.getMonth() !== (m - 1) || fecha.getDate() !== d){
              marcarError(birthdate, 'Fecha inexistente.');
              ok = false;
            } else {
              var ahora = new Date();
              var edad = ahora.getFullYear() - y;
              var mesAhora = ahora.getMonth() + 1;
              var diaAhora = ahora.getDate();
              
              if(mesAhora < m || (mesAhora === m && diaAhora < d)) edad--;
              
              if(edad < 18){
                marcarError(birthdate, 'Debes tener al menos 18 años para registrarte.');
                ok = false;
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
    var mensajes = {
      usuario: 'El nombre de usuario debe tener entre 3 y 15 caracteres y no puede comenzar con un número.',
      contrasena: 'La contraseña debe tener entre 6 y 15 caracteres, incluyendo al menos una mayúscula, una minúscula y un número.',
      confirmar_contrasena: 'Repite la contraseña para confirmar que coincide.',
      email: 'Introduce un correo electrónico válido, por ejemplo: usuario@dominio.com.',
      ciudad: 'La ciudad no puede estar vacía.',
      pais: 'El país no puede estar vacío.',
      fecha_nacimiento: 'Debes tener al menos 18 años.',
    };

    for(var id in mensajes){
      var campo = $(id);
      if(campo){
        var next = campo.nextElementSibling;
        var yaExiste = false;
        while(next){
          if(next.classList && next.classList.contains('info-msg')){
            yaExiste = true;
            break;
          }
          next = next.nextElementSibling;
        }
        
        if(!yaExiste){
          var mensaje = document.createElement('small');
          mensaje.textContent = mensajes[id];
          mensaje.classList.add('info-msg');
          mensaje.style.display = 'block';
          mensaje.style.color = '#555';
          mensaje.style.fontSize = '0.9em';
          mensaje.style.marginTop = '0.3em';
          campo.parentNode.insertBefore(mensaje, campo.nextSibling);
        }
      }
    }
  }

  // Inicialización: se asocian los eventos de submit y se configuran los eventos de input
  // para limpiar errores en tiempo real. También se inicializan los selectores de fecha
  // y se sincroniza el campo oculto 'birthdate'.
  function init(){
    var loginForm = $('loginForm');
    if(loginForm) loginForm.addEventListener('submit', validaLogin);

    var registerForm = $('registerForm');
    if(registerForm){
      registerForm.addEventListener('submit', validaRegistro);
      agregarMensajesInformativosRegistro();
    }

    // Limpiar errores en tiempo real cuando el usuario modifica un campo
    document.addEventListener('input', function(e){
      var t = e.target;
      if(!t) return;
      if(t.classList && t.classList.contains('input-error')){
        if(!estaVacioOEspacios(t.value)) quitarError(t);
      }
    });

    // Configurar selectores de fecha de nacimiento
    var bd = $('dia_nacimiento');
    var bm = $('mes_nacimiento');
    var by = $('anio_nacimiento');
    var hidden = $('fecha_nacimiento');
    
    if(bd && bm && by && hidden){
      var meses = ['Enero','Febrero',
        'Marzo','Abril','Mayo','Junio',
        'Julio','Agosto','Septiembre',
        'Octubre','Noviembre','Diciembre'];
      
      // Crear opciones de meses
      for(var i = 0; i < 12; i++){
        var opt = document.createElement('option');
        var val = (i + 1 < 10 ? '0' + (i + 1) : '' + (i + 1));
        opt.value = val;
        opt.textContent = meses[i];
        bm.appendChild(opt);
      }

      function diasEnMesNumber(year, monthNumber){
        return new Date(year, monthNumber, 0).getDate();
      }

      function actualizarHiddenDesdeControles(){
        var d = parseInt(bd.value, 10);
        var m = bm.value;
        var y = parseInt(by.value, 10);
        
        if(!isNaN(d) && m && !isNaN(y)){
          var max = diasEnMesNumber(y, parseInt(m, 10));
          if(d >= 1 && d <= max){
            var dd = (d < 10 ? '0' + d : '' + d);
            hidden.value = y + '-' + m + '-' + dd;
            quitarError(hidden);
            return true;
          } else {
            hidden.value = '';
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

      // Limitar el input del día
      bd.setAttribute('min', '1');
      bd.setAttribute('max', '31');
      bd.setAttribute('step', '1');
      bd.addEventListener('input', function(){
        var v = parseInt(bd.value, 10);
        if(isNaN(v)) return;
        if(v < 1) bd.value = '1';
        if(v > 31) bd.value = '31';
      });

      // Limitar el input del año
      by.setAttribute('min', '1900');
      by.setAttribute('max', '2100');
      by.setAttribute('step', '1');
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

  // Ejecutar inicialización cuando el DOM esté listo
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init, false);
  } else {
    init();
  }
})();
