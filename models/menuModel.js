// Este arquivo implementa o modelo de Menu principal do sistema.
// Define o schema dos menus, incluindo permissões e itens associados.
// Permite validação de campos obrigatórios e tipos de dados.
// Suporta associação de múltiplos itens de menu a um menu principal.
// Inclui métodos para validação e manipulação dos menus.
// Facilita o controle de acesso por roles vinculadas ao menu.
// Garante flexibilidade para expansão e customização dos menus.
// Centraliza regras de negócio relacionadas à navegação do sistema.
// Permite integração com frontend para renderização dinâmica.
// Auxilia na manutenção e organização dos menus do backend.
// Schema das menu
const menuSchema = {
    id: { type: 'number', required: false },
    title: { type: 'string', required: true },
    roles: { type: 'string', required: true },
    menusItensArray: { type: 'array', required: false },
    ativo: { type: 'boolean', required: false },
    isDeleted: { type: 'boolean', required: false },
    __new: { type: 'date', required: false },
    __editado: { type: 'date', required: false }
};

// Função para validar o schema das menu
function validateMenu(menu) {
    console.log('🔍 validateMenu - Dados recebidos:', menu);
    const errors = [];

    for (const [field, menu_rule] of Object.entries(menuSchema)) {
        console.log(`🔍 Validando campo '${field}':`, menu_rule);
        
        if (menu_rule.required && !menu.hasOwnProperty(field)) {
            console.log(`❌ Campo '${field}' é obrigatório mas não foi fornecido`);
            errors.push(`Campo '${field}' é obrigatório`);
        }

        if (menu.hasOwnProperty(field)) {
            const value = menu[field];
            const expectedType = menu_rule.type;
            console.log(`🔍 Validando campo '${field}': esperado ${expectedType}, recebido ${typeof value}, valor:`, value);
            
            // Validação de tipo
            if (expectedType === 'string' && typeof value !== 'string') {
                console.log(`❌ Campo '${field}' deve ser uma string, mas é ${typeof value}`);
                errors.push(`Campo '${field}' deve ser uma string`);
            } else if (expectedType === 'number' && typeof value !== 'number') {
                console.log(`❌ Campo '${field}' deve ser um número, mas é ${typeof value}`);
                errors.push(`Campo '${field}' deve ser um número`);
            } else if (expectedType === 'boolean' && typeof value !== 'boolean') {
                console.log(`❌ Campo '${field}' deve ser um boolean, mas é ${typeof value}`);
                errors.push(`Campo '${field}' deve ser um boolean`);
             } else if (expectedType === 'array') {
                if (!Array.isArray(value)) {
                    console.log(`❌ Campo '${field}' deve ser um array, mas é ${typeof value}`);
                    errors.push(`Campo '${field}' deve ser um array`);
                } else if (menu_rule.of) {
                    for (const [i, item] of value.entries()) {
                        const itemType = typeof item;
                        if (menu_rule.of === 'object' && (itemType !== 'object' || Array.isArray(item))) {
                            console.log(`❌ Item ${i} do campo '${field}' deve ser um objeto, mas é ${itemType}`);
                            errors.push(`Item ${i} do campo '${field}' deve ser um objeto`);
                        }
                    }
                }
            } 
            else if (expectedType === 'date' && !(value instanceof Date)) {
                console.log(`❌ Campo '${field}' deve ser uma data, mas é ${typeof value}`);
                errors.push(`Campo '${field}' deve ser uma data`);
            } else if (expectedType === 'object' && typeof value !== 'object') {
                console.log(`❌ Campo '${field}' deve ser um objeto, mas é ${typeof value}`);
                errors.push(`Campo '${field}' deve ser um objeto`);
            }
        }
    }

    console.log('🔍 validateMenu - Erros encontrados:', errors);
    return {
        isValid: errors.length === 0,
        errors
    };
}

// Função para verificar se menu já existe
async function checkMenuExists(db, title, roles) {
    try {
        const existingMenu = await db.findOne("menu", {
            title: title,
            roles: { $regex: roles, $options: 'i' }, // Busca case-insensitive
            $or: [
                { isDeleted: { $exists: false } },
                { isDeleted: false }
            ]
        });
        return existingMenu;
    } catch (error) {
        console.error('Erro ao verificar se menu existe:', error);
        return null;
    }
}

// Função para gerar ID único para nova menu
async function generateMenuId(db) {
    try {
        // Busca a última menu cadastrada
        const regUltimo = await db.acharUltimo("menu", {});

        let idMenu;
        if (regUltimo && regUltimo.id) {
            // Se existe menu, pega o ID do último e soma 1
            idMenu = regUltimo.id + 1;
        } else {
            // Se não existe nenhuma menu, começa com ID 1
            idMenu = 1;
        }

        // Verifica se o ID gerado já existe (por segurança)
        const existingMenu = await db.findOne("menu", { id: idMenu });
        if (existingMenu) {
            throw new Error("Erro ao gerar ID único para a menu");
        }

        return idMenu;
    } catch (error) {
        throw new Error(`Erro ao gerar ID da menu: ${error.message}`);
    }
}

