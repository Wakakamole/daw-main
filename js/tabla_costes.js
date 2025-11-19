/*
    Script para generar y mostrar/ocultar la tabla de costes de un folleto
*/

//DEFINICIÓN DE TARIFAS Y DATOS DE ENTRADA

//Costes
const TARIFAS = {
    COSTO_ENVIO: 10.00,
    PAGINAS: [
        { max: 4, precio: 2.00 },   // menos de 5 paginas
        { max: 10, precio: 1.80 },  //entre 5 y 10 paginas
        { max: Infinity, precio: 1.60 } //mas de 10 paginas
    ],
    COLOR: 0.50,
    RESOLUCION_ALTA: 0.20
};

// 
const DATOS_FILAS = Array.from({ length: 15 }, (_, i) => ({
    paginas: i + 1,
    fotos: (i + 1) * 3
}));

const PARAMETROS_COLUMNAS = [
    { esColor: false, esAltaResolucion: false }, // Blanco y negro, <= 300 dpi
    { esColor: false, esAltaResolucion: true },  // Blanco y negro, > 300 dpi
    { esColor: true, esAltaResolucion: false },  // Color, <= 300 dpi
    { esColor: true, esAltaResolucion: true }   // Color, > 300 dpi
];

//FUNCIÓN QUE CALCULA EL COSTE TOTAL
function calcularCosteFolleto(numPaginas, numFotos, esColor, esAltaResolucion) {
    let costeTotal = 0.0;

    let costePaginas = 0.0;
    
    //Numero de paginas
    for (const tarifa of TARIFAS.PAGINAS) {
        if (numPaginas <= tarifa.max) {
            costePaginas = numPaginas * tarifa.precio;
            break;
        }
    }
    costeTotal += costePaginas;

    //Color (0.5 €/foto)
    if (esColor) {
        costeTotal += numFotos * TARIFAS.COLOR;
    }

    //Si es resolucion alta (0.2 €/foto)
    if (esAltaResolucion) {
        costeTotal += numFotos * TARIFAS.RESOLUCION_ALTA;
    }

    costeTotal += TARIFAS.COSTO_ENVIO;  //Le sumamos el coste de envío
    
    // Devuelvo el precio con 2 decimales
    return parseFloat(costeTotal.toFixed(2));
}


//FUNCION QUE GENERA LA TABLA (usando DOM nodo a nodo)
function generarTablaCostes(container) {
    
    const title = document.createElement('p');  // Título de la tabla
    
    // Creo la talba
    const table = document.createElement('table');
    table.setAttribute('id', 'tabla-costes-generada');
    
    //THEAD
    const thead = document.createElement('thead');
    const headerRow1 = document.createElement('tr'); 
    const headerRow2 = document.createElement('tr'); 

    //celdas principales
    const headers = [
        { text: 'Número de páginas', rowspan: 2 },
        { text: 'Número de fotos', rowspan: 2 }
    ];

    headers.forEach(h => {
        let th = document.createElement('th');
        th.setAttribute('rowspan', h.rowspan.toString());
        th.appendChild(document.createTextNode(h.text));
        headerRow1.appendChild(th);
    });

    // Celdas fusionadas (Blanco y negro | Color)
    const colorHeaders = [
        { text: 'Blanco y negro', colspan: 2 },
        { text: 'Color', colspan: 2 }
    ];

    colorHeaders.forEach(ch => {
        let th = document.createElement('th');
        th.setAttribute('colspan', ch.colspan.toString());
        th.appendChild(document.createTextNode(ch.text));
        headerRow1.appendChild(th);
    });
    
    thead.appendChild(headerRow1);

    const dpiHeaders = ['150-300 dpi', '450-900 dpi', '150-300 dpi', '450-900 dpi'];
    dpiHeaders.forEach(dh => {
        let th = document.createElement('th');
        th.appendChild(document.createTextNode(dh));
        headerRow2.appendChild(th);
    });
    
    thead.appendChild(headerRow2);
    table.appendChild(thead);

    //TBODY
    const tbody = document.createElement('tbody');

    DATOS_FILAS.forEach(data => {
        const row = document.createElement('tr');
        
        //numero de páginas
        let tdPaginas = document.createElement('td');
        tdPaginas.appendChild(document.createTextNode(data.paginas));
        row.appendChild(tdPaginas);

        //nmero de fotos
        let tdFotos = document.createElement('td');
        tdFotos.appendChild(document.createTextNode(data.fotos));
        row.appendChild(tdFotos);

        //Celdas de los costes
        PARAMETROS_COLUMNAS.forEach(params => {
            const coste = calcularCosteFolleto(
                data.paginas, 
                data.fotos, 
                params.esColor, 
                params.esAltaResolucion
            );

            let tdCoste = document.createElement('td');
            // Formatear a € con dos decimales (reemplazando . por ,) (chatgpt)
            const costeFormateado = `${coste.toFixed(2).replace('.', ',')} €`;
            tdCoste.appendChild(document.createTextNode(costeFormateado)); 
            row.appendChild(tdCoste);
        });

        tbody.appendChild(row);
    });

    table.appendChild(tbody);

    //Añadir la nueva tabla
    container.innerHTML = '';   //Limpiar por si ya existía una tabla cuando se oculta y muestra
    container.appendChild(title);
    container.appendChild(table);
}


//FUNCIONALIDAD DE MOSTRAR/OCULTAR
function toggleTableVisibility() {
    const container = document.getElementById('tableContainer');
    const button = document.getElementById('mostrarTabla');

    if (container.style.display === 'none') {
        // Mostrar la tabla
        container.style.display = 'block'; 
        button.textContent = 'Ocultar Tabla de Costes';
        
        // Generar la tabla solo la primera vez que se muestre
        if (!document.getElementById('tabla-costes-generada')) {
            generarTablaCostes(container);
        }
    } else {
        // Ocultar la tabla
        container.style.display = 'none';
        button.textContent = 'Mostrar Tabla de Costes';
    }
}

//INICIALIZACIÓN DEL SCRIPT
function init() {
    const button = document.getElementById('mostrarTabla');
    if (button) {
        button.addEventListener('click', toggleTableVisibility);
    }
}

document.addEventListener('DOMContentLoaded', init);