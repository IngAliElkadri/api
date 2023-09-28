const mysql = require('mysql2');
const dbConfig ={
    host:process.env.HOST_DB,
    user:process.env.USER_DB,
    password:process.env.PASSWORD_DB,
    database:process.env.DB_NAME,
    port:3306
};
const conexion= mysql.createConnection(dbConfig);

conexion.connect((error)=>{
    if(error){
        console.log('ERROR AL CONECTAR BASE DE DATOS')
    }else{
        console.log('Conexion a la base de datos exitosa')
    }
});
conexion.end((error)=>{
    if(error){
        console.log('ERROR AL CERRAR CONEXION CON BASE DE DATOS');
    }else{
        console.log('CONEXION CON LA BASE DE DATOS CERRADA EXITOSAMENTE')
    }
});
module.exports = {
    conexion,
};