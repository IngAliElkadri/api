const express = require('express');
const ruter = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const consultasbd = require('./basedatos/consultas');
const secretkey = 'AF84565599ALI';
const bodyParser = require('body-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const moment = require('moment'); 
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
const csvPath = 'reporte_pagos_en_sucursal.csv';

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
    const { id_reportante, referencia,monto, cod_banco, estado_id} = req.body;
    const obteneridbanco = await consultasbd.obteneridbanco(cod_banco);
    if (obteneridbanco && obteneridbanco.length > 1 && obteneridbanco[0].length > 0){
       const banco_id = obteneridbanco[0][0].id;
       const exispago = await consultasbd.VerificarExPago(referencia,banco_id);
       if(exispago[0][0]){
        res.status(200).json({Pagoon:"El pago ya fue registrado anteriormente"});
       }
       else{
       const registrar = await consultasbd.Repago(id_reportante,referencia,monto,banco_id,estado_id);
       res.status(200).json({Message:"El pago fue registrado con exito"});
       }
    }
    else{
      res.status(500).json({Message:"Error reportando pago"});
    }
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
ruter.post('/usuario/generarpedido', async (req, res) => {
  try {
    const { id_reportante, nombre, apellido, cedula, telefono, direccion, ref, cod_banco, nomdelivery } = req.body;

    // Verificar si el cliente existe
    let idcliente = 0;
    const comprobarexitecliente = await consultasbd.comExicliente(cedula);
    if (comprobarexitecliente[0][0] && comprobarexitecliente.length > 0) {
      idcliente=comprobarexitecliente[0][0].id;
    } else {
      // Si el cliente no existe, registrarlo
      const registrarCliente = await consultasbd.Recliente(nombre, apellido, cedula, telefono, direccion);
      const retornarid = await consultasbd.comExicliente(cedula);
      idcliente = retornarid[0][0].id;
      console.log('Cliente no existe');
    }

    // Verificar si el pago está registrado
    let idpago = 0;
    const verificarpago = await consultasbd.Vpago(ref, cod_banco);
    if (verificarpago[0][0] && verificarpago.length > 0) {
      idpago = verificarpago[0][0].id;
    } else {
      res.status(200).json({ Pagooff: "No existe el pago reportado" });
      return; // Detener la ejecución si el pago no está registrado
    }

    // Verificar si el delivery está registrado
    let iddelivery = 0;
    const Obdelivery = await consultasbd.Obtenerdelivery(nomdelivery);

    if (Obdelivery[0][0] && Obdelivery.length > 0) {
      iddelivery = Obdelivery[0][0].id;
    } else {
      // Si el delivery no está registrado, registrarlo
      const reportardelivery = await consultasbd.Redelivery(nomdelivery);
      const Obtendelivery = await consultasbd.Obtenerdelivery(nomdelivery);
      iddelivery = Obtendelivery[0][0].id;
    }

    // Registrar el pedido con los ids obtenidos
    const reportarpedido = await consultasbd.Repedido(idcliente, id_reportante, iddelivery, idpago, 1, 4);

    res.status(200).json({ Exito: "Pedido registrado correctamente" });

  } catch (error) {
    console.error('Error registrando un pedido', error);
    res.status(500).json({ Fracaso: 'El pago ya se le fue asignado a otro pedido' });
  }
});
ruter.post('/usuario/registrarProducto', async (req, res) => {
  try {
    const {pago,nombre_producto, descripcion, precio,cantidad} = req.body;
    const verificarprod = await consultasbd.comExiPro(nombre_producto, descripcion);
    const operacion = verificarprod;
    if (verificarprod && verificarprod.length > 1 && verificarprod[0].length > 0){
      const idprod = operacion[0][0].id;
      const Obid = await consultasbd.ObidPedidoConCI(pago);
      const idpedido = Obid[0][0].id;
      const registrarDe= await consultasbd.Redetalles(idpedido,idprod,cantidad);
      res.status(200).json({Exito:"Producto agregado a detalles"});
    }
    else{
      const registrarProducto = await consultasbd.reProducto(nombre_producto, descripcion, precio);
      const verificarprod = await consultasbd.comExiPro(nombre_producto, descripcion);
      const operacion = verificarprod;
      const idprod = operacion[0][0].id;
      const Obid = await consultasbd.ObidPedidoConCI(pago);
      const idpedido = Obid[0][0].id;
      const registrarDe= await consultasbd.Redetalles(idpedido,idprod,cantidad);
      res.status(200).json({Exito:"Producto registrado y agregado a detalles"});
    }
  } catch (error) {
    console.error('Error registrando un producto', error);
    res.status(500).json({ message: 'Error en /usuario/registrarProducto' });
  }
});

ruter.post('/usuario/reportardetalles', async (req, res) => {
  try {
    const {id_producto,cantidad } = req.body;
    const operacion = await consultasbd.Redetalles(id_producto,cantidad);
    res.status(200).json({Message:"Detalle registrado con exito"});
  } catch (error) {
    console.error('Error registrando el detalle', error);
    res.status(500).json({ message: 'Error en /usuario/reportardetalles' });
  }
});
ruter.get('/usuario/verdeliverys/', async (req, res) => {
  try {
    const operacion = await consultasbd.Vdeliverysusu();
    if (operacion && operacion.length > 1 && operacion[0].length > 0) {
      res.status(200).json(operacion[0]);
    }
    else{
      res.status(200).json({Message: "No hay deliverys"});
    }
  } catch (error) {
    console.error('Error viendo reportes de pagos', error);
    res.status(500).json({ message: 'Error en /usuario/verdeliverys/' });
  }
});
// RUTAS ENCARGADOS
ruter.get('/encargado/verbancos/', async (req, res) => {
  try {
    const operacion = await consultasbd.Vbancos();
    if (operacion && operacion.length > 1 && operacion[0].length > 0) {
      res.status(200).json(operacion[0]);
    }
    else{
      res.status(200).json({Message: "No hay bancos registrados"});
    }
  } catch (error) {
    console.error('Error viendo reportes de Bancos', error);
    res.status(500).json({ message: 'Error en /usuario/verbancos/' });
  }
});
ruter.post('/encargado/Registrarbanco/', async (req, res) => {
  try {
    const {cod_banco,nombre_banco,cuenta } = req.body;
    const operacion = await consultasbd.Rebanco(cod_banco,nombre_banco,cuenta);
    res.status(200).json({Message:"Banco registrado con exito"});
  } catch (error) {
    console.error('Error registrando un banco', error);
    res.status(500).json({ message: 'Error en /encargado/verbancos/' });
  }
});
ruter.get('/encargado/versucursales/', async (req, res) => {
  try {
    const operacion = await consultasbd.Vsucursales();
    if (operacion && operacion.length > 1 && operacion[0].length > 0) {
      res.status(200).json(operacion[0]);
    }
    else{
      res.status(200).json({Message: "No hay sucursales registradas"});
    }
  } catch (error) {
    console.error('Error viendo reportes de sucursales', error);
    res.status(500).json({ message: 'Error en /encargado/versucursales/' });
  }
});
ruter.post('/encargado/Registrarsucursal/', async (req, res) => {
  try {
    const {nombre_sucursal,direccion,empresa } = req.body;
    const operacion = await consultasbd.Resucursal(nombre_sucursal,direccion,empresa);
    res.status(200).json({Message:"Sucursal registrada con exito"});
  } catch (error) {
    console.error('Error registrando una sucursal', error);
    res.status(500).json({ message: 'Error en /encargado/Registrarsucursal/' });
  }
});
ruter.get('/encargado/versucursal/pagos-aprobados/:id_sucursal', async (req, res) => {
  try {
    const id_sucursal= req.params.id_sucursal;
    const operacion = await consultasbd.PagosAppSucursal(id_sucursal);
    if (operacion && operacion.length > 1 && operacion[0].length > 0) {
      res.status(200).json(operacion[0]);
    }
    else{
      res.status(200).json({Message: "No hay reportes"});
    }
  } catch (error) {
    console.error('Error viendo reportes de pagos', error);
    res.status(500).json({ message: 'Error en /encargado/versucursal/pagos-aprobados/' });
  }
});
ruter.get('/encargado/versucursal/TodosPagos/:id_sucursal', async (req, res) => {
  try {
    const id_sucursal= req.params.id_sucursal;
    const operacion = await consultasbd.TodosPagosEnSucursal(id_sucursal);
    if (operacion && operacion.length > 1 && operacion[0].length > 0) {
      res.status(200).json(operacion[0]);
    }
    else{
      res.status(200).json({Message: "No hay reportes"});
    }
  } catch (error) {
    console.error('Error viendo reportes de pagos', error);
    res.status(500).json({ message: 'Error en /encargado/versucursal/TodosPagos/' });
  }
});
ruter.get('/encargado/versucursal/deliverys-aprobados/:id_sucursal', async (req, res) => {
  try {
    const id_sucursal= req.params.id_sucursal;
    const operacion = await consultasbd.DeliverysAPPEnSucursal(id_sucursal);
    if (operacion && operacion.length > 1 && operacion[0].length > 0) {
      res.status(200).json(operacion[0]);
    }
    else{
      res.status(200).json({Message: "No hay deliverys aprobados"});
    }
  } catch (error) {
    console.error('Error viendo reportes de deliverys aprobados', error);
    res.status(500).json({ message: 'Error en /encargado/versucursal/deliverys-aprobados/' });
  }
});
ruter.get('/encargado/versucursal/usuarios/:id_sucursal', async (req, res) => {
  try {
    const id_sucursal= req.params.id_sucursal;
    const operacion = await consultasbd.usuariosEnSucursal(id_sucursal);
    if (operacion && operacion.length > 1 && operacion[0].length > 0) {
      res.status(200).json(operacion[0]);
    }
    else{
      res.status(200).json({Message: "No hay usuarios"});
    }
  } catch (error) {
    console.error('Error viendo reportes de pagos', error);
    res.status(500).json({ message: 'Error en /encargado/versucursal/usuarios/' });
  }
});
ruter.get('/encargado/Pagospendientes/', async (req, res) => {
  try {
    const operacion = await consultasbd.Obtenerpagospendientes();
    if (operacion && operacion.length > 1 && operacion[0].length > 0) {
      res.status(200).json(operacion[0]);
    }
    else{
      res.status(200).json({Message: "No hay pagos pendientes"});
    }
  } catch (error) {
    console.error('Error viendo reportes de pagos pendientes', error);
    res.status(500).json({ message: 'Error en /encargado/Pagospendientes/' });
  }
});
ruter.get('/encargado/verusuarios/', async (req, res) => {
  try {
    const operacion = await consultasbd.Todosusuarios();
    if (operacion && operacion.length > 1 && operacion[0].length > 0) {
      res.status(200).json(operacion[0]);
    }
    else{
      res.status(200).json({Message: "No hay usuarios"});
    }
  } catch (error) {
    console.error('Error viendo lista de usuarios', error);
    res.status(500).json({ message: 'Error en /encargado/verusuarios/' });
  }
});
ruter.get('/encargado/verdeliveryspendientes/', async (req, res) => {
  try {
    const operacion = await consultasbd.Obtenerdeliveryspendientes();
    if (operacion && operacion.length > 1 && operacion[0].length > 0) {
      res.status(200).json(operacion[0]);
    }
    else{
      res.status(200).json({Message: "No hay deliverys pendientes"});
    }
  } catch (error) {
    console.error('Error viendo lista de deliverys pendientes', error);
    res.status(500).json({ message: 'Error en /encargado/verdeliveryspendientes/' });
  }
});
ruter.post('/encargado/actualizar/estadodelivery/', async (req, res) => {
  try {
    const {estado_pedido,responsable_id,pedido_id } = req.body;
    const operacion = await consultasbd.darestadopedido(estado_pedido,responsable_id,pedido_id);
    res.status(200).json({Message:"Estado actualizado con exito"});
  } catch (error) {
    console.error('Error actualizando estado pedido', error);
    res.status(500).json({ message: 'Error en /encargado/actualizar/estadodelivery/' });
  }
});
ruter.post('/encargado/actualizar/estadopago/', async (req, res) => {
  try {
    const {estado_pago,responsable_estado,ref_pago} = req.body;
    const operacion = await consultasbd.darestadopago(estado_pago,responsable_estado,ref_pago);
    res.status(200).json({Message:"Estado actualizado con exito"});
  } catch (error) {
    console.error('Error actualizando estado pedido', error);
    res.status(500).json({ message: 'Error en /encargado/actualizar/estadopago/' });
  }
});
ruter.post('/encargado/usuarios/registrar-usuario/', async (req, res) => {
  try {
    const {correo,cedula,usuario,clave,nadmin,sucursal} = req.body;
    const operacion = await consultasbd.Reusuario(correo,cedula,usuario,clave,nadmin,sucursal);
    res.status(200).json({Message:"Usuario registrado con exito"});
  } catch (error) {
    console.error('Error registrando usuario', error);
    res.status(500).json({ message: 'Error en /encargado/usuarios/registrar-usuario/' });
  }
});
ruter.post('/encargado/usuarios/modificarinfo/', async (req, res) => {
  try {
    const {correo,cedula,usuario,clave,nadmin,sucursal,ci} = req.body;
    const operacion = await consultasbd.CambiarInfoUsuario(correo,cedula,usuario,clave,nadmin,sucursal,ci);
    res.status(200).json({Message:"Informacion cambiada con exito"});
  } catch (error) {
    console.error('Error actualizando informacion de usuario', error);
    res.status(500).json({ message: 'Error en /encargado/usuarios/modificarinfo/' });
  }
});
ruter.post('/encargado/usuarios/banusuario/', async (req, res) => {
  try {
    const {cedula} = req.body;
    const operacion = await consultasbd.banearusuario(cedula);
    res.status(200).json({Message:"Usuario baneado"});
  } catch (error) {
    console.error('Error baneando usuario', error);
    res.status(500).json({ message: 'Error en /encargado/usuarios/banusuario/' });
  }
});
ruter.get('/reporte/pagos_en_sucursal/:id', async (req, res) => {
  const sucursalId = req.params.id;

  try {
    const operacion = await consultasbd.TodosPagosEnSucursal(sucursalId);
    if (operacion && operacion.length > 0) {
      const datosConInformacionExtra = operacion[0].map((registro) => ({
        fecha: moment().format('YYYY-MM-DD'),
        sucursal: sucursalId,
        nombre_reportante: registro.nombre_reportante, // Corregido aquí
        referencia: registro.referencia,
        monto: registro.monto,
        nombre_banco: registro.nombre_banco,
        nombre_estado: registro.nombre_estado,
        nombre_responsable: registro.nombre_responsable,
      }));

      const csvWriter = createCsvWriter({
        path: csvPath,
        header: [
          { id: 'fecha', title: 'Fecha' },
          { id: 'sucursal', title: 'Sucursal' },
          { id: 'nombre_reportante', title: 'Nombre Reportante' },
          { id: 'referencia', title: 'Referencia' },
          { id: 'monto', title: 'Monto' },
          { id: 'nombre_banco', title: 'Nombre Banco' },
          { id: 'nombre_estado', title: 'Nombre Estado' },
          { id: 'nombre_responsable', title: 'Nombre Responsable' },
        ],
        append: fs.existsSync(csvPath),
      });

      csvWriter.writeRecords(datosConInformacionExtra)
        .then(() => {
          console.log('Datos agregados al archivo CSV con éxito');
          res.status(200).json({ exito: 'Datos registrados en CSV correctamente' });
        })
        .catch((error) => {
          console.error('Error al agregar datos al archivo CSV:', error);
          res.status(500).json({ message: 'Error al generar el reporte en CSV' });
        });
    } else {
      res.status(200).json({ Message: "No hay pagos en la sucursal" });
    }
  } catch (error) {
    console.error('Error viendo lista de pagos en sucursal', error);
    res.status(500).json({ message: 'Error en /reporte/pagos_en_sucursal/:id' });
  }
});
ruter.get('/encargado/obtenerRoles/', async (req, res) => {
  try {
    const operacion = await consultasbd.obtenerroles();
    if (operacion && operacion.length > 1 && operacion[0].length > 0) {
      res.status(200).json(operacion[0]);
    }
    else{
      res.status(200).json({Message: "No hay roles disponibles"});
    }
  } catch (error) {
    console.error('Error viendo lista de roles', error);
    res.status(500).json({ message: 'Error en /encargado/obtenerRoles/' });
  }
});
module.exports = ruter;