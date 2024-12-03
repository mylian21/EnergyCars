const express = require('express');
const router = express.Router();

const pool =  require('../database');
const {isLoggedIn, isnoLoggedIn} = require('../lib/auth')

router.get('/sobreNosotros', isnoLoggedIn, async (req, res) => {
    res.render('negocio/sobreNosotros');
})

router.get('/contacto', isnoLoggedIn, async (req, res) => {
    res.render('negocio/contacto');    
})
module.exports = router;
