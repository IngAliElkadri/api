const {conectarBaseDeDatos} = require('./bd');
async function comprobarlogeo(usuario, clave) { //LOGEAR USUARIO
    const consulta = 'SELECT * FROM usuarios WHERE usuario=? AND clave=?';
    const conexion =await conectarBaseDeDatos()
    try {
      const result = await conexion.query(consulta, [usuario, clave]);
      conexion.end();
      console.log('CONEXION CERRADA');
      if (result.length > 0) {
        return [true, result];
      } else {
        return false;
      }
    } catch (error) {
      console.log('Hubo un error al buscar:', error);
      throw error; 
    }
  }
async function mostraRepPa(id){ //MOSTRAR REPORTES DEL USUARIO
    const consulta = '';
};
async function registrarUsu(correo, usuario, clave, nadmin, sucursal) { //REGISTRAR USUARIO
    const consulta ='INSERT INTO `usuarios`(id, correo, usuario, clave, nadmin, sucursal) VALUES (,?,?,?,?,?)';
      const conexion =await conectarBaseDeDatos()
      try {
      const result = await conexion.query(consulta, [correo, usuario, clave, nadmin, sucursal]);
      conexion.end();
      console.log('CONEXION CERRADA');
      if (result) {
        return { Mesagge: "Usuario registrado exitosamente" };
      } else {
        return { Message: "No se pudo registrar el usuario" };
      }
    } catch (error) {
      console.log('ERROR AL REGISTRAR:', error);
      throw error;
    }
  } 
async function reProducto(nombre,descripcion,monto){ // CONSULTA PARA INSERTAR PRODUCTOS
    const consulta = 'INSERT INTO productos(nombre, descripcion, precio) VALUES (?,?,?)';
    const conexion =await conectarBaseDeDatos()
    try{
        const result = await conexion.query(consulta,[nombre,descripcion,monto]);
        conexion.end();
        console.log('CONEXION CERRADA');
        if(result){
            return {Message:"Producto registrado exitosamente"};
        }
        else{
            return {Message:"Operacion fallida"};
        }
    }catch(error){
        console.log('Error base de datos')
        throw error;
    }
};
async function comExiPro(nombre, descripcion) { //COMPROBAR EXISTENCIA PRODUCTO
    const consulta = 'SELECT * FROM productos WHERE nombre =? AND descripcion =?';
    const conexion =await conectarBaseDeDatos()
    try {
      const result = await conexion.query(consulta, [nombre, descripcion]);
      conexion.end();
      console.log('CONEXION CERRADA');
      if (result.length > 0) {
        return result;
      } else {
        return false;
      }
    } catch (error) {
      console.log('Error en base de datos:', error);
      throw error; 
    }
  }
async function ExisUsuario(nombre) {
    const consulta = 'SELECT id, correo, usuario, clave, nadmin, sucursal FROM usuarios WHERE usuario=?';
    const conexion =await conectarBaseDeDatos()
    try {
      const result = await conexion.query(consulta, [nombre]);
      conexion.end();
      console.log('CONEXION CERRADA');
      if (result.length > 0) {
        console.log('Usuario en uso');
      } else {
        return [true, { Mensaje: 'Usuario disponible' }];
      }
    } catch (error) {
      console.log('Error al verificar si el usuario está disponible:', error);
      throw error; // COMPROBAR NOMBRE USUARIO SI ESTA EXISTENTE
    }
  }
  async function Repago(id_reportante,referencia,monto,banco_id,estado_id) {
    const consulta = 'INSERT INTO pagos(id_reportante, referencia, monto, banco_id, estado_id) VALUES (?,?,?,?,?)';
    const conexion =await conectarBaseDeDatos()
    try {
      const result = await conexion.query(consulta, [id_reportante,referencia,monto,banco_id,estado_id]);
      conexion.end();
      console.log('CONEXION CERRADA');
      console.log('Producto registrado con exito');
    } catch (error) {
      console.log('Error al verificar si el usuario está disponible:', error);
      throw error; // COMPROBAR NOMBRE USUARIO SI ESTA EXISTENTE
    }
  }
  async function obteneridbanco(cod_banco){
    const consulta = 'SELECT bancos.id FROM bancos where bancos.cod_banco=?;';
    const conexion =await conectarBaseDeDatos()
    try {
      const result = await conexion.query(consulta, [cod_banco]);
      conexion.end();
      console.log('CONEXION CERRADA');
      if (result.length > 0) {
        return result
      } else {
        return [{ Mensaje: 'No existe banco registrado con ese codigo' }];
      }
    } catch (error) {
      console.log('Error al obtener banco id:', error);
      throw error; 
    }
  }
