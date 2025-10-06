const express = require('express');
const routerMenuItens = express.Router();

// Importar o controller
const menuItensController = require('../controllers/menuItensController');

// Importar autenticação e middleware
const auth = require('../auth');
const requireAdmin = require('../middlewares/requireAdmin');

// GET /menu-itens - Listar todos os menuItens (apenas admin)
routerMenuItens.get('/menu-itens', auth.passport.authenticate('jwt', { session: false }), requireAdmin, menuItensController.getAllMenuItens.bind(menuItensController));

// GET /menu-itens/:id - Buscar menuItens por ID (apenas admin)
routerMenuItens.get('/menu-itens/:id', auth.passport.authenticate('jwt', { session: false }), requireAdmin, menuItensController.getMenuItensById.bind(menuItensController));

// POST /menu-itens - Criar novo menuItens (apenas admin)
routerMenuItens.post('/menu-itens', auth.passport.authenticate('jwt', { session: false }), requireAdmin, menuItensController.createMenuItens.bind(menuItensController));

// PUT /menu-itens/:id - Atualizar menuItens (apenas admin)
routerMenuItens.put('/menu-itens/:id', auth.passport.authenticate('jwt', { session: false }), requireAdmin, menuItensController.updateMenuItens.bind(menuItensController));

// DELETE /menu-itens/:id - Deletar menuItens (apenas admin)
routerMenuItens.delete('/menu-itens/:id', auth.passport.authenticate('jwt', { session: false }), requireAdmin, menuItensController.deleteMenuItens.bind(menuItensController));

// PATCH /menu-itens/:id/soft-delete - Soft delete de menuItens (apenas admin)
routerMenuItens.patch('/menu-itens/:id/soft-delete', auth.passport.authenticate('jwt', { session: false }), requireAdmin, menuItensController.softDeleteMenuItens.bind(menuItensController));

module.exports = routerMenuItens;