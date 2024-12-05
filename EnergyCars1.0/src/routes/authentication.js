const express = require('express');
const router = express.Router();

const passport = require('passport');
const {isLoggedIn, isnoLoggedIn } = require('../lib/auth');
const pool = require('../database');
const helpers = require('../lib/helpers');
const {verificarReserva, hacerReserva, elegirSurtidor, buscarEstacion } = require('../lib2/auth');

// REDERIZAR EL FORMULRIO
router.get('/registro', isnoLoggedIn, (req, res) => {
    res.render('auth/registro')
});

//REGISTRO
router.post('/registro', isnoLoggedIn, passport.authenticate('local.registro', {
    successRedirect: '/autos',
    failureRedirect: '/registro',
    failureFlash: true
}))

//ACCESO
router.get('/acceso', isnoLoggedIn, (req,res) => {
    res.render('auth/acceso')
})

router.post('/acceso', isnoLoggedIn, (req, res, next) => {
    passport.authenticate('local.acceso', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user){
            return res.redirect('/acceso')
        }
        req.logIn(user, (err) => {
            if(err){
                return next(err);
            }

            if (user.ID_USER === 1){
                return res.redirect('/admin')
            } else {
                return res.redirect('/autos')
            }
        })
    })(req,res,next);
});

//PAGINA DE ESTACIONES DE CARGA
router.get('/listarestaciones', isLoggedIn, async (req, res) => {
    const estacionesCarga = await pool.query(`
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
    `)
    res.render('auth/listarestaciones', {estacionesCarga})
})

router.get('/buscar', isLoggedIn, async (req, res) => {
    const buscar = req.query.buscar;
    const rows = await buscarEstacion(buscar);
    res.render('auth/listarestaciones', {rows});
});

//PAGINA DEL MAPA
router.get('/mapa', isLoggedIn, async(req, res) => {
    res.render('auth/mapa');
});

router.get('/estaciones', isLoggedIn, async(req, res) => {
    const estacionesMapa = await pool.query(`
        SELECT 
            estaciones_carga.ID_ESTC, 
            estaciones_carga.ESTC_NOMBRE, 
            estaciones_carga.ESTC_LATITUD, 
            estaciones_carga.ESTC_LONGITUD, 
            COUNT(surtidores.ID_SURTIDOR) AS cantidad_surtidores
        FROM 
            estaciones_carga
        LEFT JOIN
            surtidores ON estaciones_carga.ID_ESTC = surtidores.ID_ESTC
        GROUP BY 
            estaciones_carga.ID_ESTC
        `)
    res.json(estacionesMapa);
})

// PAGINA DE RESERVAS
router.get('/listarReserva', isLoggedIn, async (req, res) => {
    const {ID_USER} = req.user;
    const reservas = await pool.query(`
        SELECT 
            reservas.ID_RESERVA,
            reservas.RESERVA_FECHA,
            reservas.RESERVA_HORA_INI,
            reservas.RESERVA_HORA_FIN,
            reservas.RESERVA_IMPORTE,
            estaciones_carga.ESTC_NOMBRE,
            estaciones_carga.ESTC_DIRECCION,
            estaciones_carga.ESTC_LOCALIDAD,
            estado_reservas.EST_RES_DESCRIP
        FROM 
            energycars.reservas
        JOIN 
            energycars.surtidores ON reservas.ID_SURTIDOR = surtidores.ID_SURTIDOR
        JOIN 
            energycars.estaciones_carga ON surtidores.ID_ESTC = estaciones_carga.ID_ESTC
        JOIN 
            energycars.estado_reservas ON reservas.ID_EST_RES = estado_reservas.ID_EST_RES
        WHERE
            reservas.ID_USER = ?
    `, [ID_USER]);
    res.render('auth/listarReserva', {reservas})
})

router.get('/eliminar/:ID_RESERVA', isLoggedIn, async (req,res) => {
    const {ID_RESERVA} = req.params;
    await pool.query('DELETE FROM reservas WHERE ID_RESERVA = ?', [ID_RESERVA]);
    req.flash('auto_success', 'RESERVA ELIMINADA')
    res.redirect('/auth/listarReserva');
});