async function registrarToken(id_usu,token,dura_token){
  const consulta ='INSERT INTO logeos(id_usuario, token, dura_token) VALUES (?,?,?)'
  const conexion =await conectarBaseDeDatos()
  try {
    const result = await conexion.query(consulta, [id_usu,token,dura_token]);
    conexion.end();
    console.log('CONEXION CERRADA');
    if (result.length > 0) {
      console.log('Registro de token exitoso');
    } else {
      return [{ Mensaje: 'Fallo en registro' }];
    }
  } catch (error) {
    console.log('Error al registrar el token:', error);
    throw error; // registrar token en base de datos
  }
}
async function obtenerUltimoToken(id){
  const consulta ='SELECT token FROM logeos WHERE id_usuario = ? ORDER BY fecha DESC LIMIT 1'
  const conexion =await conectarBaseDeDatos()
  try {
    const result = await conexion.query(consulta, [id]);
    conexion.end();
    console.log('CONEXION CERRADA');
    if (result.length > 0) {
      console.log('Token obtenido con exito');
      return result
    } else {
      return [{ Mensaje: 'La obtencion del token fallo' }];
    }
  } catch (error) {
    console.log('Error al obtener el token:', error);
    throw error; // Obtener ultimo token de usuario
  }
}
async function VpagosUsu(id_reportante){
  const consulta = 'SELECT p.id,p.referencia,p.monto,b.nombre AS nombre_banco, e.estado AS nombre_estado, u.usuario AS nombre_responsable FROM pagos p JOIN estados e ON p.estado_id = e.id JOIN usuarios u ON p.responsable_estado = u.id JOIN bancos b ON p.banco_id = b.id WHERE p.id_reportante = ? AND p.estado_id= 1 AND DATE(p.fecha_emision) = CURDATE();';
  const conexion =await conectarBaseDeDatos()
  try {
    const result = await conexion.query(consulta, [id_reportante]);
    conexion.end();
    console.log('CONEXION CERRADA');
    if (result.length > 0) {
      return result
    } else {
      return [{ Mensaje: 'No existen reportes de pagos' }];
    }
  } catch (error) {
    console.log('Error al obtener registro de pagos:', error);
    throw error; 
  }
}
async function Recliente(nombre,apellido,cedula,telefono,direccion) {
  const consulta = 'INSERT INTO clientes(nombre, apellido, cedula, telefono, direccion) VALUES (?,?,?,?,?)';
  const conexion =await conectarBaseDeDatos()
  try {
    const result = await conexion.query(consulta, [nombre,apellido,cedula,telefono,direccion]);
    conexion.end();
    console.log('CONEXION CERRADA');
    console.log('cliente registrado con exito');
  } catch (error) {
    console.log('Error al registrar el usuario:', error);
    throw error; 
  }
}
async function Redelivery(nombre_delivery) {
  const consulta = 'INSERT INTO deliverys(nombre_delivery) VALUES (?)';
  const conexion =await conectarBaseDeDatos()
  try {
    const result = await conexion.query(consulta, [nombre_delivery]);
    conexion.end();
    console.log('CONEXION CERRADA');
    console.log('Delivery registrado con exito');
  } catch (error) {
    console.log('Error al registrar delivery:', error);
    throw error; 
  }
}
async function Redetalles(idpedido,id_producto,cantidad) {
  const consulta = 'INSERT INTO detalles_pedido(id_pedido, id_producto, cant, total) VALUES (?,?,?,? * (SELECT precio FROM productos WHERE id = ?))';
  const conexion =await conectarBaseDeDatos()
  try {
    const result = await conexion.query(consulta, [idpedido,id_producto,cantidad,cantidad,id_producto]);
    conexion.end();
    console.log('CONEXION CERRADA');
    console.log('Detalle registrado con exito');
  } catch (error) {
    console.log('Error al registrar detalle:', error);
    throw error; 
  }
}
async function ObidPedidoConCI(ref) {
  const consulta = 'SELECT pe.id FROM pedidos pe JOIN pagos pa ON pe.pago_id = pa.id WHERE pa.referencia = ?;';
  const conexion =await conectarBaseDeDatos()
  try {
    const result = await conexion.query(consulta, [ref]);
    conexion.end();
    console.log('CONEXION CERRADA');
    if (result.length > 0) {
      return result
    } else {
      return [{ Mensaje: 'No existen reportes de pagos' }];
    }
  } catch (error) {
    console.log('Error al obtener registro de pagos:', error);
    throw error; 
  }
}
async function comExicliente(cedula) { //COMPROBAR EXISTENCIA cliente
  const consulta = 'SELECT * FROM clientes WHERE cedula=?';
  const conexion =await conectarBaseDeDatos()
  try {
    const result = await conexion.query(consulta, [cedula]);
    conexion.end();
    console.log('CONEXION CERRADA');
    if (result.length > 0) {
      return result;
    } else {
      return false;
    }
  } catch (error) {
    console.log('Error en base de datos:', error);
    throw error; 
  }
}
async function Repedido(id_cliente,id_reportante,delivery_id,pago_id,estado_pedido,responsable_id) {
  const consulta = 'INSERT INTO pedidos(id_cliente, id_reportante, delivery_id, pago_id, estado_pedido, responsable_id) VALUES (?,?,?,?,?,?)';
  const conexion =await conectarBaseDeDatos()
  try {
    const result = await conexion.query(consulta, [id_cliente,id_reportante,delivery_id,pago_id,estado_pedido,responsable_id]);
    conexion.end();
    console.log('CONEXION CERRADA');
    console.log('pedido registrado con exito');
  } catch (error) {
    console.log('Error al registrar pedido:', error);
    throw error; 
  }
}
async function comExipagoEnpedido(ref,cod_banco) { //COMPROBAR EXISTENCIA cliente
  const consulta = 'SELECT * FROM pedidos p JOIN pagos pa ON p.pago_id = pa.id JOIN bancos ba ON pa.banco_id = ba.id WHERE pa.referencia=? AND ba.cod_banco=? AND DATE(p.fecha_reportado) = CURDATE();';
  const conexion =await conectarBaseDeDatos()
  try {
    const result = await conexion.query(consulta, [ref,cod_banco]);
    conexion.end();
    console.log('CONEXION CERRADA');
    if (result.length > 0) {
      return result;
    } else {
      return false;
    }
  } catch (error) {
    console.log('Error en base de datos:', error);
    throw error; 
  }
}
async function VerPagoregistrado(id_pago) { //COMPROBAR EXISTENCIA cliente
  const consulta = 'SELECT * FROM pedidos WHERE pedidos.pago_id = ?;';
  const conexion =await conectarBaseDeDatos()
  try {
    const result = await conexion.query(consulta, [id_pago]);
    conexion.end();
    console.log('CONEXION CERRADA');
    if (result.length > 0) {
      return result;
    } else {
      return false;
    }
  } catch (error) {
    console.log('Error en base de datos:', error);
    throw error; 
  }
}
async function Vdeliverysusu(){
  const consulta = 'SELECT pe.id,cl.nombre,cl.apellido,cl.direccion,us.usuario, de.nombre_delivery, es.estado,pe.fecha_reportado, pag.referencia FROM pedidos pe JOIN clientes cl ON pe.id_cliente = cl.id JOIN usuarios us ON pe.responsable_id = us.id JOIN deliverys de ON pe.delivery_id = de.id JOIN estados es ON pe.estado_pedido = es.id JOIN pagos pag ON pe.pago_id = pag.id WHERE pe.estado_pedido=1 AND DATE(pe.fecha_reportado) = CURDATE();';
  const conexion =await conectarBaseDeDatos()
  try {
    const result = await conexion.query(consulta);
    conexion.end();
    console.log('CONEXION CERRADA');
    if (result.length > 0) {
      return result
    } else {
      return [{ Mensaje: 'No existen deliverys' }];
    }
  } catch (error) {
    console.log('Error al obtener registro de deliverys:', error);
    throw error; 
  }
}
async function Vbancos(){
  const consulta = 'SELECT bancos.cod_banco, bancos.nombre,bancos.cuenta FROM `bancos` WHERE 1';
  const conexion =await conectarBaseDeDatos()
  try {
    const result = await conexion.query(consulta);
    conexion.end();
    console.log('CONEXION CERRADA');
    if (result.length > 0) {
      return result
    } else {
      return [{ Mensaje: 'No hay bancos registrados' }];
    }
  } catch (error) {
    console.log('Error al obtener registro de bancos:', error);
    throw error; 
  }
}async function Vpago(ref,cod_banco){
  const consulta = 'SELECT pa.id FROM pagos pa JOIN bancos ba ON pa.banco_id = ba.id WHERE pa.referencia=? AND ba.cod_banco=? AND DATE(pa.fecha_emision) = CURDATE();';
  const conexion =await conectarBaseDeDatos()
  try {
    const result = await conexion.query(consulta,[ref,cod_banco]);
    conexion.end();
    console.log('CONEXION CERRADA');
    if (result.length > 0) {
      return result
    } else {
      return false
    }
  } catch (error) {
    console.log('Error al obtener pago:', error);
    throw error; 
  }
}
async function Rebanco(cod_banco,nombre_banco,cuenta) {
  const consulta = 'INSERT INTO bancos(cod_banco, nombre, cuenta) VALUES (?,?,?)';
  const conexion =await conectarBaseDeDatos()
  try {
    const result = await conexion.query(consulta, [cod_banco,nombre_banco,cuenta]);
    conexion.end();
    console.log('CONEXION CERRADA');
    console.log('Banco registrado con exito');
  } catch (error) {
    console.log('Error al registrar pedido:', error);
    throw error; 
  }
}
async function Vsucursales(){
  const consulta = 'SELECT * FROM sucursales WHERE 1';
  const conexion =await conectarBaseDeDatos()
  try {
    const result = await conexion.query(consulta);
    conexion.end();
    console.log('CONEXION CERRADA');
    if (result.length > 0) {
      return result
    } else {
      return [{ Mensaje: 'No hay sucursales registradas' }];
    }
  } catch (error) {
    console.log('Error al obtener registro de sucursales:', error);
    throw error; 
  }
}
async function Resucursal(nombre_sucursal,direccion,empresa) {
  const consulta = 'INSERT INTO sucursales(nombre, direccion, empresa) VALUES (?,?,?)';
  const conexion =await conectarBaseDeDatos()
  try {
    const result = await conexion.query(consulta, [nombre_sucursal,direccion,empresa]);
    conexion.end();
    console.log('CONEXION CERRADA');
    console.log('Sucursal registrada con exito');
  } catch (error) {
    console.log('Error al registrar sucursal:', error);
    throw error; 
  }
}
async function PagosAppSucursal(id_sucursal){
  const consulta = 'SELECT p.id,u_reportante.usuario AS nombre_reportante,p.referencia,p.monto,b.nombre AS nombre_banco, e.estado AS nombre_estado, u.usuario AS nombre_responsable FROM pagos p JOIN estados e ON p.estado_id = e.id JOIN usuarios u ON p.responsable_estado = u.id JOIN usuarios u_reportante ON p.id_reportante = u_reportante.id JOIN bancos b ON p.banco_id = b.id JOIN sucursales s ON u.sucursal= s.id WHERE u_reportante.sucursal = ? AND p.estado_id=2 AND DATE(p.fecha_emision) = CURDATE();';
  const conexion =await conectarBaseDeDatos()
  try {
    const result = await conexion.query(consulta,[id_sucursal]);
    conexion.end();
    console.log('CONEXION CERRADA');
    if (result.length > 0) {
      return result
    } else {
      return [{ Mensaje: 'No hay pagos aprobados hoy en esta sucursal' }];
    }
  } catch (error) {
    console.log('Error al obtener registro de pagos aprobados en la sucursal:', error);
    throw error; 
  }
}async function TodosPagosEnSucursal(id_sucursal){
  const consulta = 'SELECT p.id,u_reportante.usuario AS nombre_reportante,p.referencia,p.monto,b.nombre AS nombre_banco, e.estado AS nombre_estado, u.usuario AS nombre_responsable FROM pagos p JOIN estados e ON p.estado_id = e.id JOIN usuarios u ON p.responsable_estado = u.id JOIN usuarios u_reportante ON p.id_reportante = u_reportante.id JOIN bancos b ON p.banco_id = b.id JOIN sucursales s ON u.sucursal= s.id WHERE u_reportante.sucursal = ? AND DATE(p.fecha_emision) = CURDATE();';
  const conexion =await conectarBaseDeDatos()
  try {
    const result = await conexion.query(consulta,[id_sucursal]);
    conexion.end();
    console.log('CONEXION CERRADA');
    if (result.length > 0) {
      return result
    } else {
      return [{ Mensaje: 'No hay pagos hoy en esta sucursal' }];
    }
  } catch (error) {
    console.log('Error al obtener registro de pagos en la sucursal:', error);
    throw error; 
  }
}
async function DeliverysAPPEnSucursal(id_sucursal){
  const consulta = 'SELECT pe.id,cl.nombre,cl.apellido,cl.direccion, cl.cedula,us.usuario AS nom_reportante, pag.referencia,de.nombre_delivery, usuu.usuario AS nom_respo FROM pedidos pe JOIN deliverys de ON pe.delivery_id = de.id JOIN clientes cl ON pe.id_cliente = cl.id JOIN usuarios us ON pe.id_reportante = us.id JOIN pagos pag ON pe.pago_id = pag.id JOIN usuarios usuu ON pe.responsable_id = usuu.id WHERE us.sucursal=? AND pe.estado_pedido=2 AND DATE(pe.fecha_reportado) = CURDATE();';
  const conexion =await conectarBaseDeDatos()
  try {
    const result = await conexion.query(consulta,[id_sucursal]);
    conexion.end();
    console.log('CONEXION CERRADA');
    if (result.length > 0) {
      return result
    } else {
      return [{ Mensaje: 'No hay deliverys aprobados hoy en esta sucursal' }];
    }
  } catch (error) {
    console.log('Error al obtener registro de deliverys aprobados en la sucursal:', error);
    throw error; 
  }
}
async function usuariosEnSucursal(id_sucursal){
  const consulta = 'SELECT usuarios.id,usuarios.usuario,usuarios.correo,usuarios.cedula,admins.nombre as rango FROM `usuarios` JOIN admins ON usuarios.nadmin = admins.id WHERE usuarios.sucursal=? AND usuarios.nadmin!=1 AND usuarios.nadmin!=4;';
  const conexion =await conectarBaseDeDatos()
  try {
    const result = await conexion.query(consulta,[id_sucursal]);
    conexion.end();
    console.log('CONEXION CERRADA');
    if (result.length > 0) {
      return result
    } else {
      return [{ Mensaje: 'No hay usuarios en esta sucursal' }];
    }
  } catch (error) {
    console.log('Error al obtener registro de usuarios en la sucursal:', error);
    throw error; 
  }
}
async function Obtenerpagospendientes(){
  const consulta = 'SELECT p.referencia,p.monto, ba.nombre AS Banco ,us.usuario AS Reportante,su.nombre AS sucursal FROM pagos p JOIN usuarios us ON p.id_reportante = us.id JOIN sucursales su ON us.sucursal = su.id JOIN bancos ba ON p.banco_id = ba.id WHERE p.estado_id=1 AND DATE(p.fecha_emision) = CURDATE();';
  const conexion =await conectarBaseDeDatos()
  try {
    const result = await conexion.query(consulta);
    conexion.end();
    console.log('CONEXION CERRADA');
    if (result.length > 0) {
      return result
    } else {
      return [{ Mensaje: 'No hay pagos pendientes' }];
    }
  } catch (error) {
    console.log('Error al obtener registro de pagos pendientes:', error);
    throw error; 
  }
}
async function Todosusuarios(){
  const consulta = 'SELECT us.correo,us.cedula,us.usuario,us.clave,us.nadmin,us.sucursal, su.nombre as nombre_sucursal,ad.nombre as nombre_rol,ad.responsabilidad FROM usuarios us JOIN sucursales su ON us.sucursal = su.id JOIN admins ad ON us.nadmin = ad.id WHERE us.id!=4 AND us.nadmin!=1;';
  const conexion =await conectarBaseDeDatos()
  try {
    const result = await conexion.query(consulta);
    conexion.end();
    console.log('CONEXION CERRADA');
    if (result.length > 0) {
      return result
    } else {
      return [{ Mensaje: 'No hay pagos pendientes' }];
    }
  } catch (error) {
    console.log('Error al obtener registro de pagos pendientes:', error);
    throw error; 
  }
}
async function darestadopedido(estado_pedido,responsable_id,id_pedido){
  const consulta = 'UPDATE pedidos SET estado_pedido=?,responsable_id=? WHERE pedidos.id=? AND DATE(pedidos.fecha_reportado) = CURDATE();';
  const conexion =await conectarBaseDeDatos()
  try {
    const result = await conexion.query(consulta,[estado_pedido,responsable_id,id_pedido]);
    conexion.end();
    console.log('CONEXION CERRADA');
    if (result.length > 0) {
      return result
    } else {
      return [{ Mensaje: 'Actualizacion erronea' }];
    }
  } catch (error) {
    console.log('Error al cambiar el estado del pedido:', error);
    throw error; 
  }
}
async function darestadopago(estado_pago,responsable_estado,ref_pago){
  const consulta = 'UPDATE pagos SET estado_id=?,responsable_estado=? WHERE pagos.referencia =? AND DATE(pagos.fecha_emision) = CURDATE();';
  const conexion =await conectarBaseDeDatos()
  try {
    const result = await conexion.query(consulta,[estado_pago,responsable_estado,ref_pago]);
    conexion.end();
    console.log('CONEXION CERRADA');
    if (result.length > 0) {
      return result
    } else {
      return [{ Mensaje: 'Actualizacion erronea' }];
    }
  } catch (error) {
    console.log('Error al cambiar el estado del pago:', error);
    throw error; 
  }
}
async function Obtenerdeliveryspendientes(){
  const consulta = 'SELECT pe.id,cl.nombre,cl.apellido,cl.direccion, cl.cedula,us.usuario AS nom_reportante, pag.referencia,de.nombre_delivery FROM pedidos pe JOIN deliverys de ON pe.delivery_id = de.id JOIN clientes cl ON pe.id_cliente = cl.id JOIN usuarios us ON pe.id_reportante = us.id JOIN pagos pag ON pe.pago_id = pag.id WHERE pe.estado_pedido=1 AND DATE(pe.fecha_reportado) = CURDATE();';
  const conexion =await conectarBaseDeDatos()
  try {
    const result = await conexion.query(consulta);
    conexion.end();
    console.log('CONEXION CERRADA');
    if (result.length > 0) {
      return result
    } else {
      return [{ Mensaje: 'No hay deliverys pendientes' }];
    }
  } catch (error) {
    console.log('Error al obtener registro de deliverys pendientes:', error);
    throw error; 
  }
}
async function Obtenerdelivery(nombre_delivery){
  const consulta = 'SELECT * FROM deliverys WHERE nombre_delivery=?;';
  const conexion =await conectarBaseDeDatos()
  try {
    const result = await conexion.query(consulta,[nombre_delivery]);
    conexion.end();
    console.log('CONEXION CERRADA');
    if (result.length > 0) {
      return result
    } else {
      return false;
    }
  } catch (error) {
    console.log('Error al obtener registro de deliverys pendientes:', error);
    throw error; 
  }
}
async function Reusuario(correo,cedula,usuario,clave,nadmin,sucursal) {
  const consulta = 'INSERT INTO usuarios(correo,cedula,usuario,clave, nadmin, sucursal) VALUES (?,?,?,?,?,?)';
  const conexion =await conectarBaseDeDatos()
  try {
    const result = await conexion.query(consulta, [correo,cedula,usuario,clave,nadmin,sucursal]);
    conexion.end();
    console.log('CONEXION CERRADA');
    console.log('Usuario registrado con exito');
  } catch (error) {
    console.log('Error al registrar usuario:', error);
    throw error; 
  }
}
async function banearusuario(cedula){
  const consulta = 'UPDATE usuarios SET nadmin = 1 WHERE usuarios.cedula = ?';
  const conexion =await conectarBaseDeDatos()
  try {
    const result = await conexion.query(consulta,[cedula]);
    conexion.end();
    console.log('CONEXION CERRADA');
    if (result.length > 0) {
      return result
    } else {
      return [{ Mensaje: 'Actualizacion erronea' }];
    }
  } catch (error) {
    console.log('Error al cambiar el nivel admin:', error);
    throw error; 
  }
}
async function CambiarInfoUsuario(correo,cedula,usuario,clave,nadmin,sucursal,c_ius){
  const consulta = 'UPDATE usuarios SET correo=?,cedula=?,usuario=?,clave=?,nadmin=?,sucursal=? WHERE usuarios.cedula=?';
  const conexion =await conectarBaseDeDatos()
  try {
    const result = await conexion.query(consulta,[correo,cedula,usuario,clave,nadmin,sucursal,c_ius]);
    conexion.end();
    console.log('CONEXION CERRADA');
    if (result.length > 0) {
      return result
    } else {
      return [{ Mensaje: 'Actualizacion erronea' }];
    }
  } catch (error) {
    console.log('Error al cambiar informacion del usuario:', error);
    throw error; 
  }
}
module.exports ={
    comprobarlogeo,
    registrarToken,
    obtenerUltimoToken,
    Repago,
    VpagosUsu,
    Recliente,
    comExiPro,
    reProducto,
    Redelivery,
    comExicliente,
    Repedido,
    Redelivery,
    Obtenerdelivery,
    Vdeliverysusu,
    obteneridbanco,
    Vbancos,
    Rebanco,
    Vsucursales,
    Resucursal,
    PagosAppSucursal,
    TodosPagosEnSucursal,
    usuariosEnSucursal,
    DeliverysAPPEnSucursal,
    Obtenerpagospendientes,
    Todosusuarios,
    Obtenerdeliveryspendientes,
    darestadopedido,
    darestadopago,
    Reusuario,
    banearusuario,
    CambiarInfoUsuario,
    Redetalles,
    comExipagoEnpedido,
    Vpago,
    VerPagoregistrado,
    ObidPedidoConCI
}