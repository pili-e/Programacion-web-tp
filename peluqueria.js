// FUNCIONES BASICAS Y VARIABLES

let HORARIO_APERTURA = 9;
let HORARIO_CIERRE = 17;
MAX_CLIENTES_SIMULTANEOS = 4;
let turnosIniciales = [
    {
        id: "RES-001",
        nombre: "María García",
        fecha: "2024-12-15",
        hora: "09:00",
        servicios: [{nombre: "Corte", valor: "corte", precio: 14000}],
        duracion: 60
    },
    {
        id: "RES-002",
        nombre: "Laura Pérez",
        fecha: "2024-12-15",
        hora: "10:00",
        servicios: [{nombre: "Coloración", valor: "cambio-color", precio: 80000}],
        duracion: 240
    }
];  //ejemplos de turnos reservados
let turnosReservados = JSON.parse(localStorage.getItem('turnosReservados')) || turnosIniciales; //inicializo la variable con los turnos ya reservados

function generarIdReserva() {
    const fecha = new Date();
    const random = Math.floor(Math.random() * 1000);
    return `RES-${fecha.getFullYear()}${(fecha.getMonth() + 1).toString().padStart(2, '0')}${random}`;
}

// fecha en reservar y modificar turno
function configurarInputFecha(inputId) {
    flatpickr(`#${inputId}`, {
        locale: 'es',
        minDate: 'today',
        dateFormat: 'Y-m-d',
        disable: [
            function(date) {
                return (date.getDay() === 0); 
            }
        ],
        onChange: function(selectedDates, dateStr) {
            if (dateStr) {
                generarHorariosDisponibles(dateStr);
            }
        }
    });
}

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
    i = (i + 1) % mensajes.length; 
}
cambiarMensaje();
setInterval(cambiarMensaje, 5000);

// carrusel 
let carrusel = document.querySelector('.carrusel');
if (carrusel) {
    const slides = carrusel.innerHTML;
    carrusel.innerHTML = slides + slides;

    let position = 0;
    const slideWidth = 40;

    function moverCarrusel() {
        position -= slideWidth;
        carrusel.style.transition = 'transform 1s ease-in-out';
        carrusel.style.transform = `translateX(${position}%)`;
        if (position <= -slideWidth * (carrusel.children.length / 2)) {
            setTimeout(() => {
                carrusel.style.transition = 'none';
                position = 0;
                carrusel.style.transform = `translateX(${position}%)`;
            }, 1000);
        }
    }

    setInterval(moverCarrusel, 4000);
}

function guardarTurno(turno) {
    const turnosGuardados = JSON.parse(localStorage.getItem('turnosReservados')) || [];
    turnosGuardados.push(turno);
    localStorage.setItem('turnosReservados', JSON.stringify(turnosGuardados));
} 

function recuperarDatosFormularioGuardado() {
    const formularioReserva = document.getElementById('form-reservar');
    if (!formularioReserva) return;

    const nombreInput = document.getElementById('nombre-reserva');
    const fechaInput = document.getElementById('fecha-reserva');
    const serviciosInputs = document.querySelectorAll('input[name="servicios"]');

    // recupero
    const datosGuardados = JSON.parse(localStorage.getItem('datosFormulario') || '{}');

    // solo establecer valores si los elementos existen
    if (nombreInput && datosGuardados.nombre) {
        nombreInput.value = datosGuardados.nombre;
    }
    
    if (fechaInput && datosGuardados.fecha) {
        fechaInput.value = datosGuardados.fecha;
    }

    if (datosGuardados.servicios) {
        serviciosInputs.forEach(input => {
            if (datosGuardados.servicios.includes(input.value)) {
                input.checked = true;
            }
        });
    }
}

