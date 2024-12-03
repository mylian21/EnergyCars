const pool = require('../database');

// Función para verificar si hay un conflicto de horario
async function verificarReserva(ID_EST_RES, ID_SURTIDOR, RESERVA_FECHA, RESERVA_HORA_INI, RESERVA_HORA_FIN) {
    const consulta =
        `SELECT * FROM reservas 
        WHERE ID_EST_RES = ? 
        AND ID_SURTIDOR = ? 
        AND RESERVA_FECHA = ? 
        AND ((? BETWEEN RESERVA_HORA_INI AND RESERVA_HORA_FIN) OR (? BETWEEN RESERVA_HORA_INI AND RESERVA_HORA_FIN))`;
    const existeReserva = await pool.query(consulta, [ID_EST_RES, ID_SURTIDOR, RESERVA_FECHA, RESERVA_HORA_INI, RESERVA_HORA_FIN]);
    return existeReserva.length > 0;
}

// Función para insertar una nueva reserva
async function hacerReserva(RESERVA_FECHA, RESERVA_HORA_INI, RESERVA_HORA_FIN, RESERVA_IMPORTE, ID_USER, ID_EST_RES, ID_SURTIDOR) {
    const nueva_Reserva = {
        RESERVA_FECHA,
        RESERVA_HORA_INI,
        RESERVA_HORA_FIN,
        RESERVA_IMPORTE,
        ID_USER,
        ID_EST_RES,
        ID_SURTIDOR
    };

    try {
        const result = await pool.query('INSERT INTO reservas SET ?', [nueva_Reserva]);
        const ID_RESERVA = result.insertId;
        await pool.query('UPDATE reservas SET ID_EST_RES = 2 WHERE ID_RESERVA = ?', [ID_RESERVA]);
        return ID_RESERVA;
    } catch (error) {
        console.error("Error al agregar una reserva", error);
        throw error;
    }
}

async function elegirSurtidor(ID_ESTC) { 
    const surtidoresDisponibles = await pool.query('SELECT ID_SURTIDOR FROM surtidores WHERE ID_ESTC = ? AND SURT_ESTADO = 1', [ID_ESTC]);
    if (surtidoresDisponibles.length === 0) { 
        throw new Error('No hay surtidores disponibles.'); 
    } 
    const surtidorAleatorio = surtidoresDisponibles[Math.floor(Math.random() * surtidoresDisponibles.length)];
    return surtidorAleatorio.ID_SURTIDOR; 
}

// Función para cancelar una reserva
async function cancelarReserva(ID_EST_RES, ID_RESERVA) {
    try {
        await pool.query('UPDATE reservas SET RESERVA_ESTADO = ? WHERE ID_RESERVA = ?', [ID_EST_RES, ID_RESERVA]);
    } catch (error) {
        console.error("Error al cancelar la reserva", error);
        throw error;
    }
}

// Función para buscar una estación de carga
async function buscarEstacion(filtro) {
    try {
        return await pool.query(`
            SELECT
                estaciones_carga.ID_ESTC,
                estaciones_carga.ESTC_NOMBRE,
                estaciones_carga.ESTC_DIRECCION,
                estaciones_carga.ESTC_LOCALIDAD,
                provincias.PROVINCIA_NOMBRE,
                estaciones_carga.ESTC_CANT_SURTIDORES,
                estaciones_carga.ESTC_LATITUD,
                estaciones_carga.ESTC_LONGITUD
            FROM
                estaciones_carga
            JOIN
                provincias ON estaciones_carga.ID_PROVINCIA = provincias.ID_PROVINCIA 
            WHERE 
                ESTC_NOMBRE LIKE ?
                OR (ESTC_DIRECCION LIKE ?)
                OR (ESTC_LOCALIDAD LIKE ?)
                OR (PROVINCIA_NOMBRE LIKE ?)`, 
            [`%${filtro}%`,`%${filtro}%`,`%${filtro}%`,`%${filtro}%`]);;
    } catch (error) {
        console.error("Error fetching charging stations:", error);
        throw error;  
    }
}

async function costoCarga(tiempo, kw) {
    try {
        const [priceData] = await pool.query(
            'SELECT PRECIO_KW FROM precios WHERE ID_TIEMPO_CARGA = ? AND ID_MEDIDA = ?',
            [tiempo, kw]
        );

        if (priceData) {
            const precioTotal = priceData.PRECIO_KW * tiempo;
            return { precio: precioTotal };
        } else {
            return null; // O puedes lanzar un error aquí, según tus necesidades
        }
    } catch (error) {
        console.error(error);
        throw error; // O maneja el error de otra manera, como devolver un objeto de error
    }
}


module.exports = {
    verificarReserva,
    hacerReserva,
    cancelarReserva,
    buscarEstacion,
    costoCarga,
    elegirSurtidor
};
