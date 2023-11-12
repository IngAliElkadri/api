const express = require('express');
const ruter = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const consultasbd = require('./basedatos/consultas');
const secretkey = 'AF84565599ALI';
const bodyParser = require('body-parser');
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
    return tokenString;
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
      res.status(200).send({ token,resultado });
    } else {
      res.status(200).send({ message: 'Credenciales incorrectas' });
    }
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

ruter.post('/usuario/reportarpagos', async (req, res) => {
  try {
    const { id_reportante, referencia,monto, banco_id, estado_id} = req.body;
    const operacion = await consultasbd.Repago(id_reportante, referencia,monto, banco_id, estado_id);
    res.status(200).json({Message:"Producto registrado con exito"});
  } catch (error) {
    console.error('Error registrando un pago', error);
    res.status(500).json({ message: 'Error en /reportarpagos' });
  }
});
ruter.get('/usuario/verpagos/:id_reportante', async (req, res) => {
  try {
    const id_reportante= req.params.id_reportante;
    const operacion = await consultasbd.VpagosUsu(id_reportante);
    if (operacion && operacion.length > 1 && operacion[0].length > 0) {
      res.status(200).json(operacion[0]);
    }
    else{
      res.status(200).json({Message: "No hay reportes"});
    }
  } catch (error) {
    console.error('Error viendo reportes de pagos', error);
    res.status(500).json({ message: 'Error en /usuario/verpagos/' });
  }
});
ruter.post('/usuario/reportarpedido/', async (req, res) => {
  try {
    const { id_reportante, cantidad_prod, // datos reportante
      nombre, apellido, cedula, telefono, direccion, // datos cliente
      nombre_producto, descripcion, precio } = req.body; // datos productos
    
    let id_cliente, id_producto, verificarprod, reportarpedido, registrarProducto, registrarCliente;

    const comprobarexitecliente = await consultasbd.comExicliente(cedula);
    
    if (comprobarexitecliente && comprobarexitecliente.length > 1 && comprobarexitecliente[0].length > 0) {
      id_cliente = comprobarexitecliente[0][0].id;
      verificarprod = await consultasbd.comExiPro(nombre_producto, descripcion);

      if (verificarprod && verificarprod.length > 1 && verificarprod[0].length > 0) {
        id_producto = verificarprod[0][0].id;
      } else {
        // si el producto no existe, lo registra y se obtiene su id 
        registrarProducto = await consultasbd.reProducto(nombre_producto, descripcion, precio);
        verificarprod = await consultasbd.comExiPro(nombre_producto, descripcion);
        id_producto = verificarprod[0][0].id;
      }

      // registro del pedido
      reportarpedido = await consultasbd.Repedido(cedula, id_cliente, id_reportante, id_producto, cantidad_prod, precio, 1);
      res.status(200).json({ message: 'Pedido registrado exitosamente' });
    } else {
      // Si el cliente no existe, se registra y se obtiene el bendito id
      registrarCliente = await consultasbd.Recliente(nombre, apellido, cedula, telefono, direccion);
      const comprobarexiteclienteNuevo = await consultasbd.comExicliente(cedula);
      
      if (comprobarexiteclienteNuevo && comprobarexiteclienteNuevo.length > 1 && comprobarexiteclienteNuevo[0].length > 0) {
        id_cliente = comprobarexiteclienteNuevo[0][0].id;
        verificarprod = await consultasbd.comExiPro(nombre_producto, descripcion);

        if (verificarprod && verificarprod.length > 1 && verificarprod[0].length > 0) {
          id_producto = verificarprod[0][0].id;
        } else {
          // Si el producto no existe, se registra y se obtiene su id
          registrarProducto = await consultasbd.reProducto(nombre_producto, descripcion, precio);
          verificarprod = await consultasbd.comExiPro(nombre_producto, descripcion);
          id_producto = verificarprod[0][0].id;
        }

        // Registro de pedido
        reportarpedido = await consultasbd.Repedido(cedula, id_cliente, id_reportante, id_producto, cantidad_prod, precio, 1);
        res.status(200).json({ message: 'Pedido registrado exitosamente' });
      } else {
        res.status(500).json({ message: 'Error en la creación del cliente' });
      }
    }
  } catch (error) {
    console.error('Error al reportar pedido:', error);
    res.status(500).json({ message: 'Error en /usuario/reportarpedido/' });
  }
});
ruter.post('/usuario/reportardelivery', async (req, res) => {
  try {
    const { id_pedido,nombre_delivery } = req.body;
    const operacion = await consultasbd.Redelivery(id_pedido,nombre_delivery);
    res.status(200).json({Message:"Delivery registrado con exito"});
  } catch (error) {
    console.error('Error registrando un pago', error);
    res.status(500).json({ message: 'Error en /usuario/reportardelivery' });
  }
});
ruter.get('/usuario/verdeliverys/', async (req, res) => {
  try {
    const operacion = await consultasbd.Vdeliverysusu();
    if (operacion && operacion.length > 1 && operacion[0].length > 0) {
      res.status(200).json(operacion[0][0]);
    }
    else{
      res.status(200).json({Message: "No hay reportes"});
    }
  } catch (error) {
    console.error('Error viendo reportes de pagos', error);
    res.status(500).json({ message: 'Error en /usuario/verdeliverys/' });
  }
});
module.exports = ruter;