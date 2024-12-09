const express = require('express');
const router = express.Router();

const pool =  require('../database');
const {isLoggedIn} = require('../lib/auth');
const helpers = require('../lib/helpers');


router.get('/', isLoggedIn, async (req, res) => {
    const adminuser = await pool.query('SELECT * FROM usuario WHERE ID_USER > 1 ');
    res.render('admin/gestionUser', { adminuser });
});

router.get('/eliminar/:ID_USER', isLoggedIn, async (req,res) => {
    const {ID_USER} = req.params;
    await pool.query('DELETE FROM usuario WHERE ID_USER = ?', [ID_USER]);
    req.flash('auto_success', 'USUARIO ELIMINADO')
    res.redirect('/admin');
});

router.get('/editarAdminUser/:ID_USER', isLoggedIn, async (req,res) => {
    const {ID_USER} = req.params;
    const editarAdminUser = await pool.query('SELECT * FROM usuario WHERE ID_USER = ?', [ID_USER]);
    res.render('admin/editarAdminUser', {editarAdminUser: editarAdminUser[0]});
});


router.post('/editarAdminUser/:ID_USER', isLoggedIn, async (req,res) => {
    const { ID_USER } = req.params;
    const { user_contrasenia } = req.body;
    const editarAdminUser = {
        user_contrasenia: await helpers.encryptContrasenia(user_contrasenia)
    };
    await pool.query('UPDATE usuario set ? WHERE ID_USER = ?', [editarAdminUser, ID_USER]);
    req.flash('auto_success', 'Contraseña restablecida');
    res.redirect('/admin');
});

// Gestion de Reservas
// router.get('/gestionReservas', isLoggedIn, async (req,res) => {
//     res.render('admin/gestionReservas');
// });