// Função para criar uma nova menu
async function createMenu(menuData, db) {
    console.log('🏗️  createMenu - Dados recebidos:', menuData);
    
    // Validação dos dados
    console.log('🔍 createMenu - Iniciando validação...');
    const validation = validateMenu(menuData);
    console.log('🔍 createMenu - Resultado da validação:', validation);
    
    if (!validation.isValid) {
        console.log('❌ createMenu - Validação falhou:', validation.errors);
        throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`);
    }
    console.log('✅ createMenu - Validação passou');

    // Verificar se menu já existe
    const existingMenu = await checkMenuExists(db, menuData.title, menuData.roles);
    if (existingMenu) {
        throw new Error(`Menu com título '${menuData.title}' e role '${menuData.roles}' já existe`);
    }

    // Adiciona timestamps se não existirem
    if (!menuData.__new) {
        menuData.__new = new Date();
    }

    if (!menuData.__editado) {
        menuData.__editado = new Date();
    }

    // Define valores padrão
    if (menuData.ativo === undefined) {
        menuData.ativo = true;
    }

    return menuData;
}

// Função para formatar menu para o frontend
function formatMenuForFrontend(menu) {
    return {
        id: menu.id,
        title: menu.title || '',
        roles: menu.roles || '', // String para compatibilidade com banco
        menusItensArray: menu.menusItensArray || [],
        ativo: menu.ativo || true,
        isDeleted: menu.isDeleted || false,
        createdAt: menu.__new,
        updatedAt: menu.__editado
    };
}

// Função para formatar menusItensArray no padrão específico do frontend
function formatMenusItensArrayForFrontend(menusItensArray) {
    if (!Array.isArray(menusItensArray)) {
        return [];
    }
    
    return menusItensArray.map(item => {
        const formattedItem = {
            id: item.id || -1, // Incluir o ID
            title: item.title || '',
            name: item.name || ''
        };
        
        // Se tem children, é um item temporário (sem path, sem roles)
        if (item.children && Array.isArray(item.children)) {
            // Adiciona iconName se existir (opcional para item temporário)
            if (item.iconName) {
                formattedItem.iconName = item.iconName;
            }
            formattedItem.children = formatMenusItensArrayForFrontend(item.children);
        } else {
            // Item normal - adiciona path, roles, iconName (obrigatório) e props
            formattedItem.path = item.path || '';
            formattedItem.roles = item.roles || '';
            formattedItem.iconName = item.iconName || '';
            // Adiciona props apenas para itens normais
            if (item.props) {
                formattedItem.props = item.props;
            }
        }
        
        return formattedItem;
    });
}

// Função para obter todas as menu
async function getAllMenus(db) {
    try {
        // Filtro para excluir itens deletados (soft delete)
        const filter = {
            $or: [
                { isDeleted: { $exists: false } },
                { isDeleted: false }
            ]
        };
        
        const menus = await db.find("menu", filter);
        console.log('Menus encontrados:', menus);
        return menus.map(menu => formatMenuForFrontend(menu));
    } catch (error) {
        console.error('Erro ao buscar menu:', error);
        return [];
    }
}

// Função para obter todas as menu com paginação
async function getAllMenusPaginated(db, skip = 0, limit = 15) {
    try {
        // Filtro para excluir itens deletados (soft delete)
        const filter = {
            $or: [
                { isDeleted: { $exists: false } },
                { isDeleted: false }
            ]
        };
        
        const menus = await db.find("menu", filter, { skip, limit });
        console.log('Menus paginados encontrados:', menus);
        return menus.map(menu => formatMenuForFrontend(menu));
    } catch (error) {
        console.error('Erro ao buscar menu paginados:', error);
        return [];
    }
}

// Função para obter menu por ID
async function getMenuById(db, menuId) {
    try {
        // Filtro para excluir itens deletados (soft delete)
        const filter = {
            id: menuId,
            $or: [
                { isDeleted: { $exists: false } },
                { isDeleted: false }
            ]
        };
        
        const menu = await db.findOne("menu", filter);
        
        if (menu) {
            const formattedMenu = formatMenuForFrontend(menu);
            return formattedMenu;
        }
        
        return null;
    } catch (error) {
        console.error('❌ Erro ao buscar menu:', error);
        return null;
    }
}

// Função para atualizar menu
async function updateMenu(menuData, updates) {
    // Adiciona timestamp de atualização
    updates.__editado = new Date();

    return { ...menuData, ...updates };
}

// Função para obter menu por role (role como string)
async function getMenuByRole(db, role) {
    try {
        // Filtro para buscar menu ativo que contenha o role especificado
        const filter = {
            roles: { $regex: role, $options: 'i' }, // Busca case-insensitive
            ativo: true,
            $or: [
                { isDeleted: { $exists: false } },
                { isDeleted: false }
            ]
        };
        
        const menu = await db.findOne("menu", filter);
        if (menu) {
            return formatMenuForFrontend(menu);
        }
        return null;
    } catch (error) {
        console.error('Erro ao buscar menu por role:', error);
        return null;
    }
}

module.exports = {
    menuSchema,
    validateMenu,
    checkMenuExists,
    generateMenuId,
    createMenu,
    formatMenuForFrontend,
    formatMenusItensArrayForFrontend,
    getAllMenus,
    getAllMenusPaginated,
    getMenuById,
    getMenuByRole,
    updateMenu
}; 