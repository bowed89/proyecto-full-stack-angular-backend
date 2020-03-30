'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'clave_secreta_del_curso_de_angular';

exports.ensureAuth = function(req, res, next) {
    // Si no llega una cabecera no se podrá pasar a la siguiente función de create, login,etc....
    if (!req.headers.authorization) {
        return res.status(403).send({ message: 'La petición no tiene la cabecera de autenticación' });
    }

    var token = req.headers.authorization.replace(/['"]+/g, '');

    try {
        var payload = jwt.decode(token, secret);

        if (payload.exp <= moment().unix()) {
            return res.status(401).send({
                message: 'El Token ha Expirado'
            });
        }
    } catch (ex) {
        return res.status(404).send({
            message: 'El Token no es Válido'
        });
    }

    req.user = payload;

    next();
};