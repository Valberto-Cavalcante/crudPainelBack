const express = require('express');
const routerUser = express.Router();
const bcrypt = require('bcryptjs');
const db = require("../db");
const userModel = require("../models/userModel");
const menuModel = require("../models/menuModel");

// Importe a estratégia JWT que você configurou
const auth = require('../auth');

// Importar o controller
const userController = require('../controllers/userController');
const requireAdmin = require('../middlewares/requireAdmin');

// GET /users - Listar todos os usuários
routerUser.get('/users', auth.passport.authenticate('jwt', { session: false }), requireAdmin, userController.getAllUsers.bind(userController));

// GET /users/:id - Buscar usuário por ID
routerUser.get('/users/:id', auth.passport.authenticate('jwt', { session: false }), requireAdmin, userController.getUserById.bind(userController));

// POST /users - Criar novo usuário
routerUser.post('/users', auth.passport.authenticate('jwt', { session: false }), requireAdmin, userController.createUser.bind(userController));

// PUT /users/:id - Atualizar usuário (apenas admin)
routerUser.put('/users/:id', auth.passport.authenticate('jwt', { session: false }), requireAdmin, userController.updateUser.bind(userController));

// DELETE /users/:id - Deletar usuário (apenas admin)
routerUser.delete('/users/:id', auth.passport.authenticate('jwt', { session: false }), requireAdmin, userController.deleteUser.bind(userController));

// PATCH /users/:id/reactivate - Reativar usuário (apenas admin)
routerUser.patch('/users/:id/reactivate', auth.passport.authenticate('jwt', { session: false }), requireAdmin, userController.reactivateUser.bind(userController));

// POST /auth/logout - Logout do usuário
routerUser.post('/auth/logout', async (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.STATUS_PROJETO === 'production',
        sameSite: 'strict',
        path: '/'
    });
    const { logAuthEvent } = require('./utils/logAuthEvent');
    await logAuthEvent({ req, res, user: req.user, action: 'LOGOUT' });
    res.json({
        success: true,
        message: "Logout realizado com sucesso"
    });
});

// GET /auth/me - Verificar sessão atual
routerUser.get('/auth/me', auth.passport.authenticate('jwt', { session: false }), (req, res) => {
    try {
        console.log('🔍 /auth/me - Verificando sessão para usuário:', req.user);
        
        // req.user contém os dados do usuário do token JWT
        const userData = userModel.formatUserForLogin(req.user);
        console.log('✅ /auth/me - Usuário formatado:', userData);
        
        res.json({
            success: true,
            data: {
                user: userData,
                permissions: userData.tipo ? [userData.tipo] : []
            }
        });
    } catch (error) {
        console.error('❌ /auth/me - Erro ao verificar sessão:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// POST /auth/login - Login do usuário da plataforma admin
routerUser.post('/auth/login', async (req, res, next) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ 
            success: false, 
            error: "email e senha são obrigatórios" 
        });
    }

    try {
        console.log("login attempt", email);
        
        // Busca o usuário pelo userName ou email
        const user = await db.findOne("usuarios", { 
            $or: [
                { userName: email.trim() },
                { email: email.trim() }
            ],
            ativo: true 
        });

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                error: "Usuário não encontrado" 
            });
        }

        // Verifica a senha usando o model
        const passwordValid = await userModel.comparePassword(senha, user.pass);

        if (!passwordValid) {
            return res.status(401).json({ 
                success: false, 
                error: "Senha incorreta" 
            });
        }

        // Formata para o frontend usando o model (sem senha_hash para login)
        const userForFrontend = userModel.formatUserForLogin(user);
        
        // Gerar token JWT
        const token = auth.jwt.sign(
            { id: userForFrontend.id, userName: userForFrontend.userName, roles: userForFrontend.roles},
            auth.jwtOptions.secretOrKey,
            { expiresIn: '7d' }
        );
        
        // Definir cookie HttpOnly seguro
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.STATUS_PROJETO === 'production', // HTTPS apenas em produção
            sameSite: 'lax', // Mudado de 'strict' para 'lax' para permitir navegação
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
            path: '/'
        });
        
        res.json({
            success: true,
            message: "Login realizado com sucesso",
            data: {
                user: userForFrontend,
                permissions: userForFrontend.tipo ? [userForFrontend.tipo] : []
            }
        });
        const { logAuthEvent } = require('./utils/logAuthEvent');
        await logAuthEvent({ req, res, user: userForFrontend, action: 'LOGIN' });
    } catch (err) {
        console.log("Erro no login", err);
        next(err);
    }
});

