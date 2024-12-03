const express = require('express');
const router = express.Router();

const pool =  require('../database');
const {isLoggedIn} = require('../lib/auth')

router.get('/agregar', isLoggedIn, async (req, res) => {
    const marca_modeloAgregar = await pool.query(`
        SELECT 
            marca_modelo.ID_MARCA_MODELO, 
            marcas.MARC_NOMBRE, 
            modelos.MOD_NOMBRE,
            tipos_conectores.TC_NOMBRE 
            FROM marca_modelo 
            JOIN marcas ON marca_modelo.ID_MARCA = marcas.ID_MARCA
            JOIN modelos ON marca_modelo.ID_MODELO = modelos.ID_MODELO
            JOIN tipos_conectores ON marca_modelo.ID_TC = tipos_conectores.ID_TC ;
        `)
    res.render('autos/agregar', {marca_modeloAgregar});
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

