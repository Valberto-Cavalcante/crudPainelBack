/**
 * Controller responsável pelo gerenciamento de itens de menu
 * 
 * Funcionalidades:
 * - Criação e gerenciamento de itens de menu
 * - Validação de dados dos itens (título e path)
 * - Organização da estrutura de navegação
 * - Listagem paginada de itens de menu
 * - Associação de itens com seus menus pai
 */

const menuItensModel = require('../models/menuItensModel');
const db = require('../db');
const PaginationUtils = require('../utils/pagination');

class MenuItensController {
    // Validação dos dados
    validateMenuItensData(data, isUpdate = false) {
        const errors = [];

        if (!isUpdate) {
            if (!data.title || data.title.trim() === '') {
                errors.push('title é obrigatório');
            }
        }

        if (data.title && data.title.length < 3) {
            errors.push('title deve ter pelo menos 3 caracteres');
        }
        
        if (!data.path || data.path.trim() === '') {
            errors.push('O path é obrigatório');
        }

        return errors;
    }

    // GET - todos os menuItens com paginação
    async getAllMenuItens(req, res) {
        try {
            console.log('🔍 GET /menu-itens - Parâmetros recebidos:', req.query);
            const { page = 1, limit = 10 } = req.query;
            
            // Validar parâmetros de paginação
            const { page: validatedPage, limit: validatedLimit } = PaginationUtils.validatePaginationParams(page, limit);
            console.log('✅ Parâmetros validados:', { page: validatedPage, limit: validatedLimit });
            
            // Buscar menu items com paginação (já filtrado no modelo)
            const result = await menuItensModel.getAllMenuItensPaginated(db, (validatedPage - 1) * validatedLimit, validatedLimit);
            console.log('📦 Resultado do getAllMenuItensPaginated:', {
                totalItems: result.pagination?.totalItems,
                currentPage: result.pagination?.currentPage,
                totalPages: result.pagination?.totalPages,
                itemsCount: result.data?.length
            });

            // Retornar resposta paginada
            res.json(result);
        } catch (err) {
            console.error('❌ Erro ao buscar menuItens:', err);
            res.status(500).json({ success: false, error: 'Erro interno do servidor' });
        }
    }