router.get('/gestionReservas', isLoggedIn, async (req, res) => {
    try {
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
                estado_reservas.EST_RES_DESCRIP,
                usuarios.USER_CORREO
            FROM 
                reservas
            JOIN 
                surtidores ON reservas.ID_SURTIDOR = surtidores.ID_SURTIDOR
            JOIN 
                estaciones_carga ON surtidores.ID_ESTC = estaciones_carga.ID_ESTC
            JOIN 
                estado_reservas ON reservas.ID_EST_RES = estado_reservas.ID_EST_RES
            JOIN 
                usuario usuarios ON reservas.ID_USER = usuarios.ID_USER
        `);

        res.render('admin/gestionReservas', { reservas });
    } catch (error) {
        console.error('Error al obtener las reservas:', error);
        res.status(500).send('Error al obtener las reservas.');
    }
});

router.get('/gestionReservas/cancelar/:ID_RESERVA', isLoggedIn, async (req, res) =>{
    const {ID_RESERVA} = req.params;
    await pool.query(`UPDATE reservas SET ID_EST_RES = 3 WHERE ID_RESERVA = ?`,[ID_RESERVA]);
    res.redirect('/admin/gestionReservas');
});


router.get('/vermarcas', isLoggedIn, async (req, res) => {
    const vehiculos = await pool.query('SELECT * FROM vehiculos');
    const marcas = await pool.query('SELECT * FROM marcas');
    const modelos = await pool.query('SELECT * FROM modelos');
    const tipos_conectores = await pool.query('SELECT * FROM tipos_conectores');
    const marca_modelo = await pool.query(`
        SELECT 
                marca_modelo.ID_MARCA_MODELO, 
                marcas.MARC_NOMBRE, 
                modelos.MOD_NOMBRE,
                tipos_conectores.TC_NOMBRE 
                FROM marca_modelo 
                JOIN marcas ON marca_modelo.ID_MARCA = marcas.ID_MARCA
                JOIN modelos ON marca_modelo.ID_MODELO = modelos.ID_MODELO
                JOIN tipos_conectores ON marca_modelo.ID_TC = tipos_conectores.ID_TC ;
                `);
    res.render('admin/vermarcas', { marcas, modelos, tipos_conectores, marca_modelo, vehiculos });
});
            
//Ruta para agregar relación entre marca, modelo y tipo de conector
router.post('/vermarcas', isLoggedIn, async (req, res) => {
    const { id_marca, id_modelo, id_tc } = req.body;
    try {
        if (id_marca && id_modelo && id_tc) {
            await pool.query('INSERT INTO marca_modelo (ID_MARCA, ID_MODELO, ID_TC) VALUES (?, ?, ?)', [id_marca, id_modelo, id_tc]);
            req.flash('auto_success', 'Relación agregada con éxito');
        }
        res.redirect('/admin/vermarcas');
    } catch (error) {
        console.error('Error al agregar relación marca-modelo-tipo de conector:', error);
        res.status(500).send('Error al agregar la relación');
    }
});

// Ruta para agregar nueva marca
router.post('/vermarcas/marca', isLoggedIn, async (req, res) => {
    const { marc_nombre } = req.body;
    const nueva_marc_nombre = {marc_nombre}
    await pool.query('INSERT INTO marcas set ?', [nueva_marc_nombre]);
    req.flash('auto_success', 'MARCA AGREGADA CORRECTAMENTE');
    res.redirect('/admin/vermarcas');

});

// Ruta para agregar nuevo modelo
router.post('/vermarcas/modelo', isLoggedIn, async (req, res) => {
    const { mod_nombre} = req.body;
    if (mod_nombre) {
        await pool.query('INSERT INTO modelos (mod_nombre) VALUES (?)', [mod_nombre]);
    }
    req.flash('auto_success', 'MODELO AGREGADO CORRECTAMENTE');
    res.redirect('/admin/vermarcas');
});

// Ruta para agregar nuevo año
router.post('/vermarcas/anio', isLoggedIn, async (req, res) => {
    const { n_anio } = req.body;
    if (n_anio) {
        await pool.query('INSERT INTO anio (anio) VALUES (?)', [n_anio]);
    }
    req.flash('auto_success', 'AÑO AGREGADO CORRECTAMENTE');
    res.redirect('/admin/vermarcas');
});

// Ruta para agregar nuevo tipo de conector
router.post('/vermarcas/conector', isLoggedIn, async (req, res) => {
    const { tc_nombre } = req.body;
    if (tc_nombre) {
        await pool.query('INSERT INTO tipos_conectores (tc_nombre) VALUES (?)', [tc_nombre]);
    }
    req.flash('auto_success', 'CONECTOR AGREGADO CORRECTAMENTE');
    res.redirect('/admin/vermarcas');
});

router.post('/vermarcas/eliminar', isLoggedIn, async (req, res) => {
    const ID_MARCA_MODELO = req.body.id_marca_modelo;
    await pool.query('DELETE FROM marca_modelo WHERE ID_MARCA_MODELO = ?', [ID_MARCA_MODELO]);
    req.flash('auto_success', 'RESGISTRO ELIMINADO')
    res.redirect('/admin/vermarcas');
});

router.get('/gestionEstaciones', async (req, res) => {
    try {
        const estaciones = await pool.query(`
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
        `);
        const provincias = await pool.query('SELECT * FROM provincias');
        res.render('admin/gestionEstaciones', { estaciones, provincias }); 
    } catch (error) {
        console.error('Error al obtener las estaciones o provincias:', error);
        res.status(500).send('Error al cargar las estaciones');
    }
});

// Ruta para crear una estación de carga
router.post('/gestionEstaciones', async (req, res) => {
    console.log(req.body);
    const {
        estc_nombre,
        estc_direccion,
        estc_localidad,
        estc_cant_surtidores,
        id_provincia,
        estc_latitud,
        estc_longitud
    } = req.body;

    try {
        // Validar que todos los campos requeridos están presentes
        if (!estc_nombre || !estc_direccion || !estc_localidad || !estc_cant_surtidores || !id_provincia || !estc_latitud || !estc_longitud) {
            req.flash('error', 'Por favor, completa todos los campos.');
            return res.redirect('/admin/gestionEstaciones');
        }

        // Insertar la estación en la base de datos
        const result = await pool.query(
            'INSERT INTO estaciones_carga (ESTC_NOMBRE, ESTC_DIRECCION, ESTC_LOCALIDAD, ESTC_CANT_SURTIDORES, ID_PROVINCIA, ESTC_LATITUD, ESTC_LONGITUD) VALUES (?, ?, ?, ?, ?, ?, ?)', 
            [estc_nombre, estc_direccion, estc_localidad, estc_cant_surtidores, id_provincia, estc_latitud, estc_longitud]
        );

        // Obtener el ID de la estación recién creada
        const idEstacion = result.insertId;

        // Insertar los surtidores en la tabla surtidores
        for (let i = 0; i < estc_cant_surtidores; i++) {
            await pool.query(
                'INSERT INTO surtidores (SURT_ESTADO, ID_ESTC) VALUES (?, ?)', 
                [1, idEstacion]  // El estado se establece como 1 y se usa el ID de la estación
            );
        }

        req.flash('success', 'Estación de carga y surtidores creados exitosamente.');
        res.redirect('/admin/gestionEstaciones');
    } catch (error) {
        console.error('Error al crear estación de carga o surtidores:', error);
        req.flash('error', 'Ocurrió un error al crear la estación de carga y los surtidores.');
        res.redirect('/admin/gestionEstaciones');
    }
});

router.get('/gestionEstaciones/eliminar/:ID_ESTC', isLoggedIn, async (req,res) => {
    const {ID_ESTC} = req.params;
    await pool.query('DELETE FROM surtidores WHERE ID_ESTC = ?', [ID_ESTC]);
    await pool.query('DELETE FROM estaciones_carga WHERE ID_ESTC = ?', [ID_ESTC]);
    req.flash('auto_success', 'ESTACION ELIMINADA')
    res.redirect('/admin/gestionEstaciones');
});


//Ruta para gestionar transacciones
router.get('/gestiontransacciones', async(req, res)=>{
    res.render('admin/gestiontransacciones');
});

//Ruta ver usuarios
router.get('/verusuarios', isLoggedIn, async (req, res) => {
    const { nombre, apellido, correo } = req.query;
    
    let query = `
        SELECT 
            YEAR(USER_FECHA_REGISTRO) AS anio,
            MONTH(USER_FECHA_REGISTRO) AS mes,
            DAY(USER_FECHA_REGISTRO) AS dia,
            USER_NOMBRE,
            USER_APELLIDO,
            USER_CORREO
        FROM usuario
        WHERE USER_CORREO <> 'admin@gmail.com'
    `;

    const params = [];

    if (nombre) {
        query += ` AND USER_NOMBRE LIKE ?`;
        params.push(`%${nombre}%`);
    }
    if (apellido) {
        query += ` AND USER_APELLIDO LIKE ?`;
        params.push(`%${apellido}%`);
    }
    if (correo) {
        query += ` AND USER_CORREO LIKE ?`;
        params.push(`%${correo}%`);
    }

    const usuarios = await pool.query(query, params);

    const totalRegistros = usuarios.length;

    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.json({ usuarios, totalRegistros });
    }

    res.render('admin/verusuarios', {
        usuarios,
        totalRegistros
    });
});


//Ver Reservas
router.get('/verReservas', async (req, res) => {
    const reservasPorDia = await pool.query(`
        SELECT RESERVA_FECHA AS dia, COUNT(*) AS cantidad_reservas
        FROM reservas
        GROUP BY dia
        ORDER BY dia
    `);

    const reservasPorMes = await pool.query(`
        SELECT DATE_FORMAT(RESERVA_FECHA, '%Y-%m') AS mes, COUNT(*) AS cantidad_reservas
        FROM reservas
        GROUP BY mes
        ORDER BY mes
    `);

    const reservasPorAno = await pool.query(`
        SELECT YEAR(RESERVA_FECHA) AS anio, COUNT(*) AS cantidad_reservas
        FROM reservas
        GROUP BY anio
        ORDER BY anio
    `);

    res.render('admin/verReservas', {
        reservasPorDia,
        reservasPorMes,
        reservasPorAno
    });
});

// Ver Estaciones
router.get('/verEstaciones', async (req, res) => {
    const { estacion } = req.query;

    let filtroEstacion = estacion ? `WHERE EC.ESTC_NOMBRE LIKE ${pool.escape(`%${estacion}%`)}` : '';
    let indicadores = {};

    // Consultas para los diferentes indicadores
    indicadores.reservasPorDia = await pool.query(`
        SELECT 
            EC.ESTC_NOMBRE AS estacion,
            R.RESERVA_FECHA AS dia,
            COUNT(*) AS total_reservas
        FROM reservas R
        JOIN surtidores S ON R.ID_SURTIDOR = S.ID_SURTIDOR
        JOIN estaciones_carga EC ON S.ID_ESTC = EC.ID_ESTC
        ${filtroEstacion}
        GROUP BY EC.ESTC_NOMBRE, R.RESERVA_FECHA
        ORDER BY EC.ESTC_NOMBRE, R.RESERVA_FECHA;
    `);

    indicadores.reservasPorMes = await pool.query(`
        SELECT 
            EC.ESTC_NOMBRE AS estacion,
            DATE_FORMAT(R.RESERVA_FECHA, '%Y-%m') AS mes,
            COUNT(*) AS total_reservas
        FROM reservas R
        JOIN surtidores S ON R.ID_SURTIDOR = S.ID_SURTIDOR
        JOIN estaciones_carga EC ON S.ID_ESTC = EC.ID_ESTC
        ${filtroEstacion}
        GROUP BY EC.ESTC_NOMBRE, mes
        ORDER BY EC.ESTC_NOMBRE, mes;
    `);

    indicadores.reservasPorAno = await pool.query(`
        SELECT 
            EC.ESTC_NOMBRE AS estacion,
            YEAR(R.RESERVA_FECHA) AS anio,
            COUNT(*) AS total_reservas
        FROM reservas R
        JOIN surtidores S ON R.ID_SURTIDOR = S.ID_SURTIDOR
        JOIN estaciones_carga EC ON S.ID_ESTC = EC.ID_ESTC
        ${filtroEstacion}
        GROUP BY EC.ESTC_NOMBRE, anio
        ORDER BY EC.ESTC_NOMBRE, anio;
    `);

    res.render('admin/verEstaciones', { indicadores, estacion });
});

//Botónes Volver 
router.get('/verusuarios', isLoggedIn, async(req, res) => {
    res.render('admin/gestiontransacciones');
});

router.get('/verReservas', isLoggedIn, async(req, res) => {
    res.render('admin/gestiontransacciones');
});

router.get('/verEstaciones', isLoggedIn, async(req, res) => {
    res.render('admin/gestiontransacciones');
});


module.exports = router;
