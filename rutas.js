const express = require('express');
const ruter = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const consultasbd = require('./basedatos/consultas');
const secretkey = 'AF84565599ALI';

async function verificaToken(token, secretkey, informacionPe = {}) {
  try {
    const decodedToken = jwt.verify(token, secretkey);
    return decodedToken;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      // Si el token ha caducado, genera uno nuevo
      const informacion = { ...informacionPe };
      const newToken = jwt.sign(informacion, secretkey, { expiresIn: '1h' });
      return newToken;
    } else {
      throw error;
    }
  }
}
async function manejarToken(usuarioId, secretkey) {
  const resu = await consultasbd.obtenerUltimoToken(usuarioId);
  if (resu && resu[0] && resu[0][0] && resu[0][0].token) {
    const tokenString = resu[0][0].token;
    const token = await verificaToken(tokenString, secretkey, usuarioId);
    if (token.length>100){
      const registrartoken = await consultasbd.registrarToken(usuarioId, token, '1h');
      return tokenString;
    }
    return {token,tokenString};
  } else {
    // Si no hay un token existente, genera uno nuevo
    const informacion = { usuarioId };
    const newToken = jwt.sign(informacion, secretkey, { expiresIn: '1h' });
    const registrartoken = await consultasbd.registrarToken(usuarioId, newToken, '1h');
    return newToken;
  }
}

ruter.use(express.json());

// Ruta iniciosesion
ruter.post('/inicioSesion', async (req, res) => {
  try {
    const { usuario, clave } = req.body;
    const operacion = await consultasbd.comprobarlogeo(usuario, clave);
    const resultado = operacion[1][0][0];
    if (resultado) {
      const token = await manejarToken(resultado.id, secretkey);
      res.send({ token,resultado });
    } else {
      res.status(404).json({ message: 'Credenciales incorrectas' });
    }
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// RUTA INICIO USUARIO (sin el middleware autenticarToken)
ruter.post('/inicio/usuario', async (req, res) => {
  try {
    // Acción para la ruta de inicio de usuario
  } catch (error) {
    console.error('Error accediendo a inicio usuario', error);
    res.status(500).json({ message: 'Error en /inicio/usuario' });
  }
});

module.exports = ruter;