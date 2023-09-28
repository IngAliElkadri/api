const express = require('express');
const app= express();
const port=3000;

app.use(express.json());

require('dotenv').config();

app.listen(port,()=>{
    console.log('escuchando en puerto 3000');
});