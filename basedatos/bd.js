const mysql = require('mysql2/promise');
async function conectarBaseDeDatos() {
    try {
        const conexion = await mysql.createConnection({
        host:'localhost', 
        user: 'root',    
        password: '',
        database: 'pago_verificado_v03', 
      });
      console.log('Conexión exitosa a la base de datos MySQL.');
      return conexion;
    } catch (error) {
      console.error('Error al conectar con la base de datos:', error);
    }
  };

module.exports = {
    conectarBaseDeDatos,
};