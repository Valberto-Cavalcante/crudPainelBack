/**
 * Controller responsável pelo gerenciamento de menus do sistema
 * 
 * Funcionalidades:
 * - Criação e gerenciamento de menus do sistema
 * - Validação de dados do menu (título e roles)
 * - controle de permissões de acesso aos menus
 * - Listagem paginada de menus
 * - Organização hierárquica de menus
 */

const menuModel = require('../models/menuModel');
const db = require('../db');
const PaginationUtils = require('../utils/pagination');

class MenuController {

    // Função para validar dados de menu
    validateMenuData(menuData, isUpdate = false) {
        console.log('🔍 Validando dados do menu:', menuData);
        const errors = [];

        if (!isUpdate) {
            console.log('🔍 Validando title:', menuData.title);
            if (!menuData.title || menuData.title.trim() === '') {
                errors.push('title é obrigatório');
            }
            console.log('🔍 Validando roles:', menuData.roles, 'Tipo:', typeof menuData.roles);
            // Como convertemos roles para string, não precisamos validar como array
            if (!menuData.roles || menuData.roles.trim() === '') {
                errors.push('roles é obrigatório');
            }
        }

        if (menuData.title && menuData.title.length < 3) {
            errors.push('title deve ter pelo menos 3 caracteres');
        }

        console.log('🔍 Erros de validação encontrados:', errors);
        return errors;
    }

    // Obter todas as menu com paginação
    async getAllMenus(req, res) {
        try {
            const { page = 1, limit = 15 } = req.query;
            
            // Validar parâmetros de paginação
            const { page: validatedPage, limit: validatedLimit } = PaginationUtils.validatePaginationParams(page, limit);
            
            // Buscar total de menus para calcular paginação
            const totalItems = await db.countAll("menu");
            
            // Calcular informações de paginação
            const paginationInfo = PaginationUtils.getPaginationInfo(validatedPage, validatedLimit, totalItems);
            
            // Buscar menus com paginação
            const menus = await menuModel.getAllMenusPaginated(db, paginationInfo.skip, paginationInfo.itemsPerPage);

            // Retornar resposta paginada
            const response = PaginationUtils.formatPaginatedResponse(menus, paginationInfo);
            res.json(response);

        } catch (err) {
            console.log("Erro ao buscar menu", err);
            res.status(500).json({
                success: false,
                error: "Erro interno do servidor"
            });
        }
    }

    // Obter menu por ID
    async getMenuById(req, res) {
        try {
            const menuId = parseInt(req.params.id, 10);
            if (isNaN(menuId)) {
                return res.status(400).json({
                    success: false,
                    error: "ID da menu deve ser um número válido"
                });
            }

            const menu = await menuModel.getMenuById(db, menuId);

            if (!menu) {
                return res.status(404).json({
                    success: false,
                    error: "Menu não encontrada"
                });
            }

            // Log apenas dos IDs e títulos dos itens para identificar duplicatas
            if (menu.menusItensArray && menu.menusItensArray.length > 0) {
                console.log("🔍 ITENS DO MENU - IDs e Títulos:");
                menu.menusItensArray.forEach((item, index) => {
                    console.log(`Item ${index + 1}: ID=${item.id}, Title="${item.title}"`);
                });
            }

            res.json({
                success: true,
                data: menu
            });

        } catch (err) {
            console.log("Erro ao buscar menu", err);
            res.status(500).json({
                success: false,
                error: "Erro interno do servidor"
            });
        }
    }

