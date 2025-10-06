const db = require('./db');

// Arrays de itens que serão children
const arrAtiv = [
    {
        title: "Minhas Atividades",
        path: "/dashboard/MinhasAtividades",
        name: "MinhasAtividades",
        roles: ['admin'],
    },
    {
        title: "Teste Editor Quill",
        path: "/dashboard/EditorQuill",
        name: "EditorQuill",
        roles: ['admin'],
    }
];

const arrCrud = [
    {
        title: "Cursos",
        path: "/dashboard/CrudCurso",
        name: "CrudCurso",
        roles: ['admin'],
    },
    {
        title: "CRUD Disciplinas",
        path: "/dashboard/CrudDisc",
        name: "CrudDisciplina",
        roles: ['admin'],
    },
    {
        title: "CRUD Módulos",
        path: "/dashboard/CrudMod",
        name: "CrudModulo",
        roles: ['admin'],
    },
    {
        title: "CRUD Aulas",
        path: "/dashboard/CrudAula",
        name: "CrudAula",
        roles: ['admin'],
    },
    {
        title: "CRUD Páginas",
        path: "/dashboard/CrudPagina",
        name: "CrudPagina",
        roles: ['admin'],
    },
    {
        title: "Libera Aula no Módulo",
        path: "/dashboard/ModuloAulaLibera",
        name: "ModuloAulaLibera",
        roles: ['admin'],
    }
];

const arrTestes = [
    {
        title: "Mostra Questão",
        path: "/dashboard/MostraQuestao",
        name: "MostraQuestao",
        roles: ['admin'],
    },
    {
        title: "Tela Questão Edit",
        path: "/dashboard/TelaEdicaoQuestao",
        name: "TelaEdicaoQuestao",
        roles: ['admin'],
    },
    {
        title: "Teste Vídeos - VIMEO",
        iconName: "busca",
        path: "/dashboard/TesteVideos",
        name: "EscolherVimeo",
        roles: ['admin'],
    },
    {
        title: "Consulta Mista Tutor",
        path: "/dashboard/ConsultaMistaTutor",
        name: "ConsultaMistaTutor",
        roles: ['admin'],
    }
];

