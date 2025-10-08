/**
 * Controller responsável pelo gerenciamento de usuários
 * 
 * Funcionalidades:
 * - Criação e gerenciamento de contas de usuário
 * - Validação de dados do usuário (email, userName, senha, nome)
 * - Gerenciamento de papéis e permissões
 * - Autenticação e segurança
 * - Listagem paginada de usuários
 * - Controle de status de conta (ativo/inativo)
 */

const userModel = require('../models/userModel');
const { ROLES_ARRAY } = require('../utils/roles');
const db = require('../db');
const PaginationUtils = require('../utils/pagination');

class UserController {

    // Função para validar dados do usuário
    validateUserData(userData, isUpdate = false) {
        const errors = [];

        if (!isUpdate) {
            // Validação de email ou userName (pelo menos um deve estar presente)
            if ((!userData.email || userData.email.trim() === '') &&
                (!userData.userName || userData.userName.trim() === '')) {
                errors.push('email ou userName é obrigatório');
            }
            if (!userData.senha || userData.senha.trim() === '') {
                errors.push('senha é obrigatória');
            }
            if (!userData.nome || userData.nome.trim() === '') {
                errors.push('nome é obrigatório');
            }
            if (!userData.roles || (Array.isArray(userData.roles) && userData.roles.length === 0)) {
                errors.push('roles é obrigatório');
            }
        }

        if (userData.senha && userData.senha.length < 6) {
            errors.push('senha deve ter pelo menos 6 caracteres');
        }

        if (userData.userName && userData.userName.length < 3) {
            errors.push('userName deve ter pelo menos 3 caracteres');
        }

        if (userData.nome && userData.nome.length < 3) {
            errors.push('nome deve ter pelo menos 3 caracteres');
        }
        let errorRoles = [];
        // Validação dos roles
        // if (userData.roles) {
        //     const rolesArray = Array.isArray(userData.roles) ? userData.roles : [userData.roles];
        //     for (const role of rolesArray) {
        //         if (!ROLES_ARRAY.includes(role)) {
        //             errorRoles.push(role);
        //         }
        //     }
        //     if (errorRoles.length == rolesArray.length) {
        //         errors.push(`O usuário deve ter pelo menos um desses roles ${ROLES_ARRAY.join(', ')}`);
        //     }
        // }

        return errors;
    }

    // Criar novo usuário
    async createUser(req, res) {
        try {
            const {
                email,
                userName,
                senha,
                nome,
                roles,
                ativo = true,
                perfil,
                matricula,
                ra,
                dataNascimento,
                formacao,
                experiencia,
                especialidade,
                responsaveis,
                extra
            } = req.body;

            // Validação dos dados usando o controller
            const userData = {
                email,
                userName,
                senha,
                nome,
                roles,
                ativo,
                perfil,
                matricula,
                ra,
                dataNascimento: dataNascimento && dataNascimento.trim() ? new Date(dataNascimento) : null,
                formacao,
                experiencia,
                especialidade,
                responsaveis
            };
            const validationErrors = this.validateUserData(userData, false);

            if (validationErrors.length > 0) {
                return res.status(400).json({
                    success: false,
                    error: validationErrors.join(', ')
                });
            }

            // Gera ID único para o usuário
            const userId = await userModel.generateUserId(db);
            userData.id = userId;

            // Determina o userName baseado no email ou userName fornecido
            let finalUserName;
            let finalEmail;

            if (userName) {
                finalUserName = userName.trim();
                finalEmail = email ? email.trim() : `${userName.trim()}@example.com`;
            } else if (email) {
                // Extrai userName do email (parte antes do @)
                finalUserName = email.split('@')[0];
                finalEmail = email.trim();
            }

            // Verifica se já existe um usuário com o mesmo userName (ativo ou inativo)
            const testaUserName = await db.findOne("usuarios", { userName: finalUserName });
            if (testaUserName) {
                return res.status(400).json({
                    success: false,
                    error: "Já existe um usuário com esse userName: " + finalUserName
                });
            }

            // Verifica se já existe um usuário com o mesmo email (ativo ou inativo)
            const testaEmail = await db.findOne("usuarios", { email: finalEmail });
            if (testaEmail) {
                return res.status(400).json({
                    success: false,
                    error: "Já existe um usuário com esse email: " + finalEmail
                });
            }

            // Usa o model para criar o usuário
            const newUser = await userModel.createUser({
                id: userData.id,
                userName: finalUserName,
                email: finalEmail,
                pass: userData.senha, // Converte senha para pass
                nome: userData.nome,
                roles: Array.isArray(roles) ? roles : [roles],
                ativo: userData.ativo,
                perfil: userData.perfil || null,
                matricula: userData.matricula || null,
                ra: userData.ra || null,
                dataNascimento: userData.dataNascimento,
                formacao: userData.formacao || null,
                experiencia: userData.experiencia || null,
                especialidade: userData.especialidade || null,
                responsaveis: userData.responsaveis || null,
                extra: extra || null,
                __new: new Date(),
                __editado: new Date()
            });

            // Insere no banco
            const result = await db.insert("usuarios", newUser, true);

            // Busca o usuário criado
            const createdUser = await db.findOne("usuarios", { _id: result.insertedId });

            // Formata para o frontend (sem senha_hash)
            const userForFrontend = userModel.formatUserForLogin(createdUser);

            res.status(201).json({
                success: true,
                message: "Usuário criado com sucesso",
                data: userForFrontend
            });

        } catch (err) {
            console.log("Erro ao criar usuário", err);
            console.log("Stack trace:", err.stack);
            res.status(500).json({
                success: false,
                error: "Erro interno do servidor"
            });
        }
    }

