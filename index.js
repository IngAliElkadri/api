const express = require('express');
const app= express();
const ruter = require('./rutas');
const port=3000;

app.use(express.json());
app.use('/',ruter)
require('dotenv').config();

app.listen(port,()=>{
    console.log('escuchando en puerto 3000');
});