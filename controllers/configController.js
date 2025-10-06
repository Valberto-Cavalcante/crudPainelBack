/**
 * Controller responsável pelo gerenciamento de configurações do sistema
 * 
 * Funcionalidades:
 * - Criação, edição e exclusão de configurações do sistema
 * - Validação dos dados de configuração (nome, tipo e valor)
 * - Gerenciamento de configurações com suporte a diferentes tipos
 * - Busca paginada de configurações
 * - Manipulação de configurações específicas do sistema
 */

const configModel = require('../models/configModel');
const { ROLES_ARRAY, DEFAULT_ROLE_COLORS } = require('../utils/roles');
const db = require('../db');
const PaginationUtils = require('../utils/pagination');

class ConfigController {
    
    // Função para validar dados de configuração
    validateConfigData(configData, isUpdate = false) {
        const errors = [];
        
        if (!isUpdate) {
            if (!configData.nome || configData.nome.trim() === '') {
                errors.push('nome é obrigatório');
            }
            if (!configData.tipo || configData.tipo.trim() === '') {
                errors.push('tipo é obrigatório');
            }
            if (!configData.valor || typeof configData.valor !== 'object') {
                errors.push('valor é obrigatório e deve ser um objeto');
            }
        }
        
        if (configData.nome && configData.nome.length < 3) {
            errors.push('nome deve ter pelo menos 3 caracteres');
        }
        
        return errors;
    }
    
    // Obter todas as configurações com paginação
    async getAllConfigs(req, res) {
        try {
            const { page = 1, limit = 15 } = req.query;
            
            // Validar parâmetros de paginação
            const { page: validatedPage, limit: validatedLimit } = PaginationUtils.validatePaginationParams(page, limit);
            
            // Buscar total de configurações para calcular paginação
            const totalItems = await db.countAll("configuracoes");
            
            // Calcular informações de paginação
            const paginationInfo = PaginationUtils.getPaginationInfo(validatedPage, validatedLimit, totalItems);
            
            // Buscar configurações com paginação
            const configs = await configModel.getAllConfigsPaginated(db, paginationInfo.skip, paginationInfo.itemsPerPage);
            
            // Retornar resposta paginada
            const response = PaginationUtils.formatPaginatedResponse(configs, paginationInfo);
            res.json(response);
            
        } catch (err) {
            console.log("Erro ao buscar configurações", err);
            res.status(500).json({
                success: false,
                error: "Erro interno do servidor"
            });
        }
    }
    
    // Obter configuração por ID
    async getConfigById(req, res) {
        try {
            const configId = parseInt(req.params.id, 10);
            console.log("configId", configId);
            if (isNaN(configId)) {
                return res.status(400).json({ 
                    success: false, 
                    error: "ID da configuração deve ser um número válido" 
                });
            }
            
            const config = await configModel.getConfigById(db, configId);
            
            if (!config) {
                return res.status(404).json({ 
                    success: false, 
                    error: "Configuração não encontrada" 
                });
            }
            
            res.json({
                success: true,
                data: config
            });
            
        } catch (err) {
            console.log("Erro ao buscar configuração", err);
            res.status(500).json({
                success: false,
                error: "Erro interno do servidor"
            });
        }
    }
    
    // Criar nova configuração
    async createConfig(req, res) {
        try {
            const { nome, tipo, valor, ativo = true } = req.body;
            
            // Validação dos dados
            const configData = { nome, tipo, valor, ativo };
            const validationErrors = this.validateConfigData(configData, false);
            
            if (validationErrors.length > 0) {
                return res.status(400).json({ 
                    success: false, 
                    error: validationErrors.join(', ') 
                });
            }
            
            // Gera ID único para a configuração
            const configId = await configModel.generateConfigId(db);
            configData.id = configId;
            
            // Usa o model para criar a configuração
            const newConfig = await configModel.createConfig(configData);
            
            // Insere no banco
            const result = await db.insert("configuracoes", newConfig, true);
            
            // Busca a configuração criada
            const createdConfig = await db.findOne("configuracoes", { _id: result.insertedId });
            
            // Formata para o frontend
            const configForFrontend = configModel.formatConfigForFrontend(createdConfig);
            
            res.status(201).json({
                success: true,
                message: "Configuração criada com sucesso",
                data: configForFrontend
            });
            
        } catch (err) {
            console.log("Erro ao criar configuração", err);
            res.status(500).json({
                success: false,
                error: "Erro interno do servidor"
            });
        }
    }
    
