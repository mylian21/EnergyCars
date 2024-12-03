const express = require('express');
const router = express.Router();

const pool =  require('../database');
const {isLoggedIn} = require('../lib/auth')

router.get('/agregar', isLoggedIn, async (req, res) => {
    const anio = await pool.query('SELECT * FROM anio');
    const marcas = await pool.query('SELECT * FROM marcas');
    const modelos = await pool.query('SELECT * FROM modelos');
    const marca_modelo = await pool.query('SELECT * FROM marca_modelo');
    res.render('autos/agregar', {marca_modelo,marcas,modelos, anio});
});

router.post('/agregar', isLoggedIn, async (req, res) => {
    const { veh_marca, veh_modelo, veh_anio, veh_patente } = req.body;
    const newAutos = {
        veh_marca,
        veh_modelo,
        veh_anio,
        veh_patente
    };
    await pool.query('INSERT INTO vehiculos set ?', [newAutos]);
    req.flash('auto_success', 'AUTO AGREGADO CORRECTAMENTE');
    res.redirect('/autos');
});

router.get('/', isLoggedIn, async (req, res) => {
    const vehiculos = await pool.query('SELECT * FROM vehiculos');
    res.render('autos/listar', { vehiculos });
});

router.get('/eliminar/:ID_VEH', isLoggedIn, async (req,res) => {
    const {ID_VEH} = req.params;
    await pool.query('DELETE FROM vehiculos WHERE ID_VEH = ?', [ID_VEH]);
    req.flash('auto_success', 'AUTO ELIMINADO')
    res.redirect('/autos');
});

router.get('/editar/:ID_VEH', isLoggedIn, async (req,res) => {
    const {ID_VEH} = req.params;
    const editarAutos = await pool.query('SELECT * FROM vehiculos WHERE ID_VEH = ?', [ID_VEH]);
    res.render('autos/editar', {editarAutos: editarAutos[0]});
});


router.post('/editar/:ID_VEH', isLoggedIn, async (req,res) => {
    const { ID_VEH } = req.params;
    const { veh_marca, veh_modelo, veh_anio, veh_patente } = req.body;
    const editarAutos = {
        veh_marca,
        veh_modelo,
        veh_anio,
        veh_patente
    };
    await pool.query('UPDATE vehiculos set ? WHERE ID_VEH = ?', [editarAutos, ID_VEH]);
    req.flash('auto_success', 'CAMBIO EXITOSO');
    res.redirect('/autos');
})

module.exports = router;

