'use strict'

var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();
app.use(cors());

// Cargar Rutas ...
var user_routes = require('./routes/user');
var animal_routes = require('./routes/animal');

// Middlewares de Body-parser,
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configurar Cabeceras y Cors
app.use((req, res, next) => {
    res.header('Acess-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Request-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();

});

// Ruta Base
app.use('/api', user_routes);
app.use('/api', animal_routes);

module.exports = app;