    // Atualizar configuração
    async updateConfig(req, res) {
        try {
            const configId = parseInt(req.params.id, 10);
            const { nome, tipo, valor, ativo } = req.body;
            
            if (isNaN(configId)) {
                return res.status(400).json({ 
                    success: false, 
                    error: "ID da configuração deve ser um número válido" 
                });
            }
            
            // Busca a configuração existente
            const existingConfig = await db.findOne("configuracoes", { id: configId });
            if (!existingConfig) {
                return res.status(404).json({ 
                    success: false, 
                    error: "Configuração não encontrada" 
                });
            }
            
            // Validação dos dados
            const configData = { nome, tipo, valor, ativo };
            const validationErrors = this.validateConfigData(configData, true);
            
            if (validationErrors.length > 0) {
                return res.status(400).json({ 
                    success: false, 
                    error: validationErrors.join(', ') 
                });
            }
            
            // Prepara o objeto de atualização
            const updateData = {};
            
            if (nome !== undefined) {
                updateData.nome = nome.trim();
            }
            
            if (tipo !== undefined) {
                updateData.tipo = tipo.trim();
            }
            
            if (valor !== undefined) {
                updateData.valor = valor;
            }
            
            if (ativo !== undefined) {
                updateData.ativo = ativo;
            }
            
            // Usa o model para atualizar
            const updatedConfig = await configModel.updateConfig(existingConfig, updateData);
            
            // Atualiza no banco
            const result = await db.update("configuracoes", { id: configId }, updatedConfig);
            
            if (result.modifiedCount > 0) {
                // Busca a configuração atualizada
                const config = await db.findOne("configuracoes", { id: configId });
                const configForFrontend = configModel.formatConfigForFrontend(config);
                
                res.json({
                    success: true,
                    message: "Configuração atualizada com sucesso",
                    data: configForFrontend
                });
            } else {
                res.json({
                    success: true,
                    message: "Nenhuma alteração foi feita",
                    data: configModel.formatConfigForFrontend(existingConfig)
                });
            }
            
        } catch (err) {
            console.log("Erro ao atualizar configuração", err);
            res.status(500).json({
                success: false,
                error: "Erro interno do servidor"
            });
        }
    }
    
    // Deletar configuração
    async deleteConfig(req, res) {
        try {
            const configId = parseInt(req.params.id, 10);
            
            if (isNaN(configId)) {
                return res.status(400).json({ 
                    success: false, 
                    error: "ID da configuração deve ser um número válido" 
                });
            }
            
            // Busca a configuração existente
            const existingConfig = await db.findOne("configuracoes", { id: configId });
            if (!existingConfig) {
                return res.status(404).json({ 
                    success: false, 
                    error: "Configuração não encontrada" 
                });
            }
            
            // Deleta a configuração
            const result = await db.deleteOne("configuracoes", { id: configId });
            
            if (result.modifiedCount > 0) {
                res.json({
                    success: true,
                    message: "Configuração deletada com sucesso"
                });
            } else {
                res.status(500).json({
                    success: false,
                    error: "Erro ao deletar configuração"
                });
            }
            
        } catch (err) {
            console.log("Erro ao deletar configuração", err);
            res.status(500).json({
                success: false,
                error: "Erro interno do servidor"
            });
        }
    }
    
    // Obter configuração de cores do menu
    async getMenuColors(req, res) {
        try {
            const colors = await configModel.getMenuColorsConfig(db);
            
            res.json({
                success: true,
                data: colors
            });
            
        } catch (err) {
            console.log("Erro ao buscar cores do menu", err);
            res.status(500).json({
                success: false,
                error: "Erro interno do servidor"
            });
        }
    }
    
    // Salvar configuração de cores do menu
    async saveMenuColors(req, res) {
        try {
            const { colors } = req.body;
            
            if (!colors || typeof colors !== 'object') {
                return res.status(400).json({ 
                    success: false, 
                    error: "Cores são obrigatórias e devem ser um objeto" 
                });
            }
            
            // Valida se todos os roles têm cores
            for (const role of ROLES_ARRAY) {
                if (!colors[role] || typeof colors[role] !== 'string') {
                    return res.status(400).json({ 
                        success: false, 
                        error: `Cor inválida para o role: ${role}` 
                    });
                }
            }
            
            // Salva as configurações
            const result = await configModel.saveMenuColorsConfig(db, colors);
            
            res.json({
                success: true,
                message: "Cores do menu salvas com sucesso",
                data: colors
            });
            
        } catch (err) {
            console.log("Erro ao salvar cores do menu", err);
            res.status(500).json({
                success: false,
                error: "Erro interno do servidor"
            });
        }
    }
    
    // Obter lista de roles disponíveis
    async getRoles(req, res) {
        try {
            res.json({
                success: true,
                data: {
                    roles: ROLES_ARRAY,
                    defaultColors: DEFAULT_ROLE_COLORS
                }
            });
            
        } catch (err) {
            console.log("Erro ao buscar roles", err);
            res.status(500).json({
                success: false,
                error: "Erro interno do servidor"
            });
        }
    }
}

module.exports = new ConfigController();