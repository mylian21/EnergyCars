const express = require('express');
const morgan = require('morgan');
const { engine } = require('express-handlebars');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session')
const MySQLStore = require('express-mysql-session')(session);
const passport = require('passport');
const hbs = require('handlebars');

const { database } = require('./keys');


// inicializamos
const app = express();
require('./lib/passport'); // PARA QUE LA APLICACION SE ENTERE DE LA AUTENTIFICACION DE CREACION

//settings
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'))
app.engine('.hbs', engine({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: require('./lib/handlebars')
}));
app.set('view engine', '.hbs');

hbs.registerHelper('eq', function(a,b){
    return a === b;
});

hbs.registerHelper('mayor', function(a,b){
    return a > b;
});

hbs.registerHelper('ifCond', function(v1, v2, options){
    return (v1 === v2 ? options.fn(this) : options.inverse(this))
});

//Middlewares
app.use(session({
    secret: 'EnergyCarssqlnodesession',
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore(database)
}));
app.use(flash());
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(passport.initialize()); //INICIAR PASSPORT
app.use(passport.session()); // INICIAR SECCION DE PASSPORT

//Global Variables
app.use((req, res, next) => {
    app.locals.auto_success = req.flash('auto_success');
    app.locals.auto_error = req.flash('auto_error');
    app.locals.user = req.user;
    next();
})

//Routes
app.use(require('./routes'));
app.use('/',require('./routes/authentication'));
app.use('/auth',require('./routes/authentication'));
app.use('/autos', require('./routes/autos'));
app.use('/admin', require('./routes/admin'));
app.use('/negocio', require('./routes/negocio'));

//Public
app.use(express.static(path.join(__dirname, 'public')))

//Starting the server
app.listen(app.get('port'), () => {
    console.log('Server on port', app.get('port'));
});