function actualizarPrecios() {
    const precioTotal = document.getElementById('precio-total');
    if (!precioTotal) return;

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

function configurarInputFecha(inputId) {
    const fechaInput = document.getElementById(inputId);
    if (!fechaInput) return;

    // configuracion del calendario
    flatpickr(fechaInput, {
        locale: 'es',
        dateFormat: "y-m-d",
        minDate: "today",
        maxDate: new Date().fp_incr(180),
        disable: [
            function(date) {
                return date.getDay() === 0; 
            }
        ],
        onChange: function(selectedDates, dateStr) {
            if (window.horaSeleccionada) {
                generarHorariosDisponibles(dateStr, window.horaSeleccionada);
            } else {
                generarHorariosDisponibles(dateStr);
            }
        },
        disableMobile: false,
        static: true,
        animate: true,                    
        monthSelectorType: 'static',      
        showMonths: 1,                    
        prevArrow: '<svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path></svg>',  
        nextArrow: '<svg viewBox="0 0 24 24"><path d="M8.59 7.41L10 6l6 6-6 6-1.41-1.41L13.17 12z"></path></svg>',
    });
}

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

function seleccionarHorario(boton, hora) {
    document.querySelectorAll('.horario-btn').forEach(btn => {
        btn.classList.remove('seleccionado');
    });
    
    boton.classList.add('seleccionado');
    window.horaSeleccionada = boton.dataset.hora;
    if (document.getElementById('form-reservar')) { 
        guardarDatosFormulario();
    }
}

function generarHorariosDisponibles(fecha, horaPrevia = null) {
    const listaHorarios = document.getElementById('lista-horarios');
    if (!listaHorarios) return;
    const duracionTurno = calcularDuracionTotal();
    
    if (duracionTurno === 0) {
        listaHorarios.innerHTML = '<p>Por favor selecciona al menos un servicio</p>';
        return;
    }

    let horariosHTML = [];
    
    const esModificarTurno = window.location.pathname.includes('modificar-turno.html');
    
    for (let hora = HORARIO_APERTURA; hora < HORARIO_CIERRE; hora++) {
        const horaStr = hora.toString().padStart(2, '0') + ':00';
        const finTurno = hora + (duracionTurno / 60);
        
        if (finTurno <= HORARIO_CIERRE) {
            const turnosEnEseHorario = turnosReservados.filter(turno => {
                return turno.fecha === fecha && turno.hora === horaStr;
            }).length;

            const disponible = turnosEnEseHorario < MAX_CLIENTES_SIMULTANEOS;
      
            const esHoraPrevia = esModificarTurno && horaPrevia === horaStr;
            
            horariosHTML.push(`
                <button type="button" 
                        class="horario-btn ${disponible ? '' : 'no-disponible'} ${esHoraPrevia ? 'seleccionado' : ''}"
                        ${disponible ? '' : 'disabled'}
                        onclick="seleccionarHorario(this, '${horaStr}')"
                        data-hora="${horaStr}">
                    ${horaStr}
                </button>
            `);
        }
    }

    listaHorarios.innerHTML = horariosHTML.join('');

    if (esModificarTurno && horaPrevia) {
        window.horaSeleccionada = horaPrevia;
        setTimeout(() => {
            const horaBtn = document.querySelector(`[data-hora="${horaPrevia}"]`);
            if (horaBtn && !horaBtn.disabled) {
                horaBtn.classList.add('seleccionado');
            }
        }, 100);
    }
}

function guardarDatosFormulario() {
    const formularioReserva = document.getElementById('form-reservar');
    if (!formularioReserva) return;

    const nombreInput = document.getElementById('nombre-reserva');
    const fechaInput = document.getElementById('fecha-reserva');
    const serviciosInputs = document.querySelectorAll('input[name="servicios"]:checked');

    if (nombreInput && fechaInput) {
        const datosFormulario = {
            nombre: nombreInput.value,
            fecha: fechaInput.value,
            servicios: Array.from(serviciosInputs).map(input => input.value)
        };

        localStorage.setItem('datosFormulario', JSON.stringify(datosFormulario));
    }
}

function recuperarDatosFormulario() {
    // recuperar servicios
    const servicios = JSON.parse(sessionStorage.getItem('servicios') || '[]');
    servicios.forEach(servicio => {
        const checkbox = document.querySelector(`input[value="${servicio}"]`);
        if (checkbox) checkbox.checked = true;
    });

    // recuperar fecha
    const fecha = sessionStorage.getItem('fecha');
    if (fecha) {
        document.getElementById('fecha-reserva').value = fecha;
        generarHorariosDisponibles(fecha);
    }

    // recuperar hora
    const hora = sessionStorage.getItem('hora');
    if (hora) {
        setTimeout(() => {
            const botonHora = document.querySelector(`[data-hora="${hora}"]`);
            if (botonHora) botonHora.classList.add('seleccionado');
        }, 100);
    }

    // recuperar nombre 
    const nombre = sessionStorage.getItem('nombre');
    if (nombre) {
        const nombreInput = document.getElementById('nombre-reserva');
        if (nombreInput) nombreInput.value = nombre;
    }

    // actualizar precios si hay servicios seleccionados
    if (servicios.length > 0) {
        actualizarPrecios();
    }
}

function guardarModificaciones(idReserva) {
    const reservaIndex = turnosReservados.findIndex(turno => turno.id === idReserva);
    if (reservaIndex === -1) return false;
    const serviciosSeleccionados = Array.from(document.querySelectorAll('input[name="servicios"]:checked'))
        .map(checkbox => ({
            nombre: checkbox.nextElementSibling.textContent.split('-')[0].trim(),
            valor: checkbox.value,
            precio: parseInt(checkbox.dataset.precio)
        }));
    const fecha = document.getElementById('fecha-modificar').value;
    const hora = document.querySelector('.horario-btn.seleccionado')?.dataset.hora;
    if (!fecha || !hora || serviciosSeleccionados.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos incompletos',
            text: 'Por favor completa todos los campos requeridos',
            confirmButtonColor: '#726E60',
            confirmButtonText: 'Entendido'
        });
        return false;
    }
    turnosReservados[reservaIndex] = {
        ...turnosReservados[reservaIndex],
        fecha: fecha,
        hora: hora,
        servicios: serviciosSeleccionados,
        duracion: calcularDuracionTotal()
    };
    localStorage.setItem('turnosReservados', JSON.stringify(turnosReservados));
    return true;
}

