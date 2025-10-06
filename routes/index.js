var express = require('express');
var router = express.Router();
const db = require("../db");

var auth = require('../auth');

// Importar rotas
const userRoutes = require('./user');
const configRoutes = require('./config');
const menuRoutes = require('./menu');
const menuItensRoutes = require('./menuItens');
const healthRoutes = require('./health');

// Usar as rotas
router.use('/', userRoutes);
router.use('/', configRoutes);
router.use('/', menuRoutes);
router.use('/', menuItensRoutes);
router.use('/', healthRoutes);

module.exports = router;