    // GET - menuItens por ID
    async getMenuItensById(req, res) {
        try {
            const id = parseInt(req.params.id, 10);

            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'ID inválido' });
            }

            const item = await menuItensModel.getMenuItensById(db, id);

            if (!item) {
                return res.status(404).json({ success: false, error: 'MenuItens não encontrado' });
            }

            res.json({ success: true, data: item });

        } catch (err) {
            console.error('Erro ao buscar menuItens por ID:', err);
            res.status(500).json({ success: false, error: 'Erro interno do servidor' });
        }
    }

    // POST - criar novo menuItens
    async createMenuItens(req, res) {
        try {
            const {
                title, 
                iconName, 
                name, 
                path, 
                roles, 
                props = {}, 
                __new 
            } = req.body;

            // Converter roles para string (banco espera string)
            const rolesString = Array.isArray(roles)
                ? roles.join(',')
                : (typeof roles === 'string' ? roles : '');

            const data = {
                title,
                iconName,
                name: title, // Sempre associar title ao name
                path,
                roles: rolesString,
                props,
                __new: new Date()
            };

            // Validação de regras do controller
            const validationErrors = this.validateMenuItensData(data, false);
            if (validationErrors.length > 0) {
                return res.status(400).json({ success: false, error: validationErrors.join(', ') });
            }

            // Validação do schema do modelo (tipos/obrigatoriedades)
            const schemaValidation = menuItensModel.validateMenuItens(data);
            if (!schemaValidation.isValid) {
                return res.status(400).json({ success: false, error: schemaValidation.errors.join(', ') });
            }

            const newId = await menuItensModel.generateMenuItensId(db);
            data.id = newId;

            const newItem = await menuItensModel.createMenuItens(data);
            const result = await db.insert("menuItens", newItem, true);
            const createdItem = await db.findOne("menuItens", { _id: result.insertedId });

            const formatted = menuItensModel.formatMenuItensForFrontend(createdItem);

            res.status(201).json({
                success: true,
                message: 'MenuItens criado com sucesso',
                data: formatted
            });
        } catch (err) {
            console.error('Erro ao criar menuItens:', err);
            res.status(500).json({ success: false, error: 'Erro interno do servidor' });
        }
    }

    // PUT - atualizar menuItens
    async updateMenuItens(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            const {
                title, iconName, name, path, roles, props, parentId
            } = req.body;

            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'ID inválido' });
            }

            const existing = await db.findOne("menuItens", { id });
            if (!existing) {
                return res.status(404).json({ success: false, error: 'MenuItens não encontrado' });
            }

            // Converter roles para string se enviado (banco espera string)
            const rolesString = roles === undefined
                ? undefined
                : (Array.isArray(roles) ? roles.join(',') : (typeof roles === 'string' ? roles : ''));

            const data = {
                title, 
                iconName,
                name: title, // Sempre associar title ao name
                path,
                roles: rolesString,
                props
            };

            const validationErrors = this.validateMenuItensData(data, true);
            if (validationErrors.length > 0) {
                return res.status(400).json({ success: false, error: validationErrors.join(', ') });
            }

            // Validação do schema do modelo (somente para campos presentes)
            const partialForValidation = { ...existing, ...Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined)) };
            const schemaValidation = menuItensModel.validateMenuItens(partialForValidation);
            if (!schemaValidation.isValid) {
                return res.status(400).json({ success: false, error: schemaValidation.errors.join(', ') });
            }

            const updateData = {};
            if (title !== undefined) {
                updateData.title = title;
                updateData.name = title; // Sempre associar title ao name
            }
            if (iconName !== undefined) updateData.iconName = iconName;
            if (path !== undefined) updateData.path = path;
            if (rolesString !== undefined) updateData.roles = rolesString;
            if (props !== undefined) updateData.props = props;
            if (parentId !== undefined) updateData.parentId = parentId;
            updateData.__editado = new Date();

            const updated = await menuItensModel.updateMenuItens(existing, updateData);
            const result = await db.update("menuItens", { id }, updated);

            if (result.modifiedCount > 0) {
                const fresh = await db.findOne("menuItens", { id });
                const formatted = menuItensModel.formatMenuItensForFrontend(fresh);
                res.json({ success: true, message: 'Atualizado com sucesso', data: formatted });
            } else {
                res.json({ success: true, message: 'Nenhuma alteração feita', data: menuItensModel.formatMenuItensForFrontend(existing) });
            }
        } catch (err) {
            console.error('Erro ao atualizar menuItens:', err);
            res.status(500).json({ success: false, error: 'Erro interno do servidor' });
        }
    }


    // DELETE - deletar menuItens
    async deleteMenuItens(req, res) {
        try {
            const id = parseInt(req.params.id, 10);

            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'ID inválido' });
            }

            const existing = await db.findOne("menuItens", { id });
            if (!existing) {
                return res.status(404).json({ success: false, error: 'MenuItens não encontrado' });
            }

            const result = await db.deleteOne("menuItens", { id });
            
            if (result.modifiedCount > 0) {
                res.json({ success: true, message: 'MenuItens deletado com sucesso' });
            } else {
                res.status(500).json({ success: false, error: 'Erro ao deletar menuItens' });
            }

        } catch (err) {
            console.error('Erro ao deletar menuItens:', err);
            res.status(500).json({ success: false, error: 'Erro interno do servidor' });
        }
    }

    // Soft delete de menuItens
    async softDeleteMenuItens(req, res) {
        try {
            console.log("Iniciando soft delete de menu item...");
            const id = parseInt(req.params.id, 10);
            console.log("Menu item ID:", id);

            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'ID inválido' });
            }

            console.log("Verificando se menu item existe...");
            const existing = await db.findOne("menuItens", { id });
            console.log("Menu item encontrado:", existing);
            if (!existing) {
                return res.status(404).json({ success: false, error: 'MenuItens não encontrado' });
            }

            const updateData = {
                isDeleted: true,
                __editado: new Date()
            };
            console.log("Dados para atualização:", updateData);

            console.log("Executando update...");
            const result = await db.update("menuItens", { id }, updateData);
            console.log("Resultado do update:", result);
            
            if (result.modifiedCount > 0) {
                console.log("Soft delete bem-sucedido");
                res.json({
                    success: true,
                    message: 'Menu item marcado como deletado com sucesso'
                });
            } else {
                console.log("Erro: modifiedCount = 0");
                res.status(500).json({
                    success: false,
                    error: 'Erro ao marcar menu item como deletado'
                });
            }
        } catch (error) {
            console.error('Erro ao fazer soft delete do menu item:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    }


}

module.exports = new MenuItensController();