function modificarTurno(idReserva) {
    const turnoIndex = turnosReservados.findIndex(turno => turno.id === idReserva);
    
    if (turnoIndex === -1) {
        Swal.fire({
            icon: 'error',
            title: 'Turno no encontrado',
            text: 'No se encontró ningún turno con ese número de reserva. Por favor, verifica el número ingresado.',
            confirmButtonColor: '#726E60',
            confirmButtonText: 'Intentar nuevamente'
        });
        return false;
    }

    const serviciosSeleccionados = Array.from(document.querySelectorAll('input[name="servicios"]:checked'))
        .map(checkbox => ({
            nombre: checkbox.nextElementSibling.textContent.split('-')[0].trim(),
            valor: checkbox.value,
            precio: parseInt(checkbox.dataset.precio)
        }));

    if (serviciosSeleccionados.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos incompletos',
            text: 'Debes seleccionar al menos un servicio',
            confirmButtonColor: '#726E60',
            confirmButtonText: 'Completar campos'
        });
        return false;
    }

    const nuevaFecha = document.getElementById('fecha-modificar').value;
    const nuevoHorario = document.querySelector('.horario-btn.seleccionado')?.dataset.hora;
    const turnoActual = turnosReservados[turnoIndex];

    turnosReservados[turnoIndex] = {
        ...turnoActual,
        fecha: nuevaFecha || turnoActual.fecha,
        hora: nuevoHorario || turnoActual.hora,
        servicios: serviciosSeleccionados,
        duracion: calcularDuracionTotal(serviciosSeleccionados)
    };

    localStorage.setItem('turnosReservados', JSON.stringify(turnosReservados));
    return true;
} // buscar y modificar un turno existente

function buscarTurnoPorId(id) {
    return turnosReservados.find(turno => turno.id === id);
}

function mostrarDetallesTurno(turno) {
    const infoTurno = document.getElementById('info-turno');
    if (!infoTurno) return;

    infoTurno.innerHTML = `
        <p><strong>Fecha:</strong> ${turno.fecha}</p>
        <p><strong>Hora:</strong> ${turno.hora}</p>
        <p><strong>Servicios:</strong></p>
        <ul>
            ${turno.servicios.map(servicio => 
                `<li>${servicio.nombre} - $${servicio.precio}</li>`
            ).join('')}
        </ul>
    `;
    document.getElementById('detalles-turno').style.display = 'block';
}

function cancelarTurno(id) {
    const turnoIndex = turnosReservados.findIndex(turno => turno.id === id);
    if (turnoIndex === -1) return false;

    turnosReservados.splice(turnoIndex, 1);

    localStorage.setItem('turnosReservados', JSON.stringify(turnosReservados));
    return true;
}

function validarFechaVencimiento(fecha) {
    const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!regex.test(fecha)) return false;
    
    const [mes, ano] = fecha.split('/');
    const fechaActual = new Date();
    const anoActual = fechaActual.getFullYear() % 100;
    const mesActual = fechaActual.getMonth() + 1;
    
    const anoTarjeta = parseInt(ano);
    const mesTarjeta = parseInt(mes);
    
    return (anoTarjeta > anoActual) || 
           (anoTarjeta === anoActual && mesTarjeta >= mesActual);
}

// validacion datos pago tarjeta
function validarNumeroTarjeta(numero) {
    return /^\d{16}$/.test(numero);
}

