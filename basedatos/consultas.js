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
  async function Repago(id_reportante,referencia,monto,banco_id,estado_id,responsable_estado,fecha_aceptado) {
    const consulta = 'INSERT INTO pagos(id_reportante, referencia, monto, banco_id, estado_id, responsable_estado, fecha_aceptado) VALUES (?,?,?,?,?,?,?)';
    const conexion =await conectarBaseDeDatos()
    try {
      const result = await conexion.query(consulta, [id_reportante,referencia,monto,banco_id,estado_id,responsable_estado,fecha_aceptado]);
      conexion.end();
      console.log('CONEXION CERRADA');
      console.log('Producto registrado con exito');
    } catch (error) {
      console.log('Error al verificar si el usuario está disponible:', error);
      throw error; // COMPROBAR NOMBRE USUARIO SI ESTA EXISTENTE
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
  const consulta = 'SELECT p.id,p.referencia,p.monto, e.estado AS nombre_estado, u.usuario AS nombre_responsable FROM pagos p JOIN estados e ON p.estado_id = e.id JOIN usuarios u ON p.responsable_estado = u.id WHERE p.id_reportante = ? AND DATE(p.fecha_emision) = CURDATE();';
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
    console.log('Error al verificar si el usuario está disponible:', error);
    throw error; // COMPROBAR NOMBRE USUARIO SI ESTA EXISTENTE
  }
}
async function Redelivery(id_pedido,nombre_delivery) {
  const consulta = 'INSERT INTO deliverys(id_pedido, nombre_delivery) VALUES (?,?)';
  const conexion =await conectarBaseDeDatos()
  try {
    const result = await conexion.query(consulta, [id_pedido,nombre_delivery]);
    conexion.end();
    console.log('CONEXION CERRADA');
    console.log('Delivery registrado con exito');
  } catch (error) {
    console.log('Error al registrar delivery:', error);
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
async function Repedido(id_pedido,id_cliente,id_reportante,id_producto,cantidad,precio_u,estado_pedido) {
  const consulta = 'INSERT INTO pedidos(id_pedido, id_cliente, id_reportante, id_producto, cantidad, precio_u, estado_pedido) VALUES (?,?,?,?,?,?,?)';
  const conexion =await conectarBaseDeDatos()
  try {
    const result = await conexion.query(consulta, [id_pedido,id_cliente,id_reportante,id_producto,cantidad,precio_u,estado_pedido]);
    conexion.end();
    console.log('CONEXION CERRADA');
    console.log('pedido registrado con exito');
  } catch (error) {
    console.log('Error al registrar pedido:', error);
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
    Repedido
}