// Array principal com a hierarquia original
const array_path = [
    {
        title: "Início",
        path: "inicio",
        name: "Historico_ultimos",
        roles: ['admin', 'conteudo', 'demo', 'saeb_avaliacao'],
    },
    {
        path: "/dashboard/Sair",
        name: "Sair",
        roles: ['admin', 'conteudo', 'demo', 'saeb_avaliacao'],
    },
    {
        title: "Teste Geral",
        path: "TesteGeral",
        name: "TesteGeral",
        roles: ['admin'],
    },
    {
        title: "Atividades Explorer",
        path: "/dashboard/AtividadeExplorer",
        name: "AtividadeExplorer",
        roles: ['admin', 'conteudo'],
    },
    {
        title: "Atividades",
        children: arrAtiv,
        roles: ['admin'],
    },
    {
        title: "SAEB Descritores",
        path: "/dashboard/TelaDescritores",
        name: "TelaDescritores",
        roles: ['admin', 'saeb_avaliacao'],
    },
    {
        title: "Avaliação Exemplo",
        path: "/dashboard/VisualizarPDF",
        name: "VisualizarPDF",
        roles: ['admin', 'saeb_avaliacao'],
    },
    {
        title: "Gerar Item Antigo Axios",
        path: "/dashboard/Consulta",
        name: "Consulta",
        roles: ['admin'],
    },
    {
        title: "Gerar Item 'Sem API' Frontend",
        path: "/dashboard/AssistGerarItem",
        name: "AssistGerarItem",
        roles: ['admin'],
    },
    {
        title: "Gerar Item API",
        path: "/dashboard/AssistGerarItemAPI",
        name: "AssistGerarItemAPI",
        roles: ['admin', 'saeb_avaliacao'],
    },
    {
        title: "Tutor Matemática 'Sem API'",
        path: "/dashboard/ConsultaTutor",
        name: "ConsultaTutor",
        roles: ['admin'],
    },
    {
        title: "Tutor Matemática",
        path: "/dashboard/TutorMatematica",
        name: "TutorMatematica",
        roles: ['admin', 'saeb_avaliacao'],
    },
    {
        title: "Tutor Página",
        path: "/dashboard/IaTutorPagina",
        name: "IaTutorPagina",
        roles: ['admin'],
    },
    {
        title: "Análise Página NOVO",
        path: "/dashboard/IaAnalisePagina",
        name: "IaAnalisePagina",
        roles: ['admin'],
    },
    {
        title: "IA Página BATCH 1",
        path: "/dashboard/IaAnalisePaginaBatch",
        name: "IaAnalisePaginaBatch",
        roles: ['admin'],
    },
    {
        title: "IA Página BATCH 2",
        path: "/dashboard/IaAnalisePaginaBatchFase2",
        name: "IaAnalisePaginaBatchFase2",
        roles: ['admin'],
    },
    {
        title: "Análise Pagina Teste",
        path: "/dashboard/IaAnalisePaginaTeste",
        name: "IaAnalisePaginaTeste",
        roles: ['admin'],
    },
    {
        title: "CRUD",
        iconName: "painel_aulas",
        children: arrCrud,
        roles: ['admin'],
    },
    {
        title: "Buscar Página",
        iconName: "busca",
        path: "/dashboard/PaginaBuscar",
        name: "PaginaBuscar",
        roles: ['admin', 'conteudo', 'demo'],
    },
    {
        title: "Histórico",
        iconName: "historico",
        path: "/dashboard/Historico",
        name: "Historico",
        roles: ['admin', 'conteudo', 'demo'],
    },
    {
        title: "Navega nas Questões",
        iconName: "ic_analytics",
        path: "/dashboard/NavegaQuestoes",
        name: "NavegaQuestoes",
        roles: ['admin', 'conteudo', 'saeb_avaliacao'],
    },
    {
        title: "Painel Aulas",
        iconName: "painel_aulas",
        children: [
            { title: "EF Anos Iniciais", path: "/dashboard/painelaulas/F1", name: "Nivel", props: { curso: "F1" }, roles: ['admin', 'conteudo', 'demo', 'saeb_avaliacao'] },
            { title: "EF Anos Finais", path: "/dashboard/painelaulas/F2", name: "Nivel", props: { curso: "F2" }, roles: ['admin', 'conteudo', 'demo', 'saeb_avaliacao'] },
            { title: "Ens. Médio", path: "/dashboard/painelaulas/EM", name: "Nivel", props: { curso: "EM" }, roles: ['admin', 'conteudo', 'demo', 'saeb_avaliacao'] }
        ],
        name: "PainelAulas",
        roles: ['admin', 'conteudo', 'demo', 'saeb_avaliacao'],
    },
    {
        title: "Testes Desenvolvimento",
        children: arrTestes,
        roles: ['admin'],
    },
    {
        title: "Editor de Fórmulas",
        path: "/dashboard/EditorFormulas",
        name: "EditorFormulas",
        roles: ['admin', 'conteudo'],
    },
    {
        title: "Exemplo de Pílula",
        path: "/dashboard/Pilula",
        name: "Pilula",
        roles: ['admin', 'conteudo'],
    },
];

// Função para verificar se há interseção entre arrays de roles
function hasPerfilIntersection(menuroles, menuItemroles) {
    // Se menuroles é string, converte para array
    const menurolesArray = Array.isArray(menuroles) ? menuroles : [menuroles];
    
    // Se menuItemroles é string, converte para array
    const menuItemrolesArray = Array.isArray(menuItemroles) ? menuItemroles : [menuItemroles];
    
    // Verifica se há pelo menos um perfil em comum
    return menurolesArray.some(perfil => menuItemrolesArray.includes(perfil));
}

// Função para verificar se um item já existe baseado em path ou title
async function checkItemExists(item) {
    try {
        let query = {};
        
        // Se tem path, verifica pelo path
        if (item.path) {
            query.path = item.path;
        } else if (item.title) {
            // Se não tem path, verifica pelo title
            query.title = item.title;
        } else {
            // Se não tem nem path nem title, verifica pelo name
            query.name = item.name;
        }
        
        const existingItem = await db.findOne('menuItens', query);
        return existingItem;
    } catch (error) {
        return null;
    }
}

// Função para extrair todos os itens normais (incluindo os que estão em children)
function extractAllNormalItems(array) {
    const allItems = [];
    
    function extractItems(items) {
        for (const item of items) {
            if (item.children) {
                // Se tem children, é um item temporário - não adiciona à lista
                // Mas extrai os children
                extractItems(item.children);
            } else {
                // Item normal - adiciona à lista
                allItems.push(item);
            }
        }
    }
    
    extractItems(array);
    return allItems;
}

