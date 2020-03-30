'use strict'

// Modulos
var bcrypt = require('bcrypt-nodejs');
var fs = require('fs');
var path = require('path');

// Modelos
var User = require('../models/user');

// Servicio JWT
var jwt = require('../services/jwt');

//  **** Acciones ****

function pruebas_controlador(req, res) {
    res.status(200).send({
        message: 'Prueba',
        user: req.user
    });
}

function saveUser(req, res) {

    // Crear el objeto de usuario --> Creando un nuevo usuario *.*
    var user = new User();

    // Recoger parametros petición
    var params = req.body;

    if (params.password && params.name && params.surname && params.email) {

        // Asignar valores al objeto Usuario
        user.name = params.name;
        user.surname = params.surname;
        user.email = params.email;
        user.role = 'ROLE_USER';
        user.image = null;

        if (params.email)

        // Comprobar si existe el email en la BBDD 
            User.findOne({ email: user.email.toLowerCase() }, (err, issetUser) => {
            // Si no devuelve datos entonces guarda recien en la BD
            if (!issetUser) {
                // Cifrar Password
                bcrypt.hash(params.password, null, null, function(err, hash) {

                    user.password = hash;

                    // Guardar Usuario en la BBDD
                    user.save((err, userStored) => {
                        if (err) {
                            res.status(500).send({ message: 'Error al Guardar el Usuario' });
                        } else {
                            if (!userStored) {
                                res.status(404).send({ message: 'No se ha registrado el usuario!' });
                            } else {
                                res.status(200).send({ user: userStored });
                            }
                        }

                    });
                });
            } else {
                res.status(200).send({
                    message: 'El Usuario no puede Registrarse porque existe un email similar almacenado '
                });

            }

        });

    } else {
        res.status(200).send({ message: 'Introduce los datos correctamente para registrar al Usuario!' });
    }
}

function login(req, res) {

    var params = req.body;
    var email = params.email;
    var password = params.password;

    User.findOne({ email: email.toLowerCase() }, (err, user) => {
        if (err) {
            res.status(500).send({
                message: 'Error al comprobar el Usuario'
            });
        } else {
            if (user) {
                bcrypt.compare(password, user.password, (err, check) => {
                    if (check) {
                        // Comprobar y generar Token
                        if (params.gettoken) {
                            // Devolver Token JWT
                            res.status(200).send({
                                token: jwt.createToken(user),
                                user: user
                            });
                        } else {
                            res.status(200).send({ user });
                        }
                    } else {
                        res.status(404).send({
                            message: 'La Contraseña es Incorrecta!'
                        });
                    }
                });
            } else {
                res.status(404).send({
                    message: 'No existe un Usuario Registrado!'
                });
            }
        }
    });
}

function updateUser(req, res) {
    // Parametros de la url
    var userId = req.params.id;

    var update = req.body;

    // Si el userId es diferente al usuario logueado  
    if (userId != req.user.sub) {
        return res.status(500).send({ message: 'No tienes permiso para actualizar el usuario' });
    }

    User.findByIdAndUpdate(userId, update, { new: true }, (err, userUpdated) => {
        if (err) {
            res.status(500).send({
                message: 'Error al Actualizar el Usuario'
            });
        } else {
            if (!userUpdated) {
                res.status(404).send({ message: 'No se ha podido actualizar el Usuario' });
            } else {
                res.status(200).send({ user: userUpdated });
            }

        }
    });
}

function uploadImage(req, res) {

    var userId = req.params.id;
    var file_name = 'No subido...';

    // Si se cargo la imagen 
    if (req.files) {
        var file_path = req.files.image.path;
        var file_split = file_path.split('\\');
        var file_name = file_split[2];

        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        // Si el archivo cargado tiene las sgte extensiones entonces se hace un update
        if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif') {

            if (userId != req.user.sub) {
                return res.status(500).send({ message: 'No tienes permiso para actualizar el usuario' });
            }

            User.findByIdAndUpdate(userId, { image: file_name }, { new: true }, (err, userUpdated) => {
                if (err) {
                    res.status(500).send({
                        message: 'Error al Actualizar el Usuario'
                    });
                } else {
                    if (!userUpdated) {
                        res.status(404).send({ message: 'No se ha podido actualizar el Usuario' });
                    } else {
                        res.status(200).send({ user: userUpdated, image: file_name });
                    }

                }
            });

        } else {
            // 'fs' Sirve para que no se almacene archivos con extensiones no válidas
            fs.unlink(file_path, (err) => {
                if (err) {
                    res.status(200).send({ message: 'Extensión no válida y fichero no borrado' });
                } else {
                    res.status(200).send({ message: 'Extensión no válida' });
                }
            });
        }
    } else {
        res.status(200).send({ message: 'No se han subido archivos' });
    }
}

function getImageFile(req, res) {

    // Obtengo el valor del parametro de la url que se llama imageFile 
    var imageFile = req.params.imageFile;
    var path_file = './uploads/users/' + imageFile;

    // Comprobar si el archivo existe
    fs.exists(path_file, function(exists) {
        if (exists) {
            // Accedemos a rutas en el sistema de archivos con 'path'
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(404).send({ message: 'La imagen no existe' });
        }
    });
}

function getKeepers(req, res) {

    User.find({ role: 'ROLE_ADMIN' }).exec((err, users) => {
        if (err) {
            res.status(500).send({ message: 'Error en la petición' });
        } else {
            if (!users) {
                res.status(404).send({ message: 'No hay cuidadores' });
            } else {
                res.status(200).send({ users });
            }
        }
    });
}

module.exports = {
    saveUser,
    login,
    pruebas_controlador,
    updateUser,
    uploadImage,
    getImageFile,
    getKeepers
};