    // Buscar todos os usuários com paginação
    async getAllUsers(req, res) {
        try {
            const { page = 1, limit = 15, filter } = req.query;

            // Validar parâmetros de paginação
            const { page: validatedPage, limit: validatedLimit } = PaginationUtils.validatePaginationParams(page, limit);

            // Construir query baseada nos filtros separados
            let query = {};

            // Filtro de status (ativo/inativo)
            const statusFilter = req.query.status;
            if (statusFilter) {
                if (statusFilter === 'inactive') {
                    query.ativo = false;
                } else if (statusFilter === 'active') {
                    query.ativo = true;
                }
                // Se statusFilter for 'all', não aplica filtro de status
            } else {
                // Por padrão, mostra apenas usuários ativos
                query.ativo = true;
            }

            // Filtro de roles
            const roleFilter = req.query.role;
            if (roleFilter && roleFilter !== 'all') {
                if (roleFilter === 'admin') {
                    query.roles = { $in: ["admin"] };
                } else if (roleFilter === 'professor') {
                    query.roles = { $in: ["professor"] };
                } else if (roleFilter === 'aluno') {
                    query.roles = { $in: ["aluno"] };
                } else if (roleFilter === 'coordenador') {
                    query.roles = { $in: ["coordenador"] };
                } else if (roleFilter === 'supervisor') {
                    query.roles = { $in: ["supervisor"] };
                }
            }

            // Buscar total de usuários ativos para calcular paginação
            const totalItems = await db.count("usuarios", query);

            // Calcular informações de paginação
            const paginationInfo = PaginationUtils.getPaginationInfo(validatedPage, validatedLimit, totalItems);

            // Buscar usuários ativos com paginação
            const users = await db.find("usuarios", query, {
                skip: paginationInfo.skip,
                limit: paginationInfo.itemsPerPage
            });

            // Formata todos os usuários para o frontend (sem senha_hash)
            const usersForFrontend = users.map(user => userModel.formatUserForLogin(user));

            // Retornar resposta paginada
            const response = PaginationUtils.formatPaginatedResponse(usersForFrontend, paginationInfo);
            res.json(response);

        } catch (err) {
            console.log("Erro ao buscar usuários", err);
            res.status(500).json({
                success: false,
                error: "Erro interno do servidor"
            });
        }
    }

