const express = require('express');
const routerMenu = express.Router();

// Importar o controller
const menuController = require('../controllers/menuController');

// Importar autenticação e middleware
const auth = require('../auth');
const requireAdmin = require('../middlewares/requireAdmin');

// GET /menus - Listar todas as menu (apenas admin)
routerMenu.get('/menus', auth.passport.authenticate('jwt', { session: false }), requireAdmin, menuController.getAllMenus.bind(menuController));

// GET /menus/:id - Buscar menu por ID (apenas admin)
routerMenu.get('/menus/:id', auth.passport.authenticate('jwt', { session: false }), requireAdmin, menuController.getMenuById.bind(menuController));

// POST /menus - Criar nova menu (apenas admin)
routerMenu.post('/menus', auth.passport.authenticate('jwt', { session: false }), requireAdmin, menuController.createMenu.bind(menuController));

// PUT /menus/:id - Atualizar menu (apenas admin)
routerMenu.put('/menus/:id', auth.passport.authenticate('jwt', { session: false }), requireAdmin, menuController.updateMenu.bind(menuController));

// DELETE /menus/:id - Deletar menu (apenas admin)
routerMenu.delete('/menus/:id', auth.passport.authenticate('jwt', { session: false }), requireAdmin, menuController.deleteMenu.bind(menuController));

// GET /menus/perfil/:perfil - Buscar menu por perfil (apenas admin)
routerMenu.get('/menus/perfil/:perfil', menuController.getMenusByPerfil);


module.exports = routerMenu; 