router.get('/reserva', isLoggedIn, async (req,res) => {
    const estacionCarga = await pool.query('SELECT * FROM estaciones_carga');
    const surtidor = await pool.query('SELECT * FROM surtidores');
    const tiempo_carga = await pool.query('SELECT * FROM tiempo_carga')
    res.render('auth/reserva', {estacionCarga, surtidor, tiempo_carga});
});

router.post('/reserva', isLoggedIn, async (req,res) => {
    console.log(req.body);
    const {ID_USER} = req.user;
    const {reserva_fecha, reserva_hora_ini, reserva_hora_fin, reserva_importe, ID_ESTC} = req.body;
    const estadoReserva = await pool.query('SELECT ID_EST_RES FROM estado_reservas WHERE ID_EST_RES = 1');
    const elegirSurt = await elegirSurtidor(ID_ESTC);
    try {
        //Verificar si hay reserva disponible
        const reservaDisponible = await verificarReserva(estadoReserva, elegirSurt, reserva_fecha, reserva_hora_ini, reserva_hora_fin)
        if (reservaDisponible) {
            return res.status(409).json({ message: "Este horario ya esta reservado."})
        }

        //Si esta la reserva disponible la creamos.
        await hacerReserva(reserva_fecha, reserva_hora_ini, reserva_hora_fin, reserva_importe, ID_USER, estadoReserva[0].ID_EST_RES, elegirSurt);
        res.redirect('/auth/listarReserva');
    } catch(error) {

    }
});

router.get('/reserva/estacion/:ID_ESTC', isLoggedIn, async (req, res) => {
    const {ID_ESTC} = req.params;
    const estacionCargaID_ESTC = await pool.query('SELECT * FROM estaciones_carga WHERE ID_ESTC = ?', [ID_ESTC]);
    const surtidor = await pool.query('SELECT * FROM surtidores');
    const tiempo_carga = await pool.query('SELECT * FROM tiempo_carga')
    res.render('auth/reservaMapa',{estacionCargaID_ESTC: estacionCargaID_ESTC[0], surtidor, tiempo_carga});
    console.log({estacionCargaID_ESTC})
})

router.post('/reserva/estacion/:ID_ESTC', isLoggedIn, async (req,res) => {
    console.log(req.body);
    const {ID_USER} = req.user;
    const {ID_ESTC} = req.params;
    const {reserva_fecha, reserva_hora_ini, reserva_hora_fin, reserva_importe} = req.body;
    const estadoReserva = await pool.query('SELECT ID_EST_RES FROM estado_reservas WHERE ID_EST_RES = 1');
    const elegirSurt = await elegirSurtidor(ID_ESTC);
    try {
        //Verificar si hay reserva disponible
        const reservaDisponible = await verificarReserva(estadoReserva, elegirSurt, reserva_fecha, reserva_hora_ini, reserva_hora_fin)
        if (reservaDisponible) {
            return res.status(409).json({ message: "Este horario ya esta reservado."})
        }

        //Si esta la reserva disponible la creamos.
        await hacerReserva(reserva_fecha, reserva_hora_ini, reserva_hora_fin, reserva_importe, ID_USER, estadoReserva[0].ID_EST_RES, elegirSurt);
        res.redirect('/auth/listarReserva');
    } catch(error) {

    }
});

router.get('/perfil', isLoggedIn, (req,res) => {
    res.render('auth/perfil');
});

router.get('/editarUser/:ID_USER', isLoggedIn, async (req,res) => {
    const {ID_USER} = req.params;
    const editarUser = await pool.query('SELECT * FROM usuario WHERE ID_USER = ?', [ID_USER]);
    res.render('auth/editarUser', {editarUser: editarUser[0]});
});


router.post('/editarUser/:ID_USER', isLoggedIn, async (req,res) => {
    const { ID_USER } = req.params;
    const { user_nombre, user_apellido, user_telefono, user_contrasenia } = req.body;
    const editarUser = {
        user_nombre,
        user_apellido,
        user_telefono,
        user_contrasenia: await helpers.encryptContrasenia(user_contrasenia)
    };
    await pool.query('UPDATE usuario set ? WHERE ID_USER = ?', [editarUser, ID_USER]);
    req.flash('auto_success', 'Usuario actualizado con éxito');
    res.redirect('/perfil');
})

router.get('/cerrar', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);  // Maneja el error si es necesario
        }
        res.redirect('/acceso');  // Redirecciona al usuario después del logout
    });
});

module.exports = router;
