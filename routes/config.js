const express = require('express');
const routerConfig = express.Router();

// Importar o controller
const configController = require('../controllers/configController');

// Importar autenticação e middleware
const auth = require('../auth');
const requireAdmin = require('../middlewares/requireAdmin');

// GET /configs - Listar todas as configurações (apenas admin)
routerConfig.get('/configs', auth.passport.authenticate('jwt', { session: false }), requireAdmin, configController.getAllConfigs.bind(configController));

// GET /configs/menu/colors - Obter cores do menu (apenas admin)
routerConfig.get('/configs/menu/colors', auth.passport.authenticate('jwt', { session: false }), requireAdmin, configController.getMenuColors.bind(configController));

// POST /configs/menu/colors - Salvar cores do menu (apenas admin)
routerConfig.post('/configs/menu/colors', auth.passport.authenticate('jwt', { session: false }), requireAdmin, configController.saveMenuColors.bind(configController));

// GET /configs/roles - Obter lista de roles disponíveis (apenas admin)
routerConfig.get('/configs/roles', auth.passport.authenticate('jwt', { session: false }), requireAdmin, configController.getRoles.bind(configController));

// Manter rota antiga para compatibilidade temporária
routerConfig.get('/configs/roles', auth.passport.authenticate('jwt', { session: false }), requireAdmin, configController.getRoles.bind(configController));

// GET /configs/:id - Buscar configuração por ID (apenas admin)
routerConfig.get('/configs/:id', auth.passport.authenticate('jwt', { session: false }), requireAdmin, configController.getConfigById.bind(configController));

// POST /configs - Criar nova configuração (apenas admin)
routerConfig.post('/configs', auth.passport.authenticate('jwt', { session: false }), requireAdmin, configController.createConfig.bind(configController));

// PUT /configs/:id - Atualizar configuração (apenas admin)
routerConfig.put('/configs/:id', auth.passport.authenticate('jwt', { session: false }), requireAdmin, configController.updateConfig.bind(configController));

// DELETE /configs/:id - Deletar configuração (apenas admin)
routerConfig.delete('/configs/:id', auth.passport.authenticate('jwt', { session: false }), requireAdmin, configController.deleteConfig.bind(configController));

module.exports = routerConfig; 