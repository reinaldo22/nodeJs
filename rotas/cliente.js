const express = require('express');
const rota = express.Router();
const mongoose = require("mongoose");
require("../models/Cliente");

rota.get('/', (req, res) => {
    res.send("teste");
});
module.exports = rota;