// Este arquivo centraliza a definição e validação de roles do sistema.
// Define constantes para cada role, array de roles válidos e cores padrão.
// Fornece funções para validar se um role é permitido e se um array de roles é válido.
// Útil para controle de acesso, permissões e exibição de roles no frontend.
// Permite padronizar o uso de roles em toda a aplicação.
//
// Funcionalidades principais:
// - ROLES: objeto com todos os roles do sistema.
// - isValidRole: verifica se um role é permitido.
// - validateRolesArray: valida arrays de roles.
// - DEFAULT_ROLE_COLORS: cores padrão para cada role.
//
// Lista centralizada de roles do sistema


// 07/10/2025 : havia confusão do role do programa com role do LCMS
//      COM ISSO: esse array perde o sentido
const ROLES = {
    ADMIN: 'admin',
    SUPERVISOR: 'supervisor',
    COORDENADOR: 'coordenador',
    PROFESSOR: 'professor',
    ALUNO: 'aluno'
};

// Array de roles para validação
const ROLES_ARRAY = Object.values(ROLES);

// Cores padrão para cada role
const DEFAULT_ROLE_COLORS = {
    [ROLES.ADMIN]: '#d32f2f',      // Vermelho
    [ROLES.SUPERVISOR]: '#ed6c02',  // Laranja
    [ROLES.COORDENADOR]: '#1976d2', // Azul
    [ROLES.PROFESSOR]: '#7b1fa2',   // Roxo
    [ROLES.ALUNO]: '#388e3c'        // Verde
};

// Validação de roles
function isValidRole(role) {
    return /^[a-z_]+$/.test(role);
    // return ROLES_ARRAY.includes(role);
}


// Validação de array de roles
function validateRolesArray(roles) {
    if (!Array.isArray(roles)) {
        return false;
    }
    return roles.every(role => isValidRole(role));
}

module.exports = {
    ROLES,
    ROLES_ARRAY,
    DEFAULT_ROLE_COLORS,
    isValidRole,
    validateRolesArray
}; 