// Função para criar todos os itens normais primeiro (com verificação de existência)
async function createAllNormalItems() {
    const allNormalItems = extractAllNormalItems(array_path);
    const itemsMap = new Map();
    
    for (const item of allNormalItems) {
        try {
            // Verificar se o item já existe
            const existingItem = await checkItemExists(item);
            
            if (existingItem) {
                // Item já existe - usar o existente
                itemsMap.set(item.name, existingItem);
            } else {
                // Item não existe - criar novo
                const menuItemData = {
                    title: item.title || '',
                    iconName: item.iconName || '',
                    name: item.name || '',
                    path: item.path || '',
                    roles: Array.isArray(item.roles) ? item.roles.join(',') : item.roles || '',
                    props: item.props || {},
                    ativo: true
                };
                
                const lastItem = await db.acharUltimo('menuItens', {});
                const newId = lastItem ? lastItem.id + 1 : 1;
                const newMenuItem = {
                    ...menuItemData,
                    id: newId,
                    __new: new Date(),
                    __editado: new Date()
                };
                
                await db.insert('menuItens', newMenuItem, false);
                itemsMap.set(item.name, { ...newMenuItem, id: newId });
            }
        } catch (error) {
            // Error handling without console.log
        }
    }
    
    return itemsMap;
}

// Função para converter array com IDs, respeitando a hierarquia original
// E FILTRANDO apenas itens com roles compatíveis
function convertArrayWithIds(array, itemsMap, menuPerfil) {
    const result = array.map(item => {
        if (item.children) {
            // Item temporário - mantém a estrutura de children
            // MAS filtra os children para incluir apenas os compatíveis
            const compatibleChildren = convertArrayWithIds(item.children, itemsMap, menuPerfil);
            
            // Só inclui o item se tiver children compatíveis
            if (compatibleChildren.length > 0) {
                return {
                    id: -1, // ID -1 para itens temporários
                    title: item.title || '',
                    iconName: item.iconName || '',
                    name: item.name || '',
                    roles: Array.isArray(item.roles) ? item.roles.join(',') : item.roles || '',
                    props: { isTemporary: true }, // Marcar como temporário
                    children: compatibleChildren
                };
            } else {
                // Não tem children compatíveis - não incluir este item
                return null;
            }
        } else {
            // Item normal - verifica se é compatível com o perfil do menu
            if (hasPerfilIntersection(menuPerfil, item.roles)) {
                // Item compatível - busca o ID no mapa
                const mappedItem = itemsMap.get(item.name);
                if (mappedItem) {
                    return {
                        id: mappedItem.id,
                        title: item.title || '',
                        iconName: item.iconName || '',
                        name: item.name || '',
                        path: item.path || '',
                        roles: Array.isArray(item.roles) ? item.roles.join(',') : item.roles || '',
                        props: item.props || {}
                    };
                } else {
                    return item;
                }
            } else {
                // Item não compatível - não incluir
                return null;
            }
        }
    }).filter(item => item !== null); // Remove itens null (não compatíveis)
    
    return result;
}

// Função para verificar se já existe um menu para um perfil específico
async function checkMenuExistsForPerfil(perfil) {
    try {
        const existingMenu = await db.findOne('menu', { roles: perfil, ativo: true });
        return existingMenu;
    } catch (error) {
        return null;
    }
}

// Função para criar menus para cada perfil (com verificação de existência)
async function createMenusForroles() {
    const roles = ['admin', 'conteudo', 'demo', 'saeb_avaliacao'];
    
    for (const perfil of roles) {
        try {
            // Verificar se já existe um menu ativo para este perfil
            const existingMenu = await checkMenuExistsForPerfil(perfil);
            
            if (existingMenu) {
                // Menu já existe para este perfil - não criar novo
                continue;
            }
            
            // Menu não existe - criar novo
            const lastMenu = await db.acharUltimo('menu', {});
            const newId = lastMenu ? lastMenu.id + 1 : 1;
            
            // Criar menu com apenas itens compatíveis com o perfil
            const menuData = {
                id: newId,
                title: `Menu ${perfil.charAt(0).toUpperCase() + perfil.slice(1)}`,
                roles: perfil,
                menusItensArray: convertArrayWithIds(array_path, await createAllNormalItems(), perfil),
                ativo: true,
                __new: new Date(),
                __editado: new Date()
            };
            
            await db.insert('menu', menuData, false);
            
        } catch (error) {
            // Error handling without console.log
        }
    }
}

// Função principal
async function main() {
    try {
        await createMenusForroles();
    } catch (error) {
        // Error handling without console.log
    } finally {
        process.exit(0);
    }
}

main(); 