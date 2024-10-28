// Variables globales
const HORARIO_APERTURA = 9;
const HORARIO_CIERRE = 17;
const MAX_CLIENTES_SIMULTANEOS = 4;
let turnosReservados = [];

//anuncio inicio
let mensajes = [
    "NO TE QUEDES SIN TU TURNO PARA ESTAS FIESTAS!",
    "APROVECHA NUESTROS DESCUENTOS DE FIN DE AÑO!",
    "RESERVA TU TURNO AHORA Y LUCI INCREIBLE!"
];

let i = 0;
let anuncio = document.getElementById('anuncio');

function cambiarMensaje() {
    anuncio.textContent = mensajes[i];
    i = (i + 1) % mensajes.length; // Vuelve al primer mensaje al finalizar
}

cambiarMensaje();
setInterval(cambiarMensaje, 5000);

// carrusel 
let carrusel = document.querySelector('.carrusel');
let index = 0;

function mostrarSiguienteImagen() {
    const slides = carrusel.children.length - 2; // Restamos las 2 imágenes duplicadas
    index = (index + 2) % slides;
    carrusel.style.transform = `translateX(-${index * 50}%)`;
    
    // Si llegamos a las imágenes duplicadas
    if (index >= slides - 2) {
        // Esperamos a que termine la transición
        setTimeout(() => {
            carrusel.style.transition = 'none';
            index = 0;
            carrusel.style.transform = `translateX(0)`;
            setTimeout(() => {
                carrusel.style.transition = 'transform 1s ease-in-out';
            }, 50);
        }, 1000);
    }
}

setInterval(mostrarSiguienteImagen, 4000);

// Función para actualizar precios
function actualizarPrecios() {
    const serviciosSeleccionados = document.querySelectorAll('input[name="servicios"]:checked');
    let total = 0;
    let resumenHTML = '';

    serviciosSeleccionados.forEach(checkbox => {
        const precio = parseInt(checkbox.dataset.precio);
        const nombreServicio = checkbox.nextElementSibling.textContent.split('-')[0].trim();
        total += precio;
        resumenHTML += `
            <div class="servicio-seleccionado">
                <span>${nombreServicio}</span>
                <span>$${precio.toLocaleString()}</span>
            </div>
        `;
    });

    const sena = total * 0.2;

    document.getElementById('servicios-seleccionados').innerHTML = resumenHTML;
    document.getElementById('precio-total').textContent = `$${total.toLocaleString()}`;
    document.getElementById('precio-sena').textContent = `$${sena.toLocaleString()}`;
}

// Función para calcular duración total
function calcularDuracionTotal() {
    const serviciosSeleccionados = document.querySelectorAll('input[name="servicios"]:checked');
    let duracionTotal = 0;
    
    serviciosSeleccionados.forEach(servicio => {
        const grupoServicio = servicio.closest('.servicios-grupo').querySelector('h4').textContent;
        if (grupoServicio.includes('Coloración')) {
            duracionTotal += 240; // 4 horas para servicios de color
        } else {
            duracionTotal += 60; // 1 hora para otros servicios
        }
    });
    
    return duracionTotal;
}

// Función para generar horarios disponibles
function generarHorariosDisponibles(fecha) {
    const listaHorarios = document.getElementById('lista-horarios');
    const duracionTurno = calcularDuracionTotal();
    
    if (duracionTurno === 0) {
        listaHorarios.innerHTML = '<p>Por favor selecciona al menos un servicio</p>';
        return;
    }

    let horariosHTML = [];
    
    for (let hora = HORARIO_APERTURA; hora < HORARIO_CIERRE; hora++) {
        const horaStr = hora.toString().padStart(2, '0') + ':00';
        const finTurno = hora + (duracionTurno / 60);
        
        if (finTurno <= HORARIO_CIERRE) {
            const turnosEnEseHorario = turnosReservados.filter(turno => {
                return turno.fecha === fecha && turno.hora === horaStr;
            }).length;

            const disponible = turnosEnEseHorario < MAX_CLIENTES_SIMULTANEOS;
            
            horariosHTML.push(`
                <button class="horario-btn ${disponible ? '' : 'no-disponible'}"
                        ${disponible ? '' : 'disabled'}
                        data-hora="${horaStr}">
                    ${horaStr}
                </button>
            `);
        }
    }

    listaHorarios.innerHTML = horariosHTML.join('');

    document.querySelectorAll('.horario-btn:not(.no-disponible)').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.horario-btn').forEach(b => b.classList.remove('seleccionado'));
            e.target.classList.add('seleccionado');
        });
    });
}

// Event Listeners cuando el documento está listo
document.addEventListener('DOMContentLoaded', () => {
    // Event listeners para los checkboxes de servicios
    document.querySelectorAll('input[name="servicios"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            actualizarPrecios();
            const fechaInput = document.getElementById('fecha-reserva');
            if (fechaInput.value) {
                generarHorariosDisponibles(fechaInput.value);
            }
        });
    });

    // Event listener para el input de fecha
    const fechaInput = document.getElementById('fecha-reserva');
    const hoy = new Date().toISOString().split('T')[0];
    fechaInput.min = hoy;
    
    fechaInput.addEventListener('change', () => {
        generarHorariosDisponibles(fechaInput.value);
    });
});

