// Este arquivo define o modelo de Itens de Menu.
// Estrutura o schema dos itens que compõem os menus do sistema.
// Permite validação de campos obrigatórios e tipos de dados.
// Suporta propriedades customizadas para cada item de menu.
// Gerencia hierarquia de menus via parentId.
// Inclui métodos para manipulação e validação dos itens.
// Facilita a integração com o frontend para renderização dinâmica.
// Permite controle de acesso por roles associadas aos itens.
// Garante flexibilidade para expansão do menu.
// Centraliza regras de negócio dos itens de menu.
// Schema do menuItens
const menuItensSchema = {
    id: { type: 'number', required: false },
    title: { type: 'string', required: true },
    iconName: { type: 'string', required: false },
    path: { type: 'string', required: true },
    props: { type: 'object', required: false },
    name: { type: 'string', required: false },
    roles: { type: 'string', required: false }, // Agora é string, não array
    parentId: { type: 'number', required: false },
    isDeleted: { type: 'boolean', required: false },
    __new: { type: 'date', required: false },
    __editado: { type: 'date', required: false }
};

// Validação do schema
function validateMenuItens(menuItem) {
    const errors = [];

    for (const [field, rule] of Object.entries(menuItensSchema)) {
        if (rule.required && !menuItem.hasOwnProperty(field)) {
            errors.push(`Campo '${field}' é obrigatório`);
        }

        if (menuItem.hasOwnProperty(field)) {
            const value = menuItem[field];
            const expectedType = rule.type;

            if (expectedType === 'string' && typeof value !== 'string') {
                errors.push(`Campo '${field}' deve ser uma string`);
            } else if (expectedType === 'number' && typeof value !== 'number') {
                errors.push(`Campo '${field}' deve ser um número`);
            } else if (expectedType === 'boolean' && typeof value !== 'boolean') {
                errors.push(`Campo '${field}' deve ser um boolean`);
            } else if (expectedType === 'array' && !Array.isArray(value)) {
                errors.push(`Campo '${field}' deve ser um array`);
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

// Geração de ID único
async function generateMenuItensId(db) {
    try {
        const ultimo = await db.acharUltimo("menuItens", {});
        const novoId = ultimo && ultimo.id ? ultimo.id + 1 : 1;

        const existente = await db.findOne("menuItens", { id: novoId });
        if (existente) {
            throw new Error("Erro ao gerar ID único para o menuItens");
        }

        return novoId;
    } catch (error) {
        throw new Error(`Erro ao gerar ID do menuItens: ${error.message}`);
    }
}

// Criação de um novo menuItens
async function createMenuItens(data) {
    const validation = validateMenuItens(data);
    if (!validation.isValid) {
        throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`);
    }

    if (!data.__new) {
        data.__new = new Date();
    }

    if (!data.__editado) {
        data.__editado = new Date();
    }

    return data;
}

// Formatar menuItens para o frontend
function formatMenuItensForFrontend(menuItem) {
    console.log('🔄 Formatando menuItem para frontend:', {
        originalId: menuItem.id,
        title: menuItem.title,
        roles: menuItem.roles
    });
    
    const formatted = {
        id: menuItem.id,
        title: menuItem.title,
        iconName: menuItem.iconName || '',
        path: menuItem.path,
        props: menuItem.props || {},
        name: menuItem.name || '',
        // Sempre converter roles para array
        roles: menuItem.roles ? (Array.isArray(menuItem.roles) ? menuItem.roles : menuItem.roles.split(',')) : [],
        parentId: menuItem.parentId || null,
        isDeleted: menuItem.isDeleted || false,
        createdAt: menuItem.__new,
        updatedAt: menuItem.__editado
    };
    
    console.log('✨ MenuItem formatado:', {
        formattedId: formatted.id,
        formattedRoles: formatted.roles
    });
    
    return formatted;
}

// Buscar todos os menuItens (apenas não deletados)
async function getAllMenuItens(db) {
    try {
        const menuItens = await db.find("menuItens", { isDeleted: { $ne: true } });
        return menuItens.map(formatMenuItensForFrontend);
    } catch (error) {
        console.error('Erro ao buscar menuItens:', error);
        throw new Error('Erro ao buscar menuItens');
    }
}

// Buscar todos os menuItens com paginação (apenas não deletados)
async function getAllMenuItensPaginated(db, skip = 0, limit = 15) {
    try {
        console.log('🔍 getAllMenuItensPaginated - Parâmetros:', { skip, limit });
        
        const totalItems = await db.count("menuItens", { isDeleted: { $ne: true } });
        console.log('📊 Total de itens no banco (não deletados):', totalItems);
        
        const menuItens = await db.find("menuItens", { isDeleted: { $ne: true } }, { skip, limit });
        console.log('📦 Itens encontrados no banco:', menuItens.length);
        console.log('📋 Primeiros 3 itens do banco:', menuItens.slice(0, 3));
        
        const formattedItems = menuItens.map(formatMenuItensForFrontend);
        console.log('✨ Itens formatados para frontend:', formattedItems.length);
        console.log('📋 Primeiros 3 itens formatados:', formattedItems.slice(0, 3));
        
        const result = {
            data: formattedItems,
            pagination: {
                currentPage: Math.floor(skip / limit) + 1,
                totalPages: totalItems > 0 ? Math.ceil(totalItems / limit) : 1,
                totalItems,
                itemsPerPage: limit,
                hasNextPage: skip + limit < totalItems,
                hasPrevPage: skip > 0
            },
            success: true
        };
        
        console.log('🎯 Resultado final:', {
            dataLength: result.data.length,
            pagination: result.pagination
        });
        
        return result;
    } catch (error) {
        console.error('❌ Erro ao buscar menuItens paginados:', error);
        throw new Error('Erro ao buscar menuItens paginados');
    }
}



// Buscar menuItens por ID
async function getMenuItensById(db, id) {
    try {
        const item = await db.findOne("menuItens", { id });
        if (item) {
            return formatMenuItensForFrontend(item);
        }
        return null;
    } catch (error) {
        console.error('Erro ao buscar menuItens:', error);
        return null;
    }
}

// Atualizar menuItens
async function updateMenuItens(menuData, updates) {
    updates.__editado = new Date();
    return { ...menuData, ...updates };
}

module.exports = {
    menuItensSchema,
    validateMenuItens,
    generateMenuItensId,
    createMenuItens,
    formatMenuItensForFrontend,
    getAllMenuItens,
    getAllMenuItensPaginated,
    getMenuItensById,
    updateMenuItens
};