    // Buscar usuário por ID
    async getUserById(req, res) {
        try {
            const userId = parseInt(req.params.id, 10);

            if (isNaN(userId)) {
                return res.status(400).json({
                    success: false,
                    error: "ID do usuário deve ser um número válido"
                });
            }

            const user = await db.findOne("usuarios", { id: userId, ativo: true });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: "Usuário não encontrado ou inativo"
                });
            }

            const userForFrontend = userModel.formatUserForLogin(user);

            res.json({
                success: true,
                data: userForFrontend
            });

        } catch (err) {
            console.log("Erro ao buscar usuário", err);
            res.status(500).json({
                success: false,
                error: "Erro interno do servidor"
            });
        }
    }

    // Atualizar usuário
    async updateUser(req, res) {
        try {
            const userId = parseInt(req.params.id, 10);
            const {
                email,
                userName,
                senha,
                nome,
                roles,
                ativo,
                perfil,
                matricula,
                ra,
                dataNascimento,
                formacao,
                experiencia,
                especialidade,
                responsaveis,
                extra
            } = req.body;

            if (isNaN(userId)) {
                return res.status(400).json({
                    success: false,
                    error: "ID do usuário deve ser um número válido"
                });
            }

            // Busca o usuário existente (ativo ou inativo - permite reativação)
            const existingUser = await db.findOne("usuarios", { id: userId });
            if (!existingUser) {
                return res.status(404).json({
                    success: false,
                    error: "Usuário não encontrado"
                });
            }

            // Validação dos dados usando o controller
            const userData = { email, userName, senha, nome, roles, ativo };
            const validationErrors = this.validateUserData(userData, true);

            if (validationErrors.length > 0) {
                return res.status(400).json({
                    success: false,
                    error: validationErrors.join(', ')
                });
            }

            // Prepara o objeto de atualização
            const updateData = {};

            if (userName !== undefined) {
                // Verifica se o novo userName já existe em outro usuário
                const existingUserWithUserName = await db.findOne("usuarios", {
                    userName: userName.trim(),
                    id: { $ne: userId }
                });
                if (existingUserWithUserName) {
                    return res.status(400).json({
                        success: false,
                        error: "Já existe outro usuário com esse userName: " + userName
                    });
                }
                updateData.userName = userName.trim();
            }

            if (email !== undefined) {
                // Verifica se o novo email já existe em outro usuário
                const existingUserWithEmail = await db.findOne("usuarios", {
                    email: email.trim(),
                    id: { $ne: userId }
                });
                if (existingUserWithEmail) {
                    return res.status(400).json({
                        success: false,
                        error: "Já existe outro usuário com esse email: " + email
                    });
                }
                updateData.email = email.trim();
            }

            if (nome !== undefined) {
                updateData.nome = nome.trim();
            }

            // if (roles !== undefined) {
            //     // Validação dos roles
            //     const rolesArray = Array.isArray(roles) ? roles : [roles];
            //     for (const role of rolesArray) {
            //         if (!ROLES_ARRAY.includes(role)) {
            //             return res.status(400).json({
            //                 success: false,
            //                 error: `role '${role}' deve ser: ${ROLES_ARRAY.join(', ')}`
            //             });
            //         }
            //     }
            //     updateData.roles = rolesArray;
            // }

            if (ativo !== undefined) {
                updateData.ativo = ativo;
            }

            // Atualiza os campos opcionais se fornecidos
            if (perfil !== undefined) {
                updateData.perfil = perfil || null;
            }
            if (matricula !== undefined) {
                updateData.matricula = matricula || null;
            }
            if (ra !== undefined) {
                updateData.ra = ra || null;
            }
            if (dataNascimento !== undefined) {
                updateData.dataNascimento = dataNascimento && dataNascimento.trim() ? new Date(dataNascimento) : null;
            }
            if (formacao !== undefined) {
                updateData.formacao = formacao || null;
            }
            if (experiencia !== undefined) {
                updateData.experiencia = experiencia || null;
            }
            if (especialidade !== undefined) {
                updateData.especialidade = especialidade || null;
            }
            if (responsaveis !== undefined) {
                updateData.responsaveis = responsaveis || null;
            }
            if (extra !== undefined) {
                updateData.extra = extra || null;
            }

            // Se uma nova senha foi fornecida, criptografa ela
            if (senha !== undefined) {
                updateData.pass = await userModel.hashPassword(senha);
            }

            // Usa o model para atualizar
            const updatedUser = await userModel.updateUser(existingUser, updateData);

            // Atualiza no banco
            const result = await db.update("usuarios", { id: userId }, updatedUser);

            if (result.modifiedCount > 0) {
                // Busca o usuário atualizado
                const user = await db.findOne("usuarios", { id: userId });
                const userForFrontend = userModel.formatUserForLogin(user);

                res.json({
                    success: true,
                    message: "Usuário atualizado com sucesso",
                    data: userForFrontend
                });
            } else {
                res.json({
                    success: true,
                    message: "Nenhuma alteração foi feita",
                    data: userModel.formatUserForLogin(existingUser)
                });
            }

        } catch (err) {
            console.log("Erro ao atualizar usuário", err);
            res.status(500).json({
                success: false,
                error: "Erro interno do servidor"
            });
        }
    }

    // Desativar usuário (marcar como inativo)
    async deleteUser(req, res) {
        try {
            const userId = parseInt(req.params.id, 10);

            if (isNaN(userId)) {
                return res.status(400).json({
                    success: false,
                    error: "ID do usuário deve ser um número válido"
                });
            }

            // Busca o usuário existente
            const existingUser = await db.findOne("usuarios", { id: userId });
            if (!existingUser) {
                return res.status(404).json({
                    success: false,
                    error: "Usuário não encontrado"
                });
            }

            // Marca o usuário como inativo
            const result = await db.update("usuarios", { id: userId }, {
                ativo: false,
                __editado: new Date()
            });

            if (result.modifiedCount > 0) {
                res.json({
                    success: true,
                    message: "Usuário desativado com sucesso"
                });
            } else {
                res.status(500).json({
                    success: false,
                    error: "Erro ao desativar usuário"
                });
            }

        } catch (err) {
            console.log("Erro ao desativar usuário", err);
            res.status(500).json({
                success: false,
                error: "Erro interno do servidor"
            });
        }
    }

    // Reativar usuário (marcar como ativo)
    async reactivateUser(req, res) {
        try {
            const userId = parseInt(req.params.id, 10);

            if (isNaN(userId)) {
                return res.status(400).json({
                    success: false,
                    error: "ID do usuário deve ser um número válido"
                });
            }

            // Busca o usuário existente
            const existingUser = await db.findOne("usuarios", { id: userId });
            if (!existingUser) {
                return res.status(404).json({
                    success: false,
                    error: "Usuário não encontrado"
                });
            }

            // Marca o usuário como ativo
            const result = await db.update("usuarios", { id: userId }, {
                ativo: true,
                __editado: new Date()
            });

            if (result.modifiedCount > 0) {
                res.json({
                    success: true,
                    message: "Usuário reativado com sucesso"
                });
            } else {
                res.status(500).json({
                    success: false,
                    error: "Erro ao reativar usuário"
                });
            }

        } catch (err) {
            console.log("Erro ao reativar usuário", err);
            res.status(500).json({
                success: false,
                error: "Erro interno do servidor"
            });
        }
    }

    // Login de usuário
    async loginUser(req, res) {
        try {
            const { email, senha } = req.body;

            // Valida os dados de entrada
            const validation = userModel.validateLoginData(email, senha);
            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    error: validation.errors.join(', ')
                });
            }

            // Busca o usuário
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

            // Verifica a senha
            const passwordValid = await userModel.comparePassword(senha, user.pass);

            if (!passwordValid) {
                return res.status(401).json({
                    success: false,
                    error: "Senha incorreta"
                });
            }

            // Formata para o frontend (sem senha_hash)
            const userForFrontend = userModel.formatUserForLogin(user);

            res.json({
                success: true,
                message: "Login realizado com sucesso",
                data: userForFrontend
            });

        } catch (err) {
            console.log("Erro no login", err);
            res.status(500).json({
                success: false,
                error: "Erro interno do servidor"
            });
        }
    }
}

module.exports = new UserController();