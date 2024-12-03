function calcularHoraFin() {
    const horaInicio = document.getElementById('reserva_hora_ini').value;
    const tiempoCarga = parseInt(document.getElementById('reserva_hora_time').value, 10);
    if (horaInicio) {
        const [horas, minutos] = horaInicio.split(':').map(Number);
        const fecha = new Date();
        fecha.setHours(horas);
        fecha.setMinutes(minutos + tiempoCarga);

        const horaFin = fecha.toLocaleTimeString().slice(0, 5);
        document.getElementById('reserva_hora_fin').value = horaFin;
    }
};

function costoEstimado() {
    const duracion = parseInt(document.getElementById('reserva_hora_time').value);
    const precioKw = 25;
    let pagoTotal = duracion * precioKw;
    document.getElementById('reserva_importe').value = pagoTotal;
}

function actualizarIdEstc(idEstc) {
    document.getElementById('ID_ESTC').value = idEstc;
    }