// POST /auth/login/conteudo - Login do usuário pedagogico
routerUser.post('/auth/login/conteudo', async (req, res, next) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ 
            success: false, 
            error: "email e senha são obrigatórios" 
        });
    }

    try {
        console.log("login attempt", email);
        
        // Busca o usuário pelo userName ou email
        const user = await db.findOne("usuarios", { 
            $or: [
                { userName: email.trim() },
                { email: email.trim() }
            ],
            ativo: true 
        });

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                error: "Usuário não encontrado" 
            });
        }

        // Verifica a senha usando o model
        const passwordValid = await userModel.comparePassword(senha, user.pass);

        if (!passwordValid) {
            return res.status(401).json({ 
                success: false, 
                error: "Senha incorreta" 
            });
        }
        
        // Buscar menu correspondente ao primeiro role do usuário
        let userMenu = null;
        if (user.roles && user.roles.length > 0) {
            const firstRole = user.roles[0];
            const menu = await menuModel.getMenuByRole(db, firstRole);
            // Retorna apenas o menusItensArray formatado no padrão específico do frontend
            userMenu = menu ? menuModel.formatMenusItensArrayForFrontend(menu.menusItensArray) : null;
        }
        
        // Gerar token JWT
        const token = auth.jwt.sign(
            { id: user.id, roles: user.roles},
            auth.jwtOptions.secretOrKey,
            { expiresIn: '7d' }
        );
        
        res.json({
            success: true,
            message: "Login realizado com sucesso",
            id_usu: user.id,
            roles: user.roles,
            token: token,
            menu: userMenu
        });

    } catch (err) {
        console.log("Erro no login", err);
        next(err);
    }
});

// PUT /auth/password - Atualizar senha do usuário
routerUser.put('/auth/password', auth.passport.authenticate('jwt', { session: false }), async (req, res, next) => {
    const { userName, oldPass, newPass } = req.body;

    if (!userName || !oldPass || !newPass) {
        return res.status(400).json({ 
            success: false, 
            error: "userName, senha atual e nova senha são obrigatórios" 
        });
    }

    if (newPass.length < 6) {
        return res.status(400).json({ 
            success: false, 
            error: "Nova senha deve ter pelo menos 6 caracteres" 
        });
    }

    try {
        // Verifica se o usuário existe
        const user = await db.findOne("usuarios", { 
            userName: userName.trim(), 
            ativo: true 
        });

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                error: "Usuário não encontrado" 
            });
        }

        // Verifica se a senha antiga está correta usando o model
        const oldPasswordValid = await userModel.comparePassword(oldPass, user.pass);

        if (!oldPasswordValid) {
            return res.status(401).json({ 
                success: false, 
                error: "Senha atual incorreta" 
            });
        }

        // Criptografa a nova senha usando o model
        const hashedNewPassword = await userModel.hashPassword(newPass);

        // Atualiza a senha
        const filtroUser = { _id: user._id };
        const execUser = { $set: { pass: hashedNewPassword } };
        const resultadoAtualiza = await db.atualizaUm("usuarios", filtroUser, execUser, true);

        res.json({
            success: true,
            message: "Senha atualizada com sucesso",
            modifiedCount: resultadoAtualiza.modifiedCount
        });

    } catch (err) {
        console.log("Erro ao atualizar senha", err);
        next(err);
    }
});

// GET /userstodos/:id? - Rota legacy para listar usuários
routerUser.get('/userstodos/:id?', auth.passport.authenticate('jwt', { session: false }), requireAdmin, async (req, res, next) => {
    try {
        const xId = req.params.id;
        
        let query = {};
        
        if (xId === "ativos") {
            query.ativo = true;
        } else if (xId === "admin") {
            query.roles = { $in: ["admin"] };
        } else if (xId === "conteudo") {
            query.roles = { $in: ["conteudo"] };
        } else if (xId && xId !== "todos") {
            const xIdInteiro = parseInt(xId, 10);
            if (!isNaN(xIdInteiro)) {
                query.id = xIdInteiro;
            }
        }

        const aggUsers = [
            { $match: query },
            {
                $project: {
                    _id: 0,
                    id: 1,
                    email: 1,
                    userName: 1,
                    senha_hash: "$pass",
                    nome: 1,
                    tipo: 1,
                    createdAt: "$__new",
                    updatedAt: "$__editado",
                    ativo: 1
                }
            }
        ];

        const users = await db.findColecaoAgg("usuarios", aggUsers);
        
        // Retorna diretamente um array, compatível com frontend que faz users.map
        res.json(Array.isArray(users) ? users : (users ? [users] : []));

    } catch (err) {
        console.log("Erro na rota legacy userstodos", err);
        next(err);
    }
});

module.exports = routerUser;