function validarCVV(cvv) {
    return /^\d{3}$/.test(cvv);
}

function validarNombreTarjeta(nombre) {
    return /^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]{3,50}$/.test(nombre);
}

function formatearFechaInput(input) {
    let valor = input.value.replace(/\D/g, '');
    if (valor.length >= 2) {
        valor = valor.slice(0,2) + '/' + valor.slice(2);
    }
    input.value = valor.slice(0,5);
}

function formatearNumeroTarjeta(input) {
    let valor = input.value.replace(/\D/g, '');
    input.value = valor.slice(0,16);
}




// FUNCIONES HANDLE: sirven de apoyo para el listener, dividen las acciones por tarea
function handlePagoClick() {
    const nombre = document.getElementById('nombre-reserva')?.value;
    if (!nombre) {
        Swal.fire({
            icon: 'warning',
            title: 'Campo requerido',
            text: 'Por favor, ingresa tu nombre y apellido para continuar con la reserva',
            confirmButtonColor: '#726E60',
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    const serviciosSeleccionados = document.querySelectorAll('input[name="servicios"]:checked');
    if (serviciosSeleccionados.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Selección requerida',
            text: 'Por favor, selecciona al menos un servicio para poder continuar con la reserva',
            confirmButtonColor: '#726E60',
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    const fecha = document.getElementById('fecha-reserva')?.value;
    if (!fecha) {
        Swal.fire({
            icon: 'warning',
            title: 'Fecha requerida',
            text: 'Por favor, selecciona una fecha para tu turno antes de continuar',
            confirmButtonColor: '#726E60',
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    if (!window.horaSeleccionada) {
        Swal.fire({
            icon: 'warning',
            title: 'Horario requerido',
            text: 'Por favor, selecciona un horario disponible para tu turno',
            confirmButtonColor: '#726E60',
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    const total = Array.from(serviciosSeleccionados)
        .reduce((sum, servicio) => sum + parseInt(servicio.dataset.precio), 0);
    const sena = total * 0.2;
    const idReserva = generarIdReserva();

    const turnoActual = {
        id: idReserva,
        nombre: nombre,
        fecha: fecha,
        hora: window.horaSeleccionada,
        servicios: Array.from(serviciosSeleccionados).map(s => ({
            nombre: s.nextElementSibling.textContent.split('-')[0].trim(),
            precio: parseInt(s.dataset.precio)
        })),
        total: total,
        sena: sena,
        estado: 'pendiente'
    };

    const turnosGuardados = JSON.parse(localStorage.getItem('turnosReservados') || '[]');
    turnosGuardados.push(turnoActual);
    localStorage.setItem('turnosReservados', JSON.stringify(turnosGuardados));

    const infoPago = document.getElementById('info-pago');
    const montoSena = document.getElementById('monto-sena');
    const numeroReserva = document.getElementById('numero-reserva');
    const reservaExitosa = document.getElementById('reserva-exitosa');
    const btnPago = document.getElementById('btn-pago');
    
    if (infoPago && montoSena) {
        montoSena.textContent = `$${sena.toLocaleString()}`;
        infoPago.style.display = 'block';
        if (numeroReserva && reservaExitosa) {
            numeroReserva.textContent = idReserva;
            reservaExitosa.style.display = 'block';
        }
        btnPago.textContent = 'Turno Reservado - Pendiente de Pago';
        btnPago.disabled = true;
    }

    Swal.fire({
        icon: 'success',
        title: '¡Turno reservado con éxito!',
        html: `
            <p>Tu número de reserva es: <strong>${idReserva}</strong></p>
            <p class="text-muted small">Guarda este número, lo necesitarás para modificar o cancelar tu turno</p>
        `,
        confirmButtonColor: '#726E60'
    });
}

function handleContinuarPago(e) {
    e.preventDefault();
    
    // obtengo los datos necesarios
    const nombre = document.getElementById('nombre-reserva').value;
    const fecha = document.getElementById('fecha-reserva').value;
    const serviciosSeleccionados = document.querySelectorAll('input[name="servicios"]:checked');
    
    // valido que todos los campos esten completos
    if (!nombre || !fecha || serviciosSeleccionados.length === 0 || !window.horaSeleccionada) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos incompletos',
            text: 'Por favor, asegurate de completar todos los campos requeridos antes de continuar',
            confirmButtonColor: '#726E60',
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    // preparo los datos de los servicios
    const servicios = Array.from(serviciosSeleccionados).map(checkbox => ({
        nombre: checkbox.nextElementSibling.textContent.split('-')[0].trim(),
        valor: checkbox.value,
        precio: parseInt(checkbox.dataset.precio)
    }));

    // calculo totales
    const total = servicios.reduce((sum, servicio) => sum + servicio.precio, 0);
    const sena = total * 0.2;
    
    // genero ID reserva
    const idReserva = generarIdReserva();

    // crear objeto con todos los datos del turno
    const turnoTemporal = {
        id: idReserva,
        nombre: nombre,
        fecha: fecha,
        hora: window.horaSeleccionada,
        servicios: servicios,
        total: total,
        sena: sena
    };

    // guardo en localStorage 
    localStorage.setItem('turnoTemporal', JSON.stringify(turnoTemporal));
    window.location.href = 'confirmar-pago.html';
}

function handleSubmitPago(e) {
    e.preventDefault();
    
    const numeroTarjeta = document.getElementById('numero-tarjeta').value.replace(/\s/g, '');
    const fechaVencimiento = document.getElementById('fecha-vencimiento').value;
    const cvv = document.getElementById('cvv').value;
    const nombreTarjeta = document.getElementById('nombre-tarjeta').value;

    let errores = [];

    if (!validarNumeroTarjeta(numeroTarjeta)) {
        errores.push('El número de tarjeta debe tener 16 dígitos numéricos');
    }

    if (!validarFechaVencimiento(fechaVencimiento)) {
        errores.push('La fecha de vencimiento no es válida o está expirada');
    }

    if (!validarCVV(cvv)) {
        errores.push('El código de seguridad debe tener 3 dígitos numéricos');
    }

    if (!validarNombreTarjeta(nombreTarjeta)) {
        errores.push('El nombre en la tarjeta solo debe contener letras y espacios');
    }

    if (errores.length > 0) {
        Swal.fire({
            icon: 'error',
            title: 'Error en el formulario',
            html: errores.join('<br>'),
            confirmButtonColor: '#726E60'
        });
        return;
    }

    const turnoTemporal = JSON.parse(localStorage.getItem('turnoTemporal'));
    if (turnoTemporal) {
        const btnPagar = e.target.querySelector('button[type="submit"]');
        btnPagar.disabled = true;
        btnPagar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Procesando...';

        setTimeout(() => {
            guardarTurno(turnoTemporal);
            Swal.fire({
                icon: 'success',
                title: '¡Pago exitoso!',
                text: 'Tu turno ha sido confirmado. ¡Muchas gracias por confiar en nosotros!',
                confirmButtonColor: '#726E60'
            }).then(() => {
                localStorage.removeItem('turnoTemporal');
                window.location.href = 'index.html';
            });
        }, 2000);
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se encontró información del turno. Por favor, intenta realizar la reserva nuevamente.',
            confirmButtonColor: '#726E60'
        }).then(() => {
            window.location.href = 'reservar-turno.html';
        });
    }
}

function handleBuscarTurno() {
    const idReserva = document.getElementById('id-reserva').value;
    const turnosGuardados = JSON.parse(localStorage.getItem('turnosReservados')) || [];
    const turnoEncontrado = turnosGuardados.find(turno => turno.id === idReserva);

    if (turnoEncontrado && turnoEncontrado.servicios) {
        document.getElementById('modificar-detalles').style.display = 'block';
        document.getElementById('resumen-turno-actual').style.display = 'block';
        
        // mostrar resumen del turno actual
        document.getElementById('resumen-turno-actual').innerHTML = `
            <h4>Detalles del Turno Actual</h4>
            <p><strong>Número de Reserva:</strong> ${turnoEncontrado.id}</p>
            <p><strong>Nombre:</strong> ${turnoEncontrado.nombre}</p>
            <p><strong>Fecha:</strong> ${turnoEncontrado.fecha}</p>
            <p><strong>Hora:</strong> ${turnoEncontrado.hora}</p>
            <p><strong>Servicios:</strong></p>
            <ul>
                ${turnoEncontrado.servicios.map(s => `
                    <li>${s.nombre} - $${s.precio.toLocaleString()}</li>
                `).join('')}
            </ul>
            <p class="fw-bold">Total: $${turnoEncontrado.servicios.reduce((sum, s) => sum + s.precio, 0).toLocaleString()}</p>
        `;

        // preseleccionar servicios existentes
        document.querySelectorAll('input[name="servicios"]').forEach(checkbox => {
            const servicioEncontrado = turnoEncontrado.servicios.some(s => 
                s.valor === checkbox.value || // para turnos modificados
                s.nombre.toLowerCase().includes(checkbox.value.replace('-', ' ')) // para turnos nuevos
            );
            checkbox.checked = servicioEncontrado;
        });

        // establecer fecha y generar horarios
        const fechaInput = document.getElementById('fecha-modificar');
        if (fechaInput) {
            fechaInput._flatpickr.setDate(turnoEncontrado.fecha);
            window.horaSeleccionada = turnoEncontrado.hora;
            generarHorariosDisponibles(turnoEncontrado.fecha, turnoEncontrado.hora);
        }

        actualizarPrecios();

    } else {
        // si no se encuentra el turno
        Swal.fire({
            icon: 'error',
            title: 'Turno no encontrado',
            text: 'No se encontró ningún turno con ese número de reserva. Por favor, verifica el número ingresado o asegurate de que el turno no haya sido cancelado.',
            confirmButtonColor: '#726E60',
            confirmButtonText: 'Aceptar'
        });
    }
}

function handleConfirmarModificacion() {
    const idReserva = document.getElementById('id-reserva').value;
    const fechaNueva = document.getElementById('fecha-modificar').value;
    const serviciosSeleccionados = document.querySelectorAll('input[name="servicios"]:checked');

    // validar que haya servicios seleccionados
    if (serviciosSeleccionados.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Selección requerida',
            text: 'Por favor, selecciona al menos un servicio',
            confirmButtonColor: '#726E60',
            confirmButtonText: 'Aceptar'
        });
        return false;
    }

    // validar que haya fecha seleccionada
    if (!fechaNueva) {
        Swal.fire({
            icon: 'warning',
            title: 'Fecha requerida',
            text: 'Por favor, selecciona una fecha para el turno',
            confirmButtonColor: '#726E60',
            confirmButtonText: 'Aceptar'
        });
        return false;
    }

    // validar que haya horario seleccionado
    if (!window.horaSeleccionada) {
        Swal.fire({
            icon: 'warning',
            title: 'Horario requerido',
            text: 'Por favor, selecciona un horario disponible',
            confirmButtonColor: '#726E60',
            confirmButtonText: 'Aceptar'
        });
        return false;
    }

    // obtener los turnos guardados
    const turnosGuardados = JSON.parse(localStorage.getItem('turnosReservados')) || [];
    const turnoIndex = turnosGuardados.findIndex(turno => turno.id === idReserva);

    if (turnoIndex !== -1) {
        const serviciosNuevos = Array.from(serviciosSeleccionados).map(checkbox => ({
            nombre: checkbox.nextElementSibling.textContent.split('-')[0].trim(),
            valor: checkbox.value,
            precio: parseInt(checkbox.dataset.precio)
        }));

        const totalNuevo = serviciosNuevos.reduce((sum, servicio) => sum + servicio.precio, 0);

        // actualizar el turno
        turnosGuardados[turnoIndex] = {
            ...turnosGuardados[turnoIndex],
            fecha: fechaNueva,
            hora: window.horaSeleccionada,
            servicios: serviciosNuevos,
            total: totalNuevo,
            sena: totalNuevo * 0.2
        };

        // guardar cambios
        localStorage.setItem('turnosReservados', JSON.stringify(turnosGuardados));

        Swal.fire({
            icon: 'success',
            title: '¡Turno modificado!',
            text: 'Tu turno ha sido modificado exitosamente. Te esperamos en la nueva fecha y horario seleccionados.',
            confirmButtonColor: '#726E60',
            confirmButtonText: 'Aceptar'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = 'sacar-turno.html';
            }
        });

        return true;
    } else {
        // si no se encuentra el turno
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo encontrar el turno para modificar. Por favor, intenta nuevamente.',
            confirmButtonColor: '#726E60',
            confirmButtonText: 'Aceptar'
        });
        return false;
    }
}

function handleBuscarTurnoCancelar() {
    const id = document.getElementById('id-reserva-cancelar').value;
    const turno = buscarTurnoPorId(id);
    
    if (turno) {
        // guardar ID 
        window.idTurnoActual = id;
        
        // mostrar detalles turno
        const detallesTurno = document.getElementById('detalles-turno');
        detallesTurno.style.display = 'block';
        
        // actualizo contenido de info-turno
        document.getElementById('info-turno').innerHTML = `
            <div class="mb-3">
                <p><strong>Número de Reserva:</strong> ${turno.id}</p>
                <p><strong>Nombre:</strong> ${turno.nombre}</p>
                <p><strong>Fecha:</strong> ${turno.fecha}</p>
                <p><strong>Hora:</strong> ${turno.hora}</p>
                <p><strong>Servicios:</strong></p>
                <ul>
                    ${turno.servicios.map(s => `
                        <li>${s.nombre} - $${s.precio.toLocaleString()}</li>
                    `).join('')}
                </ul>
                <p class="fw-bold">Total: $${turno.servicios.reduce((sum, s) => sum + s.precio, 0).toLocaleString()}</p>
            </div>
        `;
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Turno no encontrado',
            text: 'No se encontró ningún turno con ese número de reserva. Por favor, verifica el número ingresado.',
            confirmButtonColor: '#726E60',
            confirmButtonText: 'Aceptar'
        });
        document.getElementById('detalles-turno').style.display = 'none';
    }
}

function handleConfirmarCancelacion() {
    // busco y guardo id turno actual
    const idTurnoActual = window.idTurnoActual;
    
    if (!idTurnoActual) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se encontró el turno para cancelar. Por favor, busca el turno nuevamente.',
            confirmButtonColor: '#726E60',
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    // muestro confirmacion antes de cancelar
    Swal.fire({
        title: '¿Estás seguro?',
        text: "¿Deseas cancelar este turno? Esta acción no se puede deshacer.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#726E60',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, cancelar turno',
        cancelButtonText: 'No, mantener turno'
    }).then((result) => {
        if (result.isConfirmed) {
            // cancelacion definitiva
            if (cancelarTurno(idTurnoActual)) {
                Swal.fire({
                    icon: 'success',
                    title: 'Turno cancelado',
                    text: 'Tu turno ha sido cancelado exitosamente. ¡Esperamos verte pronto nuevamente!',
                    confirmButtonColor: '#726E60',
                    confirmButtonText: 'Aceptar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = 'sacar-turno.html';
                    }
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo cancelar el turno. Por favor, intenta nuevamente.',
                    confirmButtonColor: '#726E60',
                    confirmButtonText: 'Aceptar'
                });
            }
        }
    });
}

