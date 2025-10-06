// Este arquivo define o modelo de configurações do sistema.
// Responsável por estruturar, validar e manipular as configurações gerais da aplicação,
// como temas, parâmetros de sistema, cores de menu, entre outros.
// Inclui o schema de validação para garantir integridade dos dados salvos.
// Fornece funções para validação de tipos e obrigatoriedade dos campos.
// Permite a extensão para novos tipos de configuração conforme o crescimento do sistema.
// Utiliza arrays e objetos para flexibilidade de valores.
// Integra com utilitários de roles para configurações relacionadas a permissões.
// Garante que cada configuração tenha informações de criação e edição.
// Facilita a manutenção centralizada das configurações do backend.
const { ROLES_ARRAY, DEFAULT_ROLE_COLORS } = require('../utils/roles');

// Schema das configurações
const configSchema = {
    id: { type: 'number', required: true },
    nome: { type: 'string', required: true },
    tipo: { type: 'string', required: true }, // 'menu_colors', 'system', etc
    valor: { type: 'object', required: true },
    ativo: { type: 'boolean', required: true, default: true },
    __new: { type: 'date', required: true },
    __editado: { type: 'date', required: false }
};

// Função para validar o schema das configurações
function validateConfig(config) {
    const errors = [];
    
    for (const [field, config_rule] of Object.entries(configSchema)) {
        if (config_rule.required && !config.hasOwnProperty(field)) {
            errors.push(`Campo '${field}' é obrigatório`);
        }
        
        if (config.hasOwnProperty(field)) {
            const value = config[field];
            const expectedType = config_rule.type;
            
            // Validação de tipo
            if (expectedType === 'string' && typeof value !== 'string') {
                errors.push(`Campo '${field}' deve ser uma string`);
            } else if (expectedType === 'number' && typeof value !== 'number') {
                errors.push(`Campo '${field}' deve ser um número`);
            } else if (expectedType === 'boolean' && typeof value !== 'boolean') {
                errors.push(`Campo '${field}' deve ser um boolean`);
            } else if (expectedType === 'date' && !(value instanceof Date)) {
                errors.push(`Campo '${field}' deve ser uma data`);
            } else if (expectedType === 'object' && typeof value !== 'object') {
                errors.push(`Campo '${field}' deve ser um objeto`);
            }
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

// Função para gerar ID único para nova configuração
async function generateConfigId(db) {
    try {
        // Busca a última configuração cadastrada
        const regUltimo = await db.acharUltimo("configuracoes", {});
        
        let idConfig;
        if (regUltimo && regUltimo.id) {
            // Se existe configuração, pega o ID do último e soma 1
            idConfig = regUltimo.id + 1;
        } else {
            // Se não existe nenhuma configuração, começa com ID 1
            idConfig = 1;
        }
        
        // Verifica se o ID gerado já existe (por segurança)
        const existingConfig = await db.findOne("configuracoes", { id: idConfig });
        if (existingConfig) {
            throw new Error("Erro ao gerar ID único para a configuração");
        }
        
        return idConfig;
    } catch (error) {
        throw new Error(`Erro ao gerar ID da configuração: ${error.message}`);
    }
}

// Função para criar uma nova configuração
async function createConfig(configData) {
    // Validação dos dados
    const validation = validateConfig(configData);
    if (!validation.isValid) {
        throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`);
    }
    
    // Adiciona timestamps se não existirem
    if (!configData.__new) {
        configData.__new = new Date();
    }
    
    if (!configData.__editado) {
        configData.__editado = new Date();
    }
    
    // Define valores padrão
    if (configData.ativo === undefined) {
        configData.ativo = true;
    }
    
    return configData;
}

// Função para formatar configuração para o frontend
function formatConfigForFrontend(config) {
    return {
        id: config.id,
        nome: config.nome,
        tipo: config.tipo,
        valor: config.valor,
        ativo: config.ativo,
        createdAt: config.__new,
        updatedAt: config.__editado
    };
}

// Função para obter configuração de cores do menu
async function getMenuColorsConfig(db) {
    try {
        const config = await db.findOne("configuracoes", { 
            tipo: 'menu_colors',
            ativo: true 
        });
        
        if (config) {
            return config.valor;
        }
        
        // Se não existe configuração, retorna as cores padrão
        return DEFAULT_ROLE_COLORS;
    } catch (error) {
        console.error('Erro ao buscar configuração de cores do menu:', error);
        return DEFAULT_ROLE_COLORS;
    }
}

// Função para salvar configuração de cores do menu
async function saveMenuColorsConfig(db, colors) {
    try {
        // Valida se as cores são válidas
        for (const role of ROLES_ARRAY) {
            if (!colors[role] || typeof colors[role] !== 'string') {
                throw new Error(`Cor inválida para o role: ${role}`);
            }
        }
        
        // Busca configuração existente
        const existingConfig = await db.findOne("configuracoes", { 
            tipo: 'menu_colors' 
        });
        
        if (existingConfig) {
            // Atualiza configuração existente
            const result = await db.atualizaUm("configuracoes", 
                { id: existingConfig.id },
                { $set: { valor: colors, __editado: new Date() } },
                true
            );
            return result;
        } else {
            // Cria nova configuração
            const configId = await generateConfigId(db);
            const newConfig = await createConfig({
                id: configId,
                nome: 'Cores do Menu por Perfil',
                tipo: 'menu_colors',
                valor: colors,
                ativo: true,
                __new: new Date(),
                __editado: new Date()
            });
            
            return await db.insert("configuracoes", newConfig, true);
        }
    } catch (error) {
        throw new Error(`Erro ao salvar configuração de cores: ${error.message}`);
    }
}

// Função para obter todas as configurações
async function getAllConfigs(db) {
    try {
        const configs = await db.findColecaoID("configuracoes", {});
        return configs.map(config => formatConfigForFrontend(config));
    } catch (error) {
        console.error('Erro ao buscar configurações:', error);
        return [];
    }
}

// Função para obter todas as configurações com paginação
async function getAllConfigsPaginated(db, skip = 0, limit = 15) {
    try {
        const configs = await db.findColecaoIDPaginated("configuracoes", {}, skip, limit);
        return configs.map(config => formatConfigForFrontend(config));
    } catch (error) {
        console.error('Erro ao buscar configurações paginadas:', error);
        return [];
    }
}

// Função para obter configuração por ID
async function getConfigById(db, configId) {
    try {
        const config = await db.findOne("configuracoes", { id: configId });
        if (config) {
            return formatConfigForFrontend(config);
        }
        return null;
    } catch (error) {
        console.error('Erro ao buscar configuração:', error);
        return null;
    }
}

// Função para atualizar configuração
async function updateConfig(configData, updates) {
    // Adiciona timestamp de atualização
    updates.__editado = new Date();
    
    return { ...configData, ...updates };
}

module.exports = {
    configSchema,
    validateConfig,
    generateConfigId,
    createConfig,
    formatConfigForFrontend,
    getMenuColorsConfig,
    saveMenuColorsConfig,
    getAllConfigs,
    getAllConfigsPaginated,
    getConfigById,
    updateConfig
}; 