    // Criar nova menu
    async createMenu(req, res) {
        try {
            console.log('🔄 POST /menus - Dados recebidos:', req.body);
            const { title, roles, menusItensArray = [], ativo = true } = req.body;
        
            // Converter roles de array para string para compatibilidade com banco
            const rolesString = Array.isArray(roles) ? roles.join(',') : roles;

            // Validação dos dados
            const menuData = { 
                title, 
                roles: rolesString, 
                menusItensArray, 
                ativo, 
                __new: new Date() 
            };
            console.log('📦 Dados processados para criar menu:', menuData);
            const validationErrors = this.validateMenuData(menuData, false);

            if (validationErrors.length > 0) {
                console.log('❌ Erros de validação:', validationErrors);
                return res.status(400).json({
                    success: false,
                    error: validationErrors.join(', ')
                });
            }
            console.log('✅ Validação passou');

            // Verifica se já existe um menu com o mesmo título e roles (apenas menus não deletados)
            console.log('🔍 Verificando se menu já existe...');
            console.log('🔍 Buscando por title:', title.trim(), 'e roles:', roles);

            const existingMenu = await db.findOne("menu", {
                title: title.trim(),
                roles: { $regex: rolesString, $options: 'i' }, // Busca case-insensitive
                $or: [
                    { isDeleted: { $exists: false } },
                    { isDeleted: false }
                ]
            });

            if (existingMenu) {
                console.log('❌ Menu já existe:', existingMenu);
                return res.status(400).json({
                    success: false,
                    error: "Já existe um menu cadastrado para este cargo"
                });
            }
            console.log('✅ Menu não existe, pode criar');

            // Gera ID único para a menu
            console.log('🆔 Gerando ID para menu...');
            const menuId = await menuModel.generateMenuId(db);
            menuData.id = menuId;
            console.log('✅ ID gerado:', menuId);

            // Usa o model para criar a menu
            console.log('🏗️  Criando menu no model...');
            const newMenu = await menuModel.createMenu(menuData);
            console.log('✅ Menu criado no model:', newMenu);

            // Insere no banco
            console.log('💾 Inserindo no banco...');
            const result = await db.insert("menu", newMenu, true);
            console.log('✅ Inserido no banco:', result);

            // Busca a menu criada
            console.log('🔍 Buscando menu criada...');
            const createdMenu = await db.findOne("menu", { _id: result.insertedId });
            console.log('✅ Menu encontrada:', createdMenu);

            // Formata para o frontend
            const menuForFrontend = menuModel.formatMenuForFrontend(createdMenu);
            console.log('✨ Menu formatada para frontend:', menuForFrontend);

            res.status(201).json({
                success: true,
                message: "Menu criada com sucesso",
                data: menuForFrontend
            });

        } catch (err) {
            console.log("Erro ao criar menu", err);
            res.status(500).json({
                success: false,
                error: "Erro interno do servidor"
            });
        }
    }

