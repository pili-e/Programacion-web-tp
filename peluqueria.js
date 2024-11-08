let HORARIO_APERTURA = 9;
let HORARIO_CIERRE = 17;
let MAX_CLIENTES_SIMULTANEOS = 4;
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
let index = 0;

function mostrarSiguienteImagen() {
    const slides = carrusel.children.length - 2;
    index = (index + 2) % slides;
    carrusel.style.transform = `translateX(-${index * 50}%)`;
    
    if (index >= slides - 2) {
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

// calcular duración total del turno
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

// generar horarios disponibles
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
                <button type="button" class="hora-btn ${disponible ? '' : 'no-disponible'}"
                        ${disponible ? '' : 'disabled'}
                        data-hora="${horaStr}">
                    ${horaStr}
                </button>
            `);
        }
    }

    listaHorarios.innerHTML = horariosHTML.join('');

    // botones de hora
    document.querySelectorAll('.hora-btn:not(.no-disponible)').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.hora-btn').forEach(b => b.classList.remove('seleccionado'));
            this.classList.add('seleccionado');
            window.horaSeleccionada = this.dataset.hora;
        });
    });
}

// guardar y recuperar datos del formulario
function guardarDatosFormulario() {
    // guardar servicios seleccionados
    const serviciosSeleccionados = Array.from(document.querySelectorAll('input[name="servicios"]:checked'))
        .map(checkbox => checkbox.value);
    sessionStorage.setItem('servicios', JSON.stringify(serviciosSeleccionados));

    // guardar fecha y hora
    const fecha = document.getElementById('fecha-reserva').value;
    const hora = document.querySelector('.horario-btn.seleccionado')?.dataset.hora;
    sessionStorage.setItem('fecha', fecha);
    if (hora) sessionStorage.setItem('hora', hora);

    // guardar nombre si existe
    const nombre = document.getElementById('nombre-reserva')?.value;
    if (nombre) sessionStorage.setItem('nombre', nombre);
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


document.addEventListener('DOMContentLoaded', () => {
    recuperarDatosFormulario();
    document.querySelectorAll('input[name="servicios"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            actualizarPrecios();
            const fechaInput = document.getElementById('fecha-reserva');
            if (fechaInput.value) {
                generarHorariosDisponibles(fechaInput.value);
            }
            guardarDatosFormulario();
        });
    });

    const fechaInput = document.getElementById('fecha-reserva');
    const hoy = new Date().toISOString().split('T')[0];
    fechaInput.min = hoy;
    
    fechaInput.addEventListener('change', () => {
        generarHorariosDisponibles(fechaInput.value);
        guardarDatosFormulario();
    });

    const nombreInput = document.getElementById('nombre-reserva');
    if (nombreInput) {
        nombreInput.addEventListener('input', guardarDatosFormulario);
    }

    if (window.location.pathname.includes('confirmar-pago.html')) {
        const turnoTemporal = JSON.parse(localStorage.getItem('turnoTemporal'));
        if (turnoTemporal) {
            document.getElementById('resumen-turno').innerHTML = `
                <p><strong>Nombre:</strong> ${turnoTemporal.nombre}</p>
                <p><strong>Fecha:</strong> ${turnoTemporal.fecha}</p>
                <p><strong>Hora:</strong> ${turnoTemporal.hora}</p>
                <p><strong>Servicios:</strong></p>
                <ul>
                    ${turnoTemporal.servicios.map(s => `
                        <li>${s.nombre} - $${s.precio}</li>
                    `).join('')}
                </ul>
            `;
            document.getElementById('total-turno').innerHTML = `
                <p><strong>Total:</strong> $${turnoTemporal.total}</p>
            `;
            document.getElementById('monto-sena').textContent = `$${turnoTemporal.sena}`;
            document.getElementById('numero-reserva').textContent = turnoTemporal.id;
        }
    }
});

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('horario-btn')) {
        e.preventDefault(); 
        guardarDatosFormulario();
    }
});

function buscarReserva(id) {
    return turnosReservados.find(turno => turno.id === id);
}

// cargar los datos de la reserva encontrada
function cargarDatosReserva(reserva) {
    if (!reserva) {
        alert('No se encontró la reserva');
        return false;
    }

    document.getElementById('modificar-detalles').style.display = 'block';

    document.querySelectorAll('input[name="servicios"]').forEach(checkbox => {
        checkbox.checked = reserva.servicios.some(s => s.valor === checkbox.value);
    });

    const fechaInput = document.getElementById('fecha-modificar');
    fechaInput.value = reserva.fecha;
    generarHorariosDisponibles(reserva.fecha);

    actualizarPrecios();

    return true;
}

// guardar las modificaciones
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
        alert('Por favor completa todos los campos');
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

// buscar y modificar un turno existente
function modificarTurno(idReserva) {
    const turnoIndex = turnosReservados.findIndex(turno => turno.id === idReserva);
    
    if (turnoIndex === -1) {
        alert('No se encontró el turno con ese ID');
        return false;
    }

    const serviciosSeleccionados = Array.from(document.querySelectorAll('input[name="servicios"]:checked'))
        .map(checkbox => ({
            nombre: checkbox.nextElementSibling.textContent.split('-')[0].trim(),
            valor: checkbox.value,
            precio: parseInt(checkbox.dataset.precio)
        }));

    const nuevaFecha = document.getElementById('fecha-modificar').value;
    const nuevoHorario = document.querySelector('.horario-btn.seleccionado')?.dataset.hora;

    if (!nuevaFecha || !nuevoHorario || serviciosSeleccionados.length === 0) {
        alert('Por favor completa todos los campos');
        return false;
    }

    // actualizar el turno
    turnosReservados[turnoIndex] = {
        ...turnosReservados[turnoIndex], // mantener el ID y nombre original
        fecha: nuevaFecha,
        hora: nuevoHorario,
        servicios: serviciosSeleccionados,
        duracion: calcularDuracionTotal(serviciosSeleccionados)
    };

    // guardar en localStorage
    localStorage.setItem('turnosReservados', JSON.stringify(turnosReservados));
    return true;
}

document.addEventListener('DOMContentLoaded', function() {
    const btnBuscarTurno = document.getElementById('buscar-turno');
    const btnConfirmarModificacion = document.getElementById('confirmar-modificacion');

    if (btnBuscarTurno) {
        btnBuscarTurno.addEventListener('click', function() {
            const idReserva = document.getElementById('id-reserva-modificar').value;
            const turno = turnosReservados.find(t => t.id === idReserva);
            
            if (turno) {
                // Mostrar el formulario de modificación
                document.getElementById('modificar-detalles').style.display = 'block';
                
                // Pre-seleccionar los servicios actuales
                turno.servicios.forEach(servicio => {
                    const checkbox = document.querySelector(`input[value="${servicio.valor}"]`);
                    if (checkbox) checkbox.checked = true;
                });

                // Establecer la fecha actual
                document.getElementById('fecha-modificar').value = turno.fecha;
                
                // Generar horarios y actualizar precios
                generarHorariosDisponibles(turno.fecha);
                actualizarPrecios();
            } else {
                alert('No se encontró ningún turno con ese ID');
            }
        });
    }

    if (btnConfirmarModificacion) {
        btnConfirmarModificacion.addEventListener('click', function() {
            const idReserva = document.getElementById('id-reserva-modificar').value;
            if (modificarTurno(idReserva)) {
                alert('Turno modificado exitosamente');
                window.location.href = 'sacar-turno.html';
            }
        });
    }
});


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


document.addEventListener('DOMContentLoaded', function() {
    const btnBuscarTurno = document.getElementById('buscar-turno-cancelar');
    const btnConfirmarCancelacion = document.getElementById('confirmar-cancelacion');
    let idTurnoActual = '';

    if (btnBuscarTurno) {
        btnBuscarTurno.addEventListener('click', function() {
            const id = document.getElementById('id-reserva-cancelar').value;
            const turno = buscarTurnoPorId(id);
            
            if (turno) {
                idTurnoActual = id;
                mostrarDetallesTurno(turno);
            } else {
                alert('No se encontró ningún turno con ese ID');
                document.getElementById('detalles-turno').style.display = 'none';
            }
        });
    }

    if (btnConfirmarCancelacion) {
        btnConfirmarCancelacion.addEventListener('click', function() {
            if (confirm('¿Estás seguro de que deseas cancelar este turno?')) {
                if (cancelarTurno(idTurnoActual)) {
                    alert('Turno cancelado exitosamente');
                    window.location.href = 'sacar-turno.html';
                } else {
                    alert('Hubo un error al cancelar el turno');
                }
            }
        });
    }
});


function generarIdReserva() {
    const fecha = new Date();
    const random = Math.floor(Math.random() * 1000);
    return `RES-${fecha.getFullYear()}${(fecha.getMonth() + 1).toString().padStart(2, '0')}${random}`;
}

document.addEventListener('DOMContentLoaded', function() {
    const btnPago = document.getElementById('btn-pago');
    
    if (btnPago) {
        btnPago.addEventListener('click', function() {
            const nombre = document.getElementById('nombre-reserva')?.value;
            if (!nombre) {
                alert('Por favor ingresa tu nombre');
                return;
            }

            const serviciosSeleccionados = document.querySelectorAll('input[name="servicios"]:checked');
            if (serviciosSeleccionados.length === 0) {
                alert('Por favor selecciona al menos un servicio');
                return;
            }

            const fecha = document.getElementById('fecha-reserva')?.value;
            if (!fecha) {
                alert('Por favor selecciona una fecha');
                return;
            }

            if (!window.horaSeleccionada) {
                alert('Por favor selecciona una hora');
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

            alert(`¡Turno reservado con éxito!\nTu número de reserva es: ${idReserva}\nPor favor guardalo para futuras consultas.`);
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const btnContinuarPago = document.getElementById('btn-continuar-pago');
    
    if (btnContinuarPago) {
        btnContinuarPago.addEventListener('click', function(e) {
            e.preventDefault(); 
            const nombre = document.getElementById('nombre-reserva').value;
            const fecha = document.getElementById('fecha-reserva').value;
            const serviciosSeleccionados = document.querySelectorAll('input[name="servicios"]:checked');
            
            if (!nombre || !fecha || serviciosSeleccionados.length === 0 || !window.horaSeleccionada) {
                alert('Por favor completa todos los campos antes de continuar');
                return;
            }

            const servicios = Array.from(serviciosSeleccionados).map(checkbox => ({
                nombre: checkbox.nextElementSibling.textContent.split('-')[0].trim(),
                precio: parseInt(checkbox.dataset.precio)
            }));

            const total = servicios.reduce((sum, servicio) => sum + servicio.precio, 0);
            const sena = total * 0.2;
            const idReserva = 'RES-' + Math.random().toString(36).substr(2, 6).toUpperCase();

            const turnoTemporal = {
                id: idReserva,
                nombre: nombre,
                fecha: fecha,
                hora: window.horaSeleccionada,
                servicios: servicios,
                total: total,
                sena: sena
            };

            localStorage.setItem('turnoTemporal', JSON.stringify(turnoTemporal));

            window.location.href = 'confirmar-pago.html';
        });
    }
});


document.addEventListener('DOMContentLoaded', function() {
    // cargar datos del turno en la página de confirmación
    if (window.location.pathname.includes('confirmar-pago.html')) {
        const turnoTemporal = JSON.parse(localStorage.getItem('turnoTemporal'));
        if (turnoTemporal) {
            document.getElementById('resumen-turno').innerHTML = `
                <p><strong>Nombre:</strong> ${turnoTemporal.nombre}</p>
                <p><strong>Fecha:</strong> ${turnoTemporal.fecha}</p>
                <p><strong>Hora:</strong> ${turnoTemporal.hora}</p>
                <p><strong>Servicios:</strong></p>
                <ul>
                    ${turnoTemporal.servicios.map(s => `
                        <li>${s.nombre} - $${s.precio.toLocaleString()}</li>
                    `).join('')}
                </ul>
                <p><strong>Total:</strong> $${turnoTemporal.total.toLocaleString()}</p>
                <p><strong>Seña (20%):</strong> $${turnoTemporal.sena.toLocaleString()}</p>
            `;
            document.getElementById('monto-sena').textContent = `$${turnoTemporal.sena.toLocaleString()}`;
            document.getElementById('numero-reserva').textContent = turnoTemporal.id;
        }
    }
});