function generarResumenTurnoHTML(turnoTemporal) {
    if (!turnoTemporal) {
        return `
            <div class="alert alert-danger">
                No se encontró información del turno. Por favor, intenta realizar la reserva nuevamente.
            </div>
        `;
    }

    // generar HTML con los detalles del turno
    return `
        <div class="mb-3">
            <p class="fw-bold">Número de Reserva: <span class="text-danger">${turnoTemporal.id}</span></p>
            <p class="text-muted small">Guarda este número, lo necesitarás para modificar o cancelar tu turno</p>
            
            <div class="mt-4">
                <p><strong>Nombre:</strong> ${turnoTemporal.nombre}</p>
                <p><strong>Fecha:</strong> ${turnoTemporal.fecha}</p>
                <p><strong>Hora:</strong> ${turnoTemporal.hora}</p>
            </div>

            <div class="mt-4">
                <p class="fw-bold mb-2">Servicios seleccionados:</p>
                <ul class="list-unstyled">
                    ${turnoTemporal.servicios.map(servicio => `
                        <li class="mb-1">
                            ${servicio.nombre} - $${servicio.precio.toLocaleString()}
                        </li>
                    `).join('')}
                </ul>
            </div>

            <div class="mt-4 pt-3 border-top">
                <p class="fw-bold mb-2">Resumen de pago:</p>
                <p class="fw-bold">Total: $${turnoTemporal.total.toLocaleString()}</p>
                <p class="fw-bold text-danger">Seña (20%): $${turnoTemporal.sena.toLocaleString()}</p>
                <p class="text-muted small">
                    * La seña corresponde al 20% del valor total y debe ser abonada para confirmar el turno
                </p>
            </div>
        </div>
    `;
}


