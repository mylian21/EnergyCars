const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const pool = require('../database'); 
const helpers = require('../lib/helpers');

passport.use('local.acceso', new LocalStrategy({
    usernameField: 'user_correo',
    passwordField: 'user_contrasenia',
    passReqToCallback: true
}, async (req, user_correo, user_contrasenia, done) => {
    
    const rows = await pool.query('SELECT * FROM usuario WHERE USER_CORREO = ?', [user_correo]);
    if (rows.length > 0) {
        const user = rows[0];
        const validarContrasenia = await helpers.compararContrasenia(user_contrasenia, user.USER_CONTRASENIA);
        if (validarContrasenia) {
            done(null, user, req.flash('auto_success','Bienvenido ' + user.user_nombre + ' ' + user.user_apellido));
        } else {
            done(null, false, req.flash('auto_error','Contraseña Incorrecta'));
        }
    } else {
        done(null, false, req.flash('auto_error','El usuario y la contraseña no existe'));
    }
}));

passport.use('local.registro', new LocalStrategy({
    usernameField: 'user_correo',
    passwordField: 'user_contrasenia',
    passReqToCallback: true
}, async (req, user_correo, user_contrasenia, done) => {

    const {user_nombre, user_apellido, user_telefono} = req.body;
    let nuevoUsuario = {
        user_nombre,
        user_apellido,
        user_correo,
        user_telefono,
        user_contrasenia
    };
    nuevoUsuario.user_contrasenia = await helpers.encryptContrasenia(user_contrasenia);
    const resultado = await pool.query('INSERT INTO usuario SET ?', [nuevoUsuario]);
    nuevoUsuario.ID_USER = resultado.insertId;  
    return done(null, nuevoUsuario);
}));

passport.serializeUser((user, done) => {
    done(null, user.ID_USER);
});

passport.deserializeUser(async (ID_USER, done) => {
    const rows = await pool.query('SELECT * FROM usuario WHERE ID_USER = ?', [ID_USER]);
    done(null, rows[0]);
});