    // Atualizar menu
    async updateMenu(req, res) {
        try {
            console.log('🔄 PUT /menus/:id - Dados recebidos:', req.body);
            const menuId = parseInt(req.params.id, 10);
            const { title, roles, menusItensArray, ativo } = req.body;
            
            // Converter roles de array para string para compatibilidade com banco
            const rolesString = Array.isArray(roles) ? roles.join(',') : roles;

            if (isNaN(menuId)) {
                return res.status(400).json({
                    success: false,
                    error: "ID da menu deve ser um número válido"
                });
            }

            // Busca a menu existente
            const existingMenu = await db.findOne("menu", { id: menuId });
            if (!existingMenu) {
                return res.status(404).json({
                    success: false,
                    error: "Menu não encontrada"
                });
            }

            // Validação dos dados
            const menuData = { title, roles: rolesString, menusItensArray, ativo };
            const validationErrors = this.validateMenuData(menuData, true);

            if (validationErrors.length > 0) {
                return res.status(400).json({
                    success: false,
                    error: validationErrors.join(', ')
                });
            }

            // Verifica se já existe outro menu com o mesmo título e roles (apenas menus não deletados)
            if (title !== undefined || roles !== undefined) {
                const checkTitle = title !== undefined ? title.trim() : existingMenu.title;
                const checkRoles = roles !== undefined ? rolesString : existingMenu.roles;
                
                const duplicateMenu = await db.findOne("menu", {
                    id: { $ne: menuId }, // Exclui o próprio menu
                    title: checkTitle,
                    roles: { $regex: checkRoles, $options: 'i' }, // Busca case-insensitive
                    $or: [
                        { isDeleted: { $exists: false } },
                        { isDeleted: false }
                    ]
                });

                if (duplicateMenu) {
                    return res.status(400).json({
                        success: false,
                        error: "Já existe um menu cadastrado para este cargo"
                    });
                }
            }

            // Prepara o objeto de atualização
            const updateData = {};

            if (title !== undefined) {
                updateData.title = title.trim();
            }

            if (roles !== undefined) {
                updateData.roles = rolesString;
            }

            if (menusItensArray !== undefined) {
                updateData.menusItensArray = menusItensArray;
            }

            if (ativo !== undefined) {
                updateData.ativo = ativo;
            }

            // Usa o model para atualizar
            const updatedMenu = await menuModel.updateMenu(existingMenu, updateData);

            // Atualiza no banco
            const result = await db.update("menu", { id: menuId }, updatedMenu);

            if (result.modifiedCount > 0) {
                // Busca a menu atualizada
                const menu = await db.findOne("menu", { id: menuId });
                const menuForFrontend = menuModel.formatMenuForFrontend(menu);

                res.json({
                    success: true,
                    message: "Menu atualizada com sucesso",
                    data: menuForFrontend
                });
            } else {
                res.json({
                    success: true,
                    message: "Nenhuma alteração foi feita",
                    data: menuModel.formatMenuForFrontend(existingMenu)
                });
            }

        } catch (err) {
            console.log("Erro ao atualizar menu", err);
            res.status(500).json({
                success: false,
                error: "Erro interno do servidor"
            });
        }
    }

    // Deletar menu
    async deleteMenu(req, res) {
        try {
            const menuId = parseInt(req.params.id, 10);

            if (isNaN(menuId)) {
                return res.status(400).json({
                    success: false,
                    error: "ID da menu deve ser um número válido"
                });
            }

            // Busca a menu existente
            const existingMenu = await db.findOne("menu", { id: menuId });
            if (!existingMenu) {
                return res.status(404).json({
                    success: false,
                    error: "Menu não encontrada"
                });
            }

            // Deleta a menu
            const result = await db.deleteOne("menu", { id: menuId });

            if (result.modifiedCount > 0) {
                res.json({
                    success: true,
                    message: "Menu deletada com sucesso"
                });
            } else {
                res.status(500).json({
                    success: false,
                    error: "Erro ao deletar menu"
                });
            }

        } catch (err) {
            console.log("Erro ao deletar menu", err);
            res.status(500).json({
                success: false,
                error: "Erro interno do servidor"
            });
        }
    }

        // GET - todos os menus associados a uma perfil
        async getMenusByPerfil(req, res) {
            try {
                const perfilName = req.params.perfil;
    
                if (!perfilName || perfilName.trim() === '') {
                    return res.status(400).json({
                        success: false,
                        error: "Perfil é obrigatória"
                    });
                }
    
                console.log(`🔍 Buscando menus para a perfil: ${perfilName}`);
    
                // Busca menus que tenham essa perfil no campo "roles"
                const menus = await db.find("menu", {
                    roles: { $regex: `(^|,)${perfilName}(,|$)`, $options: 'i' }, // regex p/ perfil isolada
                    $or: [
                        { isDeleted: { $exists: false } },
                        { isDeleted: false }
                    ]
                });
    
                if (!menus || menus.length === 0) {
                    return res.status(404).json({
                        success: false,
                        error: "Nenhum menu encontrado para essa perfil"
                    });
                }
    
                // Formatar para frontend
                const formatted = menus.map(menuModel.formatMenuForFrontend);
    
                res.json({
                    success: true,
                    count: formatted.length,
                    data: formatted
                });
    
            } catch (err) {
                console.log("Erro ao buscar menus por perfil", err);
                res.status(500).json({
                    success: false,
                    error: "Erro interno do servidor"
                }
            )}}

}

module.exports = new MenuController();