// LISTENER
document.addEventListener('DOMContentLoaded', function() {
    // detectar la pagina actual
    const currentPath = window.location.pathname;

    // CONFIGURACION INICIAL COMUN
    if (document.getElementById('fecha-reserva')) {
        configurarInputFecha('fecha-reserva');
    }
    if (document.getElementById('fecha-modificar')) {
        configurarInputFecha('fecha-modificar');
    }

    // MANEJO DE SERVICIOS 
    document.querySelectorAll('input[name="servicios"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const formularioReserva = document.getElementById('form-reservar');
            actualizarPrecios();
            
            if (formularioReserva) {
                const fechaInput = document.getElementById('fecha-reserva');
                if (fechaInput?.value) {
                    const horarioSeleccionado = document.querySelector('.horario-btn.seleccionado')?.dataset.hora;
                    generarHorariosDisponibles(fechaInput.value);
                    if (horarioSeleccionado) {
                        document.querySelectorAll('.horario-btn').forEach(btn => {
                            if (btn.dataset.hora === horarioSeleccionado) {
                                btn.classList.add('seleccionado');
                            }
                        });
                    }
                }
                guardarDatosFormulario();
            }
        });
    });

    // INICIALIZACION POR PAGINA
    if (currentPath.includes('reservar-turno.html')) {
        initPaginaReserva();
    } else if (currentPath.includes('modificar-turno.html')) {
        initPaginaModificacion();
    } else if (currentPath.includes('confirmar-pago.html')) {
        initPaginaPago();
    } else if (currentPath.includes('cancelar-turno.html')) {
        initPaginaCancelacion();
    }

    // otros
    const btnBuscarTurnoCancelar = document.getElementById('buscar-turno-cancelar');
    const btnConfirmarCancelacion = document.getElementById('confirmar-cancelacion');

    if (btnBuscarTurnoCancelar) {
        btnBuscarTurnoCancelar.addEventListener('click', handleBuscarTurnoCancelar);
    }

    if (btnConfirmarCancelacion) {
        btnConfirmarCancelacion.addEventListener('click', handleConfirmarCancelacion);
    }

    const fechaVencimiento = document.getElementById('fecha-vencimiento');
    const numeroTarjeta = document.getElementById('numero-tarjeta');
    const cvv = document.getElementById('cvv');
    const formPago = document.getElementById('form-pago');

    if (fechaVencimiento) {
        fechaVencimiento.addEventListener('input', (e) => formatearFechaInput(e.target));
    }

    if (numeroTarjeta) {
        numeroTarjeta.addEventListener('input', (e) => formatearNumeroTarjeta(e.target));
    }

    if (cvv) {
        cvv.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0,3);
        });
    }

    if (formPago) {
        formPago.addEventListener('submit', handleSubmitPago);
    }
});

