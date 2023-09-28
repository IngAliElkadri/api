const express = require('express');
const ruter = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

app.use(express.json());
ruter.post('/inicioSesion',(req,res)=>{
    const {usuario,clave}=req.body;
    
});