// funciones de inicializacion usadas en el listener
function initPaginaReserva() {
    recuperarDatosFormulario();
    
    const nombreInput = document.getElementById('nombre-reserva');
    if (nombreInput) {
        nombreInput.addEventListener('input', guardarDatosFormulario);
    }

    const btnPago = document.getElementById('btn-pago');
    if (btnPago) {
        btnPago.addEventListener('click', handlePagoClick);
    }

    const btnContinuarPago = document.getElementById('btn-continuar-pago');
    if (btnContinuarPago) {
        btnContinuarPago.addEventListener('click', handleContinuarPago);
    }
}

function initPaginaModificacion() {
    const btnBuscarTurno = document.getElementById('buscar-turno');
    const btnConfirmarModificacion = document.getElementById('confirmar-modificacion');
    
    if (btnBuscarTurno) {
        btnBuscarTurno.addEventListener('click', handleBuscarTurno);
    }

    if (btnConfirmarModificacion) {
        btnConfirmarModificacion.addEventListener('click', handleConfirmarModificacion);
    }
}

function initPaginaPago() {
    const turnoTemporal = JSON.parse(localStorage.getItem('turnoTemporal'));
    if (turnoTemporal) {
        document.getElementById('resumen-turno').innerHTML = generarResumenTurnoHTML(turnoTemporal);
    }

    const formularioPago = document.getElementById('formulario-pago');
    if (formularioPago) {
        formularioPago.addEventListener('submit', handleSubmitPago);
        initFormatoFecha();
    }
}

function initPaginaCancelacion() {
    let idTurnoActual = '';
    const btnBuscarTurno = document.getElementById('buscar-turno-cancelar');
    const btnConfirmarCancelacion = document.getElementById('confirmar-cancelacion');
    
    if (btnBuscarTurno) {
        btnBuscarTurno.addEventListener('click', () => handleBuscarTurnoCancelar(idTurnoActual));
    }

    if (btnConfirmarCancelacion) {
        btnConfirmarCancelacion.addEventListener('click', () => handleConfirmarCancelacion(idTurnoActual));
    }
}

function initFormatoFecha() {
    const inputFecha = document.querySelector('input[placeholder="MM/AA"]');
    if (inputFecha) {
        inputFecha.addEventListener('input', function(e) {
            let valor = e.target.value.replace(/\D/g, '');
            if (valor.length >= 2) {
                valor = valor.slice(0,2) + '/' + valor.slice(2);
            }
            e.target.value = valor.slice(0,5);
        });
    }
}

